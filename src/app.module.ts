import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';
import { DiscordModule } from './discord/discord.module';
import { NotificationsModule } from './notifications/notifications.module';

/**
 * Root application module for SQUADZ backend.
 *
 * Imports:
 * - ConfigModule: Environment variable management (global)
 * - PrismaModule: Database access (global)
 * - AuthModule: Authentication & JWT (Milestone 1)
 * - UsersModule: User profiles & setup (Milestone 1)
 * - MediaModule: Image processing (avatar upload) (Milestone 1)
 * - DiscordModule: Discord OAuth & channel management (Milestone 1)
 * - NotificationsModule: Email notifications (Milestone 1 - Phase 6) ✅
 *
 * Feature modules to be added:
 * - SquadsModule (Milestone 2)
 * - ContractsModule (Milestone 2)
 * - CompetitionsModule (Milestone 2)
 * - etc.
 */
@Module({
  imports: [
    // Global configuration module - loads .env file
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
      envFilePath: ['.env', '.env.local'], // Load .env files
    }),

    // Global Prisma module - provides database access everywhere
    PrismaModule,

    // Feature modules (Milestone 1)
    AuthModule,
    UsersModule,
    MediaModule,
    DiscordModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
