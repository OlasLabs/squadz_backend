# TESTING STANDARDS

## DESCRIPTION

Testing standards for SQUADZ backend (Jest + Pactum). Defines test file organization, unit test patterns, E2E test patterns, test data strategy, and assertion guidelines. Use this as the authoritative source for writing consistent, focused tests across all 13 modules.

**Scope:**
- Test file naming and location conventions
- Unit test structure for services
- E2E test structure with Pactum
- Test data seeding strategy
- What to test vs what to skip
- Assertion patterns
---

## QUICK REFERENCE

**Unit Tests:**
- Location: `src/<module>/<file>.spec.ts` (colocated)
- Mock: PrismaService, external APIs, other services
- Test: Business logic, calculations, validations
- Skip: Framework code, Prisma queries, external API calls
- Speed: < 100ms per test

**E2E Tests:**
- Location: `test/<module>.e2e-spec.ts`
- Real: Database (Docker Postgres), external APIs (test credentials)
- Test: Complete workflows, RBAC, state transitions
- Auth: Reusable helper in `test/helpers/auth.helper.ts`
- Data: Seeded from `prisma/seed.test.ts`

**Assertions:**
- Assert: Business-critical fields only (status, IDs, amounts)
- Skip: Exact timestamps, auto-generated IDs
- Errors: Assert status code + error message
- Pactum: Use `expectJsonLike` for partial matching

**External APIs:**
- Discord, Removal.ai, Payments, S3: Use real test credentials
- Never mock in E2E tests
- Clean up test resources after run

---

## TEST FILE ORGANIZATION

### File Naming Conventions

**Unit Tests:**
```
src/
├── users/
│   ├── users.service.ts
│   ├── users.service.spec.ts          # Unit tests for service
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── create-user.dto.spec.ts    # Unit tests for DTO validation
```

**E2E Tests:**
```
test/
├── auth.e2e-spec.ts                    # Auth module E2E tests
├── users.e2e-spec.ts                   # Users module E2E tests
├── squads.e2e-spec.ts                  # Squads module E2E tests
├── contracts.e2e-spec.ts               # Contracts module E2E tests
├── matches.e2e-spec.ts                 # Matches module E2E tests
├── transfers.e2e-spec.ts               # Transfers module E2E tests
└── helpers/
    ├── auth.helper.ts                  # Reusable auth helpers
    ├── setup.ts                        # Global test setup
    └── teardown.ts                     # Global test cleanup
```

**Naming Pattern:**
- Unit tests: `<filename>.spec.ts` (next to source file)
- E2E tests: `<module>.e2e-spec.ts` (in `test/` directory)
- Test helpers: `<name>.helper.ts` (in `test/helpers/`)

---

### Test File Location

**Unit Tests (`.spec.ts`):**
- Colocated with source files
- Same directory as the code being tested
- One spec file per source file

**E2E Tests (`.e2e-spec.ts`):**
- All in `test/` directory at project root
- One E2E file per module
- Shared helpers in `test/helpers/`

**Test Data Seeds:**
- Development: `prisma/seed.ts`
- E2E tests: `prisma/seed.test.ts`

---

## UNIT TEST PATTERNS

### What to Test (Unit Tests)

**✅ DO Test:**
- Business logic in services
- Validation logic and calculations
- State machine transitions
- Fee calculations (tier-based, player valuation)
- Permission validation logic
- Data transformations

**❌ DON'T Test:**
- NestJS framework code (controllers, decorators)
- Prisma queries (tested via E2E)
- DTOs with only class-validator decorators (framework tested)
- Getters/setters with no logic
- External API calls (Discord API, Removal.ai, payment APIs)
- Database operations (use E2E tests with real DB)
- File upload operations (use E2E tests with real S3)

---

### Service Test Structure

**Unit Test Pattern:**

1. **Setup (beforeEach):**
   - Create NestJS TestingModule
   - Provide service under test
   - Mock all dependencies (PrismaService, other services)
   - Get service instance from module

2. **Test Organization:**
   - Group related tests in describe blocks by method/feature
   - One test per expected behavior
   - Descriptive test names starting with "should..."
   - Focus on business logic outcomes

3. **Test Isolation:**
   - Each test is independent
   - Mock return values specific to test case
   - No shared state between tests

4. **What to Mock (Unit Tests Only):**
   - PrismaService (always mock in unit tests for speed)
   - Other module services (inject mocks for isolation)
   - External API services (Discord, Removal.ai, payment services)
   - Time-dependent functions (Date.now, setTimeout)

**Example Test Organization:**
```
describe('UsersService')
  describe('calculateBreakFee')
    - should calculate 100% fee for Basic tier
    - should calculate 100% fee for Pro tier
    - should calculate 50% fee for Premium tier
  
  describe('validateSetupComplete')
    - should throw if setup not complete
    - should pass if setup complete
    - should throw if Discord not connected
```

**Key Points:**
- Test pure functions and business logic
- One assertion per test (focused)
- Mock dependencies for speed and isolation
- Keep tests fast (< 100ms per test)

---

### Testing Business Logic

**Focus on Calculations and Validations:**

**Player Valuation Tests:**
- Test minimum valuation (2 coins for new players)
- Test maximum valuation (12 coins cap)
- Test valuation increases with XP and performance
- Test position-specific formulas

**Contract Fee Tests:**
- Test tier-based multipliers (Basic 100%, Pro 100%, Premium 50%)
- Test fee calculation uses current player valuation
- Test edge cases (valuation = 2, valuation = 12)

**State Validation Tests:**
- Test valid state transitions allowed
- Test invalid state transitions rejected
- Test state-dependent operations (e.g., can't break PENDING contract)

**Tier Limit Tests:**
- Test Basic tier limits (1 squad, 1 competition, 0 screenshots)
- Test Pro tier limits (1 squad, 2 competitions, 2 screenshots)
- Test Premium tier limits (2 squads, 3 competitions, 4 screenshots)
- Test limit enforcement on operations

**Test Edge Cases and Boundaries:**
- Minimum/maximum values
- Tier boundaries (249 XP → 250 XP grade change)
- State transitions (PENDING → ACTIVE → BROKEN)
- Invalid inputs (negative values, null, undefined)
- Business rule violations (roster full, insufficient balance)

---

## E2E TEST PATTERNS

### E2E Test Structure

**E2E Test Pattern:**

1. **Setup (beforeAll):**
   - Initialize NestJS app for testing
   - Authenticate test users (captain, player, admin)
   - Store auth tokens for reuse across tests
   - Use seeded test accounts from seed.test.ts

2. **Test Organization:**
   - Group by endpoint/feature in describe blocks
   - One endpoint or workflow per describe block
   - Use descriptive test names with HTTP method and expected outcome
   - Test both success and error scenarios

3. **Test Flow:**
   - Authenticate with stored bearer token
   - Make API request with appropriate HTTP method
   - Assert response status code
   - Assert critical response fields (use partial matching)
   - Store created resource IDs for dependent tests (Pactum stash)

4. **Test Scenarios:**
   - Happy path (valid data, correct permissions)
   - Validation errors (missing fields, invalid formats)
   - Permission errors (wrong role, insufficient tier)
   - Business rule violations (roster full, already registered)
   - State conflicts (already accepted, already completed)

5. **Cleanup (afterAll):**
   - Close NestJS app
   - Database automatically resets (seeded before next run)

**Example Test Organization:**
```
describe('Squads (E2E)')
  describe('POST /squads')
    - should create squad for captain
    - should reject if user setup incomplete
    - should reject if user already has max squads (tier limit)
    - should validate required fields
  
  describe('GET /squads/:id')
    - should return squad for authenticated user
    - should return 404 for non-existent squad
  
  describe('PATCH /squads/:id')
    - should update squad for captain
    - should reject if not captain (403)
```

**Key Points:**
- Use real database (Docker Postgres)
- Test complete workflows and RBAC
- Store created IDs for dependent tests
- Test both success and failure paths
- Use seeded test accounts with known IDs

---

### Authentication Setup Helper

**Create Reusable Auth Helper Pattern:**

**Purpose:**
- Authenticate test users once in beforeAll
- Reuse tokens across all tests in suite
- Avoid repeated login calls (faster tests)

**Helper File Location:** `test/helpers/auth.helper.ts`

**Functions Needed:**
1. `setupE2ETest()` - Initialize and configure NestJS app for testing
2. `getAuthToken(app, email, password)` - Login and return access token
3. `getRefreshToken(app, email, password)` - Login and return refresh token

**Usage Pattern:**
- Call setupE2ETest() in beforeAll
- Authenticate each test user (captain, player, admin, incomplete user)
- Store tokens in test suite variables
- Reuse tokens in all test specs with Authorization header
- Close app in afterAll

**Test Accounts (from seed.test.ts):**
- captain1@test.com - Complete setup, Captain role
- captain2@test.com - Complete setup, Captain role
- player1@test.com - Complete setup, Player role
- incomplete@test.com - Incomplete setup (2/4 pages)
- admin@test.com - Admin role

---

### External API Test Strategy

**Use Real External APIs with Test Credentials:**

E2E tests use real external services with separate test accounts/credentials to validate actual integration behavior.

**External Services:**
- **Discord API:** Real dev bot, test server
- **Removal.ai API:** Real dev API key (free tier)
- **Payment APIs:** Apple sandbox, Google Play test accounts
- **AWS S3:** Separate dev bucket

**Pattern:**
- Use separate credentials/accounts for testing (never production)
- Test actual API integration, not mocked responses
- Validate real API behavior (auth, errors, rate limits)
- Clean up test resources after test run

---

### Workflow Tests

**Test Complete Workflows Across Endpoints:**

Workflow tests validate entire user journeys spanning multiple endpoints and state transitions.

**Match Workflow Example:**
1. Create match (admin) → Store match ID
2. Submit lineups (both captains) → Verify status updated
3. Mark ready (both captains) → Verify match status = READY
4. Mark done (both captains) → Verify status = DONE
5. Submit results (both captains) → Verify matching data
6. Verify match completed and results verified

**Squad to Competition Workflow Example:**
1. Create squad → Send contracts → Accept contracts
2. Squad reaches minimum roster (5 players)
3. Register for competition → Handle Sub-Ineligible players
4. Verify registration approved and squad becomes CompSquad

**Other Critical Workflows to Test:**
- Transfer flow (contract break → transfer pool → transfer request → acceptance)
- Challenge flow (activation → progress → completion → rewards)
- Payment flow (purchase → receipt verification → balance update)

**Workflow Test Benefits:**
- Validates integration between modules
- Tests state transitions across multiple steps
- Catches race conditions and timing issues
- Validates RBAC throughout user journey
- Tests real end-to-end scenarios

---

### Pactum Assertion Patterns

**Assertion Methods Available:**

**Exact Match:**
- Use when all response fields are known and fixed
- Tests exact JSON structure and values
- Best for error responses with fixed messages

**Partial Match (JsonLike):**
- Use when response has dynamic fields (IDs, timestamps)
- Tests only specified fields, ignores others
- Best for success responses with auto-generated data
- Most commonly used assertion method

**Pattern Match (JsonMatch):**
- Use when values follow patterns (regex)
- Tests field formats (dates, UUIDs, emails)
- Best for validating data formats

**Array Contains:**
- Use when testing array responses
- Can test strict or partial matches
- Tests element presence and structure

**Status Codes:**
- Always assert expected HTTP status code
- 200/201 for success, 400/403/422 for errors
- Use specific codes, not just 2xx/4xx

**Response Time:**
- Optionally assert maximum response time
- Useful for performance-critical endpoints
- Set reasonable thresholds (e.g., 1000ms)

**Common Patterns:**

**Success Response (Dynamic ID):**
- Use JsonLike to ignore auto-generated ID
- Assert critical business fields only
- Store created ID for dependent tests

**Error Response (Validation):**
- Assert exact status code (400)
- Assert error message array contains expected messages
- Don't assert entire error structure

**Error Response (Business Rule):**
- Assert exact status code (422)
- Assert exact error message
- Validates business logic enforcement

**List Response (Pagination):**
- Assert array length or use array matchers
- Assert individual item structure
- Validate pagination metadata

---

## TEST DATA STRATEGY

### Seeded Test Data

**Two Seed Files:**

**1. Development Seed (`prisma/seed.ts`):**
- For manual development and exploration
- Rich, varied data for UI testing
- Run: `npx prisma db seed`

**2. E2E Test Seed (`prisma/seed.test.ts`):**
- Production-like complete data
- Predictable test accounts with known IDs
- Run: `NODE_ENV=test ts-node prisma/seed.test.ts`

---

### Using Seeded Data in Tests

**Reference Known IDs from seed.test.ts:**

**Seed File Provides:**
- Predictable test accounts with fixed IDs (exported as constants)
- Multiple user roles and setup states (captain, player, incomplete, admin)
- Complete resource data (squads, competitions, contracts, matches)
- Consistent baseline data across all test runs

**Usage Pattern:**
- Import seeded IDs as constants from seed file
- Reference IDs directly in test request bodies
- Use read-only (don't modify seeded data during tests)
- Document which seeded resources each test suite uses

**Benefits:**
- No test execution order dependencies
- Known starting state for all tests
- Fast test setup (data pre-seeded)
- Consistent data across development machines and CI

---

### Test Data Isolation

**Each E2E Test Should:**

**Use Seeded Data as Starting Point:**
- Reference seeded users, squads, competitions
- Don't modify seeded data (read-only)
- Seeded data provides consistent baseline

**Create New Resources When Testing Creation:**
- Create fresh squads for squad tests
- Create fresh contracts for contract tests
- Create fresh matches for match tests
- Store created IDs for use in same test

**Store Created IDs for Dependent Operations:**
- Use Pactum stash to store IDs between steps
- Access stored IDs in subsequent requests
- Keeps tests self-contained

**Avoid Test Execution Order Dependencies:**
- Each test should work independently
- Use beforeEach for test-specific setup
- Don't rely on previous test creating data
- Reset state in beforeEach if needed

**Pattern:**
1. beforeEach: Create fresh test resources if needed
2. Test: Perform operation on fresh resource
3. Assert: Validate outcome
4. No cleanup needed: Database resets between full test runs

---

## ASSERTION PATTERNS

### What to Assert

**✅ DO Assert:**
- Critical business data (status, amounts, IDs)
- State transitions (PENDING → ACTIVE)
- Relationships (player belongs to squad)
- Validation errors (correct error messages)
- Timestamps exist (not exact values)

**❌ DON'T Assert:**
- Exact timestamp values (flaky)
- Auto-generated IDs (unpredictable)
- Framework response structure (trust NestJS)
- Every single field (brittle)

---

### Assertion Granularity

**Assert Business-Critical Fields Only:**
- Contract status (PENDING, ACTIVE, BROKEN)
- Player and squad relationships (IDs)
- Financial values (balances, fees)
- State transitions
- Validation error messages

**Use Partial Matching for Dynamic Fields:**
- Ignore auto-generated IDs when not critical
- Ignore exact timestamps (assert presence only)
- Ignore computed fields that aren't being tested
- Focus on fields that matter for test scenario

**Good Assertions (Focused):**
- Assert what matters for the test scenario
- Use partial matching for responses with dynamic data
- Validate error responses thoroughly
- Keep assertions focused and meaningful

**Bad Assertions (Over-Specified):**
- Asserting exact timestamp values (will fail due to timing)
- Asserting exact auto-generated IDs (unpredictable)
- Asserting every field in response (unnecessary)
- Not checking critical business fields

---

### Pactum Assertion Methods

**For E2E tests using Pactum:**

**Exact Match:**
- Use when all response fields are known and fixed
- Best for error responses with fixed messages

**Partial Match (expectJsonLike):**
- Use when response has dynamic fields (IDs, timestamps)
- Tests only specified fields, ignores others
- Most commonly used for success responses

**Pattern Match (expectJsonMatch):**
- Use when values follow patterns (regex)
- Best for validating data formats (dates, UUIDs, emails)

**Status Codes:**
- Always assert expected HTTP status code
- Use specific codes: 200, 201, 400, 403, 422, 409, 404

**Common Patterns:**
- Success responses: Use partial matching, ignore IDs/timestamps
- Error responses: Assert status code and error message
- List responses: Assert array structure and key elements
- Store created IDs for dependent tests

---

### Error Assertion Patterns

**Validate Error Structure and Messages:**

**400 Bad Request (Validation Errors):**
- Assert status code is exactly 400
- Assert error message is array of validation errors
- Assert message contains expected validation failures
- Example scenarios: Missing required fields, invalid email format, password too short

**403 Forbidden (Permission Errors):**
- Assert status code is exactly 403
- Assert error message indicates forbidden access
- Example scenarios: Wrong role, insufficient tier, not resource owner

**422 Unprocessable Entity (Business Rule Violations):**
- Assert status code is exactly 422
- Assert error message describes specific business rule violated
- Example scenarios: Roster full, insufficient balance, tier limit exceeded

**409 Conflict (State Conflicts):**
- Assert status code is exactly 409
- Assert error message describes state conflict
- Example scenarios: Already accepted, already completed, duplicate registration

**404 Not Found:**
- Assert status code is exactly 404
- Assert error message indicates resource not found
- Example scenarios: Invalid ID, deleted resource

**Error Response Structure:**
All errors follow standard format with:
- statusCode (number)
- message (string or array of strings)
- error (string, e.g., "Bad Request")
- timestamp (ISO datetime)
- path (request URL)

---

### Testing State Machines

**Assert State Transitions Explicitly:**

**Contract State Transition Pattern:**
1. Create contract → Assert starts in PENDING state
2. Verify current state before transition
3. Perform state transition action (accept/decline/break)
4. Assert new state is correct
5. Verify related data updated (roster, transfer pool, balances)

**Match State Transition Pattern:**
1. Create match → Assert SCHEDULED state
2. Submit lineups → Assert LINEUP_SUBMITTED state
3. Both captains mark ready → Assert READY state
4. Both captains mark done → Assert DONE state
5. Submit results → Assert RESULT_SUBMITTED state
6. Verify results match → Assert VERIFIED and COMPLETED state

**Invalid State Transition Tests:**
- Attempt to transition from invalid state
- Assert request rejected with 422 or 409
- Verify state remains unchanged
- Validate error message describes invalid transition

**State Validation Points:**
- Test each valid transition path
- Test rejection of invalid transitions
- Verify state-dependent operations respect current state
- Validate state changes are atomic (all or nothing)

**Examples of State Machines to Test:**
- Contract lifecycle (PENDING → ACTIVE → TERMINATED/BROKEN)
- Match workflow (SCHEDULED → READY → DONE → COMPLETED)
- Squad type (NonCompSquad → CompSquad on first registration)
- Subscription status (ACTIVE → GRACE_PERIOD → EXPIRED)
- Challenge status (ACTIVE → COMPLETED/FAILED)
- Transfer request (PENDING → ACCEPTED/DECLINED)

---

## RELATED DOCUMENTATION

- **tech-stack.mdc** - Testing frameworks (Jest, Pactum), CI/CD pipeline, coverage targets
- **backend-architecture.mdc** - Module organization, service patterns, request flow
- **db-schema.mdc** - Database tables for test data reference
- **api-requirements.mdc** - Complete endpoint requirements and RBAC matrix and UI Screen Specifications
- **game-rules.mdc** - Business rules to validate in tests