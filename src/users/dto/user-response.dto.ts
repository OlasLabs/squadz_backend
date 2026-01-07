import { UserRole, SubscriptionTier, Position } from '@prisma/client';

export class UserResponseDto {
  id: string;
  squadzId: string;
  email: string;
  fullName: string;
  knownAsName?: string;
  role: UserRole;
  setupComplete: boolean;
  setupPagesCompleted: number;
  emailVerified: boolean;
  nationality?: string;
  currentLocation?: string;
  favouriteTeam?: string;
  psnId?: string;
  primaryPosition?: Position;
  secondaryPosition?: Position;
  avatarUrl?: string;
  avatarThumbnailUrl?: string;
  discordUserId?: string;
  discordUsername?: string;
  subscriptionTier: SubscriptionTier;
  totalXp: number;
  coinBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

