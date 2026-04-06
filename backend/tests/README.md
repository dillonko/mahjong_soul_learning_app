# Backend Test Suite

## Overview

Comprehensive test suite for the Mahjong Soul Academy backend API using **Bun's built-in test runner** (`bun:test`).

## Test Structure

```
tests/
├── setup.ts              # Test database config, helpers, seed data
├── helpers.ts            # HTTP request helpers, token generators
├── unit/                 # Unit tests (no DB, no server)
│   ├── auth-utils.test.ts       # JWT, bcrypt, session token utils
│   ├── response-utils.test.ts   # API response formatting
│   ├── cors-middleware.test.ts   # CORS header handling
│   └── auth-middleware.test.ts   # Auth middleware (token extraction)
├── integration/          # Integration tests (real DB + server)
│   ├── auth-routes.test.ts      # Register, login, guest, /me
│   ├── modules-routes.test.ts   # CRUD modules
│   ├── keywords-routes.test.ts  # Keywords, filtering, random
│   ├── strategies-routes.test.ts# Strategies, difficulty filter
│   └── progress-routes.test.ts  # Progress CRUD, auth required
└── e2e/                  # End-to-end workflow tests
    └── user-workflows.test.ts   # Complete user journeys
```

## Running Tests

```bash
# Run all tests
bun test

# Run by category
bun test tests/unit/
bun test tests/integration/
bun test tests/e2e/

# Run with coverage
bun test --coverage

# Setup test database first (for integration/e2e)
DATABASE_URL=file:./test.db bunx prisma db push --force-reset --skip-generate
```

## Test Database

Tests use a separate SQLite database (`test.db`) to avoid affecting development data. The setup file (`setup.ts`) configures:
- `DATABASE_URL=file:./test.db`
- `JWT_SECRET=test-secret-key-for-testing`
- `PORT=3099` (to avoid conflicts with dev server)

## Coverage Targets

- **Unit tests**: >90% coverage on utilities and middleware
- **Integration tests**: All API endpoints with positive + negative cases
- **E2E tests**: Complete user workflows (register → learn → progress)
- **Overall target**: >80% code coverage
