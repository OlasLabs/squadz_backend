import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { DiscordService } from '../discord/discord.service';
import { CompleteSetupDto } from './dto/complete-setup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
    private discordService: DiscordService,
  ) {}

  /**
   * Get user profile by ID
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        squadzId: true,
        email: true,
        fullName: true,
        knownAsName: true,
        role: true,
        setupComplete: true,
        setupPagesCompleted: true,
        emailVerified: true,
        nationality: true,
        currentLocation: true,
        favoriteTeam: true,
        psnId: true,
        primaryPosition: true,
        secondaryPosition: true,
        avatarUrl: true,
        avatarThumbnailUrl: true,
        discordUserId: true,
        discordUsername: true,
        subscriptionTier: true,
        totalXp: true,
        coinBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Complete setup (unified endpoint for all 4 pages)
   * Routes to appropriate page handler based on dto.page
   */
  async completeSetup(userId: string, dto: CompleteSetupDto, file?: any) {
    switch (dto.page) {
      case 1:
        return this.completeSetupPage1(userId, dto);
      case 2:
        return this.completeSetupPage2(userId, dto);
      case 3:
        return this.completeSetupPage3(userId, dto);
      case 4:
        return this.completeSetupPage4(userId, file);
      default:
        throw new BadRequestException('Invalid page number. Must be 1-4.');
    }
  }

  /**
   * Setup Page 1: Player Details
   */
  private async completeSetupPage1(userId: string, dto: CompleteSetupDto) {
    return this.completeSetupPage(userId, 1, {
      nationality: dto.nationality,
      currentLocation: dto.currentLocation,
      favoriteTeam: dto.favoriteTeam,
      psnId: dto.psnId,
      knownAsName: dto.knownAsName,
    });
  }

  /**
   * Setup Page 2: Connect Discord
   */
  private async completeSetupPage2(userId: string, dto: CompleteSetupDto) {
    if (!dto.authorizationCode) {
      throw new BadRequestException(
        'Authorization code is required for page 2',
      );
    }

    // Exchange authorization code for Discord profile
    const discordProfile = await this.discordService.exchangeCodeForProfile(
      dto.authorizationCode,
    );

    // Check if Discord user is already connected to another account
    const existingConnection = await this.prisma.user.findFirst({
      where: {
        discordUserId: discordProfile.discordUserId,
        id: { not: userId },
        deletedAt: null,
      },
    });

    if (existingConnection) {
      throw new BadRequestException(
        'This Discord account is already connected to another user',
      );
    }

    return this.completeSetupPage(userId, 2, {
      discordUserId: discordProfile.discordUserId,
      discordUsername: discordProfile.discordUsername,
    });
  }

  /**
   * Setup Page 3: Select Positions
   */
  private async completeSetupPage3(userId: string, dto: CompleteSetupDto) {
    // Validate secondary position differs from primary
    if (
      dto.secondaryPosition &&
      dto.secondaryPosition === dto.primaryPosition
    ) {
      throw new BadRequestException(
        'Secondary position must differ from primary position',
      );
    }

    return this.completeSetupPage(userId, 3, {
      primaryPosition: dto.primaryPosition,
      secondaryPosition: dto.secondaryPosition,
    });
  }

  /**
   * Setup Page 4: Upload Avatar
   */
  private async completeSetupPage4(userId: string, file: any) {
    if (!file) {
      throw new BadRequestException('Avatar image is required');
    }

    // Process avatar (background removal, optimization, S3 upload)
    const { avatarUrl, thumbnailUrl } = await this.mediaService.processAvatar(
      file,
      userId,
    );

    return this.completeSetupPage(userId, 4, {
      avatarUrl,
      avatarThumbnailUrl: thumbnailUrl,
    });
  }

  /**
   * Generic setup page completion handler with role upgrade logic
   */
  private async completeSetupPage(
    userId: string,
    pageNumber: number,
    pageData: any,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if page already completed (idempotent - allow resubmission)
    const pageKey = `page${pageNumber}Complete` as keyof typeof user;
    const isAlreadyComplete = user[pageKey] as boolean;

    return this.prisma.$transaction(async (tx) => {
      // Update page data and mark as complete
      const updateData: any = {
        ...pageData,
        [pageKey]: true,
      };

      // Only increment if page wasn't previously completed
      if (!isAlreadyComplete) {
        updateData.setupPagesCompleted = { increment: 1 };
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Check if all 4 pages are now complete → Upgrade to PLAYER role
      if (
        updatedUser.setupPagesCompleted === 4 &&
        updatedUser.role === UserRole.USER
      ) {
        const playerUser = await tx.user.update({
          where: { id: userId },
          data: {
            role: UserRole.PLAYER,
            setupComplete: true,
          },
          select: {
            id: true,
            squadzId: true,
            email: true,
            fullName: true,
            knownAsName: true,
            role: true,
            setupComplete: true,
            setupPagesCompleted: true,
            emailVerified: true,
            nationality: true,
            currentLocation: true,
            favoriteTeam: true,
            psnId: true,
            primaryPosition: true,
            secondaryPosition: true,
            avatarUrl: true,
            avatarThumbnailUrl: true,
            discordUserId: true,
            discordUsername: true,
            subscriptionTier: true,
            totalXp: true,
            coinBalance: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        this.logger.log(
          `User ${userId} upgraded to PLAYER role after completing all 4 setup pages`,
        );

        return { user: playerUser };
      }

      // Return updated user without role upgrade
      const userResponse = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          squadzId: true,
          email: true,
          fullName: true,
          knownAsName: true,
          role: true,
          setupComplete: true,
          setupPagesCompleted: true,
          emailVerified: true,
          nationality: true,
          currentLocation: true,
          favoriteTeam: true,
          psnId: true,
          primaryPosition: true,
          secondaryPosition: true,
          avatarUrl: true,
          avatarThumbnailUrl: true,
          discordUserId: true,
          discordUsername: true,
          subscriptionTier: true,
          totalXp: true,
          coinBalance: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { user: userResponse };
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate secondary position differs from primary if both provided
    if (
      dto.secondaryPosition &&
      dto.primaryPosition &&
      dto.secondaryPosition === dto.primaryPosition
    ) {
      throw new BadRequestException(
        'Secondary position must differ from primary position',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        knownAsName: dto.knownAsName,
        nationality: dto.nationality,
        currentLocation: dto.currentLocation,
        favoriteTeam: dto.favoriteTeam,
        psnId: dto.psnId,
        primaryPosition: dto.primaryPosition,
        secondaryPosition: dto.secondaryPosition,
      },
      select: {
        id: true,
        squadzId: true,
        email: true,
        fullName: true,
        knownAsName: true,
        role: true,
        setupComplete: true,
        setupPagesCompleted: true,
        emailVerified: true,
        nationality: true,
        currentLocation: true,
        favoriteTeam: true,
        psnId: true,
        primaryPosition: true,
        secondaryPosition: true,
        avatarUrl: true,
        avatarThumbnailUrl: true,
        discordUserId: true,
        discordUsername: true,
        subscriptionTier: true,
        totalXp: true,
        coinBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Update avatar (same as setup page 4)
   */
  async updateAvatar(userId: string, file: any) {
    if (!file) {
      throw new BadRequestException('Avatar image is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Process avatar
    const { avatarUrl, thumbnailUrl } = await this.mediaService.processAvatar(
      file,
      userId,
    );

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl,
        avatarThumbnailUrl: thumbnailUrl,
      },
      select: {
        id: true,
        squadzId: true,
        email: true,
        fullName: true,
        knownAsName: true,
        role: true,
        setupComplete: true,
        setupPagesCompleted: true,
        emailVerified: true,
        nationality: true,
        currentLocation: true,
        favoriteTeam: true,
        psnId: true,
        primaryPosition: true,
        secondaryPosition: true,
        avatarUrl: true,
        avatarThumbnailUrl: true,
        discordUserId: true,
        discordUsername: true,
        subscriptionTier: true,
        totalXp: true,
        coinBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'Password change not available for OAuth accounts',
      );
    }

    // Verify passwords match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update password and increment token version (invalidates all sessions)
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
          tokenVersion: { increment: 1 },
        },
      }),
      // Delete all refresh tokens for this user (force re-login)
      this.prisma.refreshToken.deleteMany({
        where: { userId },
      }),
    ]);

    this.logger.log(
      `Password changed for user ${userId}, all sessions invalidated`,
    );

    return { message: 'Password changed successfully. Please log in again.' };
  }

  /**
   * Disconnect Discord
   */
  async disconnectDiscord(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.discordUserId) {
      throw new BadRequestException('Discord is not connected');
    }

    return this.prisma.$transaction(async (tx) => {
      // Remove Discord connection and mark page 2 as incomplete
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          discordUserId: null,
          discordUsername: null,
          page2Complete: false,
          setupPagesCompleted: { decrement: 1 },
        },
      });

      // If pages completed drops below 4, downgrade to USER role
      if (
        updatedUser.setupPagesCompleted < 4 &&
        updatedUser.role === UserRole.PLAYER
      ) {
        const downgradedUser = await tx.user.update({
          where: { id: userId },
          data: {
            role: UserRole.USER,
            setupComplete: false,
          },
          select: {
            id: true,
            squadzId: true,
            email: true,
            fullName: true,
            knownAsName: true,
            role: true,
            setupComplete: true,
            setupPagesCompleted: true,
            emailVerified: true,
            nationality: true,
            currentLocation: true,
            favoriteTeam: true,
            psnId: true,
            primaryPosition: true,
            secondaryPosition: true,
            avatarUrl: true,
            avatarThumbnailUrl: true,
            discordUserId: true,
            discordUsername: true,
            subscriptionTier: true,
            totalXp: true,
            coinBalance: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        this.logger.log(
          `User ${userId} downgraded to USER role after Discord disconnection`,
        );

        return { user: downgradedUser };
      }

      // Return updated user without downgrade
      const userResponse = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          squadzId: true,
          email: true,
          fullName: true,
          knownAsName: true,
          role: true,
          setupComplete: true,
          setupPagesCompleted: true,
          emailVerified: true,
          nationality: true,
          currentLocation: true,
          favoriteTeam: true,
          psnId: true,
          primaryPosition: true,
          secondaryPosition: true,
          avatarUrl: true,
          avatarThumbnailUrl: true,
          discordUserId: true,
          discordUsername: true,
          subscriptionTier: true,
          totalXp: true,
          coinBalance: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { user: userResponse };
    });
  }
}
