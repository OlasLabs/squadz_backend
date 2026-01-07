import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface GoogleTokenInfo {
  iss: string;
  azp: string;
  aud: string;
  sub: string; // Google User ID
  email: string;
  email_verified: string;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: string;
  exp: string;
  alg: string;
  kid: string;
}

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable()
export class GoogleOAuthService {
  private readonly GOOGLE_TOKEN_INFO_URL =
    'https://oauth2.googleapis.com/tokeninfo';

  constructor(private config: ConfigService) {}

  /**
   * Verify Google ID token and extract user profile
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserProfile> {
    try {
      // Verify token via Google's tokeninfo endpoint
      const response = await axios.get<GoogleTokenInfo>(
        this.GOOGLE_TOKEN_INFO_URL,
        {
          params: { id_token: idToken },
          timeout: 10000, // 10 second timeout
        },
      );

      const tokenInfo = response.data;

      // Validate audience (client ID)
      const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
      if (tokenInfo.aud !== clientId) {
        throw new UnauthorizedException('Invalid Google token audience');
      }

      // Validate issuer
      const validIssuers = [
        'accounts.google.com',
        'https://accounts.google.com',
      ];
      if (!validIssuers.includes(tokenInfo.iss)) {
        throw new UnauthorizedException('Invalid Google token issuer');
      }

      // Validate email verified
      if (tokenInfo.email_verified !== 'true') {
        throw new UnauthorizedException('Google email not verified');
      }

      // Validate token not expired
      const expiryTime = parseInt(tokenInfo.exp, 10);
      if (Date.now() >= expiryTime * 1000) {
        throw new UnauthorizedException('Google ID token expired');
      }

      return {
        googleId: tokenInfo.sub,
        email: tokenInfo.email,
        name: tokenInfo.name,
        picture: tokenInfo.picture,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new UnauthorizedException('Invalid Google ID token');
        }
        throw new InternalServerErrorException(
          'Failed to verify Google ID token',
        );
      }

      if (
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to verify Google ID token',
      );
    }
  }

  /**
   * Download and return Google profile picture buffer
   */
  async downloadProfilePicture(pictureUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(pictureUrl, {
        responseType: 'arraybuffer',
        timeout: 15000, // 15 second timeout
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to download Google profile picture',
      );
    }
  }
}
