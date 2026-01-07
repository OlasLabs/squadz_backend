-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL_PASSWORD', 'GOOGLE', 'APPLE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'PLAYER', 'VICE_CAPTAIN', 'CAPTAIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BASIC', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('IOS', 'ANDROID');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('GK', 'RB', 'CB', 'LB', 'RWB', 'LWB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'RW', 'LW', 'ST', 'CF', 'SS');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('D', 'C', 'B', 'A');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('INIT_CONTRACT', 'COMP_CONTRACT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED', 'TERMINATED', 'BROKEN');

-- CreateEnum
CREATE TYPE "CompetitionType" AS ENUM ('LEAGUE', 'CUP');

-- CreateEnum
CREATE TYPE "CompetitionFormat" AS ENUM ('KNOCKOUT', 'ROUND_ROBIN', 'LEAGUE_AND_KNOCKOUT');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('LEAGUE', 'CUP', 'FRIENDLY');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LINEUP_SUBMITTED', 'READY', 'LIVE', 'DONE', 'RESULT_SUBMITTED', 'VERIFIED', 'COMPLETED', 'FORFEIT');

-- CreateEnum
CREATE TYPE "MatchSide" AS ENUM ('HOME', 'AWAY');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('NONE', 'PENDING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "TransferPoolStatus" AS ENUM ('FREE_AGENT', 'TRANSFER_LISTED');

-- CreateEnum
CREATE TYPE "TransferRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'DIFFICULT', 'SQUAD');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('MATCH_BASED', 'WEEKLY', 'SEASONAL');

-- CreateEnum
CREATE TYPE "PlayerChallengeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "XpSource" AS ENUM ('MATCH_WIN', 'MATCH_DRAW', 'MATCH_LOSS', 'GOAL_SCORED', 'ASSIST', 'CLEAN_SHEET', 'MATCH_RATING_HIGH', 'MATCH_RATING_GOOD', 'FULL_MATCH', 'PARTIAL_MATCH', 'NO_FOULS', 'TACKLE', 'MVP', 'CHALLENGE_EASY', 'CHALLENGE_MEDIUM', 'CHALLENGE_DIFFICULT', 'CHALLENGE_SQUAD', 'TEAM_WIN_STREAK', 'TEAM_GOALS_WEEK', 'TEAM_CLEAN_SHEETS', 'TEAM_UNBEATEN');

-- CreateEnum
CREATE TYPE "CoinTransactionType" AS ENUM ('PURCHASE', 'CONTRACT_BREAK', 'TRANSFER_FEE', 'REGISTRATION', 'CHALLENGE_UNLOCK', 'CHALLENGE_REWARD', 'LATE_LINEUP', 'SQUAD_PASS', 'REFUND', 'ADMIN_CREDIT');

-- CreateEnum
CREATE TYPE "SquadBankTransactionType" AS ENUM ('CAPTAIN_DEPOSIT', 'CONTRACT_FEE_RECEIVED', 'TRANSFER_FEE_RECEIVED', 'REGISTRATION_FEE', 'LATE_LINEUP_FEE', 'SQUAD_PASS_PURCHASE', 'TRANSFER_FEE_PAID', 'PLAYER_REGISTRATION');

-- CreateEnum
CREATE TYPE "CashTransactionType" AS ENUM ('PRIZE_AWARDED', 'WITHDRAWAL_REQUESTED', 'WITHDRAWAL_COMPLETED', 'REFUND');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONTRACT_OFFER', 'CONTRACT_ACCEPTED', 'CONTRACT_DECLINED', 'TRANSFER_REQUEST', 'TRANSFER_ACCEPTED', 'MATCH_REMINDER', 'LINEUP_DUE', 'MATCH_READY', 'RESULT_SUBMITTED', 'RESULT_VERIFIED', 'DISPUTE_CREATED', 'DISPUTE_RESOLVED', 'CHALLENGE_COMPLETE', 'XP_EARNED', 'GRADE_PROMOTED', 'SUBSCRIPTION_RENEWAL', 'SUBSCRIPTION_CANCELLED');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('GMAIL', 'WHATSAPP', 'TWITTER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "squadzId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'EMAIL_PASSWORD',
    "googleId" TEXT,
    "appleId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationOtp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "accountLockedUntil" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "setupComplete" BOOLEAN NOT NULL DEFAULT false,
    "setupPagesCompleted" INTEGER NOT NULL DEFAULT 0,
    "page1Complete" BOOLEAN NOT NULL DEFAULT false,
    "page2Complete" BOOLEAN NOT NULL DEFAULT false,
    "page3Complete" BOOLEAN NOT NULL DEFAULT false,
    "page4Complete" BOOLEAN NOT NULL DEFAULT false,
    "nationality" TEXT,
    "currentLocation" TEXT,
    "favoriteTeam" TEXT,
    "psnId" TEXT,
    "knownAsName" TEXT,
    "discordUserId" TEXT,
    "discordUsername" TEXT,
    "discordConnectedAt" TIMESTAMP(3),
    "primaryPosition" "Position",
    "secondaryPosition" "Position",
    "avatarUrl" TEXT,
    "avatarThumbnailUrl" TEXT,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "currentGrade" "Grade" NOT NULL DEFAULT 'D',
    "playerValuation" INTEGER NOT NULL DEFAULT 2,
    "valuationLastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'BASIC',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "subscriptionPlatform" "Platform",
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "gracePeriodEnd" TIMESTAMP(3),
    "coinBalance" INTEGER NOT NULL DEFAULT 0,
    "cashBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenVersion" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squad" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "slogan" TEXT,
    "logoUrl" TEXT NOT NULL,
    "isCompSquad" BOOLEAN NOT NULL DEFAULT false,
    "captainId" TEXT NOT NULL,
    "viceCaptainId" TEXT,
    "squadBankBalance" INTEGER NOT NULL DEFAULT 0,
    "currentRosterSize" INTEGER NOT NULL DEFAULT 0,
    "maxRosterSize" INTEGER NOT NULL DEFAULT 14,
    "inviteCode" TEXT NOT NULL,
    "formation" TEXT,
    "trophyCount" INTEGER NOT NULL DEFAULT 0,
    "discordChannelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Squad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "competitionId" TEXT,
    "positions" "Position"[],
    "winningsSharePercent" DECIMAL(65,30),
    "winningsShareAmount" DECIMAL(65,30),
    "transferFee" INTEGER,
    "optionalNotes" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),
    "breakFee" INTEGER,
    "brokenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CompetitionType" NOT NULL,
    "format" "CompetitionFormat" NOT NULL,
    "region" TEXT NOT NULL,
    "totalPrizePool" DECIMAL(65,30) NOT NULL,
    "prizeDistribution" JSONB NOT NULL,
    "entryFee" INTEGER NOT NULL,
    "maxTeams" INTEGER NOT NULL,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "rulesUrl" TEXT,
    "specificRules" JSONB,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'UPCOMING',
    "bannerImageUrl" TEXT,
    "logoUrl" TEXT,
    "adminIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionRegistration" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "registeredBy" TEXT NOT NULL,
    "registrationFee" INTEGER NOT NULL,
    "registeredPlayerIds" TEXT[],
    "subIneligiblePlayerIds" TEXT[],
    "usedSquadPass" BOOLEAN NOT NULL DEFAULT false,
    "squadPassPurchasedAt" TIMESTAMP(3),
    "viceCaptainId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "CompetitionRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "standings" JSONB NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "divisionId" TEXT,
    "matchType" "MatchType" NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "homeReadyAt" TIMESTAMP(3),
    "awayReadyAt" TIMESTAMP(3),
    "homeDoneAt" TIMESTAMP(3),
    "awayDoneAt" TIMESTAMP(3),
    "discordChannelId" TEXT,
    "homeSubmittedAt" TIMESTAMP(3),
    "awaySubmittedAt" TIMESTAMP(3),
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "resultVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "matchFacts" JSONB,
    "disputeStatus" "DisputeStatus" NOT NULL DEFAULT 'NONE',
    "disputeCategories" TEXT[],
    "disputeResolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchSquad" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "side" "MatchSide" NOT NULL,

    CONSTRAINT "MatchSquad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchLineup" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "formation" TEXT NOT NULL,
    "startingPlayerIds" TEXT[],
    "substitutePlayerIds" TEXT[],
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "lateFee" INTEGER,

    CONSTRAINT "MatchLineup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipation" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "isStarting" BOOLEAN NOT NULL DEFAULT false,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "tackles" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "matchRating" DECIMAL(65,30),
    "isMvp" BOOLEAN NOT NULL DEFAULT false,
    "isCleanSheet" BOOLEAN NOT NULL DEFAULT false,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MatchParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerRating" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "raterPlayerId" TEXT NOT NULL,
    "ratedPlayerId" TEXT NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "categories" TEXT[],
    "description" TEXT NOT NULL,
    "evidenceUploaded" BOOLEAN NOT NULL DEFAULT false,
    "discordChannelId" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "penaltyApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamLink" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferPoolEntry" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "poolStatus" "TransferPoolStatus" NOT NULL,
    "listedBySquadId" TEXT,
    "listedByCaptainId" TEXT,
    "transferFee" INTEGER,
    "preferredPosition" "Position" NOT NULL,
    "secondaryPosition" "Position",
    "contractType" "ContractType" NOT NULL,
    "openToViceCaptain" BOOLEAN NOT NULL DEFAULT false,
    "enableDiscordContact" BOOLEAN NOT NULL DEFAULT true,
    "enteredPoolAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitedPoolAt" TIMESTAMP(3),

    CONSTRAINT "TransferPoolEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "sendingCaptainId" TEXT NOT NULL,
    "receivingPlayerId" TEXT NOT NULL,
    "targetSquadId" TEXT NOT NULL,
    "currentSquadId" TEXT,
    "transferFee" INTEGER,
    "signingFee" INTEGER NOT NULL,
    "registrationFee" INTEGER NOT NULL DEFAULT 2,
    "totalCost" INTEGER NOT NULL,
    "discordChannelId" TEXT,
    "status" "TransferRequestStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferWindow" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TransferWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCard" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "position" "Position" NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "tierBadge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPlayerCard" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "cardImageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "position" "Position" NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPlayerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeScreenshot" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "screenshotUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextUploadAllowed" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XpTransaction" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" "XpSource" NOT NULL,
    "matchId" TEXT,
    "challengeId" TEXT,
    "description" TEXT,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "squadId" TEXT,
    "amount" INTEGER NOT NULL,
    "transactionType" "CoinTransactionType" NOT NULL,
    "platform" "Platform",
    "transactionId" TEXT,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadBankTransaction" (
    "id" TEXT NOT NULL,
    "squadId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionType" "SquadBankTransactionType" NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SquadBankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "transactionType" "CashTransactionType" NOT NULL,
    "balanceBefore" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "withdrawalStatus" "WithdrawalStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "ChallengeDifficulty" NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "coinReward" INTEGER,
    "challengeType" "ChallengeType" NOT NULL,
    "validationRules" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerChallenge" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activationCost" INTEGER NOT NULL,
    "status" "PlayerChallengeStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentProgress" INTEGER NOT NULL DEFAULT 0,
    "targetProgress" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),
    "xpAwarded" INTEGER,
    "coinAwarded" INTEGER,

    CONSTRAINT "PlayerChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "attachments" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminApplication" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "audienceSize" TEXT NOT NULL,
    "squadCount" TEXT NOT NULL,
    "acceptsDiligence" BOOLEAN NOT NULL,
    "preferredContact" "ContactMethod" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemoryEdit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "editText" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryEdit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_squadzId_key" ON "User"("squadzId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_appleId_key" ON "User"("appleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordUserId_key" ON "User"("discordUserId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_squadzId_idx" ON "User"("squadzId");

-- CreateIndex
CREATE INDEX "User_discordUserId_idx" ON "User"("discordUserId");

-- CreateIndex
CREATE INDEX "User_subscriptionTier_idx" ON "User"("subscriptionTier");

-- CreateIndex
CREATE INDEX "User_currentGrade_idx" ON "User"("currentGrade");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Squad_inviteCode_key" ON "Squad"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Squad_discordChannelId_key" ON "Squad"("discordChannelId");

-- CreateIndex
CREATE INDEX "Squad_captainId_idx" ON "Squad"("captainId");

-- CreateIndex
CREATE INDEX "Squad_viceCaptainId_idx" ON "Squad"("viceCaptainId");

-- CreateIndex
CREATE INDEX "Squad_inviteCode_idx" ON "Squad"("inviteCode");

-- CreateIndex
CREATE INDEX "Squad_isCompSquad_idx" ON "Squad"("isCompSquad");

-- CreateIndex
CREATE INDEX "Contract_playerId_idx" ON "Contract"("playerId");

-- CreateIndex
CREATE INDEX "Contract_squadId_idx" ON "Contract"("squadId");

-- CreateIndex
CREATE INDEX "Contract_competitionId_idx" ON "Contract"("competitionId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_contractType_idx" ON "Contract"("contractType");

-- CreateIndex
CREATE INDEX "Competition_region_idx" ON "Competition"("region");

-- CreateIndex
CREATE INDEX "Competition_status_idx" ON "Competition"("status");

-- CreateIndex
CREATE INDEX "Competition_type_idx" ON "Competition"("type");

-- CreateIndex
CREATE INDEX "CompetitionRegistration_competitionId_idx" ON "CompetitionRegistration"("competitionId");

-- CreateIndex
CREATE INDEX "CompetitionRegistration_squadId_idx" ON "CompetitionRegistration"("squadId");

-- CreateIndex
CREATE INDEX "CompetitionRegistration_status_idx" ON "CompetitionRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionRegistration_competitionId_squadId_key" ON "CompetitionRegistration"("competitionId", "squadId");

-- CreateIndex
CREATE INDEX "Division_competitionId_idx" ON "Division"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_discordChannelId_key" ON "Match"("discordChannelId");

-- CreateIndex
CREATE INDEX "Match_competitionId_idx" ON "Match"("competitionId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_scheduledTime_idx" ON "Match"("scheduledTime");

-- CreateIndex
CREATE INDEX "MatchSquad_matchId_idx" ON "MatchSquad"("matchId");

-- CreateIndex
CREATE INDEX "MatchSquad_squadId_idx" ON "MatchSquad"("squadId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchSquad_matchId_side_key" ON "MatchSquad"("matchId", "side");

-- CreateIndex
CREATE INDEX "MatchLineup_matchId_idx" ON "MatchLineup"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchLineup_matchId_squadId_key" ON "MatchLineup"("matchId", "squadId");

-- CreateIndex
CREATE INDEX "MatchParticipation_playerId_idx" ON "MatchParticipation"("playerId");

-- CreateIndex
CREATE INDEX "MatchParticipation_matchId_idx" ON "MatchParticipation"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipation_matchId_playerId_key" ON "MatchParticipation"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "PlayerRating_matchId_idx" ON "PlayerRating"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRating_matchId_raterPlayerId_ratedPlayerId_key" ON "PlayerRating"("matchId", "raterPlayerId", "ratedPlayerId");

-- CreateIndex
CREATE INDEX "Dispute_matchId_idx" ON "Dispute"("matchId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "StreamLink_matchId_idx" ON "StreamLink"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "StreamLink_matchId_squadId_key" ON "StreamLink"("matchId", "squadId");

-- CreateIndex
CREATE INDEX "TransferPoolEntry_playerId_idx" ON "TransferPoolEntry"("playerId");

-- CreateIndex
CREATE INDEX "TransferPoolEntry_poolStatus_idx" ON "TransferPoolEntry"("poolStatus");

-- CreateIndex
CREATE UNIQUE INDEX "TransferRequest_discordChannelId_key" ON "TransferRequest"("discordChannelId");

-- CreateIndex
CREATE INDEX "TransferRequest_sendingCaptainId_idx" ON "TransferRequest"("sendingCaptainId");

-- CreateIndex
CREATE INDEX "TransferRequest_receivingPlayerId_idx" ON "TransferRequest"("receivingPlayerId");

-- CreateIndex
CREATE INDEX "TransferRequest_status_idx" ON "TransferRequest"("status");

-- CreateIndex
CREATE INDEX "TransferWindow_competitionId_idx" ON "TransferWindow"("competitionId");

-- CreateIndex
CREATE INDEX "TransferWindow_isActive_idx" ON "TransferWindow"("isActive");

-- CreateIndex
CREATE INDEX "PlayerCard_playerId_idx" ON "PlayerCard"("playerId");

-- CreateIndex
CREATE INDEX "CustomPlayerCard_playerId_idx" ON "CustomPlayerCard"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomPlayerCard_playerId_slotNumber_key" ON "CustomPlayerCard"("playerId", "slotNumber");

-- CreateIndex
CREATE INDEX "AttributeScreenshot_playerId_idx" ON "AttributeScreenshot"("playerId");

-- CreateIndex
CREATE INDEX "AttributeScreenshot_uploadedAt_idx" ON "AttributeScreenshot"("uploadedAt");

-- CreateIndex
CREATE INDEX "XpTransaction_playerId_idx" ON "XpTransaction"("playerId");

-- CreateIndex
CREATE INDEX "XpTransaction_source_idx" ON "XpTransaction"("source");

-- CreateIndex
CREATE INDEX "XpTransaction_createdAt_idx" ON "XpTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoinTransaction_transactionId_key" ON "CoinTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "CoinTransaction_userId_idx" ON "CoinTransaction"("userId");

-- CreateIndex
CREATE INDEX "CoinTransaction_squadId_idx" ON "CoinTransaction"("squadId");

-- CreateIndex
CREATE INDEX "CoinTransaction_transactionType_idx" ON "CoinTransaction"("transactionType");

-- CreateIndex
CREATE INDEX "CoinTransaction_transactionId_idx" ON "CoinTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "CoinTransaction_createdAt_idx" ON "CoinTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "SquadBankTransaction_squadId_idx" ON "SquadBankTransaction"("squadId");

-- CreateIndex
CREATE INDEX "SquadBankTransaction_transactionType_idx" ON "SquadBankTransaction"("transactionType");

-- CreateIndex
CREATE INDEX "SquadBankTransaction_createdAt_idx" ON "SquadBankTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "CashTransaction_userId_idx" ON "CashTransaction"("userId");

-- CreateIndex
CREATE INDEX "CashTransaction_transactionType_idx" ON "CashTransaction"("transactionType");

-- CreateIndex
CREATE INDEX "CashTransaction_createdAt_idx" ON "CashTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Challenge_difficulty_idx" ON "Challenge"("difficulty");

-- CreateIndex
CREATE INDEX "Challenge_isActive_idx" ON "Challenge"("isActive");

-- CreateIndex
CREATE INDEX "PlayerChallenge_playerId_idx" ON "PlayerChallenge"("playerId");

-- CreateIndex
CREATE INDEX "PlayerChallenge_challengeId_idx" ON "PlayerChallenge"("challengeId");

-- CreateIndex
CREATE INDEX "PlayerChallenge_status_idx" ON "PlayerChallenge"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AdminApplication_playerId_idx" ON "AdminApplication"("playerId");

-- CreateIndex
CREATE INDEX "AdminApplication_status_idx" ON "AdminApplication"("status");

-- CreateIndex
CREATE INDEX "MemoryEdit_userId_idx" ON "MemoryEdit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemoryEdit_userId_lineNumber_key" ON "MemoryEdit"("userId", "lineNumber");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Squad" ADD CONSTRAINT "Squad_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Squad" ADD CONSTRAINT "Squad_viceCaptainId_fkey" FOREIGN KEY ("viceCaptainId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionRegistration" ADD CONSTRAINT "CompetitionRegistration_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionRegistration" ADD CONSTRAINT "CompetitionRegistration_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSquad" ADD CONSTRAINT "MatchSquad_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchSquad" ADD CONSTRAINT "MatchSquad_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLineup" ADD CONSTRAINT "MatchLineup_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipation" ADD CONSTRAINT "MatchParticipation_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipation" ADD CONSTRAINT "MatchParticipation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_raterPlayerId_fkey" FOREIGN KEY ("raterPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRating" ADD CONSTRAINT "PlayerRating_ratedPlayerId_fkey" FOREIGN KEY ("ratedPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamLink" ADD CONSTRAINT "StreamLink_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamLink" ADD CONSTRAINT "StreamLink_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamLink" ADD CONSTRAINT "StreamLink_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPoolEntry" ADD CONSTRAINT "TransferPoolEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_sendingCaptainId_fkey" FOREIGN KEY ("sendingCaptainId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_receivingPlayerId_fkey" FOREIGN KEY ("receivingPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_targetSquadId_fkey" FOREIGN KEY ("targetSquadId") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferWindow" ADD CONSTRAINT "TransferWindow_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCard" ADD CONSTRAINT "PlayerCard_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPlayerCard" ADD CONSTRAINT "CustomPlayerCard_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeScreenshot" ADD CONSTRAINT "AttributeScreenshot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpTransaction" ADD CONSTRAINT "XpTransaction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadBankTransaction" ADD CONSTRAINT "SquadBankTransaction_squadId_fkey" FOREIGN KEY ("squadId") REFERENCES "Squad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerChallenge" ADD CONSTRAINT "PlayerChallenge_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerChallenge" ADD CONSTRAINT "PlayerChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminApplication" ADD CONSTRAINT "AdminApplication_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemoryEdit" ADD CONSTRAINT "MemoryEdit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
