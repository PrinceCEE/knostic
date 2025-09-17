# Knostic

A small full‑stack CSV management tool: upload, view, edit, validate and persist two related CSV datasets (strings & classifications).

## Tech Stack

- Backend: Node.js, Express, TypeScript, Multer, csv-parser, fast-csv, Zod, Pino
- Frontend: React + Vite + TypeScript, Tailwind
- Tests: Vitest + Supertest
- Containerization: Docker & Docker Compose

## Live App

Deployed Frontend: https://knostic-nmjsqu98g-chimezie-edehs-projects.vercel.app/

The deployed app expects its backend API at the configured `VITE_API_URL` baked in at build time. If you redeploy the server under a different domain, rebuild the frontend with the new URL.

## 1. Local Development (no Docker)

### Prerequisites

- Node 20+ (recommend LTS)
- npm (comes with Node)

### Backend (server)

```bash
cd server
npm install
cp .env.example .env  # create if you want custom values (PORT, LOG_LEVEL)
echo 'PORT=3000' > .env
npm run dev
```

Server will start at http://localhost:3000 (API base: `/api`).

### Frontend (app)

In another terminal:

```bash
cd app
npm install
echo 'VITE_API_URL=http://localhost:3000' > .env
npm run dev
```

Visit http://localhost:5173

## 2. Running Tests

Backend tests (service + handler):

```bash
cd server
npm test
```

All tests should pass (Vitest). Add `--coverage` for coverage:

```bash
npm test -- --coverage
```

## 3. Docker / Docker Compose

### Build & Run (recommended)

At the repo root:

```bash
docker compose build
docker compose up -d
```

Services:

- `knostic-server`: http://localhost:3000
- `knostic-app`: http://localhost:5173

### Logs

```bash
docker compose logs -f server
docker compose logs -f app
```

### Stopping & Cleanup

```bash
docker compose down
# remove volumes/network if added later:
docker compose down -v --remove-orphans
```

### Rebuilding after code changes

```bash
docker compose build --no-cache server
docker compose up -d
```

## 4. Environment Variables

Backend (server):

- `PORT` (required; compose sets 3000)
- `LOG_LEVEL` (info|warn|error|debug|trace) default: trace

Frontend (app):

- `VITE_API_URL` (injected at build time)

## 5. Project Structure (abridged)

```
app/                # React frontend
server/             # Express backend
  src/
    config/         # Zod env parsing
    handlers/       # HTTP route handlers
    services/       # CSV service logic
    uploads/        # Stored CSV files
```

## 6. Common Tasks

| Goal               | Command                         |
| ------------------ | ------------------------------- |
| Start backend dev  | `cd server && npm run dev`      |
| Start frontend dev | `cd app && npm run dev`         |
| Run tests          | `cd server && npm test`         |
| Build images       | `docker compose build`          |
| Launch stack       | `docker compose up -d`          |
| Tail server logs   | `docker compose logs -f server` |

## 7. Notes

- Frontend build embeds `VITE_API_URL`; rebuild image if API URL changes.
- CSV validation: strings rows must match a (Topic, SubTopic, Industry) triple from classifications.
- PUT updates replace entire file content after validation.

## 8. Troubleshooting

| Issue                            | Fix                                                |
| -------------------------------- | -------------------------------------------------- |
| Server exits: missing PORT       | Ensure compose env sets `PORT` or add to `.env`    |
| CORS / network errors            | Confirm `VITE_API_URL` matches server origin       |
| Frontend still points to old API | Rebuild app image with updated build arg           |
| Tests fail on path alias         | Ensure `vitest.config.mjs` exists with alias setup |

---

Feel free to open an issue or extend with additional datasets or auth.
