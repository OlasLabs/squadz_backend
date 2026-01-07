import { UserRole } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    squadzId: string;
    email: string;
    role: UserRole;
    setupComplete: boolean;
    setupPagesCompleted: number;
    emailVerified: boolean;
  };
  isNewUser?: boolean; // For OAuth flows (signup vs login)
}
