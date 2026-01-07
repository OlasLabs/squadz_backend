import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import JwksRsa from 'jwks-rsa';

interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string; // Apple User ID
  email?: string;
  email_verified?: boolean;
}

export interface AppleUserProfile {
  appleId: string;
  email: string;
  name?: string;
}

@Injectable()
export class AppleOAuthService {
  private jwksClient: JwksRsa.JwksClient;

  constructor(private config: ConfigService) {
    // Initialize JWKS client to fetch Apple's public keys
    this.jwksClient = JwksRsa({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
    });
  }

  /**
   * Verify Apple ID token and extract user profile
   */
  async verifyIdToken(idToken: string): Promise<AppleUserProfile> {
    try {
      // Decode token header to get kid (key ID)
      const decodedToken = jwt.decode(idToken, { complete: true });

      if (!decodedToken || !decodedToken.header.kid) {
        throw new UnauthorizedException('Invalid Apple ID token format');
      }

      // Fetch signing key from Apple's JWKS
      const key = await this.getSigningKey(decodedToken.header.kid);

      // Verify token signature and claims
      const payload = jwt.verify(idToken, key, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: this.config.get<string>('APPLE_CLIENT_ID'),
      }) as AppleIdTokenPayload;

      // Validate required fields
      if (!payload.sub) {
        throw new UnauthorizedException('Apple ID token missing user ID');
      }

      if (!payload.email) {
        throw new UnauthorizedException('Apple ID token missing email');
      }

      return {
        appleId: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid Apple ID token');
      }

      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Apple ID token expired');
      }

      throw new InternalServerErrorException('Failed to verify Apple ID token');
    }
  }

  /**
   * Fetch signing key from Apple's JWKS
   */
  private async getSigningKey(kid: string): Promise<string> {
    try {
      const key = await this.jwksClient.getSigningKey(kid);
      return key.getPublicKey();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch Apple signing key',
      );
    }
  }
}
