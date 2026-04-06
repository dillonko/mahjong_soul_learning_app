# Frontend Test Suite

## Overview

Comprehensive test suite for the Mahjong Soul Academy frontend using **Vitest** (unit/integration) and **Playwright** (E2E).

## Running Tests

```bash
# Unit + Integration tests
bun run test              # Run once
bun run test:watch        # Watch mode
bun run test:unit         # Unit tests only
bun run test:integration  # Integration tests only
bun run test:coverage     # With coverage report

# E2E tests (requires running backend + frontend servers)
bun run test:e2e          # Headless
bun run test:e2e:headed   # With browser visible
```

## Configuration

- **Vitest**: `vitest.config.ts` - Uses happy-dom environment, path aliases
- **Playwright**: `playwright.config.ts` - Chromium, auto-starts servers

## Coverage Targets

- **Unit tests**: >80% on stores and composables
- **Integration tests**: Component interaction flows
- **E2E tests**: Full user journeys
- **Overall target**: >70% code coverage
