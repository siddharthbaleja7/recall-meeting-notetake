# Agent instructions — Recall (Fathom clone)

You are building a 24-hour take-home clone of fathom.video for a software engineer
assignment. Read this whole file before writing code. Read `docs/MVP.md`,
`docs/DESIGN.md`, and `docs/DATA-MODEL.md` next — in that order.

## 0. Capture logging — verify before anything else

**This repo must be a git repository before hooks will fire or anything can be
committed.** If `git status` fails, run `git init` first.

`.github/hooks/capture-hooks.json` wires GitHub Copilot's real `sessionStart`,
`userPromptSubmitted`, and `agentStop` hooks to `.github/hooks/session-start.sh` and
`.github/hooks/capture.py`, which together should append every prompt/response pair
to `.agent-logs/` automatically, per turn.

Before writing any product code:
1. Send a canary prompt: `CAPTURE TEST — 8x assignment, <name>`.
2. Confirm it landed in `.agent-logs/` — both the prompt and your response, as
   separate PROMPT/RESPONSE entries.
3. Start a second session and repeat, to confirm the hook fires session-independently.
4. Write `CAPTURE-TEST.md` at repo root documenting tool, model, the hook files, the
   log path, both raw canary entries, and anything that didn't work first try.

`capture.py` is a best-effort implementation against GitHub's documented hook
contract — the exact JSON field names Copilot sends per event weren't fully
published where I could check, so the script tries several plausible keys
(`prompt`, `text`, `content`, `message`, etc.) and falls back to dumping the raw
JSON payload into the log if none match. **If you see a raw-JSON fallback entry
during the canary test**, open it, find the real field name Copilot used, and add
it to `CANDIDATE_KEYS` in `capture.py` — then rerun the canary until it captures
clean text. Don't fall back to logging by hand once it's fixed. Commit
`.agent-logs/` as you go, not in one dump at the end; do not gitignore it.

## 1. Do the real product research first

Before writing product code, actually use fathom.video: sign up free, connect a
calendar, run a real ~2 minute Zoom/Meet/Teams call with yourself, and go through
every flow end to end — playback vs transcript, AI summary, template switching,
action items, highlighting mid-call, search across meetings, sharing a clip with
someone not on the call. Screenshot as you go into `/recon`. You do not have to make
the recording bot itself work — stubbing capture is explicitly fine, but say so in the
walkthrough and spend the saved time elsewhere (per the brief).

Update `docs/MVP.md` and `docs/DESIGN.md` with anything you learn that contradicts or
sharpens what's written there — they're a starting hypothesis, not gospel.

## 2. Stack

- Next.js (App Router) + TypeScript + Tailwind.
- No real database needed for the MVP — seed data as a typed in-memory/JSON module is
  fine and faster to ship; if time allows, upgrade to SQLite via Prisma.
- Deploy target: Vercel. The live link must open for someone not signed in as you —
  don't gate the app behind auth unless you also ship a working signup.
- If you wire a real LLM call for summaries (optional, P1), use the Anthropic API;
  never hardcode a key into client code.

## 3. Build order

Follow `docs/MVP.md`'s P0 list top to bottom before touching anything in P1. Working
end-to-end beats partially-built breadth — a judge scoring "speed" and "what you left
out" wants to see finished slices, not five half-features.

## 4. Non-negotiables

- Seed real, plausible data: at minimum 5 meetings, including one 8-person, ~60-minute
  meeting (the brief calls this out specifically — test that the UI actually holds up
  with a long, many-speaker transcript, not just short 3-person calls).
- Responsive down to mobile. Visible keyboard focus. Reduced-motion respected.
- Say what's stubbed, in-code (a comment) and in the walkthrough — don't let a fake
  calendar-connect flow read as if it actually authenticates.
- The repo is public. `.agent-logs/` ships with it, uncommitted-nothing.

## 5. What NOT to build

CRM/Slack/Asana integrations, AI Scorecards/coaching, multi-user team permissions,
a real recording bot. All explicitly out of scope — see `docs/MVP.md` P2.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
