import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AppleOAuthDto } from './dto/apple-oauth.dto';
import { GoogleOAuthDto } from './dto/google-oauth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SquadzIdGeneratorService } from './services/squadz-id-generator.service';
import { OtpGeneratorService } from './services/otp-generator.service';
import { TokenGeneratorService } from './services/token-generator.service';
import { AppleOAuthService } from './services/apple-oauth.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { NotificationsService } from '../notifications/notifications.service';

interface AccessTokenPayload {
  sub: string;
  email: string;
  squadzId: string;
  role: UserRole;
  setupComplete: boolean;
  setupPagesCompleted: number;
  emailVerified: boolean;
}

interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private squadzIdGenerator: SquadzIdGeneratorService,
    private otpGenerator: OtpGeneratorService,
    private tokenGenerator: TokenGeneratorService,
    private appleOAuthService: AppleOAuthService,
    private googleOAuthService: GoogleOAuthService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Register new user with email/password
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    // Validate passwords match
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check email uniqueness
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check username uniqueness
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Generate SQUADZ ID
    const squadzId = await this.squadzIdGenerator.generate();

    // Generate OTP
    const otp = this.otpGenerator.generate();
    const otpExpiry = this.otpGenerator.getExpiryTime();

    // Create user
    await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        fullName: dto.fullName,
        passwordHash,
        squadzId,
        authProvider: AuthProvider.EMAIL_PASSWORD,
        emailVerified: false,
        emailVerificationOtp: otp,
        otpExpiresAt: otpExpiry,
        role: UserRole.USER,
        setupComplete: false,
        setupPagesCompleted: 0,
      },
    });

    // Send verification email
    await this.notificationsService.sendVerificationEmail(
      dto.email,
      otp,
      squadzId,
    );

    return {
      message:
        'Registration successful. Please check your email for verification code.',
    };
  }

  /**
   * Verify email with OTP and upgrade to User role
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Validate OTP
    if (user.emailVerificationOtp !== dto.otp) {
      throw new UnauthorizedException('Invalid email or OTP');
    }

    // Check OTP expiry
    if (!user.otpExpiresAt || this.otpGenerator.isExpired(user.otpExpiresAt)) {
      throw new UnauthorizedException('OTP expired. Please request a new one.');
    }

    // Mark email as verified and clear OTP
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationOtp: null,
        otpExpiresAt: null,
        role: UserRole.USER,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(updatedUser);

    return {
      ...tokens,
      user: {
        id: updatedUser.id,
        squadzId: updatedUser.squadzId,
        email: updatedUser.email,
        role: updatedUser.role,
        setupComplete: updatedUser.setupComplete,
        setupPagesCompleted: updatedUser.setupPagesCompleted,
        emailVerified: updatedUser.emailVerified,
      },
    };
  }

  /**
   * Login with email/password or SQUADZ ID
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Determine identifier type (email contains '@', else SQUADZ ID)
    const isEmail = dto.identifier.includes('@');

    // Find user by identifier
    const user = await this.prisma.user.findUnique({
      where: isEmail ? { email: dto.identifier } : { squadzId: dto.identifier },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verified
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please verify your email first.',
      );
    }

    // Check account lockout
    if (user.accountLockedUntil && new Date() < user.accountLockedUntil) {
      throw new ForbiddenException(
        `Account locked until ${user.accountLockedUntil.toISOString()}`,
      );
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            accountLockedUntil: lockoutTime,
          },
        });

        // Send account lockout email
        await this.notificationsService.sendAccountLockoutEmail(
          user.email,
          lockoutTime,
        );

        throw new ForbiddenException(
          'Account locked due to too many failed login attempts. Please try again in 15 minutes.',
        );
      }

      // Update failed attempts
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: failedAttempts },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts and lockout on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        squadzId: user.squadzId,
        email: user.email,
        role: user.role,
        setupComplete: user.setupComplete,
        setupPagesCompleted: user.setupPagesCompleted,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Apple Sign-In (unified signup/login)
   */
  async appleSignIn(dto: AppleOAuthDto): Promise<AuthResponseDto> {
    // Verify Apple ID token
    const appleProfile = await this.appleOAuthService.verifyIdToken(
      dto.idToken,
    );

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: appleProfile.email },
    });

    if (user) {
      // Existing user - verify same provider
      if (user.authProvider !== AuthProvider.APPLE) {
        throw new ConflictException(
          `Email already registered with ${user.authProvider}`,
        );
      }

      // Login flow
      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          squadzId: user.squadzId,
          email: user.email,
          role: user.role,
          setupComplete: user.setupComplete,
          setupPagesCompleted: user.setupPagesCompleted,
          emailVerified: user.emailVerified,
        },
        isNewUser: false,
      };
    }

    // New user - signup flow
    const squadzId = await this.squadzIdGenerator.generate();

    user = await this.prisma.user.create({
      data: {
        email: appleProfile.email,
        fullName: appleProfile.name || appleProfile.email.split('@')[0],
        username: `user_${squadzId.split('-')[1]}`,
        squadzId,
        authProvider: AuthProvider.APPLE,
        appleId: appleProfile.appleId,
        emailVerified: true, // OAuth auto-verifies email
        role: UserRole.USER,
        setupComplete: false,
        setupPagesCompleted: 0,
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        squadzId: user.squadzId,
        email: user.email,
        role: user.role,
        setupComplete: user.setupComplete,
        setupPagesCompleted: user.setupPagesCompleted,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Google Sign-In (unified signup/login)
   */
  async googleSignIn(dto: GoogleOAuthDto): Promise<AuthResponseDto> {
    // Verify Google ID token
    const googleProfile = await this.googleOAuthService.verifyIdToken(
      dto.idToken,
    );

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: googleProfile.email },
    });

    if (user) {
      // Existing user - verify same provider
      if (user.authProvider !== AuthProvider.GOOGLE) {
        throw new ConflictException(
          `Email already registered with ${user.authProvider}`,
        );
      }

      // Login flow
      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          squadzId: user.squadzId,
          email: user.email,
          role: user.role,
          setupComplete: user.setupComplete,
          setupPagesCompleted: user.setupPagesCompleted,
          emailVerified: user.emailVerified,
        },
        isNewUser: false,
      };
    }

    // New user - signup flow
    const squadzId = await this.squadzIdGenerator.generate();

    // Download and process profile picture if provided
    // TODO: Integrate with Media module for image processing
    // if (googleProfile.picture) {
    //   const pictureBuffer = await this.googleOAuthService.downloadProfilePicture(googleProfile.picture);
    //   const processedImage = await this.mediaService.processAvatar(pictureBuffer, squadzId);
    // }

    user = await this.prisma.user.create({
      data: {
        email: googleProfile.email,
        fullName: googleProfile.name,
        username: `user_${squadzId.split('-')[1]}`,
        squadzId,
        authProvider: AuthProvider.GOOGLE,
        googleId: googleProfile.googleId,
        emailVerified: true, // OAuth auto-verifies email
        role: UserRole.USER,
        setupComplete: false,
        setupPagesCompleted: 0,
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        squadzId: user.squadzId,
        email: user.email,
        role: user.role,
        setupComplete: user.setupComplete,
        setupPagesCompleted: user.setupPagesCompleted,
        emailVerified: user.emailVerified,
      },
      isNewUser: true,
    };
  }

  /**
   * Refresh access token using refresh token
   * Implements token rotation: issues new refresh token and invalidates old one
   */
  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      // Check token version FIRST before database lookup
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedException('Token version mismatch');
      }

      // Find refresh token in database
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          userId: payload.sub,
          tokenVersion: payload.tokenVersion, // Match tokenVersion per db-schema.mdc
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify token hash matches
      const tokenValid = await bcrypt.compare(
        refreshToken,
        storedToken.tokenHash,
      );

      if (!tokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          squadzId: user.squadzId,
          role: user.role,
          setupComplete: user.setupComplete,
          setupPagesCompleted: user.setupPagesCompleted,
          emailVerified: user.emailVerified,
        } as AccessTokenPayload,
        {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      );

      // Generate new refresh token (rotation)
      const newRefreshToken = this.jwtService.sign(
        {
          sub: user.id,
          tokenVersion: user.tokenVersion,
        } as RefreshTokenPayload,
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      );

      // Hash new refresh token
      const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Atomic operation: delete old token and create new one
      await this.prisma.$transaction([
        // Delete old refresh token (invalidation)
        this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        }),
        // Store new refresh token
        this.prisma.refreshToken.create({
          data: {
            userId: user.id,
            tokenHash: newRefreshTokenHash,
            tokenVersion: user.tokenVersion,
            expiresAt,
          },
        }),
      ]);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    try {
      // Decode token to get user ID
      const payload = this.jwtService.decode(
        refreshToken,
      ) as RefreshTokenPayload;

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Delete all refresh tokens for user (per db-schema.mdc)
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: payload.sub,
        },
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Request password reset (send OTP)
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    // Find user (don't reveal if exists)
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = this.tokenGenerator.generateResetToken();
    const resetTokenExpiry = this.tokenGenerator.getResetTokenExpiry();
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    // Store hashed reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiresAt: resetTokenExpiry,
      },
    });

    // Send password reset email
    await this.notificationsService.sendPasswordResetEmail(
      user.email,
      resetToken,
    );

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with reset token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Validate passwords match
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user with valid reset token
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: { not: null },
        resetTokenExpiresAt: { gte: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (!user.resetToken) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Verify reset token
    const tokenValid = await bcrypt.compare(dto.resetToken, user.resetToken);

    if (!tokenValid) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update password, clear reset token, increment token version
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
        tokenVersion: { increment: 1 },
      },
    });

    // Delete all refresh tokens (token version increment invalidates them)
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return {
      message:
        'Password reset successful. Please login with your new password.',
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: any): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Generate access token (15 min)
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        squadzId: user.squadzId,
        role: user.role,
        setupComplete: user.setupComplete,
        setupPagesCompleted: user.setupPagesCompleted,
        emailVerified: user.emailVerified,
      } as AccessTokenPayload,
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    // Generate refresh token (30 days)
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        tokenVersion: user.tokenVersion,
      } as RefreshTokenPayload,
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    // Hash and store refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        tokenVersion: user.tokenVersion || 0,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
