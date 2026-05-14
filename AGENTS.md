## Cursor Cloud specific instructions

### Repository overview

**InventarioPYME** is an inventory management web app for small businesses. It has two services:

| Service | Directory | Port | Command |
|---------|-----------|------|---------|
| Backend (Express + TypeScript) | `backend/` | 3001 | `npm run dev` |
| Frontend (React + Vite + Tailwind) | `frontend/` | 5173 | `npm run dev` |

### Running the application

Both services must be running. The frontend proxies `/api` requests to the backend (configured in `vite.config.ts`).

```
cd backend && npm run dev   # starts API on :3001
cd frontend && npm run dev  # starts UI on :5173
```

### Database

- Uses **SQLite** via Prisma ORM (`backend/prisma/dev.db`), no external DB required.
- After fresh install: `cd backend && npx prisma migrate dev` to create/update the DB.
- Seed demo data: `cd backend && npx tsx src/seed.ts` (creates demo company + 5 products + 3 users).
- Login credentials after seeding: `admin@inventariopyme.com` / `password123`.

### Lint and tests

- Backend lint: `cd backend && npm run lint`
- Frontend lint: `cd frontend && npm run lint`
- Backend tests: `cd backend && npm test` (Jest, currently `--passWithNoTests`)
- TypeScript check: `cd backend && npx tsc --noEmit` and `cd frontend && npx tsc -b`

### Key architectural notes

- JWT auth with bcrypt password hashing. Token passed as `Authorization: Bearer <token>`.
- Inventory movements update product stock atomically via Prisma transactions.
- Low-stock alerts are created when an exit movement drops stock below the configured `minStock`. Alerts auto-resolve when stock is replenished above the minimum.
- The `.env` file in `backend/` contains `DATABASE_URL` and `JWT_SECRET` for local development.
