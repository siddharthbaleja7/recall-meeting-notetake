# Recall

An AI meeting notetaker, rebuilt from [fathom.video](https://fathom.video) as
a reference rather than a blueprint — own layout, own visual design, own
product decisions about what to keep, cut, or change. Next.js (App Router),
TypeScript, and Tailwind, backed by a real Postgres database (Neon) via
Prisma — no mock or hardcoded data.

Design direction, data model, and scope are documented in `docs/DESIGN.md`,
`docs/DATA-MODEL.md`, and `docs/MVP.md`. Product research against the real
product lives in `RECON.md` and `/recon`.

## What's built

**P0**
- Meetings feed — a single-column, chronological list grouped by day (no
  sidebar), seeded with 5 real meetings including an 8-person, ~61-minute
  meeting with a topic-anchored 100-line transcript. Cards expand in place on
  click — summary, action items, transcript, and highlighting all render
  inline, no separate detail route.
- Summary — AI-style overview paragraph + checkable action items, each with
  an assignee and a clickable timestamp that jumps the transcript to that
  line.
- Transcript — timestamped, speaker-labeled, with a distinct colored avatar
  per speaker so the 8-person transcript stays scannable.
- Highlight a moment — star any transcript line; a "Highlights (n)" filter
  narrows the transcript to just the starred lines. Reads/writes through the
  real API, persists across a reload.
- Search — a Cmd+K / `/` command-palette overlay, matching meeting titles and
  transcript content (with a quoted excerpt showing why it matched).

**P1**
- Share view (`/share/[id]`) — renders a single meeting's summary + transcript
  with no authentication, for someone who wasn't on the call.
- Summary templates — switch the AI summary's format (General / Sales call /
  Standup) from the expanded card.
- "Ask about this meeting" — a per-meeting input inside the expanded card.
  Stubbed (see below), not a persistent docked AI panel.
- Calendar-connect — a stubbed, OAuth-styled connect flow (provider choice →
  capture-mode choice → connected state). Not real: see "What's stubbed"
  below.

**P2 — explicitly out of scope**
A real recording bot, real-time live transcription, CRM/Slack/Asana
integrations, AI Scorecards/coaching, multi-user permissions, and clip export
as an actual video file are all out of scope for this MVP, per the brief.

## Backend

Real Postgres (hosted on [Neon](https://neon.tech)) via Prisma:
- `prisma/schema.prisma` — `Meeting` → many `TranscriptLine` / `ActionItem`.
- `prisma/seed.ts` — seeds the 5 meetings described above.
- API routes: `GET /api/meetings`, `GET /api/meetings/[id]`,
  `PATCH /api/meetings/[id]/transcript/[lineId]` (highlight toggle),
  `PATCH /api/meetings/[id]/action-items/[itemId]` (done toggle).

The frontend fetches everything through these routes — nothing imports the
old static seed module directly (`lib/seed-data.ts` still exports the shared
TypeScript types and is what `prisma/seed.ts` seeds from, but the app no
longer reads meeting data from it at runtime).

## What's stubbed

- **"Ask about this meeting"** is a keyword-overlap search over that
  meeting's own transcript, not a real model call — it says so in its own
  output rather than pretending to converse. See the comment above
  `answerAboutMeeting` in `app/page.tsx` for what a real version would wire
  up (the Anthropic API, scoped to that meeting's transcript).
- **Calendar-connect is not real OAuth.** Clicking a provider does not contact
  Google or Microsoft; it only advances local component state. Clearly
  commented as a stub in `app/calendar/page.tsx`.
- **No real recording/capture pipeline.** The calendar-connect flow lets you
  choose a capture mode (Audio & video / Audio only / Transcript only / Off),
  but nothing actually records — there is no live call, no bot, no recording
  pipeline behind it.
- **Summary templates are static text variations**, not a live LLM call.

## Running locally

Requires Node 20+ and a Postgres database (this project uses Neon, but any
Postgres connection string works).

1. Create `.env` at the repo root:
   ```
   DATABASE_URL="postgresql://<user>:<password>@<pooled-host>/<database>?sslmode=require"
   DIRECT_URL="postgresql://<user>:<password>@<direct-host>/<database>?sslmode=require"
   ```
   (On Neon: `DATABASE_URL` is the **pooled** connection string, `DIRECT_URL`
   is the **direct** one — Prisma uses the direct connection for migrations.)

2. Install, migrate, seed:
   ```bash
   npm install
   npx prisma migrate deploy
   npm run db:seed
   ```

3. Run it:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The meetings feed is the
home page — no login required, no signup flow (this MVP intentionally does
not gate the app behind auth).

Other routes:
- `/share/<meeting-id>` — e.g. `/share/weekly-ops`, no auth required
- `/calendar` — the calendar-connect stub

Useful checks:
```bash
npm run lint       # ESLint
npx tsc --noEmit   # type-check
npm run build      # production build
```

## Deployment

Auto-deploys to Vercel on every push to `main`. `DATABASE_URL` and
`DIRECT_URL` must also be set in the Vercel project's environment variables
(separately from local `.env`) for the deployed API routes to reach the
database. `package.json` has a `postinstall: prisma generate` step so the
Prisma client is generated on Vercel's build, not just locally.

## Capture logging

This repo's `.agent-logs/` records the raw prompt/response history of the AI
coding sessions that built it, per the assignment's transparency requirement.
See `CAPTURE-TEST.md` for how the capture hook is wired up.
