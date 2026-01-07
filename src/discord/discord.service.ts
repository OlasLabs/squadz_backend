import {
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
  NotFoundException,
  ForbiddenException,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

interface DiscordProfile {
  discordUserId: string;
  discordUsername: string;
  discriminator: string;
}

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.clientId = this.configService.get<string>('DISCORD_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('DISCORD_CLIENT_SECRET') || '';
    this.redirectUri =
      this.configService.get<string>('DISCORD_REDIRECT_URI') || '';
  }

  /**
   * Generate Discord OAuth URL for connection
   */
  async getOAuthUrl(userId: string) {
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=identify&state=${state}`;

    return {
      url: authUrl,
      state,
    };
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string) {
    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange code for profile
    const profile = await this.exchangeCodeForProfile(code);

    // Update user with Discord connection
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        discordUserId: profile.discordUserId,
        discordUsername: profile.discordUsername,
      },
    });

    return {
      message: 'Discord connected successfully',
      discordUsername: profile.discordUsername,
    };
  }

  /**
   * Disconnect Discord account
   */
  async disconnectAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        discordUserId: null,
        discordUsername: null,
      },
    });

    return { message: 'Discord disconnected successfully' };
  }

  /**
   * Get Discord connection status
   */
  async getConnectionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        discordUserId: true,
        discordUsername: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      connected: !!user.discordUserId,
      discordUsername: user.discordUsername,
    };
  }

  /**
   * Exchange authorization code for Discord profile
   */
  async exchangeCodeForProfile(
    authorizationCode: string,
  ): Promise<DiscordProfile> {
    try {
      // 1. Exchange authorization code for access token
      const tokenResponse = await axios.post(
        'https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          code: authorizationCode,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000, // 30 seconds
        },
      );

      const accessToken = tokenResponse.data.access_token;

      // 2. Fetch user profile
      const userResponse = await axios.get(
        'https://discord.com/api/users/@me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 30000,
        },
      );

      const userData = userResponse.data;

      return {
        discordUserId: userData.id,
        discordUsername: userData.username,
        discriminator: userData.discriminator || '0',
      };
    } catch (error) {
      if (error.response?.status === 401) {
        this.logger.error(
          `Discord authorization code expired or invalid: ${error.message}`,
        );
        throw new UnauthorizedException(
          'Discord authorization code expired or invalid',
        );
      }

      this.logger.error(
        `Discord API error: ${error.message}`,
        error.response?.data,
      );
      throw new ServiceUnavailableException(
        'Failed to connect to Discord. Please try again.',
      );
    }
  }

  // Channel management methods (to be implemented with Discord Bot API)
  async createSquadChannel(squadId: string, userId: string) {
    throw new NotImplementedException(
      'Squad channel creation will be implemented with Discord Bot integration',
    );
  }

  async updateChannelMembers(
    squadId: string,
    action: 'add' | 'remove',
    targetUserId: string,
    requestingUserId: string,
  ) {
    throw new NotImplementedException(
      'Channel member management will be implemented with Discord Bot integration',
    );
  }

  async getSquadChannelLink(squadId: string, userId: string) {
    throw new NotImplementedException(
      'Squad channel links will be implemented with Discord Bot integration',
    );
  }

  async createMatchChannel(matchId: string, userId: string) {
    throw new NotImplementedException(
      'Match channel creation will be implemented with Discord Bot integration',
    );
  }

  async getMatchChannelLink(matchId: string, userId: string) {
    throw new NotImplementedException(
      'Match channel links will be implemented with Discord Bot integration',
    );
  }

  async createTransferChannel(requestId: string, userId: string) {
    throw new NotImplementedException(
      'Transfer channel creation will be implemented with Discord Bot integration',
    );
  }

  async getTransferChannelLink(requestId: string, userId: string) {
    throw new NotImplementedException(
      'Transfer channel links will be implemented with Discord Bot integration',
    );
  }
}
