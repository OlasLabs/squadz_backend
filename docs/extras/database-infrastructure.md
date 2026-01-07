# Database Infrastructure Setup

Complete guide for the SQUADZ backend database infrastructure setup.

---

## Overview

This document covers the foundational database infrastructure for the SQUADZ backend, including:

- Prisma ORM configuration with PostgreSQL
- Docker setup for local development
- Database schema with 29 tables
- Seed files for development and testing
- NPM scripts for database management

---

## What Was Set Up

### 1. Prisma ORM Configuration (Prisma 7)

**Files Created:**

- `prisma/schema.prisma` - Complete database schema
- `prisma.config.ts` - Prisma 7.x configuration file
- `prisma/generated/prisma/` - Generated Prisma client (gitignored)

**Prisma 7 Key Changes:**

| Feature    | Prisma 6                                        | Prisma 7                                                   |
| ---------- | ----------------------------------------------- | ---------------------------------------------------------- |
| Provider   | `prisma-client-js`                              | `prisma-client`                                            |
| Output     | `node_modules/@prisma/client`                   | Custom path required (`./generated/prisma`)                |
| Import     | `import { PrismaClient } from '@prisma/client'` | `import { PrismaClient } from './generated/prisma/client'` |
| Connection | Built-in engine                                 | Driver adapters required (`@prisma/adapter-pg`)            |
| Middleware | `$use()`                                        | Client Extensions                                          |

**Driver Adapter Setup:**

```typescript
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });
```

**Reference:** [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)

### 2. Docker Configuration

**File:** `docker-compose.yml`

**Services:**
| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| postgres | squadz_postgres | 5432 | Development database |
| postgres_test | squadz_postgres_test | 5433 | E2E test database |
| redis | squadz_redis | 6379 | Cache & rate limiting (Milestone 2) |

### 3. Environment Variables

**File:** `.env`

Contains all required environment variables for:

- Database connection
- JWT authentication
- OAuth providers (Apple, Google, Discord)
- Email service (SMTP)
- AWS services (S3)
- External services (Removal.ai)

### 4. Prisma Service (NestJS)

**Files:**

- `src/prisma/prisma.service.ts` - PrismaService extending PrismaClient
- `src/prisma/prisma.module.ts` - Global module
- `src/prisma/index.ts` - Barrel exports

**Features:**

- Automatic connection on module init
- Graceful shutdown on app termination
- Soft delete helpers for User and Squad
- Database cleanup utility for tests

### 5. Seed Files

**Development Seed:** `prisma/seed.ts`

- 9 users with various roles and tiers
- 2 squads (NonCompSquad and CompSquad)
- 5 challenge templates

**E2E Test Seed:** `prisma/seed.test.ts`

- Fixed IDs for predictable testing
- Exported as `TEST_IDS` constant
- Complete test data coverage

---

## Database Schema

### Tables (29 Total)

| Category         | Tables                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| **Auth & Users** | User, RefreshToken                                                                    |
| **Squads**       | Squad, Contract                                                                       |
| **Competitions** | Competition, CompetitionRegistration, Division                                        |
| **Matches**      | Match, MatchSquad, MatchLineup, MatchParticipation, PlayerRating, Dispute, StreamLink |
| **Transfers**    | TransferPoolEntry, TransferRequest, TransferWindow                                    |
| **Player Cards** | PlayerCard, CustomPlayerCard, AttributeScreenshot                                     |
| **Transactions** | XpTransaction, CoinTransaction, CashTransaction, SquadBankTransaction                 |
| **Challenges**   | Challenge, PlayerChallenge                                                            |
| **Other**        | Notification, AdminApplication, MemoryEdit                                            |

### Enums (29 Total)

- AuthProvider, UserRole, SubscriptionTier, SubscriptionStatus, Platform
- Position, Grade, ContractType, ContractStatus
- CompetitionType, CompetitionFormat, CompetitionStatus, RegistrationStatus
- MatchType, MatchStatus, MatchSide, DisputeStatus
- TransferPoolStatus, TransferRequestStatus
- ChallengeDifficulty, ChallengeType, PlayerChallengeStatus
- XpSource, CoinTransactionType, CashTransactionType, SquadBankTransactionType, WithdrawalStatus
- NotificationType, ContactMethod, ApplicationStatus

---

## NPM Scripts

### Database Management Scripts

```bash
# Start development database containers
npm run db:dev

# Start test database container only
npm run db:test

# Stop all database containers
npm run db:down

# Run Prisma migrations (development)
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Seed development data
npm run db:seed

# Seed E2E test data
npm run db:seed:test

# Open Prisma Studio (visual database browser)
npm run db:studio

# Reset database (drop all data and re-run migrations)
npm run db:reset

# Regenerate Prisma client
npm run prisma:generate
```

### Application Scripts

```bash
# Build the application
npm run build

# Start development server (with hot reload)
npm run start:dev

# Start debug server
npm run start:debug

# Start production server
npm run start:prod

# Run linting
npm run lint

# Format code
npm run format
```

### Testing Scripts

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

---

## How to Run the Project

### Development Setup

#### Prerequisites

- Node.js 18+ installed
- Docker Desktop installed and running
- Git

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Start Docker Desktop

Open Docker Desktop application and wait for it to fully start.

#### Step 3: Start Database Containers

```bash
# Start PostgreSQL and Redis
npm run db:dev

# Verify containers are running
docker ps
```

You should see:

- `squadz_postgres` on port 5432
- `squadz_redis` on port 6379

#### Step 4: Create Initial Migration

```bash
npx prisma migrate dev --name init
```

This will:

1. Create the `prisma/migrations` folder
2. Generate a migration file with all 29 tables
3. Apply the migration to the database
4. Regenerate the Prisma client

#### Step 5: Seed Development Data

```bash
npm run db:seed
```

This populates the database with sample users, squads, and challenges.

#### Step 6: Verify Setup

```bash
# Open Prisma Studio to view data
npm run db:studio
```

This opens a browser at http://localhost:5555 where you can browse all tables.

#### Step 7: Start the Application

```bash
npm run start:dev
```

The server starts at http://localhost:3000

---

### Testing Setup

#### Step 1: Start Test Database

```bash
npm run db:test
```

This starts `squadz_postgres_test` on port 5433.

#### Step 2: Set Test Environment

For E2E tests, ensure `DATABASE_URL_TEST` is set in `.env`:

```
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5433/squadz_test?schema=public"
```

#### Step 3: Seed Test Data

```bash
npm run db:seed:test
```

#### Step 4: Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## Test Accounts

### Development Seed Accounts

All accounts use password: `Password123!`

| Email                | Role         | Tier    | Setup Status           |
| -------------------- | ------------ | ------- | ---------------------- |
| admin@squadz.app     | ADMIN        | PREMIUM | Complete               |
| captain1@test.com    | CAPTAIN      | PREMIUM | Complete               |
| captain2@test.com    | CAPTAIN      | PRO     | Complete               |
| vicecaptain@test.com | VICE_CAPTAIN | PRO     | Complete               |
| player1@test.com     | PLAYER       | BASIC   | Complete               |
| player2@test.com     | PLAYER       | PRO     | Complete               |
| player3@test.com     | PLAYER       | BASIC   | Complete               |
| incomplete@test.com  | USER         | BASIC   | Incomplete (2/4 pages) |
| unverified@test.com  | USER         | BASIC   | Unverified email       |

### E2E Test Seed Accounts

All accounts use password: `TestPassword123!`

| Email                | Role         | Tier    | Fixed ID                  |
| -------------------- | ------------ | ------- | ------------------------- |
| admin@test.com       | ADMIN        | PREMIUM | `test-admin-user-id-001`  |
| captain1@test.com    | CAPTAIN      | PREMIUM | `test-captain-1-id-001`   |
| captain2@test.com    | CAPTAIN      | PRO     | `test-captain-2-id-002`   |
| vicecaptain@test.com | VICE_CAPTAIN | PRO     | `test-vicecaptain-id-001` |
| player1@test.com     | PLAYER       | BASIC   | `test-player-1-id-001`    |
| player2@test.com     | PLAYER       | PRO     | `test-player-2-id-002`    |
| player3@test.com     | PLAYER       | PREMIUM | `test-player-3-id-003`    |
| incomplete@test.com  | USER         | BASIC   | `test-incomplete-user-id` |
| unverified@test.com  | USER         | BASIC   | `test-unverified-user-id` |

### Using Test IDs in E2E Tests

```typescript
import { TEST_IDS, TEST_PASSWORD } from '../prisma/seed.test';

// Use fixed IDs for predictable testing
const response = await request(app.getHttpServer())
  .get(`/users/${TEST_IDS.CAPTAIN_1_ID}`)
  .expect(200);
```

---

## Quick Reference

### Common Commands

```bash
# Full development setup (first time)
npm install
docker-compose up -d postgres redis
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev

# Daily development
npm run db:dev
npm run start:dev

# Reset everything
npm run db:down
docker volume rm squadz_squadz_postgres_data
npm run db:dev
npx prisma migrate dev
npm run db:seed
```

### Database Connection Details

**Development Database:**

- Host: localhost
- Port: 5432
- Database: squadz_dev
- User: postgres
- Password: postgres

**Test Database:**

- Host: localhost
- Port: 5433
- Database: squadz_test
- User: postgres
- Password: postgres

### Useful Prisma Commands

```bash
# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# View database in browser
npx prisma studio

# Reset database completely
npx prisma migrate reset

# Create migration without applying
npx prisma migrate dev --create-only

# Apply pending migrations
npx prisma migrate deploy
```

---

## Troubleshooting

### Docker Issues

**Problem:** "Cannot connect to the Docker daemon"
**Solution:** Start Docker Desktop and wait for it to fully initialize

**Problem:** Port already in use
**Solution:** Stop existing containers or change ports in docker-compose.yml

```bash
# Check what's using the port
netstat -ano | findstr :5432

# Force stop all containers
docker-compose down -v
```

### Prisma Issues

**Problem:** "Prisma schema validation failed"
**Solution:** Run `npx prisma validate` and fix reported errors

**Problem:** "Migration failed"
**Solution:** Check if database is running and accessible

```bash
# Test database connection
docker exec squadz_postgres pg_isready -U postgres
```

**Problem:** "Cannot find module '@prisma/client'" or import errors
**Solution:** In Prisma 7, the client is generated to a custom path. Regenerate and update imports:

```bash
npx prisma generate
```

Then update your imports from:

```typescript
// ❌ Old (Prisma 6)
import { PrismaClient } from '@prisma/client';

// ✅ New (Prisma 7)
import { PrismaClient } from './generated/prisma/client';
```

**Problem:** "exports is not defined in ES module scope"
**Solution:** Prisma 7 generates ESM modules. Use `tsx` instead of `ts-node`:

```bash
# Install tsx
npm install tsx --save-dev

# Update seed command to use tsx
npx tsx prisma/seed.ts
```

### Connection Issues

**Problem:** "Connection refused"
**Solution:** Verify Docker containers are running

```bash
docker ps
# Should show squadz_postgres and squadz_redis
```

---

## File Structure

```
squadz/
├── prisma/
│   ├── schema.prisma       # Database schema (29 tables)
│   ├── migrations/         # Migration files (after first migrate)
│   ├── generated/          # Prisma 7 generated client (gitignored)
│   │   └── prisma/
│   │       └── client.ts   # Generated PrismaClient
│   ├── seed.ts            # Development seed
│   └── seed.test.ts       # E2E test seed
├── src/
│   ├── prisma/
│   │   ├── prisma.service.ts    # PrismaService with driver adapter
│   │   ├── prisma.module.ts     # Global module
│   │   └── index.ts             # Exports
│   └── app.module.ts            # Imports PrismaModule
├── docker-compose.yml      # Docker services
├── .env                    # Environment variables
├── prisma.config.ts        # Prisma 7.x config (seed, datasource URL)
└── package.json            # Scripts and dependencies
```

---

## Related Documentation

- [Implementation Guide](../implementation/implementation-guide.md) - Build order and milestones
- [Database Schema](../core/db-schema.md) - Complete schema reference
- [Tech Stack](../core/tech-stack.md) - Technology choices
- [Backend Architecture](../core/backend-architecture.md) - Module organization
