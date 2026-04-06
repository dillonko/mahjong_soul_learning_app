# 🀄 Mahjong Soul Academy

A comprehensive learning platform for **Riichi Mahjong (Mahjong Soul)** — from absolute beginner to competent player.

Built with **Bun + TypeScript + Prisma** (backend) and **Nuxt.js 4.x** (frontend).

---

## 📁 Project Structure

```
mahjong_soul_learning_app/
├── backend/              # Bun + TypeScript REST API
│   ├── prisma/           # Database schema & migrations
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/    # CORS, Auth middleware
│   │   ├── utils/        # Helper functions
│   │   ├── index.ts      # Server entry point
│   │   ├── db.ts         # Prisma client
│   │   └── seed.ts       # Database seed data
│   └── package.json
├── frontend/             # Nuxt.js 4.x application
│   ├── app/
│   │   ├── pages/        # Route pages
│   │   ├── layouts/      # App layout
│   │   ├── composables/  # API composable
│   │   ├── stores/       # Pinia stores (auth, progress)
│   │   └── assets/css/   # Global styles
│   ├── nuxt.config.ts
│   └── package.json
├── shared/               # Shared TypeScript types
│   └── types.ts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)

### 1. Install Dependencies

```bash
# Backend
cd backend
bun install

# Frontend
cd ../frontend
bun install
```

### 2. Setup Database

```bash
cd backend

# Generate Prisma client
bunx prisma generate

# Push schema to SQLite database
bunx prisma db push

# Seed with learning content
bun run seed
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend (port 3001)
cd backend
bun run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
bun run dev
```

Open **http://localhost:3000** in your browser.

---

## 📚 Features

### Learning Modules (5 progressive stages)
1. **The Basics** — Tiles, hands, rules, game flow
2. **Yaku Patterns** — Winning hand conditions (1-han to Yakuman)
3. **Tile Efficiency** — Shanten, Ukeire, optimal discards
4. **Defense Tactics** — Safe tiles, Betaori, Suji defense
5. **Advanced Strategy** — Push/fold, placement play, scoring

Each module includes interactive lessons and a quiz.

### Keyword Flashcards
- 25+ essential Mahjong terms
- Browse by category (Tiles, Yaku, Gameplay, Scoring, Strategy)
- Interactive flashcard mode with shuffle

### Strategy Guides
- Beginner: Fast Tanyao speed wins
- Intermediate: Riichi power play, Honitsu fortress
- Advanced: Endgame 4th-place avoidance

### Progress Tracking
- Per-module completion and quiz scores
- Overall progress dashboard
- Restart/reset functionality

### Authentication
- Register with email/password
- Login for returning users
- **Guest mode** — instant access, 72-hour sessions

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/guest` | Create guest session |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/modules` | List all modules |
| GET | `/api/modules/:id` | Get single module |
| GET | `/api/progress` | Get user progress |
| POST | `/api/progress` | Save/update progress |
| DELETE | `/api/progress` | Reset all progress |
| GET | `/api/keywords` | List keywords (?category=) |
| GET | `/api/keywords/random` | Random flashcards |
| GET | `/api/strategies` | List strategies (?difficulty=) |
| GET | `/api/strategies/:id` | Get single strategy |
| GET | `/api/health` | Health check |

---

## 🗄️ Database

**Development:** SQLite (zero config)
**Production:** Change `DATABASE_URL` in `.env` to PostgreSQL and update `provider` in `prisma/schema.prisma`.

### Schema
- **User** — Registered accounts
- **GuestSession** — Temporary guest sessions (auto-expire)
- **Module** — Learning stages with JSON content
- **Progress** — Per-user per-module completion tracking
- **Keyword** — Mahjong terminology dictionary
- **Strategy** — Winning strategy guides

---

## 🛠️ Scripts

### Backend
```bash
bun run dev        # Start dev server with watch
bun run start      # Start production server
bun run seed       # Seed database with content
bunx prisma studio # Open Prisma database viewer
```

### Frontend
```bash
bun run dev        # Start Nuxt dev server
bun run build      # Build for production
bun run preview    # Preview production build
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (`frontend/.env`)
```
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

---

## 📖 Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Backend:** Pure TypeScript, Prisma ORM
- **Frontend:** [Nuxt.js 4.x](https://nuxt.com/docs/getting-started/introduction), Vue 3, Pinia
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Auth:** JWT tokens + bcrypt

---

## License

MIT



---

## 🧪 Testing

The project includes a comprehensive testing suite covering backend and frontend.

### Backend Tests (Bun Test Runner)

```bash
cd backend

# Run all tests
bun test

# Run by category
bun test tests/unit/          # Unit tests (auth utils, response, CORS, middleware)
bun test tests/integration/   # Integration tests (all API endpoints)
bun test tests/e2e/           # E2E workflow tests

# With coverage
bun test --coverage
```

**Test structure:**
- `tests/unit/` — Pure function tests (no DB, no server)
- `tests/integration/` — API endpoint tests with real database
- `tests/e2e/` — Complete user workflow tests
- `tests/test-server.ts` — Shared test server with auto-assigned port
- `tests/helpers.ts` — HTTP request helpers and token generators

### Frontend Tests (Vitest + Playwright)

```bash
cd frontend

# Unit + Integration tests (Vitest)
bun run test              # Run once
bun run test:watch        # Watch mode
bun run test:unit         # Unit tests only
bun run test:integration  # Integration tests only
bun run test:coverage     # With coverage report

# E2E tests (Playwright - requires running servers)
bun run test:e2e          # Headless
bun run test:e2e:headed   # With browser visible
```

**Test structure:**
- `tests/unit/stores/` — Pinia store tests (auth, progress)
- `tests/unit/composables/` — useApi composable tests
- `tests/integration/` — Component interaction tests (module viewer, flashcards, progress)
- `tests/e2e/` — Playwright browser tests (guest flow, user flow, flashcard flow, learning path)

### Root-Level Test Commands

```bash
# From project root
bun run test:backend         # All backend tests
bun run test:frontend        # All frontend tests
bun run test                 # Run both
bun run test:backend:coverage  # Backend coverage
bun run test:frontend:coverage # Frontend coverage
```

### CI/CD

GitHub Actions workflow (`.github/workflows/test.yml`) runs:
1. Backend unit, integration, and E2E tests
2. Frontend unit and integration tests
3. Frontend Playwright E2E tests
4. Coverage reporting
