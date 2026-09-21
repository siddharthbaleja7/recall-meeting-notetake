# Design direction

## Subject, audience, job
Subject: an AI meeting notetaker. Audience: people in back-to-back calls all day —
sales, CS, product, ops — who need to trust the record more than they trust their own
memory of the call. Primary job of the UI: let someone find and trust a specific
thing that was said, fast, without re-watching an hour of video.

Design principle: **calm authority.** This is a tool you check between meetings, often
on a small screen, half-attention. It should feel like a well-kept ledger, not a flashy
AI demo. Confidence comes from restraint and legibility, not from AI-chrome (glowing
gradients, sparkle icons, "✨ AI-powered" badges everywhere).

## Avoid the generic-AI-app tells
Explicitly avoid: warm cream + terracotta (#D97757-adjacent) as the "AI product"
default; near-black + neon-green/vermilion accent; identical rounded SaaS cards with
the same soft grey shadow on everything; tracked-out ALL-CAPS eyebrow labels above
every heading; middle-dot-joined meta strings as a crutch; a monospace face for every
small data label; a "→" tacked onto every button/link.

## Color
- `--bg` #FAFAF8 (soft paper, not stark white)
- `--surface` #F1EFE8 (card/panel fill)
- `--border` #DDD8CD
- `--ink` #14171C / `--ink-soft` #5B5F66
- `--accent` #0F5C57 (deep teal — primary actions, active states, links)
- `--accent-soft` #DCEAE8 (active-item background)
- `--flag` #C9832B (amber — used *only* for highlighted transcript moments, so it
  stays meaningful and never competes with the teal accent)
- `--flag-soft` #F7E6CE

Dark mode: same relationships, inverted — don't just invert lightness on the accent,
keep the teal legible against a near-black `#14171A` background (lighten it, don't
just reuse the light-mode hex).

## Type
Two families, clearly distinct roles:
- **Fraunces** (serif, optical sizing) for the product name and page/section headings
  — this is the one place personality shows.
- **Inter** for everything else — meeting titles, transcript text, UI chrome, action
  items. This is dense, data-heavy content; it needs a workhorse sans, not character.

Line length under 80 characters for summary/body text. No all-caps labels; the one
small-caps-style label allowed is the literal "AI SUMMARY" tag, and only because it's
functioning as a content-source indicator, not decoration.

## Layout
Two-pane, fixed sidebar + scrolling detail — the email-client / Superhuman shape
(genuinely appropriate here: Fathom is now part of Superhuman). Left-aligned
throughout; this is a working tool, not a marketing page, so nothing should be
center-aligned or hero-styled.

    +----------------+----------------------------------+
    | Recall         | Meeting title                     |
    | [search]       | date · duration · people           |
    |----------------| [Summary] [Transcript]            |
    | > meeting A    |----------------------------------|
    |   meeting B    | AI SUMMARY                         |
    |   meeting C    | overview paragraph...              |
    |   ...          |                                    |
    |                | Action items                       |
    |                | [ ] task — assignee                |
    +----------------+----------------------------------+

On mobile, the sidebar becomes a full-screen list that pushes to a detail view (not a
cramped two-column layout at 375px).

## Confirmed real-product details (from /recon)
- Action items are more than a checklist: each carries a **timestamp back into the
  call** (e.g. `@ 4:38`) alongside the assignee. Make the timestamp clickable — it
  should jump the transcript view to that line. This is a small, cheap, high-value
  detail worth keeping.
- The "Ask [product]" AI feature is a **persistent docked side panel**, not a
  separate page — it has a scope dropdown (e.g. "All calls" vs one call) and stays
  visible while browsing. If you build P1's AI-chat-over-meetings feature, dock it
  the same way rather than routing it to its own screen.
- A live call's participant grid includes a bot tile labeled `"[Name]'s Fathom Bot"`
  sitting among the human participants — worth one static illustrative screenshot
  somewhere (e.g. an empty/"how it works" state) even though live capture itself is
  stubbed.

## Motion
One deliberate moment only: the transition when a highlight is toggled on a transcript
line (a quick background-color fade-in, not a bounce or slide). No hover-lift on every
list item, no staggered fade-up on page load — those are the generic tells.

## Writing
Buttons say what happens: "Copy share link," not "Share." Empty states are
instructions, not mood: an empty search result says what to try next, not just "no
results." The AI summary tag is a source label, not a sales pitch — no exclamation
points, no "your AI assistant has generated..." framing.
