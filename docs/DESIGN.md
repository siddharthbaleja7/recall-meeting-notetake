# Design direction (frontend redesign)

This replaces the original two-pane sidebar direction below. The subject,
audience, and job are unchanged — see "Confirmed real-product details"
further down, still true — but the layout, interaction model, and palette
are a genuine redesign, not a re-skin: no sidebar, no persistent docked
panel, no separate detail route, one accent color instead of two.

## Layout — single-column chronological feed
No sidebar. Meetings render as a single vertical feed, grouped by day
("Friday, September 20"), most recent day first. Each meeting is a
collapsed card: type, title, time · duration · participant count, and — if
it has open action items — an accent-colored "N open" badge, the one
"needs attention" signal on the page.

Clicking a card expands it **in place**. There is no separate detail
route — summary, action items, transcript, and highlighting all render
inline inside the expanded card, stacked in that order, so nothing
requires a navigation. Only one card is expanded at a time (an accordion,
not a stack of always-open panels), which keeps the feed scannable on a
100+ line transcript.

    +----------------------------------------------------+
    | Recall                    [ ⌕ Search meetings ⌘K ]  |
    |------------------------------------------------------|
    | TODAY                                                |
    | [Sales] Meeting title           10:00 · 46m · 4 people ▸ |
    |                                                       |
    | YESTERDAY                                            |
    | [Internal] Weekly operating review  9:00 · 61m · 8 people  2 open ▾ |
    |   AI SUMMARY                              Format [General ▾] |
    |   overview paragraph...                              |
    |   Action items                                       |
    |   [ ] task — assignee  @18:45                        |
    |   Transcript                          [Highlights (2)]|
    |   00:00  Maya Chen   "..."                        ☆   |
    |   ...                                                |
    |   Ask about this meeting                             |
    |   [ type a question___________ ] [Ask]               |
    +----------------------------------------------------+

On mobile this is already the natural shape — no separate mobile layout
needed, just tighter padding and a hidden search-trigger label.

## Search — command overlay, not a docked box
Global search is **Cmd+K** or **"/"**, opening a centered command-palette
overlay (`Esc` or a click outside closes it). It matches meeting titles,
overview text, and transcript content; a transcript match shows the
matching line as an excerpt (speaker, timestamp, quote) so you can tell
*why* a meeting matched before opening it. Choosing a result closes the
overlay, expands that meeting in the feed, and scrolls to it. There is no
persistent search box in the layout — it only exists when summoned.

## Ask about this meeting — contextual, not a docked AI panel
Each expanded card has its own "Ask about this meeting" input, scoped to
that meeting only. This is **not** wired to a real model yet (P1, optional
per `docs/MVP.md`) — it's a keyword-overlap search over that meeting's own
transcript, and its own output says so implicitly by showing you the
matching transcript lines it found rather than pretending to converse.
Same honesty principle as the calendar-connect stub: look purposeful,
never misrepresent what's actually running. A real version would wire
this input to the Anthropic API, scoped to this meeting's transcript.

## Color — monochrome + exactly one accent
Collapsed the old two-color system (teal primary + amber flag) into a
single accent. Everything else is grayscale.

- `--bg` / `--surface` / `--panel` / `--border` — near-black through
  off-white grays (theme-dependent, see below).
- `--ink` — primary text; `--muted` — secondary text, all at reduced
  opacity rather than a separate hex, so light/dark stay proportionate.
- One accent (`--teal`/`--amber` variable names kept for backward
  compatibility with `/share` and `/calendar`, both now resolving to the
  *same* color) — reserved for **things needing attention only**: an open
  action-item count badge, a highlighted transcript line, the star/flag
  icon itself, and the "Ask" submit button. It never appears as decoration
  or as a second "brand" color.
- Dark is the default theme; light inverts the relationships rather than
  just flipping lightness — the accent is deliberately darker/more burnt
  in light mode and lighter/warmer in dark mode so it stays legible
  against both backgrounds (same principle as the old teal, kept from the
  original direction).

Avoid the generic-AI-app tells (still true): no warm cream + terracotta
default, no near-black + neon accent, no identical soft-shadowed cards,
no tracked-out ALL-CAPS eyebrows on everything, no "✨ AI-powered" badges.

## Type
Unchanged: **Fraunces-style serif** (Georgia as the available stand-in) for
the product name and section headings; **Inter-style sans** (Arial as the
available stand-in) for everything else — meeting titles, transcript text,
UI chrome. Line length under ~70 characters for the overview paragraph.

## Motion
Unchanged: one deliberate moment — the background-color fade when a
transcript line's highlight is toggled. No hover-lift, no staggered
fade-up on load. `prefers-reduced-motion` disables all transitions.

## Writing
Unchanged: buttons say what happens ("Copy share link," not "Share").
Empty states are instructions: the command overlay's empty state says
"start typing a title, topic, or something someone said," not "no
results." "AI summary" and "Ask" stay source labels, not sales pitches.

## `/share/[id]` and `/calendar` — intentionally untouched
Both routes keep their original structure exactly as built in the first
frontend phase — only the underlying color tokens changed (to the new
monochrome + one-accent scheme, automatically, since they read the same
CSS variables). `/share/[id]` is still an unauthenticated, two-column
summary+transcript view for someone who wasn't on the call; `/calendar`
is still the explicit three-step, clearly-stubbed connect flow.

## Confirmed real-product details (from `/recon`, still true)
- Action items carry a timestamp back into the call (`@ 4:38`); clicking
  it scrolls the transcript to that line. Kept, now scrolling within the
  expanded card's own transcript section instead of switching a tab.
- A live call's participant grid includes a bot tile labeled `"[Name]'s
  Fathom Bot"` — still worth an illustrative screenshot in an empty/
  "how it works" state if that gets built later.
