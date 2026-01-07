import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class SetupCompleteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Per auth-strategy.mdc: Must be PLAYER role AND setup complete
    if (!user.setupComplete || user.role === UserRole.USER) {
      throw new ForbiddenException(
        'Account setup incomplete. Please complete all setup pages to become a Player.',
      );
    }

    return true;
  }
}

