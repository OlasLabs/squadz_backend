/**
 * Development Seed File
 *
 * Creates sample data for manual development and testing.
 * Run with: npx prisma db seed
 *
 * This seed provides:
 * - Sample users with different roles and tiers
 * - Sample squads with various states
 * - Sample competitions and matches
 * - Sample contracts in different states
 */

import {
  PrismaClient,
  Grade,
  Position,
  UserRole,
  SubscriptionTier,
} from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// Create PostgreSQL adapter with connection string
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Helper to hash passwords
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// Helper to generate SQUADZ ID
const generateSquadzId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'SQZ-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// Helper to generate squad invite code
const generateInviteCode = (): string => {
  const num1 = Math.floor(Math.random() * 900) + 100;
  const num2 = Math.floor(Math.random() * 90) + 10;
  return `SQD${num1}-${num2}`;
};

async function main() {
  console.log('🌱 Starting development seed...');

  // Clear existing data (respecting foreign keys)
  console.log('🗑️  Clearing existing data...');

  // Clear User (cascades to everything related)

  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;

  // Clear Challenge (independent table)
  await prisma.$executeRaw`TRUNCATE TABLE "Challenge" CASCADE`;

  // ============================================
  // USERS
  // ============================================
  console.log('👤 Creating users...');

  const passwordHash = await hashPassword('Password123!');

  // Admin user
  const admin = await prisma.user.create({
    data: {
      squadzId: generateSquadzId(),
      email: 'admin@squadz.app',
      passwordHash,
      fullName: 'Admin User',
      username: 'admin',
      emailVerified: true,
      role: UserRole.ADMIN,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'United States',
      currentLocation: 'Los Angeles',
      favoriteTeam: 'Los Angeles FC',
      psnId: 'Admin_PSN',
      knownAsName: 'Admin',
      primaryPosition: Position.CM,
      secondaryPosition: Position.CAM,
      subscriptionTier: SubscriptionTier.PREMIUM,
      totalXp: 1000,
      currentGrade: Grade.A,
      coinBalance: 1000,
    },
  });
  console.log(`  ✅ Created admin: ${admin.email}`);

  // Captain with Premium tier (complete setup)
  const captain1 = await prisma.user.create({
    data: {
      squadzId: generateSquadzId(),
      email: 'captain1@test.com',
      passwordHash,
      fullName: 'James Rodriguez',
      username: 'captain_james',
      emailVerified: true,
      role: UserRole.CAPTAIN,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'United Kingdom',
      currentLocation: 'London',
      favoriteTeam: 'Chelsea FC',
      psnId: 'CaptainJames99',
      knownAsName: 'James',
      discordUserId: '123456789012345678',
      discordUsername: 'james#1234',
      discordConnectedAt: new Date(),
      primaryPosition: Position.ST,
      secondaryPosition: Position.CF,
      avatarUrl: 'https://example.com/avatars/captain1.png',
      subscriptionTier: SubscriptionTier.PREMIUM,
      totalXp: 500,
      currentGrade: Grade.B,
      coinBalance: 100,
      playerValuation: 8,
    },
  });
  console.log(`  ✅ Created captain: ${captain1.email}`);

  // Captain with Pro tier
  const captain2 = await prisma.user.create({
    data: {
      squadzId: generateSquadzId(),
      email: 'captain2@test.com',
      passwordHash,
      fullName: 'Sarah Williams',
      username: 'captain_sarah',
      emailVerified: true,
      role: UserRole.CAPTAIN,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'Germany',
      currentLocation: 'Berlin',
      favoriteTeam: 'Bayern Munich',
      psnId: 'SarahBoss',
      knownAsName: 'Sarah',
      discordUserId: '223456789012345678',
      discordUsername: 'sarah#5678',
      discordConnectedAt: new Date(),
      primaryPosition: Position.CAM,
      secondaryPosition: Position.CM,
      subscriptionTier: SubscriptionTier.PRO,
      totalXp: 300,
      currentGrade: Grade.C,
      coinBalance: 50,
      playerValuation: 6,
    },
  });
  console.log(`  ✅ Created captain: ${captain2.email}`);

  // Vice Captain
  const viceCaptain = await prisma.user.create({
    data: {
      squadzId: generateSquadzId(),
      email: 'vicecaptain@test.com',
      passwordHash,
      fullName: 'Michael Johnson',
      username: 'vice_mike',
      emailVerified: true,
      role: UserRole.VICE_CAPTAIN,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'United States',
      currentLocation: 'New York',
      favoriteTeam: 'New York City FC',
      psnId: 'ViceMike',
      knownAsName: 'Mike',
      discordUserId: '323456789012345678',
      discordUsername: 'mike#9012',
      discordConnectedAt: new Date(),
      primaryPosition: Position.CB,
      secondaryPosition: Position.CDM,
      subscriptionTier: SubscriptionTier.PRO,
      totalXp: 200,
      currentGrade: Grade.C,
      coinBalance: 30,
      playerValuation: 5,
    },
  });
  console.log(`  ✅ Created vice captain: ${viceCaptain.email}`);

  // Regular players with complete setup
  const players = await Promise.all([
    prisma.user.create({
      data: {
        squadzId: generateSquadzId(),
        email: 'player1@test.com',
        passwordHash,
        fullName: 'Alex Smith',
        username: 'alex_smith',
        emailVerified: true,
        role: UserRole.PLAYER,
        setupComplete: true,
        setupPagesCompleted: 4,
        page1Complete: true,
        page2Complete: true,
        page3Complete: true,
        page4Complete: true,
        nationality: 'Brazil',
        currentLocation: 'São Paulo',
        favoriteTeam: 'São Paulo FC',
        psnId: 'AlexBR',
        knownAsName: 'Alex',
        discordUserId: '423456789012345678',
        discordUsername: 'alex#3456',
        discordConnectedAt: new Date(),
        primaryPosition: Position.GK,
        secondaryPosition: null,
        subscriptionTier: SubscriptionTier.BASIC,
        totalXp: 100,
        currentGrade: Grade.D,
        coinBalance: 10,
        playerValuation: 3,
      },
    }),
    prisma.user.create({
      data: {
        squadzId: generateSquadzId(),
        email: 'player2@test.com',
        passwordHash,
        fullName: 'Emma Davis',
        username: 'emma_d',
        emailVerified: true,
        role: UserRole.PLAYER,
        setupComplete: true,
        setupPagesCompleted: 4,
        page1Complete: true,
        page2Complete: true,
        page3Complete: true,
        page4Complete: true,
        nationality: 'France',
        currentLocation: 'Paris',
        favoriteTeam: 'Paris Saint-Germain',
        psnId: 'EmmaPSG',
        knownAsName: 'Emma',
        discordUserId: '523456789012345678',
        discordUsername: 'emma#7890',
        discordConnectedAt: new Date(),
        primaryPosition: Position.LW,
        secondaryPosition: Position.LM,
        subscriptionTier: SubscriptionTier.PRO,
        totalXp: 150,
        currentGrade: Grade.D,
        coinBalance: 25,
        playerValuation: 4,
      },
    }),
    prisma.user.create({
      data: {
        squadzId: generateSquadzId(),
        email: 'player3@test.com',
        passwordHash,
        fullName: 'Lucas Martinez',
        username: 'lucas_m',
        emailVerified: true,
        role: UserRole.PLAYER,
        setupComplete: true,
        setupPagesCompleted: 4,
        page1Complete: true,
        page2Complete: true,
        page3Complete: true,
        page4Complete: true,
        nationality: 'Argentina',
        currentLocation: 'Buenos Aires',
        favoriteTeam: 'Boca Juniors',
        psnId: 'LucasBoca',
        knownAsName: 'Lucas',
        discordUserId: '623456789012345678',
        discordUsername: 'lucas#1234',
        discordConnectedAt: new Date(),
        primaryPosition: Position.RB,
        secondaryPosition: Position.CB,
        subscriptionTier: SubscriptionTier.BASIC,
        totalXp: 75,
        currentGrade: Grade.D,
        coinBalance: 5,
        playerValuation: 2,
      },
    }),
  ]);
  console.log(`  ✅ Created ${players.length} regular players`);

  // User with incomplete setup (for testing setup flow)
  const incompleteUser = await prisma.user.create({
    data: {
      squadzId: generateSquadzId(),
      email: 'incomplete@test.com',
      passwordHash,
      fullName: 'Incomplete User',
      username: 'incomplete_user',
      emailVerified: true,
      role: UserRole.USER,
      setupComplete: false,
      setupPagesCompleted: 2,
      page1Complete: true,
      page2Complete: true,
      page3Complete: false,
      page4Complete: false,
      nationality: 'Canada',
      currentLocation: 'Toronto',
      favoriteTeam: 'Toronto FC',
      psnId: 'Incomplete123',
      knownAsName: 'Incomplete',
      discordUserId: '723456789012345678',
      discordUsername: 'incomplete#0000',
      discordConnectedAt: new Date(),
    },
  });
  console.log(`  ✅ Created incomplete user: ${incompleteUser.email}`);

  // User with unverified email
  const unverifiedUser = await prisma.user.create({
    data: {
      squadzId: generateSquadzId(),
      email: 'unverified@test.com',
      passwordHash,
      fullName: 'Unverified User',
      username: 'unverified_user',
      emailVerified: false,
      emailVerificationOtp: '123456',
      otpExpiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes from now
      role: UserRole.USER,
    },
  });
  console.log(`  ✅ Created unverified user: ${unverifiedUser.email}`);

  // ============================================
  // SQUADS
  // ============================================
  console.log('🏆 Creating squads...');

  // NonCompSquad (not registered for any competition)
  const squad1 = await prisma.squad.create({
    data: {
      name: 'London Lions',
      abbreviation: 'LON',
      slogan: 'Pride of the Pride',
      logoUrl: 'https://example.com/logos/lions.png',
      isCompSquad: false,
      captainId: captain1.id,
      viceCaptainId: viceCaptain.id,
      squadBankBalance: 50,
      currentRosterSize: 5,
      inviteCode: generateInviteCode(),
      formation: '4-3-3',
    },
  });
  console.log(`  ✅ Created squad: ${squad1.name}`);

  // CompSquad (registered for competition)
  const squad2 = await prisma.squad.create({
    data: {
      name: 'Berlin Bears',
      abbreviation: 'BER',
      slogan: 'Strength in Unity',
      logoUrl: 'https://example.com/logos/bears.png',
      isCompSquad: true,
      captainId: captain2.id,
      viceCaptainId: players[1].id,
      squadBankBalance: 100,
      currentRosterSize: 6,
      inviteCode: generateInviteCode(),
      formation: '4-4-2',
      trophyCount: 2,
    },
  });
  console.log(`  ✅ Created squad: ${squad2.name}`);

  // ============================================
  // CHALLENGES
  // ============================================
  console.log('🎯 Creating challenges...');

  await prisma.challenge.createMany({
    data: [
      {
        title: 'First Goal',
        description: 'Score your first goal in a competitive match',
        difficulty: 'EASY',
        xpReward: 6,
        challengeType: 'MATCH_BASED',
        validationRules: { metric: 'goals', operator: 'gte', threshold: 1 },
        isActive: true,
      },
      {
        title: 'Hat Trick Hero',
        description: 'Score 3 goals in a single match',
        difficulty: 'DIFFICULT',
        xpReward: 20,
        coinReward: 2,
        challengeType: 'MATCH_BASED',
        validationRules: { metric: 'goals', operator: 'gte', threshold: 3 },
        isActive: true,
      },
      {
        title: 'Clean Sheet King',
        description: 'Keep a clean sheet as a defender or goalkeeper',
        difficulty: 'MEDIUM',
        xpReward: 10,
        coinReward: 1,
        challengeType: 'MATCH_BASED',
        validationRules: {
          metric: 'cleanSheets',
          operator: 'gte',
          threshold: 1,
        },
        isActive: true,
      },
      {
        title: 'Weekly Warrior',
        description: 'Play 5 matches in a week',
        difficulty: 'MEDIUM',
        xpReward: 10,
        coinReward: 1,
        challengeType: 'WEEKLY',
        validationRules: {
          metric: 'matchesPlayed',
          operator: 'gte',
          threshold: 5,
        },
        isActive: true,
      },
      {
        title: 'Squad Goals',
        description: 'Your squad scores 10 goals in a week',
        difficulty: 'SQUAD',
        xpReward: 10,
        challengeType: 'WEEKLY',
        validationRules: {
          metric: 'squadGoals',
          operator: 'gte',
          threshold: 10,
        },
        isActive: true,
      },
    ],
  });
  console.log(`  ✅ Created 5 challenges`);

  console.log('\n✨ Development seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin:        admin@squadz.app / Password123!');
  console.log('  Captain 1:    captain1@test.com / Password123!');
  console.log('  Captain 2:    captain2@test.com / Password123!');
  console.log('  Vice Captain: vicecaptain@test.com / Password123!');
  console.log('  Player 1:     player1@test.com / Password123!');
  console.log('  Player 2:     player2@test.com / Password123!');
  console.log('  Player 3:     player3@test.com / Password123!');
  console.log('  Incomplete:   incomplete@test.com / Password123!');
  console.log('  Unverified:   unverified@test.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
