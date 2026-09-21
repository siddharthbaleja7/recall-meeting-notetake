# Recall

A 24-hour take-home clone of [fathom.video](https://fathom.video) — an AI meeting
notetaker. Built with Next.js (App Router), TypeScript, and Tailwind, with seeded
in-memory data instead of a real database.

Design direction, data model, and scope are documented in `docs/DESIGN.md`,
`docs/DATA-MODEL.md`, and `docs/MVP.md`. Product research against the real
product lives in `RECON.md` and `/recon`.

## What's built

**P0**
- Meetings list — 5 seeded meetings, including an 8-person, ~61-minute meeting
  with a real, topic-anchored 100-line transcript (not filler).
- Summary tab — AI-style overview paragraph + checkable action items, each with
  an assignee and a clickable timestamp back into the transcript.
- Transcript tab — timestamped, speaker-labeled, with a distinct colored avatar
  per speaker so an 8-person transcript stays scannable.
- Highlight a moment — star any transcript line; a "Highlights (n)" toggle
  filters the transcript to just the starred lines.
- Search — live-filters the meetings list across both titles and transcript
  text.

**P1**
- Share view (`/share/[id]`) — renders a single meeting's summary + transcript
  with no authentication, for someone who wasn't on the call.
- Summary templates — switch the AI summary's format (General / Sales call /
  Standup) from the Summary tab.
- Calendar-connect — a stubbed, OAuth-styled connect flow (provider choice →
  capture-mode choice → connected state). Not real: see "What's stubbed" below.

**P2 — explicitly out of scope**
A real recording bot, real-time live transcription, CRM/Slack/Asana
integrations, AI Scorecards/coaching, multi-user permissions, and clip export
as an actual video file are all out of scope for this MVP, per the brief.

## What's stubbed

- **No real backend.** All meeting data is seeded, typed, in-memory data in
  `lib/seed-data.ts` — no database.
- **Calendar-connect is not real OAuth.** Clicking a provider does not contact
  Google or Microsoft; it only advances local component state. Clearly
  commented as a stub in `app/calendar/page.tsx`.
- **No real recording/capture pipeline.** The calendar-connect flow lets you
  choose a capture mode (Audio & video / Audio only / Transcript only / Off),
  but nothing actually records — there is no live call, no bot, no recording
  pipeline behind it.
- **Summary templates are static text variations**, not a live LLM call.

## Running locally

Requires Node 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The meetings list is the
home page — no login required, no signup flow (this MVP intentionally does not
gate the app behind auth).

Other routes:
- `/share/<meeting-id>` — e.g. `/share/weekly-ops`, no auth required
- `/calendar` — the calendar-connect stub

Useful checks:
```bash
npm run lint       # ESLint
npx tsc --noEmit   # type-check
npm run build      # production build
```

## Capture logging

This repo's `.agent-logs/` records the raw prompt/response history of the AI
coding sessions that built it, per the assignment's transparency requirement.
See `CAPTURE-TEST.md` for how the capture hook is wired up.
