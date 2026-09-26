# Design direction (frontend redesign)

This replaces the original two-pane sidebar direction below. The subject,
audience, and job are unchanged — see "Confirmed real-product details"
further down, still true — but the layout, interaction model, and palette
are a genuine redesign, not a re-skin: no sidebar, no persistent docked
panel, no separate detail route, one accent color instead of two.

This direction went through several rounds after an early pass read as
generic/AI-templated (bordered card grid with a soft shadow, an uppercase
tracked-out "AI SUMMARY" eyebrow, a `[Sales]`-style bracketed type tag,
dot-separated meta strings, a pill-shaped count badge, a sparkle icon). The
fixes below are deliberate, specific reversals of each of those, not a
different aesthetic — the goal was "looks like a person built this to solve
their own problem," not "looks minimal."

## Layout — single-column chronological feed, table-row structure
No sidebar. Meetings render as a single vertical feed, grouped by day
("Friday, September 20"), most recent day first. Each meeting is a row,
bordered on all four sides (hairline, no radius, no shadow) so the feed
reads as a bordered table rather than a floating card grid or an unbounded
flat list — the row has a title, a plain sentence-style meta line ("Internal
call, 4:30 AM — 46m, 4 people" — no dot separators, no bracketed type tag),
a vertical divider, then the status area: an accent dot + "N open" (plain
text, not a pill) if the meeting has open action items, and a disclosure
caret that points down and rotates 180° when expanded — deliberately not a
rightward chevron, which reads as "go to another page" rather than "reveal
what's below."

Clicking a row expands it **in place**. There is no separate detail
route — summary, action items, transcript, and highlighting all render
inline inside the expanded row, stacked in that order, so nothing requires
a navigation. Only one row is expanded at a time (an accordion, not a stack
of always-open panels), which keeps the feed scannable on a 100+ line
transcript.

    +----------------------------------------------------+
    | Recall                         [ Search  ⌘K ] [📅] [☾] |
    |------------------------------------------------------|
    | Sunday, September 20                                  |
    | +----------------------------------------------------+
    | | Meeting title                              ⏺ 2 open ⌄ |
    | | Internal call, 10:00 AM — 46m, 4 people             |
    | +----------------------------------------------------+
    |                                                       |
    | Friday, September 18                                  |
    | +----------------------------------------------------+
    | | Weekly operating review                    ⏺ 1 open ⌃ |
    | | Internal call, 3:30 AM — 1h 1m, 8 people             |
    | |                                                      |
    | | AI summary                        Format [General ▾] |
    | |   overview paragraph...                              |
    | | Action items                              3 items    |
    | |   [ ] task — assignee  @18:45                        |
    | | Transcript                    100 lines  [Highlights] |
    | |   00:00  MC  Maya Chen   "..."                    ☆   |
    | |   ...                                                |
    | | Ask about this meeting                               |
    | |   [ type a question___________ ] [Ask]               |
    | +----------------------------------------------------+
    +----------------------------------------------------+

On mobile this is already the natural shape — no separate mobile layout
needed, just tighter padding and the row stacking its title/meta/status
vertically instead of side by side.

## Search — command overlay, not a docked box
Global search is **Cmd+K** or **"/"**, opening a centered command-palette
overlay (`Esc` or a click outside closes it). It matches meeting titles,
overview text, and transcript content; a transcript match shows the
matching line as an excerpt (speaker, timestamp, quote) so you can tell
*why* a meeting matched before opening it. Choosing a result closes the
overlay, expands that meeting in the feed, and scrolls to it. There is no
persistent search box in the layout — it only exists when summoned. The
trigger button shows the actual modifier for the visitor's platform
(`⌘K` only after confirming the client is a Mac via `navigator.platform`,
`Ctrl+K` otherwise) rather than hardcoding the Mac glyph, which silently
mangled into an unreadable character on other font stacks.

## Ask about this meeting — contextual, not a docked AI panel
Each expanded row has its own "Ask about this meeting" input, scoped to
that meeting only. This is **not** wired to a real model yet (P1, optional
per `docs/MVP.md`) — it's a keyword-overlap search over that meeting's own
transcript, and its own output says so implicitly by showing you the
matching transcript lines it found rather than pretending to converse.
Same honesty principle as the calendar-connect stub: look purposeful,
never misrepresent what's actually running. A real version would wire
this input to the Anthropic API, scoped to this meeting's transcript.

## Color — monochrome + exactly one accent, used sparingly
Collapsed the old two-color system (teal primary + amber flag) into a
single accent, and pulled back on where it appears at all — it's not on
the search trigger, the theme toggle, the "Ask" button, or the filter
button's active state. It shows up in exactly two places:

- An open-action-item count: a small accent dot + plain accent-colored
  text (`⏺ 2 open`) — not a filled pill/chip.
- A highlighted transcript line: a thin 3px accent-colored **left border**
  (space reserved via a transparent border on every line, so nothing
  shifts when toggled) plus the filled star — not a full-row background
  wash, which read as too heavy for "used sparingly."

Everything else is grayscale:
- `--bg` / `--surface` / `--panel` / `--border` — near-black through
  off-white grays (theme-dependent, see below).
- `--ink` — primary text; `--muted` — secondary text, all at reduced
  opacity rather than a separate hex, so light/dark stay proportionate.
- `--teal`/`--amber` variable names are kept for backward compatibility
  with `/share` and `/calendar`, both now resolving to the *same* color.
- Dark is the default theme; light inverts the relationships rather than
  just flipping lightness — the accent is deliberately darker/more burnt
  in light mode and lighter/warmer in dark mode so it stays legible
  against both backgrounds.

Avoid the generic-AI-app tells: no warm cream + terracotta default, no
near-black + neon accent, no uppercase-tracked eyebrow labels anywhere
(not on the type, not on "AI summary," not on the day heading), no
dot-separated meta strings, no pill/chip badges, no sparkle/"✨ AI-powered"
iconography, no oversized glossy drop shadows. Timestamps and counts use a
monospace font — a small, deliberate typographic choice, not a template
default.

## Type
Unchanged: **Fraunces-style serif** (Georgia as the available stand-in) for
the product name and section headings; **Inter-style sans** (Arial as the
available stand-in) for everything else — meeting titles, transcript text,
UI chrome. Line length under ~70 characters for the overview paragraph.

## Motion
One deliberate moment — the border-color fade when a transcript line's
highlight is toggled. No hover-lift, no staggered fade-up on load.
`prefers-reduced-motion` disables all transitions.

## Writing
Buttons say what happens ("Copy share link," not "Share"). Empty states
are instructions: the command overlay's empty state says "start typing a
title, topic, or something someone said," not "no results." "AI summary"
and "Ask" stay source labels, not sales pitches or decoration.

## `/share/[id]` and `/calendar` — intentionally untouched
Both routes keep their original structure exactly as built in the first
frontend phase — only the underlying color tokens changed (to the new
monochrome + one-accent scheme, automatically, since they read the same
CSS variables). `/share/[id]` is still an unauthenticated, two-column
summary+transcript view for someone who wasn't on the call; `/calendar`
is still the explicit three-step, clearly-stubbed connect flow. The topbar
icons for calendar-link and theme toggle are small inline SVGs, not the
Unicode glyphs (⌁, ☼/☾) from the first pass, which rendered ambiguously
across fonts.

## Confirmed real-product details (from `/recon`, still true)
- Action items carry a timestamp back into the call (`@ 4:38`); clicking
  it scrolls the transcript to that line. Kept, now scrolling within the
  expanded row's own transcript section instead of switching a tab.
- A live call's participant grid includes a bot tile labeled `"[Name]'s
  Fathom Bot"` — still worth an illustrative screenshot in an empty/
  "how it works" state if that gets built later.
