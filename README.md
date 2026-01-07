# SQUADZ Backend

Mobile tournament management platform for FC25 Pro Clubs. Built with NestJS, Prisma, and PostgreSQL.

## Features

- 🔐 **Authentication**: Email/password, Apple Sign-In, Google Sign-In, Discord OAuth
- 👤 **User Management**: 4-page progressive setup, avatar uploads with background removal
- 🏆 **Tournament System**: Squad management, competitions, match coordination
- 💰 **Economy**: Coin system, subscription tiers (Basic/Pro/Premium)
- 📊 **Player Progression**: XP system, grades, challenges, player valuation
- 🔄 **Transfer Market**: Player transfers with dynamic pricing
- 📧 **Notifications**: Email system with transactional templates

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens)
- **File Storage**: AWS S3
- **Image Processing**: Sharp + Removal.ai
- **Email**: Mailtrap (dev), AWS SES (production)
- **Testing**: Jest + Pactum

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd squadz
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Configure required environment variables in `.env`:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/squadz_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=30d

# Email (Mailtrap for development)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-user
MAIL_PASSWORD=your-mailtrap-password
MAIL_FROM=noreply@squadz.app
FRONTEND_URL=http://localhost:3000

# AWS S3
AWS_S3_BUCKET=squadz-media-dev
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Removal.ai
REMOVAL_AI_API_KEY=your-removal-ai-api-key

# OAuth (Apple)
APPLE_TEAM_ID=your-apple-team-id
APPLE_CLIENT_ID=your-apple-client-id
APPLE_KEY_ID=your-apple-key-id

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth (Discord)
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

### 3. Database Setup

Start PostgreSQL:

```bash
docker-compose up -d
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed database (optional):

```bash
npx prisma db seed
```

### 4. Run Application

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

Application runs on `http://localhost:3000`

## Development

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration-name

# Reset database
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format
```

## API Documentation

Interactive API documentation (Swagger) available at:

```
http://localhost:3000/api
```

## Project Structure

```
src/
├── auth/              # Authentication & authorization
├── users/             # User management & setup
├── squads/            # Squad management
├── competitions/      # Competition & tournament logic
├── matches/           # Match coordination & results
├── contracts/         # Player contracts
├── transfers/         # Transfer market
├── coins/             # Coin economy & payments
├── challenges/        # Challenge system
├── media/             # Image processing & S3
├── notifications/     # Email service
├── discord/           # Discord integration
├── analytics/         # Analytics & tracking
├── common/            # Shared guards, decorators, filters
├── prisma/            # Prisma service & module
└── config/            # Configuration module

prisma/
├── schema.prisma      # Database schema
├── seed.ts            # Development seed data
└── seed.test.ts       # E2E test seed data

test/
└── *.e2e-spec.ts      # E2E test suites
```

## Environment Variables

See `.env.example` for complete list of required environment variables.

### Required for Development:
- `DATABASE_URL`
- `JWT_SECRET`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`

### Required for Production:
All development variables plus:
- `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `REMOVAL_AI_API_KEY`
- OAuth credentials (Apple, Google, Discord)

## Deployment

### Production Checklist

Before deploying to production:

1. ✅ Set `NODE_ENV=production`
2. ✅ Use strong JWT secrets (32+ characters)
3. ✅ Configure AWS SES for emails
4. ✅ Set up production S3 bucket
5. ✅ Configure OAuth with production credentials
6. ✅ Run migrations on production database
7. ✅ Enable CORS for production domains
8. ✅ Set up monitoring (CloudWatch, Sentry)

### Database Migrations

Production migrations (non-interactive):

```bash
npx prisma migrate deploy
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start in production mode |
| `npm run start:dev` | Start in development mode (watch) |
| `npm run start:debug` | Start in debug mode |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:cov` | Generate test coverage |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |

## Support

For issues and questions:
- Email: support@squadz.app
- Documentation: [Link to docs]

## License

Proprietary - All rights reserved