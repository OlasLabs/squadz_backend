# NESTJS CODING STANDARDS

TypeScript and NestJS coding guidelines for SQUADZ backend (NestJS + Prisma + PostgreSQL).

## TypeScript Guidelines

### Basic Principles

- Use English for all code and documentation
- Always declare types for variables, parameters, and return values
- Avoid `any` - use Prisma-generated types (`User`, `Squad`, `Contract`) or create proper types
- Use JSDoc for public classes and methods
- One export per file

### Nomenclature

- **PascalCase**: Classes, Interfaces, Types, Enums
- **camelCase**: Variables, functions, methods, properties
- **kebab-case**: Files and directories
- **SCREAMING_SNAKE_CASE**: Enum values, constants
- **UPPERCASE**: Environment variables

### Functions

- Start function names with verbs (e.g., createUser, validateContract, isSetupComplete)
- Use prefixes for boolean functions: `isX`, `hasX`, `canX`
- Keep functions short (< 20 lines) with single purpose
- Use early returns for guard clauses instead of nested conditions
- Use object parameters for functions with 3+ arguments

### Data & Types

- Use DTOs with class-validator decorators for all request inputs
- Use interfaces for response shapes
- Prefer Prisma-generated types over custom types
- Use `readonly` for immutable data
- Use `as const` for literal constants

## Prisma Best Practices

- Use `select` to limit returned fields and improve performance
- Use `include` for relations to avoid N+1 queries
- Use transactions for multi-step operations that must succeed/fail together
- Use atomic operations for counters (increment/decrement) instead of read-update patterns
- Always check `deletedAt: null` when querying User or Squad (soft deletes)

## Error Handling

- Use NestJS built-in exception types: NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException, ConflictException
- Never throw generic Error instances
- Add context to error messages

## Security

- Hash passwords with bcrypt (minimum 10 rounds)
- Store only hashed tokens (refresh tokens, reset tokens) - never plain text
- Always validate inputs with class-validator DTOs
- Never expose sensitive fields in API responses: passwordHash, tokenVersion, resetToken, emailVerificationOtp
- Use atomic Prisma operations for balance updates to prevent race conditions

## Validation

- Every controller endpoint must use DTO validation
- Use class-validator decorators on all DTO properties
- Never accept `any` type in controller or service method signatures
- Validate enum values, lengths, formats, and business constraints

## Testing

### Unit Tests
- Follow Arrange-Act-Assert pattern
- Mock PrismaService for database operations
- Test business logic in services, not controllers

### E2E Tests
- Use Pactum framework for API testing
- Test complete user workflows end-to-end
- Verify response status codes and body structure

## Common Anti-Patterns to Avoid

- Using `any` type
- Storing plain text tokens or passwords
- Incrementing counters with read-then-update pattern (use atomic operations)
- Skipping DTO validation
- Exposing sensitive fields in API responses
- Not checking soft delete status (deletedAt)
- Creating N+1 query problems (use include/select properly)


