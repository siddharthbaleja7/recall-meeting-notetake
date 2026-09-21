# MVP scope — priority order

Build P0 completely, end to end, before starting P1. If the clock runs out mid-P1,
that's the right place to stop — an unfinished P2 item is a worse outcome than a
polished P0+P1.

## P0 — must exist, must be good
1. **Meetings list** — seeded, at least 5 meetings, one of which is an 8-person call
   running ~60 minutes. List shows title, date, duration, participant count/type.
2. **Meeting detail — Summary tab** — AI-style overview paragraph + checkable action
   items with an assignee.
3. **Meeting detail — Transcript tab** — timestamped, speaker-labeled, scrollable.
   Must stay usable and legible on the long 8-person meeting, not just the short ones
   — that's the actual test case, per the brief.
4. **Highlight a moment** — mark any transcript line as a highlight; it should be
   visually distinct and surfaceable (e.g. a highlights count on the tab, or a
   filtered "jump to highlights" view).
5. **Search** — across meeting titles and transcript content, live-filtering the list.

## P1 — build if P0 is solid and there's time left
6. **Share view** — a route that renders a single meeting's summary + transcript with
   no auth required, for someone who wasn't on the call. This is the single highest-
   value P1 item — it's explicitly called out in the brief's walkthrough checklist.
7. **Summary templates** — let the user switch the AI summary's format (e.g. "Sales
   call" vs "Standup" vs "General") and see the same transcript re-summarized
   differently. Can be static per-template text if a real LLM call isn't wired up.
8. **Calendar connect screen** — a plausible-looking OAuth-style connect flow that
   ends in a stubbed "connected" state. Must be visually honest that it's not real
   auth if inspected — comment it clearly in code.

## P2 — explicitly out of scope, say so in the walkthrough
- A real recording bot joining Zoom/Meet/Teams
- Real-time transcription during a live call
- CRM/Slack/Asana push integrations
- AI Scorecards / call coaching
- Multi-user workspaces, roles, permissions
- Clip export as an actual video file (a shareable link/view is enough)

## The edge case that actually matters
The brief specifically flags "what happens on an eight-person call that runs an hour."
Concretely, that means: transcript rendering shouldn't jank or become unreadable with
~150+ lines and 8 distinct speakers, speaker attribution needs to stay visually
scannable (not just a name repeated in plain text every line), and the summary for
that meeting should read like it actually digested an hour of cross-talk, not like a
3-line summary reused from a 15-minute 1:1. Seed that meeting's transcript with real
length and multiple speakers talking over different topics, not a token 5-line stub.
