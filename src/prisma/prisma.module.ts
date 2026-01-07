import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule provides the PrismaService globally across the application.
 *
 * Marked as @Global() so other modules don't need to import it explicitly.
 * Simply inject PrismaService into any service or controller.
 *
 * Example usage in a service:
 * ```typescript
 * @Injectable()
 * export class UsersService {
 *   constructor(private prisma: PrismaService) {}
 *
 *   async findById(id: string) {
 *     return this.prisma.user.findUnique({ where: { id } });
 *   }
 * }
 * ```
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

