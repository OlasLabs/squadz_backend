# AUTH STRATEGY 

## DESCRIPTION

Authentication and authorization strategy for SQUADZ mobile application. Defines registration flows, JWT token management, OAuth integration (Apple/Google/Discord), role-based access control, and 4-stage account setup progression. Use this to implement auth endpoints, guards, token management, and user state transitions.

**Core Auth Flow:**
- Registration: Signup → Email Verification → 4-Page Account Setup → Player Role Assignment
- JWT tokens: 15-min access tokens, 30-day refresh tokens with automatic renewal
- OAuth providers: Apple Sign-In, Google Sign-In (unified signup/login), Discord (mandatory account setup)
- Role progression: User (incomplete setup) → Player (all 4 pages complete) → Captain/Vice Captain (leadership)
- Progressive setup: Pages completed independently, partial progress saved, role upgrades only when all complete

**Related Docs:** prd.mdc (user roles, features), game-rules.mdc (permissions), discord-integration.mdc (Discord OAuth details)

---

## QUICK REFERENCE

### Authentication Methods

| Method | Use Case | Token Lifespan |
|--------|----------|----------------|
| Email/Password | Standard registration and login | Access: 15 min, Refresh: 30 days |
| Apple Sign-In | iOS OAuth (unified signup/login) | Access: 15 min, Refresh: 30 days |
| Google Sign-In | Cross-platform OAuth (unified signup/login) | Access: 15 min, Refresh: 30 days |
| Discord OAuth | Account setup Page 2 (mandatory) | Connection saved permanently |

### Token Claims (Conceptual)

**Access Token (15-minute expiry):**
Contains user identification, role, setup status (setupComplete, setupPagesCompleted), and email verification status. Used for API authorization decisions.

**Refresh Token (30-day expiry):**
Contains minimal data (user ID, token version). Used to generate new access tokens without re-authentication.

### User State Progression

```
Signup (email + password OR OAuth)
  ↓
Email Verification (OTP code)
  ↓
User Role Assigned (email verified, setup incomplete, 0 pages completed)
  ↓
Account Setup Page 1: Player Details
  → Progress saved, page count incremented
  ↓
Account Setup Page 2: Connect Discord
  → Discord connection saved, page count incremented
  ↓
Account Setup Page 3: Select Positions
  → Positions saved, page count incremented
  ↓
Account Setup Page 4: Upload Image
  → Image processed and saved, page count incremented
  ↓
All 4 Pages Complete → Player Role Assigned (setup complete)
  ↓
Create/Join Squad → Captain OR Vice Captain (role updated)
```

### Setup Completion Logic

**Role Assignment:**
- If all 4 pages completed → Upgrade to Player role, mark setup complete
- If any pages incomplete → Remain as User role, setup incomplete

**Page Completion Tracking:**
- Each page completion increments progress counter (0 → 4)
- Partial completion persists across sessions
- Pages can be completed in any order
- Skipping pages keeps User role
- Already completed pages show pre-filled data

### Critical Validation Gates

**Before Protected Operations:**
1. Verify JWT signature and expiration
2. Check email verified status
3. Validate role matches required permission level
4. For player features: Check setup complete AND all 4 pages completed

**Access Denied Scenarios:**
- User role + setup incomplete → Show setup completion modal
- User role + partial pages complete → Redirect to incomplete pages
- Player accessing Captain feature → Forbidden

---

## REGISTRATION FLOWS

### Email/Password Registration

**Step 1: Signup**

Required Fields:
- Full Name
- Squad Username (alphanumeric + underscores, unique)
- Email (unique)
- Password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special)
- Confirm Password (must match)

Process:
1. Validate inputs (email format, password strength, username format)
2. Check email and username uniqueness
3. Hash password (bcrypt, 10 salt rounds)
4. Generate unique SQUADZ ID (format: SQZ-XXXXXXXX)
5. Create user record (no role assigned, email not verified, setup incomplete, 0 pages completed)
6. Generate 6-digit OTP (3-minute expiry)
7. Send verification email with OTP

Result: Success message, no tokens returned

**Step 2: Email Verification**

Required:
- Email OR SQUADZ ID (identifier)
- OTP Code (6 digits)

Process:
1. Find user by identifier
2. Verify OTP matches and not expired
3. Mark email as verified
4. Assign User role
5. Generate JWT tokens (access + refresh)
6. Store refresh token hash

Result: Tokens + user profile (User role, setup incomplete, 0 pages completed)

Next: Redirect to Account Setup Page 1

**Step 3: Account Setup (4 Pages)**

All setup pages are optional individually but ALL must be completed for Player role assignment.

**Page 1: Player Details**

Fields:
- Nationality (dropdown, required)
- Current Location (dropdown, required)
- Favourite Team (text input, optional)
- PSN ID/Gamertag (text input, optional)
- Known As Name (text input, optional, display name for platform)

Process:
1. Validate JWT token
2. Save provided fields
3. Mark page as complete
4. Increment pages completed counter
5. If all 4 pages complete → Upgrade to Player role, mark setup complete

Result: Updated profile with page completion count

**Page 2: Connect Discord**

Fields:
- Discord Authorization Code (from OAuth callback)

Process:
1. Validate JWT token
2. Exchange authorization code for Discord access token
3. Fetch Discord user profile (User ID, username)
4. Save Discord User ID and username
5. Mark page as complete
6. Increment pages completed counter
7. If all 4 pages complete → Upgrade to Player role, mark setup complete

Result: Updated profile with Discord connection status and page completion count

**Page 3: Select Preferred Positions**

Fields:
- Primary Position (required, dropdown: GK, RB, CB, LB, CDM, CM, RM, LM, CAM, ST, SS)
- Secondary Position (optional, dropdown, must differ from primary)

Process:
1. Validate JWT token
2. Validate primary position selected
3. Validate secondary position differs from primary (if provided)
4. Save positions
5. Mark page as complete
6. Increment pages completed counter
7. If all 4 pages complete → Upgrade to Player role, mark setup complete

Result: Updated profile with page completion count

**Page 4: Upload Avatar Image**

Fields:
- Image file (JPEG/PNG, max 5MB)

Process:
1. Validate JWT token
2. Validate file type and size
3. Remove background (Removal.ai API)
4. Optimize image (Sharp: resize 512x512, compress WebP)
5. Generate thumbnail (128x128)
6. Upload to cloud storage
7. Save image URLs
8. Mark page as complete
9. Increment pages completed counter
10. If all 4 pages complete → Upgrade to Player role, mark setup complete

Result: Updated profile with image URLs and page completion count

**Progressive Completion Behavior:**

Scenario 1: User completes Page 1 and Page 3, skips Page 2 and Page 4
- Pages completed: 2 of 4
- Role: User
- Setup: Incomplete
- Page 1 and Page 3 data saved
- Next login: Redirected to Page 2 (first incomplete page)
- Pages 1 and 3 show pre-filled data

Scenario 2: User completes all 4 pages
- Pages completed: 4 of 4
- Role: Player (auto-upgraded)
- Setup: Complete
- Full app access granted

Scenario 3: User skips all pages
- Pages completed: 0 of 4
- Role: User
- Setup: Incomplete
- Restricted access, setup modal shown when accessing player features

**Skip Button Behavior:**

Each page has "Skip" button. Skipping does NOT increment page counter or save any data for that page.

### OAuth Registration (Apple / Google)

**Unified Signup/Login:**

Single endpoints handle BOTH signup (new user) and login (existing user) based on email lookup.

**Required:**
- ID Token (JWT from OAuth provider)

**Process:**

1. Verify ID token with provider (Apple public keys OR Google tokeninfo endpoint)
2. Validate token claims (issuer, audience, expiration, signature)
3. Extract user data:
   - Apple: Apple ID, email, name (only on first auth, save immediately)
   - Google: Google ID, email, name, profile picture URL
4. Check if email exists:
   - **If exists + same provider:** Login (generate tokens, return profile)
   - **If exists + different provider:** Error "Email already registered with [other provider]"
   - **If new email:** Signup (create account, generate tokens)
5. For new accounts:
   - Generate SQUADZ ID
   - Mark email as verified (OAuth verifies email)
   - Assign User role
   - Set setup incomplete, 0 pages completed
   - For Google: Download profile picture, optimize (skip background removal), upload to cloud storage
6. Generate JWT tokens (access + refresh)
7. Store refresh token hash

**Result:** Tokens + user profile + isNewUser flag

**Next Steps:**
- isNewUser: true → Account Setup Page 1
- isNewUser: false → Home/Dashboard

**One Provider Per Account:**

Each account tied to single auth method. Users cannot link multiple providers to same email.

**Provider Storage:**
- Email/password accounts: Provider type tracked
- Apple accounts: Apple ID stored
- Google accounts: Google ID stored

---

## LOGIN FLOWS

### Email/Password Login

Required:
- Identifier (Email OR SQUADZ ID)
- Password

Process:
1. Determine identifier type (email contains '@', else SQUADZ ID)
2. Find user by identifier
3. Verify user exists and email verified
4. Verify password (bcrypt compare)
5. Check account not locked (5 failed attempts = 15-min lockout)
6. Generate JWT tokens (access + refresh)
7. Store refresh token hash
8. Reset failed login counter to 0

Result: Tokens + user profile (role, setup status, pages completed)

Next Steps:
- Setup incomplete → Account Setup (resume from last incomplete page)
- Setup complete → Home/Dashboard

**Failed Login Protection:**
- Track failed attempts per account
- 5 consecutive failures → 15-minute account lockout + email notification
- Successful login resets counter

### OAuth Login (Apple / Google)

Same flow as OAuth registration. Email lookup finds existing account, verifies provider matches, and proceeds with login instead of signup.

---

## PASSWORD RESET FLOW

**Step 1: Request Reset**

Required:
- Email

Process:
1. Find user by email (don't reveal if email exists for security)
2. If user exists: Generate 6-digit OTP (5-minute expiry), hash and store, send email
3. If user doesn't exist: Return success anyway (prevent email enumeration)

Result: Success message

Rate Limit: Max 3 requests per email per hour

**Step 2: Verify OTP**

Required:
- Email OR SQUADZ ID
- OTP Code

Process:
1. Find user by identifier
2. Verify OTP matches and not expired
3. Generate temporary reset token (15-minute validity)
4. Store reset token hash

Result: Reset token (client stores in memory, NOT SecureStore)

Next: Reset Password page

**Step 3: Reset Password**

Required:
- Email OR SQUADZ ID
- New Password
- Confirm Password
- Reset Token

Process:
1. Verify reset token valid and not expired
2. Validate new password strength
3. Hash new password (bcrypt)
4. Update user password
5. Invalidate reset token
6. Increment token version (invalidates all existing refresh tokens)
7. Delete all refresh tokens for user (force re-login on all devices)

Result: Success message

Next: Login page

---

## TOKEN MANAGEMENT

### Token Generation

**Access Token Contents:**
- User identification
- Email
- Current role
- SQUADZ ID
- Email verification status
- Setup completion status
- Pages completed count
- Issued and expiration timestamps

**Refresh Token Contents:**
- User identification
- Token version (for invalidation mechanism)
- Issued and expiration timestamps

**Token Version System:**

Purpose: Invalidate all refresh tokens for a user when security events occur.

Tracked per user, increments on:
- Password change
- Password reset
- Manual security invalidation (admin action)

Verification: When validating refresh token, check token version matches current user version. Mismatch = token invalid.

### Automatic Token Renewal

**Implementation:** Axios response interceptor

**Normal Request Flow:**
1. App makes API request with access token in Authorization header
2. Backend validates token
3. Token valid → Request proceeds
4. Response returned to app

**Expired Token Flow:**
1. App makes API request with expired access token
2. Backend returns 401 Unauthorized
3. Axios interceptor catches 401
4. Interceptor retrieves refresh token from encrypted storage
5. Interceptor calls refresh endpoint with refresh token
6. Backend validates refresh token and token version
7. Backend generates new access + refresh tokens
8. Backend invalidates old refresh token
9. Interceptor saves new tokens to encrypted storage
10. Interceptor retries original request with new access token
11. Original request succeeds

**Request Queueing:**

When multiple requests fail simultaneously:
- First 401 triggers refresh process, sets isRefreshing flag
- Subsequent requests queue and wait
- After new tokens received, all queued requests retry with new token
- Prevents concurrent refresh calls

**Refresh Failure:**
- If refresh token invalid/expired:
  - Clear all tokens from SecureStore
  - Clear Zustand auth state
  - Redirect to login page

### Token Storage

**Frontend (React Native):**

| Data | Storage Type | Reason |
|------|--------------|--------|
| Access Token | Encrypted Storage | Highly sensitive, grants API access |
| Refresh Token | Encrypted Storage | Highly sensitive, long-lived credential |
| User ID | App State + Persistent | Non-sensitive, app logic |
| User Email | App State + Persistent | Non-sensitive, display |
| User Role | App State + Persistent | Non-sensitive, UI rendering |
| Setup Status | App State + Persistent | Non-sensitive, navigation |
| Pages Completed | App State + Persistent | Non-sensitive, progress tracking |

**Never Store:**
- Tokens in unencrypted storage
- Tokens in app state (visible in debugger)
- Passwords (even hashed)

**Backend:**
- Refresh tokens: Stored as hashes, never plain text
- Metadata: User ID, token hash, token version, expiration, timestamps
- Rotation: Old token deleted when new token generated
- Cleanup: Scheduled job removes expired tokens

---

## ROLE-BASED ACCESS CONTROL

### Role Hierarchy

| Role | Access Level | Assignment |
|------|--------------|------------|
| user | Restricted | Incomplete account setup |
| player | Standard | All 4 setup pages complete |
| vice_captain | Team Support | Assigned by Captain |
| captain | Team Control | Created squad OR assigned by existing Captain |
| admin | Platform-Wide | Manual assignment |

### Permission Validation

**Backend Guards (NestJS):**

1. JWT Guard: Validates access token signature and expiration
2. Roles Guard: Checks user.role against required roles
3. Setup Guard: Checks setupComplete: true for player features

**Guard Execution Order:**
1. JWT Guard validates token, loads user data into request
2. Roles Guard checks user.role
3. Setup Guard checks setupComplete (if required)
4. If all pass → Proceed to controller
5. If any fail → Return 403 Forbidden

**Frontend Access Control:**

Check user state before rendering features:
- User role + setup incomplete → Show setup completion modal, redirect to incomplete pages
- User role + partial pages complete → Show progress indicator, redirect to next incomplete page
- Required role not met → Hide feature, show locked state

### Feature Access Requirements

| Feature | Required Role | Additional Checks |
|---------|---------------|-------------------|
| View competitions | ANY authenticated | emailVerified: true |
| Join squad | player | setupComplete: true |
| Create squad | player | setupComplete: true |
| Register competition | captain | setupComplete: true + owns squad |
| Submit lineup | captain OR vice_captain | setupComplete: true + Discord connected |
| Transfer market | player | setupComplete: true |
| Challenges | player | setupComplete: true |
| Profile editing | ANY authenticated | emailVerified: true |

---

## DISCORD OAUTH INTEGRATION

### When Discord Connection Required

**Mandatory:** Account Setup Page 2 (all users must complete to become Player)

**Purpose:**
- Discord User ID enables bot to add player to Discord channels (match coordination, squad team channels, transfer market channels)
- One-time connection during setup, persists for all Discord features
- No re-authentication needed for individual matches

### Discord OAuth Flow (Account Setup)

**Trigger:** User reaches Account Setup Page 2

**Process:**

1. User clicks "Connect Discord" button
2. Frontend initiates Discord OAuth via Expo AuthSession
3. Redirect to Discord authorization URL with:
   - Client ID
   - Redirect URI
   - Scope: identify (provides User ID, username, discriminator)
   - State parameter (CSRF protection)
4. User authorizes SQUADZ app in Discord
5. Discord redirects to callback with authorization code
6. Frontend sends code to backend
7. Backend exchanges code for access token (Discord API)
8. Backend fetches Discord user profile (User ID, username)
9. Backend saves Discord connection:
   - Discord User ID (permanent identifier for bot operations)
   - Discord username (display only)
   - Connection timestamp
10. Backend marks page as complete, increments pages completed counter
11. Backend returns updated user profile

**Response:** User profile with Discord connection status

**Redirect:** Account Setup Page 3

### Discord Connection Validation

Setup completion check: Discord connection is ONE of 4 required pages. User only becomes Player when all 4 pages complete, including Discord.

**Tracked Data:**
- Discord User ID (permanent identifier for bot operations)
- Discord username (display only)
- Connection timestamp
- Page completion status

**Disconnection:**

Process:
1. Validate JWT token
2. Check if user is Captain or Vice Captain with upcoming matches
3. If yes: Warn that disconnection prevents lineup submission, require confirmation
4. Remove Discord connection data
5. Mark page as incomplete
6. Decrement pages completed counter
7. If pages completed < 4: Downgrade role to User, mark setup incomplete
8. Remove user from all Discord channels via bot

---

## PROFILE MANAGEMENT

**Get Profile:**

Returns:
- User ID, SQUADZ ID, email
- Name, Known As name
- Role, setup status, pages completed
- Nationality, location, favourite team, PSN ID
- Positions (primary, secondary)
- Profile picture URLs
- Discord connection status
- Timestamps

**Update Profile:**

Allowed fields:
- Full name
- Known As name
- Nationality
- Current location
- Favourite team
- PSN ID/Gamertag
- Primary position
- Secondary position

Cannot change:
- Email (immutable)
- SQUADZ ID (immutable)
- Role (system-managed)
- Setup completion status (system-managed)

**Update Profile Picture:**

Process identical to setup Page 4 (background removal, optimization, cloud upload).

**Change Password:**

Required:
- Current Password (verification)
- New Password
- Confirm Password

Process:
1. Verify current password correct
2. Validate new password strength
3. Hash new password
4. Update database
5. Increment token version
6. Delete all refresh tokens for user
7. User must re-login on all devices

---

## SECURITY REQUIREMENTS

### Rate Limiting

Rate limiting required on all auth endpoints to prevent abuse:
- Login attempts: Limited per IP address
- Signup: Limited per IP address
- Email verification resend: Limited per email
- Password reset requests: Limited per email
- Token refresh: Limited per user

### Account Security

**Failed Login Protection:**
- Track failed attempts per user account
- 5 consecutive failures → 15-minute account lockout
- Lockout notification sent to user email
- Successful login resets counter to 0

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Hashed with bcrypt (10 salt rounds)

**Session Invalidation Triggers:**
- Password change (increment tokenVersion)
- Password reset (increment tokenVersion)
- Security event (manual admin action)
- User-initiated logout from all devices

### Data Protection

**Sensitive Data Handling:**
- Never log tokens, passwords, or OTPs
- Redact sensitive fields in error messages and logs
- Always use secure transmission (HTTPS)

**Input Validation:**
- Sanitize all user inputs (prevent XSS)
- Validate email format server-side
- Validate SQUADZ ID format (SQZ-XXXXXXXX)
- Validate username format (alphanumeric + underscores only)
- Use parameterized queries (prevent SQL injection)

**File Upload Security:**
- Validate file type (JPEG/PNG only)
- Enforce size limit (5MB max)
- Remove EXIF data for privacy
- Sanitize filenames before storage
- Generate unique storage keys (prevent overwrites)

---

## OAUTH VERIFICATION

### Apple Sign-In Verification

**Token Type:** ID Token (JWT)

**Verification Requirements:**
- Verify JWT signature using Apple's public keys (obtained from Apple's key endpoint)
- Validate claims:
  - Issuer must be Apple
  - Audience must match your Apple Client ID
  - Token not expired
  - Subject contains Apple User ID (permanent identifier)
- Extract user data:
  - Apple ID (subject claim)
  - Email
  - Name (only provided on first authorization - must save immediately)

**Important:** Apple only provides name on FIRST authorization. Must be saved immediately. Subsequent logins won't include name.

**Reference:** https://developer.apple.com/sign-in-with-apple/

### Google Sign-In Verification

**Token Type:** ID Token (JWT)

**Verification Requirements:**
- Verify token via Google's token verification endpoint
- Validate response:
  - Audience must match your Google Client ID
  - Issuer must be Google
  - Token not expired
  - Subject contains Google User ID (permanent identifier)
- Extract user data:
  - Google ID (subject claim)
  - Email
  - Name
  - Profile picture URL

**Profile Picture Handling:**
- Download from provided CDN URL
- Optimize (resize 512x512, compress WebP)
- Generate thumbnail (128x128)
- Upload to cloud storage
- Skip background removal (OAuth pictures already clean)
- Save URLs to user profile

**Reference:** https://developers.google.com/identity/sign-in/web/sign-in

### Discord OAuth Verification

**Token Type:** Authorization Code (exchanged for access token)

**Verification Requirements:**
- Exchange authorization code for access token via Discord API
- Call Discord user endpoint with access token to fetch user profile
- Validate response contains required fields
- Extract user data:
  - Discord User ID (permanent identifier)
  - Discord username
  - Discriminator

**Security Requirements:**
- Verify state parameter matches (CSRF protection)
- Access tokens short-lived (use immediately, don't store long-term)
- Store only Discord User ID (needed for bot operations)

**Reference:** https://discord.com/developers/docs/topics/oauth2

---

## ERROR HANDLING

### Authentication Errors

| Error Type | Trigger | Action |
|------------|---------|--------|
| Invalid credentials | Wrong email/password | Show error, allow retry |
| Email not verified | Login before verification | Redirect to verification |
| Account locked | Too many failed attempts | Show lockout time |
| Token expired | Access token expired | Auto-refresh (transparent) |
| Refresh token invalid | Refresh token expired/revoked | Clear tokens, redirect to login |
| Setup incomplete | Accessing player feature as user | Show setup modal |

### OAuth Errors

| Error | Cause | Action |
|-------|-------|--------|
| Authorization cancelled | User cancelled | Allow retry |
| Code expired | Authorization code expired | Restart OAuth flow |
| Configuration error | Wrong client credentials | Log error |
| Email conflict | Email exists with different provider | Show error |

### Validation Errors

| Field | Error | Handling |
|-------|-------|----------|
| email | Invalid format | Show validation error |
| password | Too weak | Show requirements |
| username | Already taken | Show error |
| username | Invalid format | Show allowed characters |
| otp | Invalid or expired | Show error, allow resend |

### Setup Page Errors

| Page | Error | Handling |
|------|-------|----------|
| Player Details | Missing required fields | Field-level validation |
| Connect Discord | OAuth failed | Allow retry with error |
| Select Positions | No primary position | Show requirement |
| Upload Image | File too large | Show size limit |
| Upload Image | Invalid file type | Show allowed types |

---

## RELATED DOCUMENTATION

**Project Docs:**
- prd.mdc - User roles, account setup requirements, feature access
- game-rules.mdc - Role permissions, tier limits, validation rules
- discord-integration.mdc - Discord OAuth details, connection requirements, bot operations
- backend-structure.mdc - Auth module structure, endpoint specifications

**External References:**
- NestJS Authentication: https://docs.nestjs.com/security/authentication
- NestJS Guards: https://docs.nestjs.com/guards
- JWT: https://jwt.io
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Apple Sign-In: https://developer.apple.com/sign-in-with-apple/
- Google Sign-In: https://developers.google.com/identity/sign-in/web/sign-in
- Discord OAuth: https://discord.com/developers/docs/topics/oauth2