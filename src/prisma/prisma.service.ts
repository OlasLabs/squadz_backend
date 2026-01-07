import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * PrismaService manages database connection lifecycle using Prisma 7.
 *
 * Prisma 7 Changes:
 * - Uses driver adapters (PrismaPg) instead of built-in engine
 * - Import from generated path, not @prisma/client
 * - No more $use middleware (use extensions instead)
 *
 * Features:
 * - Automatic connection on module initialization
 * - Graceful shutdown on application termination
 * - Connection pooling via pg driver
 * - Soft delete helper methods for User and Squad tables
 *
 * @see https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Create PostgreSQL adapter with connection string
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    // Initialize PrismaClient with the adapter
    super({ adapter });
  }

  /**
   * Connect to database when module initializes
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database when module is destroyed
   * Ensures graceful shutdown and connection cleanup
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Find a user by ID, excluding soft-deleted records
   */
  async findActiveUser(id: string) {
    return this.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Find a squad by ID, excluding soft-deleted records
   */
  async findActiveSquad(id: string) {
    return this.squad.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Soft delete a user
   */
  async softDeleteUser(id: string) {
    return this.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Soft delete a squad
   */
  async softDeleteSquad(id: string) {
    return this.squad.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Clean the database for testing purposes
   * WARNING: This will delete ALL data from ALL tables
   * Only use in test environment
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production environment');
    }

    this.logger.warn('Cleaning database - all data will be deleted');

    // Delete in order respecting foreign key constraints
    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`);

    try {
      await this.$executeRawUnsafe(
        `TRUNCATE TABLE ${tables.join(', ')} CASCADE;`,
      );
      this.logger.log('Database cleaned successfully');
    } catch (error) {
      this.logger.error('Failed to clean database', error);
      throw error;
    }
  }
}
