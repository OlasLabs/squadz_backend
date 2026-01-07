/**
 * E2E Test Seed File
 *
 * Creates predictable test data for E2E tests.
 * Run with: NODE_ENV=test ts-node prisma/seed.test.ts
 *
 * IMPORTANT:
 * - Uses FIXED IDs for predictable test references
 * - All test accounts have the same password: TestPassword123!
 * - Data is designed to cover all test scenarios
 *
 * Test Account Summary:
 * - captain1@test.com - Complete setup, CAPTAIN, PREMIUM
 * - captain2@test.com - Complete setup, CAPTAIN, PRO
 * - vicecaptain@test.com - Complete setup, VICE_CAPTAIN, PRO
 * - player1@test.com - Complete setup, PLAYER, BASIC
 * - player2@test.com - Complete setup, PLAYER, PRO
 * - player3@test.com - Complete setup, PLAYER, PREMIUM
 * - incomplete@test.com - Incomplete setup (page 2/4), USER
 * - unverified@test.com - Unverified email, USER
 * - admin@test.com - Complete setup, ADMIN, PREMIUM
 */

import {
  PrismaClient,
  Grade,
  Position,
  UserRole,
  SubscriptionTier,
  ContractType,
  ContractStatus,
  CompetitionType,
  CompetitionFormat,
  CompetitionStatus,
  MatchType,
  MatchStatus,
  MatchSide,
} from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

// Create PostgreSQL adapter with connection string
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// ===========================================
// EXPORTED TEST IDS (for use in E2E tests)
// ===========================================

export const TEST_IDS = {
  // Users
  ADMIN_USER_ID: 'test-admin-user-id-001',
  CAPTAIN_1_ID: 'test-captain-1-id-001',
  CAPTAIN_2_ID: 'test-captain-2-id-002',
  VICE_CAPTAIN_ID: 'test-vicecaptain-id-001',
  PLAYER_1_ID: 'test-player-1-id-001',
  PLAYER_2_ID: 'test-player-2-id-002',
  PLAYER_3_ID: 'test-player-3-id-003',
  INCOMPLETE_USER_ID: 'test-incomplete-user-id',
  UNVERIFIED_USER_ID: 'test-unverified-user-id',

  // Squads
  SQUAD_1_ID: 'test-squad-1-id-001', // NonCompSquad, owned by CAPTAIN_1
  SQUAD_2_ID: 'test-squad-2-id-002', // CompSquad, owned by CAPTAIN_2

  // Competitions
  COMPETITION_1_ID: 'test-competition-1-id',
  COMPETITION_2_ID: 'test-competition-2-id',

  // Divisions
  DIVISION_1_ID: 'test-division-1-id',

  // Matches
  MATCH_1_ID: 'test-match-1-id-001', // SCHEDULED
  MATCH_2_ID: 'test-match-2-id-002', // COMPLETED

  // Contracts
  CONTRACT_1_ID: 'test-contract-1-id', // ACTIVE
  CONTRACT_2_ID: 'test-contract-2-id', // PENDING

  // Challenges
  CHALLENGE_1_ID: 'test-challenge-1-id',
  CHALLENGE_2_ID: 'test-challenge-2-id',
};

// Standard test password
export const TEST_PASSWORD = 'TestPassword123!';

// Helper functions
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

async function main() {
  console.log('🧪 Starting E2E test seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Challenge" CASCADE`;

  const passwordHash = await hashPassword(TEST_PASSWORD);

  // ============================================
  // USERS
  // ============================================
  console.log('👤 Creating test users...');

  // Admin
  await prisma.user.create({
    data: {
      id: TEST_IDS.ADMIN_USER_ID,
      squadzId: 'SQZ-ADMN0001',
      email: 'admin@test.com',
      passwordHash,
      fullName: 'Test Admin',
      username: 'test_admin',
      emailVerified: true,
      role: UserRole.ADMIN,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'United States',
      currentLocation: 'San Francisco',
      favoriteTeam: 'San Francisco FC',
      psnId: 'TestAdmin',
      knownAsName: 'Admin',
      discordUserId: 'discord-admin-001',
      discordUsername: 'admin#0001',
      discordConnectedAt: new Date(),
      primaryPosition: Position.CM,
      subscriptionTier: SubscriptionTier.PREMIUM,
      totalXp: 5000,
      currentGrade: Grade.A,
      coinBalance: 10000,
      playerValuation: 12,
    },
  });

  // Captain 1 - Premium tier
  await prisma.user.create({
    data: {
      id: TEST_IDS.CAPTAIN_1_ID,
      squadzId: 'SQZ-CPT10001',
      email: 'captain1@test.com',
      passwordHash,
      fullName: 'Test Captain One',
      username: 'test_captain_1',
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
      favoriteTeam: 'Arsenal',
      psnId: 'TestCaptain1',
      knownAsName: 'Captain One',
      discordUserId: 'discord-captain1-001',
      discordUsername: 'captain1#0001',
      discordConnectedAt: new Date(),
      primaryPosition: Position.ST,
      secondaryPosition: Position.CF,
      avatarUrl: 'https://example.com/avatars/captain1.png',
      subscriptionTier: SubscriptionTier.PREMIUM,
      totalXp: 1000,
      currentGrade: Grade.B,
      coinBalance: 500,
      playerValuation: 10,
    },
  });

  // Captain 2 - Pro tier
  await prisma.user.create({
    data: {
      id: TEST_IDS.CAPTAIN_2_ID,
      squadzId: 'SQZ-CPT20002',
      email: 'captain2@test.com',
      passwordHash,
      fullName: 'Test Captain Two',
      username: 'test_captain_2',
      emailVerified: true,
      role: UserRole.CAPTAIN,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'Germany',
      currentLocation: 'Munich',
      favoriteTeam: 'Bayern Munich',
      psnId: 'TestCaptain2',
      knownAsName: 'Captain Two',
      discordUserId: 'discord-captain2-002',
      discordUsername: 'captain2#0002',
      discordConnectedAt: new Date(),
      primaryPosition: Position.CAM,
      secondaryPosition: Position.CM,
      subscriptionTier: SubscriptionTier.PRO,
      totalXp: 500,
      currentGrade: Grade.C,
      coinBalance: 200,
      playerValuation: 7,
    },
  });

  // Vice Captain - Pro tier
  await prisma.user.create({
    data: {
      id: TEST_IDS.VICE_CAPTAIN_ID,
      squadzId: 'SQZ-VCP10001',
      email: 'vicecaptain@test.com',
      passwordHash,
      fullName: 'Test Vice Captain',
      username: 'test_vice_captain',
      emailVerified: true,
      role: UserRole.VICE_CAPTAIN,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'France',
      currentLocation: 'Paris',
      favoriteTeam: 'PSG',
      psnId: 'TestViceCaptain',
      knownAsName: 'Vice Captain',
      discordUserId: 'discord-vicecaptain-001',
      discordUsername: 'vicecaptain#0001',
      discordConnectedAt: new Date(),
      primaryPosition: Position.CB,
      secondaryPosition: Position.CDM,
      subscriptionTier: SubscriptionTier.PRO,
      totalXp: 300,
      currentGrade: Grade.C,
      coinBalance: 100,
      playerValuation: 5,
    },
  });

  // Player 1 - Basic tier
  await prisma.user.create({
    data: {
      id: TEST_IDS.PLAYER_1_ID,
      squadzId: 'SQZ-PLY10001',
      email: 'player1@test.com',
      passwordHash,
      fullName: 'Test Player One',
      username: 'test_player_1',
      emailVerified: true,
      role: UserRole.PLAYER,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'Brazil',
      currentLocation: 'Rio de Janeiro',
      favoriteTeam: 'Flamengo',
      psnId: 'TestPlayer1',
      knownAsName: 'Player One',
      discordUserId: 'discord-player1-001',
      discordUsername: 'player1#0001',
      discordConnectedAt: new Date(),
      primaryPosition: Position.GK,
      subscriptionTier: SubscriptionTier.BASIC,
      totalXp: 100,
      currentGrade: Grade.D,
      coinBalance: 20,
      playerValuation: 3,
    },
  });

  // Player 2 - Pro tier
  await prisma.user.create({
    data: {
      id: TEST_IDS.PLAYER_2_ID,
      squadzId: 'SQZ-PLY20002',
      email: 'player2@test.com',
      passwordHash,
      fullName: 'Test Player Two',
      username: 'test_player_2',
      emailVerified: true,
      role: UserRole.PLAYER,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'Spain',
      currentLocation: 'Madrid',
      favoriteTeam: 'Real Madrid',
      psnId: 'TestPlayer2',
      knownAsName: 'Player Two',
      discordUserId: 'discord-player2-002',
      discordUsername: 'player2#0002',
      discordConnectedAt: new Date(),
      primaryPosition: Position.LW,
      secondaryPosition: Position.LM,
      subscriptionTier: SubscriptionTier.PRO,
      totalXp: 200,
      currentGrade: Grade.D,
      coinBalance: 50,
      playerValuation: 4,
    },
  });

  // Player 3 - Premium tier
  await prisma.user.create({
    data: {
      id: TEST_IDS.PLAYER_3_ID,
      squadzId: 'SQZ-PLY30003',
      email: 'player3@test.com',
      passwordHash,
      fullName: 'Test Player Three',
      username: 'test_player_3',
      emailVerified: true,
      role: UserRole.PLAYER,
      setupComplete: true,
      setupPagesCompleted: 4,
      page1Complete: true,
      page2Complete: true,
      page3Complete: true,
      page4Complete: true,
      nationality: 'Italy',
      currentLocation: 'Milan',
      favoriteTeam: 'AC Milan',
      psnId: 'TestPlayer3',
      knownAsName: 'Player Three',
      discordUserId: 'discord-player3-003',
      discordUsername: 'player3#0003',
      discordConnectedAt: new Date(),
      primaryPosition: Position.RB,
      secondaryPosition: Position.CB,
      subscriptionTier: SubscriptionTier.PREMIUM,
      totalXp: 400,
      currentGrade: Grade.C,
      coinBalance: 150,
      playerValuation: 6,
    },
  });

  // Incomplete user (setup not finished)
  await prisma.user.create({
    data: {
      id: TEST_IDS.INCOMPLETE_USER_ID,
      squadzId: 'SQZ-INC10001',
      email: 'incomplete@test.com',
      passwordHash,
      fullName: 'Test Incomplete User',
      username: 'test_incomplete',
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
      psnId: 'TestIncomplete',
      knownAsName: 'Incomplete',
      discordUserId: 'discord-incomplete-001',
      discordUsername: 'incomplete#0001',
      discordConnectedAt: new Date(),
    },
  });

  // Unverified user (email not verified)
  await prisma.user.create({
    data: {
      id: TEST_IDS.UNVERIFIED_USER_ID,
      squadzId: 'SQZ-UNV10001',
      email: 'unverified@test.com',
      passwordHash,
      fullName: 'Test Unverified User',
      username: 'test_unverified',
      emailVerified: false,
      emailVerificationOtp: '123456',
      otpExpiresAt: new Date(Date.now() + 3 * 60 * 1000),
      role: UserRole.USER,
    },
  });

  console.log(`  ✅ Created 9 test users`);

  // ============================================
  // SQUADS
  // ============================================
  console.log('🏆 Creating test squads...');

  // Squad 1 - NonCompSquad
  await prisma.squad.create({
    data: {
      id: TEST_IDS.SQUAD_1_ID,
      name: 'Test Lions',
      abbreviation: 'TLN',
      slogan: 'Test Pride',
      logoUrl: 'https://example.com/logos/test-lions.png',
      isCompSquad: false,
      captainId: TEST_IDS.CAPTAIN_1_ID,
      viceCaptainId: TEST_IDS.VICE_CAPTAIN_ID,
      squadBankBalance: 100,
      currentRosterSize: 5,
      inviteCode: 'SQD100-01',
      formation: '4-3-3',
    },
  });

  // Squad 2 - CompSquad
  await prisma.squad.create({
    data: {
      id: TEST_IDS.SQUAD_2_ID,
      name: 'Test Bears',
      abbreviation: 'TBR',
      slogan: 'Test Strength',
      logoUrl: 'https://example.com/logos/test-bears.png',
      isCompSquad: true,
      captainId: TEST_IDS.CAPTAIN_2_ID,
      viceCaptainId: TEST_IDS.PLAYER_2_ID,
      squadBankBalance: 200,
      currentRosterSize: 6,
      inviteCode: 'SQD200-02',
      formation: '4-4-2',
      trophyCount: 1,
    },
  });

  console.log(`  ✅ Created 2 test squads`);

  // ============================================
  // COMPETITIONS
  // ============================================
  console.log('🏅 Creating test competitions...');

  await prisma.competition.create({
    data: {
      id: TEST_IDS.COMPETITION_1_ID,
      name: 'Test Premier League',
      type: CompetitionType.LEAGUE,
      format: CompetitionFormat.ROUND_ROBIN,
      region: 'Europe',
      totalPrizePool: 1000,
      prizeDistribution: [
        { position: 1, amount: 500 },
        { position: 2, amount: 300 },
        { position: 3, amount: 200 },
      ],
      entryFee: 10,
      maxTeams: 8,
      registrationOpen: true,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: CompetitionStatus.REGISTRATION_OPEN,
      adminIds: [TEST_IDS.ADMIN_USER_ID],
    },
  });

  await prisma.competition.create({
    data: {
      id: TEST_IDS.COMPETITION_2_ID,
      name: 'Test Cup',
      type: CompetitionType.CUP,
      format: CompetitionFormat.KNOCKOUT,
      region: 'Europe',
      totalPrizePool: 500,
      prizeDistribution: [
        { position: 1, amount: 300 },
        { position: 2, amount: 200 },
      ],
      entryFee: 5,
      maxTeams: 16,
      registrationOpen: true,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: CompetitionStatus.UPCOMING,
      adminIds: [TEST_IDS.ADMIN_USER_ID],
    },
  });

  console.log(`  ✅ Created 2 test competitions`);

  // ============================================
  // DIVISIONS
  // ============================================
  console.log('📊 Creating test divisions...');

  await prisma.division.create({
    data: {
      id: TEST_IDS.DIVISION_1_ID,
      competitionId: TEST_IDS.COMPETITION_1_ID,
      name: 'Division 1',
      level: 1,
      standings: [],
    },
  });

  console.log(`  ✅ Created 1 test division`);

  // ============================================
  // MATCHES
  // ============================================
  console.log('⚽ Creating test matches...');

  // Match 1 - Scheduled
  const match1 = await prisma.match.create({
    data: {
      id: TEST_IDS.MATCH_1_ID,
      competitionId: TEST_IDS.COMPETITION_1_ID,
      divisionId: TEST_IDS.DIVISION_1_ID,
      matchType: MatchType.LEAGUE,
      scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: MatchStatus.SCHEDULED,
    },
  });

  // Match squads for match 1
  await prisma.matchSquad.createMany({
    data: [
      { matchId: match1.id, squadId: TEST_IDS.SQUAD_1_ID, side: MatchSide.HOME },
      { matchId: match1.id, squadId: TEST_IDS.SQUAD_2_ID, side: MatchSide.AWAY },
    ],
  });

  // Match 2 - Completed
  const match2 = await prisma.match.create({
    data: {
      id: TEST_IDS.MATCH_2_ID,
      competitionId: TEST_IDS.COMPETITION_1_ID,
      divisionId: TEST_IDS.DIVISION_1_ID,
      matchType: MatchType.LEAGUE,
      scheduledTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: MatchStatus.COMPLETED,
      homeScore: 3,
      awayScore: 1,
      resultVerified: true,
      verifiedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      matchFacts: {
        goalscorers: [
          { playerId: TEST_IDS.CAPTAIN_1_ID, minute: 15, type: 'goal' },
          { playerId: TEST_IDS.CAPTAIN_1_ID, minute: 45, type: 'goal' },
          { playerId: TEST_IDS.VICE_CAPTAIN_ID, minute: 78, type: 'goal' },
          { playerId: TEST_IDS.CAPTAIN_2_ID, minute: 60, type: 'goal' },
        ],
      },
    },
  });

  await prisma.matchSquad.createMany({
    data: [
      { matchId: match2.id, squadId: TEST_IDS.SQUAD_1_ID, side: MatchSide.HOME },
      { matchId: match2.id, squadId: TEST_IDS.SQUAD_2_ID, side: MatchSide.AWAY },
    ],
  });

  console.log(`  ✅ Created 2 test matches`);

  // ============================================
  // CONTRACTS
  // ============================================
  console.log('📝 Creating test contracts...');

  // Active contract
  await prisma.contract.create({
    data: {
      id: TEST_IDS.CONTRACT_1_ID,
      playerId: TEST_IDS.PLAYER_1_ID,
      squadId: TEST_IDS.SQUAD_1_ID,
      captainId: TEST_IDS.CAPTAIN_1_ID,
      contractType: ContractType.INIT_CONTRACT,
      positions: [Position.GK],
      status: ContractStatus.ACTIVE,
      acceptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  });

  // Pending contract
  await prisma.contract.create({
    data: {
      id: TEST_IDS.CONTRACT_2_ID,
      playerId: TEST_IDS.PLAYER_3_ID,
      squadId: TEST_IDS.SQUAD_1_ID,
      captainId: TEST_IDS.CAPTAIN_1_ID,
      contractType: ContractType.INIT_CONTRACT,
      positions: [Position.RB, Position.CB],
      status: ContractStatus.PENDING,
    },
  });

  console.log(`  ✅ Created 2 test contracts`);

  // ============================================
  // CHALLENGES
  // ============================================
  console.log('🎯 Creating test challenges...');

  await prisma.challenge.createMany({
    data: [
      {
        id: TEST_IDS.CHALLENGE_1_ID,
        title: 'Test Easy Challenge',
        description: 'Score 1 goal in any match',
        difficulty: 'EASY',
        xpReward: 6,
        challengeType: 'MATCH_BASED',
        validationRules: { metric: 'goals', operator: 'gte', threshold: 1 },
        isActive: true,
      },
      {
        id: TEST_IDS.CHALLENGE_2_ID,
        title: 'Test Medium Challenge',
        description: 'Get 2 assists in a match',
        difficulty: 'MEDIUM',
        xpReward: 10,
        coinReward: 1,
        challengeType: 'MATCH_BASED',
        validationRules: { metric: 'assists', operator: 'gte', threshold: 2 },
        isActive: true,
      },
    ],
  });

  console.log(`  ✅ Created 2 test challenges`);

  console.log('\n✨ E2E test seed completed successfully!');
  console.log('\n📋 Test Accounts (all use password: TestPassword123!):');
  console.log('  Admin:        admin@test.com');
  console.log('  Captain 1:    captain1@test.com (PREMIUM)');
  console.log('  Captain 2:    captain2@test.com (PRO)');
  console.log('  Vice Captain: vicecaptain@test.com (PRO)');
  console.log('  Player 1:     player1@test.com (BASIC)');
  console.log('  Player 2:     player2@test.com (PRO)');
  console.log('  Player 3:     player3@test.com (PREMIUM)');
  console.log('  Incomplete:   incomplete@test.com');
  console.log('  Unverified:   unverified@test.com');
}

main()
  .catch((e) => {
    console.error('❌ E2E test seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

