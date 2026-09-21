# Recon status

## Confirmed already (from a marketing-site screen recording — see /recon/*.png)
- [x] Calls list has "My Calls" / "Team calls" tabs
- [x] Ask-AI is a persistent docked side panel with an "All calls" scope filter, not
      a separate page
- [x] Action items = checkbox + text + assignee chip + a clickable timestamp back
      into the call
- [x] Live call view shows a bot tile (`"[Name]'s Fathom Bot"`) among participants,
      with Zoom/Meet/Teams icons top-right
- [x] Free tier copy: unlimited recordings, instant AI summaries, AI-generated
      action items, "conversational meeting assistant," highlight playlists

**What this does NOT cover** — the recording only scrolled the public marketing and
pricing pages. None of the logged-in product was shown.

## Confirmed real (hands-on test call — see /recon/newwww1-5.png)
- [x] Signup — real account, real sign-in screen (Google/Microsoft/SSO), not a
      marketing mockup. `newwww5.png`.
- [x] Notetaker joins a real call — a real "Test call" (4 min) landed in the
      meetings list. `newwww4.png`.
- [x] Transcript — real per-line transcript that matches what was actually said on
      the call, with speaker label and timestamp. `newwww1.png`.
- [x] AI summary — correctly identified the call as a system test from context
      ("the participant's explicit mention of 'Fathom'"), not a generic template.
      `newwww3.png` (the enhanced summary; `newwww2.png` is the same page mid-
      generation, "hang tight" state, superseded by `newwww3.png`).
- [x] Action items — showed "No action items detected," which is correct given the
      call had none; confirms the feature runs and behaves correctly on empty
      input rather than being a bug or missing feature. `newwww2.png`/`newwww3.png`.

## Still needs a real, hands-on pass — this has to be you, not the agent
- [ ] Calendar connect
- [ ] Playback vs. transcript — do they scrub in sync?
- [ ] Summary template-switching
- [ ] Highlight a moment mid-call — where does it land afterward?
- [ ] Search across meetings — titles, transcript text, or both?
- [ ] Share a clip with someone who wasn't on the call — do they need an account?
- [ ] Look at (or simulate) a long, multi-person meeting — how does the product
      handle it differently from a short 1:1?

Screenshot each of these into `/recon/` as you go and add notes below.

## Notes
(fill in as you go — anything that should change docs/MVP.md or docs/DESIGN.md)
