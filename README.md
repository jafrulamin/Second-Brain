# Second Brain (Local-First • Day 1)

**Purpose**  
Personal AI-powered knowledge base. Start local, keep the stack minimal, deploy later.

**Day 1 Goals**
- Repo skeleton only (no app code yet)
- Env files in place
- SQLite via Prisma planned
- Healthcheck route placeholder created

## Local Setup (coming Day 1.5 / Day 2)
- Install Node.js LTS
- Run `npx create-next-app@latest` inside this folder (details to be added)
- Add Prisma + SQLite, run first migration
- Implement a real `/api/health` and verify at `http://localhost:3000/api/health`

## Structure
- `/app` — Next.js App Router area
- `/app/api` — server routes (same project, local-first)
- `/data` — SQLite database file (git-ignored)
- `/uploads` — local file uploads (git-ignored)
- `/prisma` — Prisma schema & migrations

## Environment
- Copy `.env.example` to `.env.local` and fill in values locally.
- Never commit secrets.

## Next Steps
- Day 1.5: scaffold Next.js via create-next-app
- Day 2: implement local PDF upload and DB row insert
- Day 3: text extraction + embeddings
- Day 4: ask → answer pipeline
- Day 5: polish + optional deploy

