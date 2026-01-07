# Auth Module

Complete authentication module for SQUADZ with email/password, OAuth (Apple/Google), JWT tokens, and password management.

## Structure

```
src/auth/
├── auth.module.ts              # Module definition
├── auth.controller.ts          # HTTP endpoints
├── auth.service.ts             # Business logic
├── dto/                        # Request/response DTOs
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── verify-email.dto.ts
│   ├── refresh-token.dto.ts
│   ├── forgot-password.dto.ts
│   ├── reset-password.dto.ts
│   ├── apple-oauth.dto.ts
│   ├── google-oauth.dto.ts
│   └── auth-response.dto.ts
├── services/                   # Utility services
│   ├── squadz-id-generator.service.ts
│   ├── otp-generator.service.ts
│   ├── token-generator.service.ts
│   ├── apple-oauth.service.ts
│   └── google-oauth.service.ts
├── strategies/                 # Passport strategies
│   └── jwt.strategy.ts
├── guards/                     # Auth guards
│   └── jwt-auth.guard.ts
└── decorators/                 # Custom decorators
    └── public.decorator.ts
```

## Endpoints

| Method | Path | Description | Public |
|--------|------|-------------|--------|
| POST | `/auth/register` | Register with email/password | ✅ |
| POST | `/auth/verify-email` | Verify email with OTP | ✅ |
| POST | `/auth/login` | Login with email/password | ✅ |
| POST | `/auth/oauth/google` | Google Sign-In | ✅ |
| POST | `/auth/oauth/apple` | Apple Sign-In | ✅ |
| POST | `/auth/refresh` | Refresh access token | ✅ |
| POST | `/auth/logout` | Logout (invalidate token) | ✅ |
| POST | `/auth/forgot-password` | Request password reset | ✅ |
| POST | `/auth/reset-password` | Reset password with token | ✅ |

## Features

### ✅ Registration & Verification
- Email/password registration
- 6-digit OTP email verification (3-minute expiry)
- Unique SQUADZ ID generation (format: `SQZ-XXXXXXXX`)
- Password strength validation

### ✅ Login & Security
- Email/password authentication
- Account lockout after 5 failed attempts (15-minute cooldown)
- Failed login attempt tracking
- Session invalidation on password change

### ✅ OAuth Integration
- **Apple Sign-In**: ID token verification with RS256 signature
- **Google Sign-In**: ID token verification via Google API
- Unified signup/login flow
- Automatic email verification for OAuth users
- Profile picture download for Google users

### ✅ JWT Token Management
- **Access tokens**: 15-minute expiry
- **Refresh tokens**: 30-day expiry
- Token version control for session invalidation
- Hashed refresh token storage

### ✅ Password Management
- Forgot password flow with reset tokens
- 1-hour reset token expiry
- Token version increment on password change
- All sessions invalidated after password reset

## Token Payloads

### Access Token (15 min)
```typescript
{
  sub: string;              // User ID
  email: string;
  role: UserRole;
  setupComplete: boolean;
  setupPagesCompleted: number;
  emailVerified: boolean;
  iat: number;
  exp: number;
}
```

### Refresh Token (30 days)
```typescript
{
  sub: string;              // User ID
  tokenVersion: number;     // For invalidation
  iat: number;
  exp: number;
}
```

## Environment Variables Required

```env
# JWT
JWT_SECRET="your-secret-minimum-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-chars"

# Apple OAuth
APPLE_CLIENT_ID="com.squadz.app"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"

# Database
DATABASE_URL="postgresql://..."
```

## Dependencies Required

Install these packages:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install class-validator class-transformer
npm install jsonwebtoken jwks-rsa
npm install axios

# Types
npm install -D @types/bcrypt @types/passport-jwt @types/jsonwebtoken
```

## Security Features

- ✅ bcrypt password hashing (10 salt rounds)
- ✅ Hashed refresh token storage
- ✅ Token version control for session invalidation
- ✅ Account lockout after failed attempts
- ✅ OTP expiry (3 minutes)
- ✅ Reset token expiry (1 hour)
- ✅ OAuth signature verification

## Next Steps

1. **Install Dependencies**: Run `npm install` with packages listed above
2. **Configure Environment**: Set all required environment variables
3. **Setup Database**: Ensure Prisma schema matches and migrations applied
4. **Integrate Notifications**: Connect email sending for OTP and password reset
5. **Integrate Media**: Connect avatar processing for Google OAuth profile pictures
6. **Add Tests**: Create unit and E2E tests per testing-standards.mdc

## Usage Example

```typescript
// Import AuthModule in app.module.ts
@Module({
  imports: [
    AuthModule,
    // ... other modules
  ],
})
export class AppModule {}

// Protect routes with JWT guard
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

// Public routes
@Public()
@Post('some-public-route')
publicRoute() {
  // ...
}
```

## Integration Points

### Notifications Module (To Be Connected)
- `sendVerificationEmail(email, otp, squadzId)` - After registration
- `sendPasswordResetEmail(email, resetToken)` - After forgot password
- `sendAccountLockoutEmail(email, unlockTime)` - After 5 failed attempts

### Media Module (To Be Connected)
- `processAvatar(pictureBuffer, userId)` - For Google OAuth profile pictures

## Notes

- All auth endpoints are public (marked with `@Public()` decorator)
- Refresh tokens are stored hashed in database
- Token version tracking enables server-side session invalidation
- SQUADZ ID format: `SQZ-` + 8 random uppercase alphanumeric characters
- Account lockout: 15 minutes after 5 failed login attempts

