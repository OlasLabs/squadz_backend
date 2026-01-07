# IMPLEMENTATION GUIDE

## DESCRIPTION

Implementation roadmap for SQUADZ backend. Defines build order, module dependencies, critical patterns, and integration contracts across 3 milestones.

**Related Docs:** db-schema.mdc, backend-architecture.mdc, api-requirements.mdc, auth-strategy.mdc, testing-standards.mdc, deployment-checklist.mdc

---

## MILESTONE OVERVIEW

### **Milestone 1: Complete Auth Flow**

**Deliverables:**
- Auth module (registration, login, OAuth, password reset)
- Users module (4-page setup, profile management)
- Media module (avatar processing)
- Notifications module (emails)
- Complete auth flow functional end-to-end

### **Milestone 2: All Feature Modules**

**Deliverables:**
- Squads, Contracts, Competitions, Matches, Transfers, Coins, Challenges, Discord, Analytics modules
- All 128 REST endpoints implemented

### **Milestone 3: Production Launch**

**Deliverables:**
- Tests passing (60%+ coverage)
- Security & performance audit complete
- Deployed to production with monitoring

---

## MILESTONE 1: COMPLETE AUTH FLOW

### Overview

**Goal:** Implement complete user authentication and account setup journey from registration to fully configured player account.

**Complete User Flows:**
1. **Email/Password Registration:** Signup → Email Verification (OTP) → 4-Page Setup → Player Role
2. **OAuth Registration (Apple/Google):** OAuth Signup → Auto Email Verification → 4-Page Setup → Player Role
3. **Login:** Email/Password OR OAuth → JWT tokens → Access granted
4. **Password Management:** Forgot Password → Reset Link → New Password
5. **Account Setup Pages:** Player Details → Connect Discord → Select Positions → Upload Avatar
6. **Profile Management:** View Profile → Update Profile → Change Password → Update Avatar

**Modules Required:**
- **Auth Module:** Registration, login, OAuth, password reset, token management
- **Users Module:** Account setup, profile management, Discord connection, role progression
- **Media Module:** Avatar upload, background removal, image optimization
- **Notifications Module:** OTP emails, verification emails, password reset emails

---

### Phase 1: Project Initialization

**1.1 Create NestJS Project**

Initialize standard NestJS project using CLI.

**1.2 Install Core Dependencies**

**Required Packages (Milestone 1 - Auth Flow Only):**
- Prisma ORM (client + dev tools)
- Authentication (Passport, JWT, bcrypt)
- Validation (class-validator, class-transformer)
- Configuration (@nestjs/config)
- Testing (pactum for E2E)
- File Upload & Processing (multer, sharp)
- Email Service (@nestjs-modules/mailer, nodemailer)
  - Development: Configure for Mailtrap (SMTP testing)
  - Production: Configure for AWS SES (via SMTP)
- HTTP Client (axios for OAuth verification, external APIs)
- Utilities (uuid)

**Note:** Redis, BullMQ, Socket.io, and Swagger deferred to Milestone 2.

Install all dependencies with proper type definitions.

**Package Verification (Aligned with tech-stack.mdc):**

| Package | Tech Stack? | Milestone 1? | Purpose |
|---------|-------------|--------------|---------|
| Prisma | ✅ Yes | ✅ Yes | ORM for database |
| Passport + JWT | ✅ Yes | ✅ Yes | Authentication |
| bcrypt | ✅ Yes (implied) | ✅ Yes | Password hashing |
| class-validator | ✅ Yes | ✅ Yes | DTO validation |
| @nestjs/config | ✅ Yes (implied) | ✅ Yes | Environment config |
| pactum | ✅ Yes | ✅ Yes | E2E testing |
| multer | ✅ Yes (implied) | ✅ Yes | File uploads |
| sharp | ✅ Yes | ✅ Yes | Image processing |
| nodemailer | ✅ Yes (implied) | ✅ Yes | Email sending (SMTP) |
| @nestjs-modules/mailer | ✅ Yes (implied) | ✅ Yes | NestJS email wrapper |
| axios | ✅ Yes | ✅ Yes | HTTP client |
| uuid | ✅ Yes (implied) | ✅ Yes | ID generation |
| Redis | ✅ Yes | ❌ Milestone 2 | Rate limiting, cache |
| BullMQ | ✅ Yes | ❌ Milestone 2 | Background jobs |
| Socket.io | ✅ Yes | ❌ Milestone 2 | Real-time features |
| Swagger | ✅ Yes | ❌ Milestone 2 | API documentation |

**1.3 Configure Folder Structure**

Create module folders matching backend-architecture.mdc structure:

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   ├── strategies/
│   └── guards/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── [other modules: squads, contracts, competitions, matches, transfers, coins, challenges, discord, media, notifications, analytics]
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── pipes/
│   └── enums/
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── config/
    └── config.module.ts

test/
├── helpers/
└── *.e2e-spec.ts

prisma/
├── schema.prisma
├── seed.ts
└── seed.test.ts
```

**Critical Pattern:** Every module follows this structure:
- `module.ts` - Module definition with imports/exports
- `controller.ts` - HTTP endpoints
- `service.ts` - Business logic
- `dto/` - Request/response data transfer objects

**1.4 Setup Environment Configuration**

**Development Environment Variables:**
- Database connection (PostgreSQL local)
- JWT secrets and expiration times
- OAuth provider credentials (Apple, Google, Discord - dev apps)
- External service keys (Removal.ai, AWS S3 - dev buckets)
- Email service (SMTP - use Mailtrap for development)

**Security:**
- Never commit `.env` files (add to .gitignore)
- Create `.env.example` template (committed to Git)
- All secrets minimum 32 characters
- Use separate credentials for dev vs production

**1.5 Setup ConfigModule**

Implement centralized configuration service:
- Load and validate all environment variables
- Provide typed configuration access throughout application
- Fail fast if required variables missing
- Export configuration as global module

---

### Phase 2: Database Setup (CRITICAL - COMPLETE SCHEMA FIRST)

**IMPORTANT:** Implement the ENTIRE schema from db-schema.mdc before building any module. This prevents refactoring and ensures all relationships exist when modules are implemented.

**2.1 Initialize Prisma**

Initialize Prisma in project with PostgreSQL provider.

**2.2 Implement Complete Schema**

Copy the ENTIRE schema from `db-schema.mdc` into `prisma/schema.prisma`.

**All Tables (from db-schema.mdc):**
- User
- RefreshToken
- Squad
- Contract
- Competition
- CompetitionRegistration
- Division
- Match
- MatchSquad
- MatchLineup
- MatchParticipation
- PlayerRating
- Dispute
- TransferPoolEntry
- TransferRequest
- TransferWindow
- PlayerCard
- CustomPlayerCard
- AttributeScreenshot
- XpTransaction
- CoinTransaction
- CashTransaction
- SquadBankTransaction
- Challenge
- PlayerChallenge
- Notification
- AdminApplication
- MemoryEdit

**All Enums (from db-schema.mdc):**
- AuthProvider, UserRole, SubscriptionTier, SubscriptionStatus, Platform
- Position, Grade
- ContractType, ContractStatus
- CompetitionType, CompetitionFormat, CompetitionStatus, RegistrationStatus
- MatchType, MatchStatus, MatchSide, DisputeStatus
- TransferPoolStatus, TransferRequestStatus
- ChallengeDifficulty, ChallengeType, PlayerChallengeStatus
- XpSource, CoinTransactionType, CashTransactionType, SquadBankTransactionType, WithdrawalStatus
- NotificationType, ContactMethod, ApplicationStatus

**All Relationships:** Ensure all foreign keys and relations defined

**All Indexes:** Ensure all performance indexes defined

**2.3 Configure PostgreSQL Connection**

Update DATABASE_URL in `.env` with local PostgreSQL credentials.

**2.4 Create Initial Migration**

Generate and apply initial migration containing complete schema. This creates all 28 tables, enums, relationships, and indexes in one migration.

**2.5 Verify Schema Implementation**

Use Prisma Studio to verify all tables created correctly.

**Verification Checklist:**
- [ ] All 28 tables created
- [ ] All enums created
- [ ] All relationships working (test via Prisma Studio)
- [ ] All indexes created
- [ ] Migration file generated successfully

**2.6 Setup Prisma Service**

Implement PrismaService extending PrismaClient:
- Handle connection lifecycle (connect/disconnect)
- Configure connection pooling
- Implement graceful shutdown hooks

Implement PrismaModule:
- Export PrismaService as global module
- Make available to all feature modules without imports

---

### Phase 3: Auth Module Implementation

**Now that all tables exist, implement Auth module using existing User and RefreshToken tables.**

**3.1 Auth Module Structure**

Implement auth module with standard NestJS architecture:
- Controller with all auth endpoints
- Service layer with business logic
- DTOs for all request/response bodies (register, login, verify-email, reset-password, forgot-password, refresh-token, apple-oauth, google-oauth)
- JWT strategies (access token, refresh token)
- Auth guards (JWT authentication)

Follow api-requirements.mdc for exact endpoint specifications.

**3.2 Implement Auth Endpoints**

Implement all 8 auth endpoints from api-requirements.mdc and auth-strategy.mdc:

**CRITICAL: DTO Validation Pattern**

All request DTOs must use class-validator decorators. Field requirements are specified in auth-strategy.mdc.

```typescript
// Pattern Example (not exhaustive)
export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)  // Complex password
  password: string;

  @Matches(/^[a-zA-Z0-9_]+$/)  // Alphanumeric + underscores
  username: string;
}

// All DTOs follow this pattern with appropriate validators
```

**Response Contract:**
```typescript
interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    squadzId: string;
    role: UserRole;
    setupComplete: boolean;
    setupPagesCompleted: number;
  };
}
```

**Registration & Verification:**
- `POST /auth/register` - Email/password registration with input validation, password hashing, SQUADZ ID generation, OTP generation, verification email trigger
  - Input: RegisterDto
  - Output: `{ message: "Verification email sent" }`
  
- `POST /auth/verify-email` - OTP verification leading to User role assignment and JWT token generation
  - Input: `{ email: string, otp: string }`
  - Output: AuthResponseDto

**OAuth Registration/Login (Unified Endpoints):**
- `POST /auth/apple` - Apple Sign-In with ID token verification, user creation/lookup, automatic email verification
  - Input: `{ idToken: string }`
  - Output: AuthResponseDto
  
- `POST /auth/google` - Google Sign-In with ID token verification, user creation/lookup, profile picture download
  - Input: `{ idToken: string }`
  - Output: AuthResponseDto

**Login & Token Management:**
- `POST /auth/login` - Email/password authentication with failed attempt tracking, account lockout enforcement
  - Input: `{ email: string, password: string }`
  - Output: AuthResponseDto
  
- `POST /auth/refresh` - Access token renewal using refresh token with version validation
  - Input: `{ refreshToken: string }`
  - Output: `{ accessToken: string }`
  
- `POST /auth/logout` - Refresh token invalidation
  - Input: `{ refreshToken: string }`
  - Output: `{ message: "Logged out successfully" }`

**Password Management:**
- `POST /auth/forgot-password` - Reset token generation and email trigger
  - Input: `{ email: string }`
  - Output: `{ message: "Reset email sent" }`
  
- `POST /auth/reset-password` - Password update with token validation and session invalidation
  - Input: `{ resetToken: string, newPassword: string, confirmPassword: string }`
  - Output: `{ message: "Password reset successful" }`

**CRITICAL: Security Requirements (NON-NEGOTIABLE)**
- Password hashing: bcrypt with 10 salt rounds (never less)
- OTP codes: 6 numeric digits with 3-minute expiry
- Reset tokens: Cryptographically random, 1-hour expiry
- Account lockout: 5 failed attempts → 15-minute cooldown
- Token storage: Refresh tokens stored HASHED, never plain text
- Session invalidation: Increment User.tokenVersion on password change/reset

**3.3 JWT Token Strategy**

Implement dual-token authentication pattern from auth-strategy.mdc:

**CRITICAL: Token Payload Structures (EXACT)**

> **Note:** auth-strategy.mdc describes token claims conceptually. Below are the precise TypeScript interfaces for implementation. These fields must match exactly across all JWT operations.

```typescript
// Access Token Payload (15-minute expiry)
interface AccessTokenPayload {
  sub: string;                    // user.id
  email: string;                  // user.email
  role: UserRole;                 // USER | PLAYER | CAPTAIN | VICE_CAPTAIN | ADMIN
  setupComplete: boolean;         // user.setupComplete
  setupPagesCompleted: number;    // user.setupPagesCompleted (0-4)
  emailVerified: boolean;         // user.emailVerified
  iat: number;                    // issued at timestamp
  exp: number;                    // expiration timestamp (15 minutes from iat)
}

// Refresh Token Payload (30-day expiry)
interface RefreshTokenPayload {
  sub: string;           // user.id
  tokenVersion: number;  // user.tokenVersion (for invalidation)
  iat: number;           // issued at timestamp
  exp: number;           // expiration timestamp (30 days from iat)
}
```

**Access Token Usage:**
- Included in Authorization header: `Bearer <token>`
- Decoded by JwtAuthGuard and attached to request.user
- Used for all authorization decisions (role checks, setup status, etc)
- Short-lived (15 min) - compromised tokens expire quickly

**Refresh Token Usage:**
- Stored hashed in RefreshToken table
- Used ONLY to generate new access tokens
- Long-lived (30 days) - reduces re-authentication friction
- Version checked against User.tokenVersion for server-side revocation

**Token Version Control:**
User.tokenVersion field enables invalidating all tokens on security events (password change, account compromise). Refresh tokens with mismatched version are rejected.

**3.4 OAuth Verification Implementation**

Implement OAuth provider verification per auth-strategy.mdc specifications:

**Apple Sign-In:**
- Fetch Apple's public keys and verify JWT signature using RS256
- Validate all claims (issuer, audience, expiration)
- Extract user data (Apple ID, email, name - note: name only provided on first authorization)

**Google Sign-In:**
- Verify ID token via Google's token verification endpoint
- Validate response data (audience, issuer, expiration)
- Extract user data (Google ID, email, name, profile picture URL)
- Download and optimize profile picture if provided

Both implementations must handle provider-specific token formats and error responses.

**3.5 Security Implementation**

**Rate Limiting:**
- Login: 5 attempts per 15 minutes per IP
- Signup: 10 per hour per IP
- Verification resend: 3 per 15 minutes per email
- Password reset: 3 per hour per email

**Account Lockout:**
- Track failed login attempts
- 5 consecutive failures → 15-minute lockout
- Send lockout notification email
- Successful login resets counter

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- bcrypt hashing (10 salt rounds)

**3.6 Testing**

**Unit Tests:**
- Password hashing and comparison
- JWT token generation and validation
- OTP generation and verification
- OAuth token verification logic
- Password strength validation
- SQUADZ ID generation uniqueness

**E2E Tests:**
- Complete registration flow
- Email verification flow
- Login flow (email/password)
- OAuth flows (Apple, Google)
- Token refresh flow
- Logout flow
- Forgot/reset password flow
- Account lockout behavior
- Rate limiting enforcement

---

### Phase 4: Users Module (Setup & Profile Endpoints)

**4.1 Users Module Structure**

Implement users module with standard NestJS architecture:
- Controller with setup and profile endpoints
- Service layer for user data operations
- DTOs for all 4 setup pages plus profile management requests
- Integration with Media module for avatar processing
- Integration with Discord OAuth for page 2

Follow api-requirements.mdc and auth-strategy.mdc for endpoint specifications.

**4.2 Implement Account Setup Endpoints**

Implement all 4 progressive setup page endpoints from auth-strategy.mdc:

**Setup Page Endpoints:**
- `POST /users/:id/setup/page1` - Player Details (nationality, location, favorite team, PSN ID, known as name)
- `POST /users/:id/setup/page2` - Connect Discord (exchange authorization code, save Discord user ID and username)
- `POST /users/:id/setup/page3` - Select Positions (primary required, secondary optional and must differ)
- `POST /users/:id/setup/page4` - Upload Avatar (trigger Media module processing pipeline)

**CRITICAL: Progressive Completion Logic (EXACT)**

```typescript
// After each setup page completion
async completeSetupPage(userId: string, pageNumber: number, pageData: any) {
  // 1. Save page-specific data
  const updateData = {
    ...pageData,
    [`page${pageNumber}Complete`]: true,
    setupPagesCompleted: { increment: 1 }
  };
  
  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  
  // 2. Check if all 4 pages complete
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  // 3. Upgrade to Player role if all pages done
  if (user.setupPagesCompleted === 4) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.PLAYER,
        setupComplete: true
      }
    });
  }
  
  return updatedUser;
}
```

**CRITICAL: Setup Page Response Contract (EXACT)**

```typescript
// Response after each setup page completion
{
  user: {
    id: string;
    squadzId: string;
    role: "USER" | "PLAYER";  // Upgrades to PLAYER when setupPagesCompleted === 4
    setupComplete: boolean;    // Becomes true when setupPagesCompleted === 4
    setupPagesCompleted: number; // 0-4
    // ... other user fields per db-schema.mdc
  }
}
```

**Critical Rules:**
- Pages can be completed in any order
- Partial completion persists across sessions
- Skipping pages keeps User role
- Role upgrade ONLY happens when all 4 pages complete
- Already completed pages show pre-filled data
- Page resubmission is idempotent (updates existing data)

**4.3 Implement Profile Management Endpoints**

Implement profile endpoints from api-requirements.mdc:

- `GET /users/:id` - View user profile (any Player can view any profile, exclude sensitive fields)
- `PATCH /users/:id/profile` - Update own profile (allowed fields: fullName, knownAsName, nationality, currentLocation, favouriteTeam, psnId, positions)
- `PATCH /users/:id/password` - Change own password (verify current, validate new, increment tokenVersion to invalidate all sessions)
- `POST /users/:id/avatar` - Update profile picture (identical processing to setup page 4)

**Security:**
- All profile operations require OWN guard (user can only modify their own data)
- Immutable fields: email, squadzId, role, setupComplete
- Password change triggers full session invalidation

**4.4 Implement Discord Management**

- `DELETE /users/:id/setup/page2` - Disconnect Discord (remove Discord IDs, mark page incomplete, decrement counter, downgrade to User role if pages < 4)

**Role Downgrade Logic:**
Disconnecting Discord reverses setup progress. If total completed pages drops below 4, user downgrades from Player to User role and setupComplete becomes false.

**4.5 Testing**

**Unit Tests:**
- Page completion logic (individual pages)
- Role upgrade logic (4 pages → Player)
- Role downgrade logic (disconnect → User)
- Profile update validation
- Password change logic

**E2E Tests:**
- Complete all 4 setup pages (sequential)
- Skip pages and verify User role retained
- Complete pages out of order
- Disconnect Discord and verify downgrade
- Update profile fields
- Change password and verify token invalidation
- Update avatar

---

### Phase 5: Media Module (Image Processing)

**5.1 Media Module Structure**

Implement media processing service:
- Image upload handling (multipart/form-data)
- Background removal integration (Removal.ai API)
- Image optimization (Sharp library)
- S3 upload functionality
- URL generation for processed images

This module is consumed by Users module (avatar upload) and later by Squads module (logo upload).

**5.2 Implement Image Processing Service**

**CRITICAL: Image Processing Contract (EXACT)**

```typescript
// Input
interface ProcessImageInput {
  file: Express.Multer.File;  // Uploaded file from multipart request
  userId: string;              // For unique filename generation
}

// Output
interface ProcessImageOutput {
  avatarUrl: string;      // Main image URL (512x512 WebP)
  thumbnailUrl: string;   // Thumbnail URL (128x128 WebP)
}

// Service method signature
async processAvatar(input: ProcessImageInput): Promise<ProcessImageOutput>
```

**Processing Pipeline:**
1. **Validation** - Verify file type (JPEG/PNG only), size limit (5MB max)
2. **Background Removal** - Call Removal.ai API to remove background
3. **Main Image Optimization** - Resize to 512x512, compress as WebP (quality 85%)
4. **Thumbnail Generation** - Resize to 128x128, compress as WebP (quality 80%)
5. **S3 Upload** - Upload both images to S3 with public read access
6. **URL Return** - Return URLs for both processed images

**CRITICAL: File Naming Convention (EXACT)**
```
Main image:  avatars/{userId}.webp
Thumbnail:   avatars/{userId}_thumb.webp
```

**S3 Configuration:**
- Development bucket: squadz-media-dev
- Production bucket: squadz-media
- Folder structure: avatars/, logos/, cards/
- Access: Public read for avatars and logos
- Content-Type: image/webp

**Error Handling:**
- File > 5MB → throw BadRequestException
- Invalid file type → throw BadRequestException
- Removal.ai fails → fallback to original image (log warning)
- S3 upload fails → throw InternalServerErrorException

**5.3 Removal.ai Integration**

Implement background removal using Removal.ai REST API:
- Send image buffer with API key authentication
- Configure for automatic sizing
- Handle API errors gracefully (fallback to original if removal fails)
- Return processed image buffer

Use development API key (50 images/month free tier) for testing.

**5.4 Testing**

**Unit Tests:**
- File validation (type, size)
- Image optimization logic
- Thumbnail generation
- S3 upload URL generation

**E2E Tests:**
- Upload valid image (JPEG, PNG)
- Upload oversized image (should fail)
- Upload invalid file type (should fail)
- Verify background removal called
- Verify S3 upload successful
- Verify URLs returned correctly

---

### Phase 6: Notifications Module (Email Service)

**6.1 Notifications Module Structure**

Implement email notification service:
- Email service with Handlebars template support
- Email templates (verification OTP, password reset, account lockout)
- SMTP configuration (Mailtrap for dev, AWS SES for production)
- Email queue management for reliable delivery

This module is consumed by Auth module (all auth-related emails) and later by other modules (match notifications, challenge updates).

**6.2 Email Service Implementation**

**CRITICAL: Email Service Contract (EXACT)**

```typescript
// Email service interface
interface NotificationService {
  sendVerificationEmail(email: string, otp: string, squadzId: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
  sendAccountLockoutEmail(email: string, unlockTime: Date): Promise<void>;
}

// Template context types
interface VerificationEmailContext {
  otp: string;           // 6-digit code
  squadzId: string;      // e.g., "SQZ-XXXXXXXX"
  expiryMinutes: 3;
}

interface PasswordResetContext {
  resetLink: string;     // e.g., "https://app.squadz.com/reset-password?token=..."
  expiryHours: 1;
}

interface LockoutEmailContext {
  unlockTime: string;    // Formatted date string
  lockoutMinutes: 15;
}
```

**Email Types:**

**Email Verification (OTP):**
- Subject: "Verify Your SQUADZ Account"
- Template: email-verification.hbs
- Context: 6-digit OTP, SQUADZ ID, 3-minute expiry

**Password Reset:**
- Subject: "Reset Your SQUADZ Password"
- Template: password-reset.hbs
- Context: Reset link with token, 1-hour expiry, security disclaimer

**Account Lockout:**
- Subject: "SQUADZ Account Temporarily Locked"
- Template: account-lockout.hbs
- Context: Unlock time, 15-minute lockout duration, security advisory

All emails use Handlebars templates with dynamic data injection.

**6.3 Email Templates (Handlebars)**

Create three responsive HTML email templates:

**Email Verification Template:**
- Display 6-digit OTP prominently
- Show SQUADZ ID for reference
- Indicate 3-minute expiry
- Brand with SQUADZ styling

**Password Reset Template:**
- Clickable reset link with token
- Show 1-hour expiry warning
- Include "didn't request this?" disclaimer
- Brand consistently

**Account Lockout Template:**
- Explain lockout reason (failed attempts)
- Show exact unlock time
- Suggest security review if user didn't attempt login
- Provide support contact

**6.4 SMTP Configuration**

**Development:** 
- Use Mailtrap (https://mailtrap.io) for email testing
- Captures all emails without sending to real recipients
- SMTP configuration: host, port, username, password from Mailtrap

**Production:** 
- Use AWS SES (Simple Email Service) per tech-stack.mdc
- **Important:** AWS SES supports SMTP interface - use nodemailer's SMTP transport
- Alternative: AWS SES SDK (more complex, SMTP is simpler)
- Requires: Domain verification, SPF/DKIM records, production access approval

**MailerModule Configuration:**
- SMTP transport settings from environment variables (host, port, credentials)
- Default sender address (must be verified in SES for production)
- Handlebars template engine for email templates
- Template directory path

**Environment Variables:**
```
Development:
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<mailtrap-user>
SMTP_PASSWORD=<mailtrap-password>
EMAIL_FROM=noreply@squadz.app

Production:
SMTP_HOST=email-smtp.us-east-1.amazonaws.com (SES SMTP endpoint)
SMTP_PORT=587
SMTP_USER=<ses-smtp-username>
SMTP_PASSWORD=<ses-smtp-password>
EMAIL_FROM=noreply@squadz.app (must be verified in SES)
```

**6.5 Testing**

**Unit Tests:**
- Email template rendering
- Email payload generation

**E2E Tests:**
- Verification email sent on registration
- Password reset email sent on forgot password
- Lockout email sent after 5 failed attempts
- Emails contain correct data (OTP, reset link, unlock time)

---

### Phase 7: Common Guards & Decorators

**7.1 Create Common Guards**

**CRITICAL: Guard Implementation Patterns (EXACT)**

```typescript
// 1. JWT Auth Guard - Validates access tokens
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Extends NestJS AuthGuard
  // Validates JWT signature and expiration
  // Attaches decoded payload to request.user
}

// 2. Setup Complete Guard - Validates 4-page setup complete
@Injectable()
export class SetupCompleteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    if (!user.setupComplete) {
      throw new ForbiddenException(
        'Account setup incomplete. Please complete all setup pages.'
      );
    }
    
    return true;
  }
}

// 3. Own Resource Guard - Validates user owns resource
@Injectable()
export class OwnResourceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;      // From JWT
    const resourceId = request.params.id; // From URL
    
    if (userId !== resourceId) {
      throw new ForbiddenException(
        'You can only access your own resources.'
      );
    }
    
    return true;
  }
}

// 4. Current User Decorator - Extract user from request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;  // Set by JwtAuthGuard
  },
);
```

**Guard Usage Patterns:**

```typescript
// Pattern 1: Authentication required
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) { }

// Pattern 2: Setup completion required
@UseGuards(JwtAuthGuard, SetupCompleteGuard)
@Get('player-features')
getPlayerFeatures() { }

// Pattern 3: Own resource access
@UseGuards(JwtAuthGuard, OwnResourceGuard)
@Patch(':id/profile')
updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) { }
```

**Critical Rules:**
- Guards execute in specified order (JwtAuthGuard must come first)
- JwtAuthGuard populates request.user for downstream guards
- OwnResourceGuard requires :id parameter in route
- SetupCompleteGuard requires JwtAuthGuard to run first

---

### Phase 8: Module Integration Contracts

**CRITICAL: Cross-Module Interfaces (EXACT)**

**Auth → Notifications Integration:**
```typescript
// Auth module calls notification service
interface AuthNotificationContract {
  // After registration
  sendVerificationEmail(email: string, otp: string, squadzId: string): Promise<void>;
  
  // After forgot password request
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
  
  // After 5 failed login attempts
  sendAccountLockoutEmail(email: string, unlockTime: Date): Promise<void>;
}
```

**Users → Media Integration:**
```typescript
// Users module calls media service for avatar processing
interface UserMediaContract {
  // Input: Uploaded file + user ID
  processAvatar(file: Express.Multer.File, userId: string): Promise<{
    avatarUrl: string;
    thumbnailUrl: string;
  }>;
  
  // Error cases
  // - File > 5MB: throw BadRequestException
  // - Invalid type: throw BadRequestException
  // - Processing fails: throw InternalServerErrorException
}
```

**Users → Discord Integration (Page 2):**
```typescript
// Users module exchanges Discord auth code
interface UserDiscordContract {
  // Input: Authorization code from OAuth callback
  exchangeCodeForProfile(authCode: string): Promise<{
    discordUserId: string;
    discordUsername: string;
    discriminator: string;
  }>;
  
  // Validation
  // - Code expired: throw UnauthorizedException
  // - User already connected: throw ConflictException
  // - Discord API error: throw ServiceUnavailableException
}
```

**Integration Error Handling:**
- All cross-module calls must have proper error handling
- Propagate meaningful errors to user (don't expose internal details)
- Log integration failures with correlation IDs
- Implement timeouts (30s for external APIs)
- Provide fallback behavior where possible

---

### Phase 9: Integration & E2E Testing

**8.1 Complete Auth Flow E2E Tests**

Create comprehensive E2E test suites using Pactum framework covering:

**Email/Password Registration Flow:**
Test complete journey from registration through all 4 setup pages to Player role:
1. Register new user (validate user created, OTP sent)
2. Verify email with OTP (validate User role assigned, tokens returned)
3. Complete setup page 1 - Player Details (validate data saved, page counter incremented)
4. Complete setup page 2 - Connect Discord (validate Discord ID saved, page counter incremented)
5. Complete setup page 3 - Positions (validate positions saved, page counter incremented)
6. Complete setup page 4 - Avatar (validate image processed, Player role assigned, setupComplete = true)
7. Login with credentials (validate Player role in response)

**OAuth Registration Flow:**
Test OAuth signup and setup completion:
1. Register via Google/Apple OAuth (validate auto email verification, User role)
2. Complete all 4 setup pages (same as email flow pages 3-6)
3. Verify Player role upgrade after page 4

**Password Reset Flow:**
Test password recovery process:
1. Request password reset (validate reset email sent)
2. Reset password with token (validate password updated, sessions invalidated)
3. Login with new password (validate success)

**Partial Setup Flow:**
Test progressive setup behavior:
1. Complete only pages 1 and 3, skip 2 and 4
2. Validate role remains User
3. Validate setupComplete remains false
4. Validate setupPagesCompleted equals 2

**Role Downgrade Flow:**
Test Discord disconnection impact:
1. Complete all 4 pages (verify Player role)
2. Disconnect Discord
3. Validate downgrade to User role
4. Validate setupComplete becomes false

All tests must verify database state, token contents, and API responses match expected business rules from auth-strategy.mdc.

**8.2 Test Database Seeding**

Create test data seed file (`prisma/seed.test.ts`) with predictable test accounts:

**Test User Profiles:**
- Complete User: All 4 pages done, Player role, full profile data
- Partial User: Only 2 pages done, User role, incomplete profile
- Unverified User: Registered but email not verified, no role
- OAuth User: Google-authenticated, Player role

**Purpose:**
- Provide consistent test data for E2E tests
- Avoid test interdependencies
- Enable parallel test execution
- Fast test database reset between runs

Seed data should match production schema but use clearly test-identifiable values (e.g., SQUADZ IDs starting with "SQZ-TEST").

**8.3 Test Helpers**

Create reusable test utilities (`test/helpers/auth.helper.ts`):

**User Registration Helper:**
Automates full registration and verification flow. Returns access token and user ID for subsequent test steps.

**Setup Completion Helper:**
Completes all 4 setup pages in sequence. Accepts user ID and access token, returns updated user profile.

**Login Helper:**
Performs login and returns tokens. Useful for tests needing authenticated requests.

**Database Cleanup Helper:**
Resets test database to known state. Runs before each test suite to ensure test isolation.

These helpers reduce test boilerplate and improve test readability.

---

### Phase 10: Common Pitfalls & Anti-Patterns

**CRITICAL: What NOT to Do**

**Setup Page Anti-Patterns:**
```typescript
// ❌ WRONG: Upgrading role before all pages complete
if (user.page1Complete) {
  user.role = UserRole.PLAYER;  // Too early!
}

// ✅ CORRECT: Check total count
if (user.setupPagesCompleted === 4) {
  user.role = UserRole.PLAYER;
}

// ❌ WRONG: Allowing role upgrade with partial setup
if (user.page1Complete && user.page2Complete) {
  user.role = UserRole.PLAYER;  // Missing pages 3 and 4!
}

// ✅ CORRECT: All 4 pages required
if (user.setupPagesCompleted === 4) {
  user.role = UserRole.PLAYER;
}
```

**Token Management Anti-Patterns:**
```typescript
// ❌ WRONG: Storing access tokens in database
await prisma.accessToken.create({ token });  // Don't do this!

// ✅ CORRECT: Only store refresh tokens (hashed)
await prisma.refreshToken.create({ 
  tokenHash: hash(refreshToken)  // Hashed, not plain
});

// ❌ WRONG: Not incrementing tokenVersion on password change
await prisma.user.update({ password: newHash });

// ✅ CORRECT: Invalidate all sessions
await prisma.user.update({ 
  password: newHash,
  tokenVersion: { increment: 1 }  // Invalidates all refresh tokens
});
```

**Password Security Anti-Patterns:**
```typescript
// ❌ WRONG: Weak hashing
const hash = await bcrypt.hash(password, 4);  // Too few rounds!

// ✅ CORRECT: Minimum 10 rounds
const hash = await bcrypt.hash(password, 10);

// ❌ WRONG: Storing plain text tokens
user.resetToken = randomToken;  // Never store plain!

// ✅ CORRECT: Hash before storage
user.resetToken = await bcrypt.hash(randomToken, 10);
```

**Guard Ordering Anti-Patterns:**
```typescript
// ❌ WRONG: Setup guard before auth guard
@UseGuards(SetupCompleteGuard, JwtAuthGuard)  // user is undefined!

// ✅ CORRECT: Auth guard must come first
@UseGuards(JwtAuthGuard, SetupCompleteGuard)

// ❌ WRONG: Checking own resource without auth
@UseGuards(OwnResourceGuard)  // No user in request!

// ✅ CORRECT: Auth guard provides user
@UseGuards(JwtAuthGuard, OwnResourceGuard)
```

**Database Transaction Anti-Patterns:**
```typescript
// ❌ WRONG: Multiple separate updates (race conditions)
await prisma.user.update({ setupPagesCompleted: { increment: 1 } });
const user = await prisma.user.findUnique({ where: { id } });
if (user.setupPagesCompleted === 4) {
  await prisma.user.update({ role: UserRole.PLAYER });
}

// ✅ CORRECT: Single atomic operation or transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.update({
    where: { id },
    data: { setupPagesCompleted: { increment: 1 } }
  });
  
  if (user.setupPagesCompleted === 4) {
    await tx.user.update({
      where: { id },
      data: { role: UserRole.PLAYER, setupComplete: true }
    });
  }
});
```

**Validation Anti-Patterns:**
```typescript
// ❌ WRONG: Accepting any position value
@IsString()
position: string;  // User could send "HACKER"!

// ✅ CORRECT: Enum validation
@IsEnum(Position)
position: Position;  // Only valid positions accepted

// ❌ WRONG: No password strength check
@IsString()
password: string;  // "123" would pass!

// ✅ CORRECT: Enforce complexity
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
@MinLength(8)
password: string;
```

---

## MILESTONE 2: ALL FEATURE MODULES

### Module Build Order

**Dependency Tree:**
```
Auth (base) → Users → Squads → Contracts → Competitions → Matches → Transfers
                                    ↓
                                Coins, Challenges
                                    ↓
                              Discord, Analytics
```

**Critical Path (Sequential):**
Auth → Users → Squads → Contracts → Competitions → Matches

**Parallel Build (After Contracts):**
Transfers, Coins, Challenges

**Build Last (Need Most Modules):**
Discord, Media, Notifications, Analytics

### Per-Module Requirements

Each module needs:
- Standard NestJS structure (module, controller, service, DTOs)
- Business logic per game-rules.mdc
- Endpoints per api-requirements.mdc
- RBAC guards per api-requirements.mdc
- Unit tests per testing-standards.mdc
- E2E tests per testing-standards.mdc

---

## MILESTONE 3: PRODUCTION LAUNCH

### Overview

Final milestone focuses on production readiness, not new features.

**Key Activities:**
- Run deployment-checklist.mdc (complete security & infrastructure audit)
- Performance optimization (indexes, query optimization, pagination)
- AWS infrastructure setup (Elastic Beanstalk, RDS, S3, SES)
- Monitoring configuration (CloudWatch, Sentry, PostHog)
- Production deployment and post-deployment verification

**Reference:** See deployment-checklist.mdc for complete production launch steps.

---

## MODULE DEPENDENCIES REFERENCE

### Dependency Tree

```
Auth (base - no dependencies)
  ↓
Users (depends on Auth - User table)
  ↓
Squads (depends on Users - captain, roster)
  ↓
Contracts (depends on Users + Squads)
  ↓
Competitions (depends on Squads - registration)
  ↓
Matches (depends on Competitions + Squads)
  ↓
Transfers (depends on Contracts + Squads - break contract, pool)
  ↓
Coins (depends on Users - balance)
  ↓
Challenges (depends on Users - XP rewards)
  ↓
Discord (depends on Users + Squads + Matches + Transfers - channels)
  ↓
Media (depends on Users + Squads - uploads)
  ↓
Notifications (depends on all modules - event triggers)
  ↓
Analytics (depends on all modules - read data)
```

### Critical Path

**Must follow this sequence:**
```
Auth → Users → Squads → Contracts → Competitions → Matches
```

**Can build in parallel after Contracts:**
```
Transfers (needs Contracts)
Coins (needs Users)
Challenges (needs Users)
```

**Build last (need most modules):**
```
Discord → Media → Notifications → Analytics
```

---

## RELATED DOCUMENTATION

**Core References:**
- **db-schema.mdc** - Complete database schema
- **backend-architecture.mdc** - Module structure and patterns
- **api-requirements.mdc** - All endpoints and RBAC matrix
- **auth-strategy.mdc** - Authentication flows and user progression
- **testing-standards.mdc** - Unit and E2E test patterns
- **deployment-checklist.mdc** - Production deployment verification
- **game-rules.mdc** - Business logic and validation rules
- **discord-integration.mdc** - Discord OAuth and bot integration