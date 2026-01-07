import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  sub: string;
  email: string;
  squadzId: string;
  role: UserRole;
  setupComplete: boolean;
  setupPagesCompleted: number;
  emailVerified: boolean;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  /**
   * Validate JWT payload and attach user to request
   */
  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email || !payload.squadzId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return user object that will be attached to request.user
    return {
      id: payload.sub,
      sub: payload.sub, // Alias for id (used in guards)
      email: payload.email,
      squadzId: payload.squadzId,
      role: payload.role,
      setupComplete: payload.setupComplete,
      setupPagesCompleted: payload.setupPagesCompleted,
      emailVerified: payload.emailVerified,
    };
  }
}
