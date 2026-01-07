import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SquadzIdGeneratorService } from './services/squadz-id-generator.service';
import { OtpGeneratorService } from './services/otp-generator.service';
import { TokenGeneratorService } from './services/token-generator.service';
import { AppleOAuthService } from './services/apple-oauth.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    SquadzIdGeneratorService,
    OtpGeneratorService,
    TokenGeneratorService,
    AppleOAuthService,
    GoogleOAuthService,
  ],
  exports: [AuthService, JwtAuthGuard, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
