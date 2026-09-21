export type MeetingType = "Sales" | "Internal" | "1:1" | "Customer Success";

export type ActionItem = {
  id: string;
  text: string;
  assignee: string;
  done: boolean;
  timestamp?: string;
};

export type TranscriptLine = {
  id: string;
  timestamp: string;
  speaker: string;
  text: string;
  highlighted: boolean;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  durationMin: number;
  type: MeetingType;
  participants: string[];
  overview: string;
  actionItems: ActionItem[];
  transcript: TranscriptLine[];
};

const speakers = ["Maya Chen", "Jon Bell", "Priya Shah", "Owen Brooks", "Nia Cole", "Sam Rivera", "Elena Park", "Theo Martin"];

// Authored, topic-anchored so the transcript actually matches this meeting's
// action items instead of generic recycled phrasing — see AGENTS.md's "edge
// case that actually matters." Each tuple is [speaker, text]; a highlight
// flag marks the handful of moments worth surfacing. Timestamps are assigned
// below from a per-segment time budget so the pacing stays realistic without
// hand-computing 140 timestamps.
const weeklyOpsSegments: Array<{ endMin: number; lines: Array<[string, string, boolean?]> }> = [
  {
    endMin: 3,
    lines: [
      ["Maya Chen", "Let's keep this tight — launch forecast, support volume, the infra work, then the customer list. Same order as the doc."],
      ["Jon Bell", "Works for me. I've only got the launch numbers ready, everything else I'm hearing live."],
      ["Maya Chen", "That's fine, that's what this meeting is for."],
      ["Owen Brooks", "Quick flag before we start — I've got a scope concern for later, not urgent enough to jump the queue."],
      ["Maya Chen", "Noted, we'll get to it after the customer list."],
    ],
  },
  {
    endMin: 15,
    lines: [
      ["Jon Bell", "Forecast first. We're tracking three days ahead of the beta cohort schedule, which is the good news."],
      ["Priya Shah", "The bad news being?"],
      ["Jon Bell", "The onboarding copy Priya shipped fixed the confusion, but activation is still soft in the first session."],
      ["Priya Shah", "Soft how much?"],
      ["Jon Bell", "About eleven points below where we modeled it. Not alarming, but I don't want to wave it off either."],
      ["Owen Brooks", "Is that a product problem or a support problem? Those get different fixes."],
      ["Jon Bell", "Leaning product. People finish the invite flow but don't come back for the second session unprompted."],
      ["Maya Chen", "Do we know why? Guessing isn't a plan."],
      ["Jon Bell", "Session replays show most of them just close the tab after the summary loads. No confusion, no error — they just don't come back."],
      ["Priya Shah", "That reads like nobody told them there's a reason to come back."],
      ["Maya Chen", "So the launch timeline holds, but we add a nudge before day two."],
      ["Priya Shah", "I can draft that this week — an email, not an in-app thing, so it doesn't compete with the empty state work."],
      ["Jon Bell", "Agreed. If that moves activation even a few points, the forecast is comfortably on track."],
      ["Owen Brooks", "And if it doesn't?"],
      ["Jon Bell", "Then we look at the invite flow itself, but let's not solve a problem we don't have yet."],
      ["Maya Chen", "Good. Priya, day-two nudge is yours — no new date, just get it in front of the beta cohort."],
      ["Priya Shah", "Understood."],
      ["Owen Brooks", "One more thing on forecast — are we still comfortable with the cohort size, or does the nudge change that math?"],
      ["Jon Bell", "Cohort size stays. The nudge is about retention within it, not how many we let in."],
      ["Owen Brooks", "Good, that's what I needed to hear."],
      ["Jon Bell", "I'll send the full forecast doc after this so nobody has to take my summary on faith."],
    ],
  },
  {
    endMin: 20,
    lines: [
      ["Theo Martin", "Moving to infra — the release train has been fine, but our on-call load doubled last week."],
      ["Sam Rivera", "Same shape we're seeing on the support side, for what it's worth."],
      ["Theo Martin", "Right, and most of it traces back to the same handful of deploys not having a rollback checklist."],
      ["Maya Chen", "So this is process, not headcount."],
      ["Theo Martin", "Mostly process. I want one page: pre-deploy checks, rollback steps, who to page. Right now that lives in three people's heads."],
      ["Elena Park", "Mine being one of them, for the record."],
      ["Theo Martin", "Yours and mine, which is exactly the problem — if either of us is out, nobody else can run the rollback."],
      ["Owen Brooks", "Can you have that by the next release?"],
      ["Theo Martin", "Yes — I'll publish the reliability checklist for the next release cycle so it's not tribal knowledge anymore."],
      ["Maya Chen", "Good, take that as the action item — reliability checklist, next release, on you.", true],
      ["Theo Martin", "On it."],
      ["Sam Rivera", "If it ships in time, flag me — I'd like to link it from our internal runbook too."],
    ],
  },
  {
    endMin: 30,
    lines: [
      ["Sam Rivera", "Support volume is up about eighteen percent week over week, mostly billing and export questions."],
      ["Elena Park", "Export is the Atlas thread I've been in — they want highlights included, not just the transcript."],
      ["Sam Rivera", "We're seeing that from two other accounts too. It's becoming a pattern, not a one-off ask."],
      ["Nia Cole", "How many tickets are we talking, roughly?"],
      ["Sam Rivera", "Forty-some this week directly, plus the billing confusion is closer to sixty."],
      ["Owen Brooks", "Sixty on billing alone is a lot for one week. Is that seasonal or new?"],
      ["Sam Rivera", "New. It lines up with the invoice format change two weeks ago."],
      ["Elena Park", "Billing I can take off your plate — most of it is the same proration question."],
      ["Sam Rivera", "That would help a lot. I'll keep tracking export separately since it's a product ask, not a support fix."],
      ["Maya Chen", "Noted — that folds into the customer list next, since it's the same shape of problem."],
    ],
  },
  {
    endMin: 42,
    lines: [
      ["Nia Cole", "On the customer side, I pulled the top signals from this week's calls and support threads."],
      ["Nia Cole", "Top one, by a wide margin, is the export gap Elena and Sam just described — highlights not carrying over."],
      ["Owen Brooks", "Second?"],
      ["Nia Cole", "Search. Two accounts specifically said they can't tell if search covers the transcript or just titles."],
      ["Priya Shah", "That's a documentation problem as much as a product one — it does cover both."],
      ["Nia Cole", "Maybe, but if two accounts asked this week, it's worth being explicit in the UI, not just the docs."],
      ["Elena Park", "Agreed. If a customer has to ask, the feature is invisible either way."],
      ["Maya Chen", "Fair. Third signal?"],
      ["Nia Cole", "Meeting length. The eight-person, hour-long calls are where people say the summary feels thin relative to how much was actually said."],
      ["Jon Bell", "That one's a little close to home."],
      ["Nia Cole", "It's the pattern, not a jab. Short calls get a summary that matches. Long calls with real cross-talk don't yet."],
      ["Theo Martin", "Is that a model problem or a product decision?"],
      ["Nia Cole", "Bit of both, but it's real enough that I want it on the list, not just anecdotal."],
      ["Sam Rivera", "For what it's worth, this exact meeting is a decent test case."],
      ["Maya Chen", "Noted, and slightly uncomfortable."],
      ["Maya Chen", "Agreed, put it on. So: export-with-highlights, search clarity, and long-call summary depth — in that order."],
      ["Nia Cole", "I'll bring exactly those three to Friday review with the account context attached.", true],
      ["Owen Brooks", "That's a good, narrow list. I'd rather we nail three than spread across ten."],
    ],
  },
  {
    endMin: 50,
    lines: [
      ["Owen Brooks", "Which is a good segue — I want to push back gently on scope for next two weeks."],
      ["Maya Chen", "Go ahead."],
      ["Owen Brooks", "Theo's reliability work and Nia's three issues both want engineering time. I don't think we have room for the reporting rebuild too."],
      ["Theo Martin", "I'd rather have the checklist land clean than split my week."],
      ["Sam Rivera", "Support would rather see the export fix than a prettier dashboard, honestly."],
      ["Priya Shah", "I'll push back a little — the reporting gaps are why I keep pulling numbers by hand for the launch update."],
      ["Owen Brooks", "That's fair, but it's a two-week ask, not a two-day one. Something has to move."],
      ["Priya Shah", "I'm not arguing to keep it, just don't want it forgotten because it's inconvenient this cycle."],
      ["Owen Brooks", "That's my read too. I think reporting improvements wait."],
      ["Maya Chen", "Anyone want to argue for keeping reporting in this cycle?"],
      ["Jon Bell", "Not from me — the forecast work already leans on the current reports fine."],
      ["Maya Chen", "Then it's settled: reliability and the top three customer issues are the two-week focus. Reporting is explicitly deferred, not dropped."],
    ],
  },
  {
    endMin: 55,
    lines: [
      ["Owen Brooks", "I'll write that up properly — what's deferred, why, and when we'll revisit it, so October doesn't start from scratch."],
      ["Priya Shah", "Appreciated — that's really all I wanted, a paper trail."],
      ["Maya Chen", "Good, document the reporting follow-ups for October so we're not relitigating this in three weeks."],
      ["Owen Brooks", "Will do.", true],
      ["Elena Park", "Can that note also flag the export ask? It's related even though it's not the same fix."],
      ["Owen Brooks", "Yes, I'll link it rather than duplicate it."],
      ["Nia Cole", "Thanks — that keeps my Friday review honest about what's actually moving versus deferred."],
    ],
  },
  {
    endMin: 61,
    lines: [
      ["Maya Chen", "Let's recap. Theo owns the reliability checklist before the next release."],
      ["Theo Martin", "Confirmed."],
      ["Maya Chen", "Nia brings the top three customer issues — export, search clarity, long-call summaries — to Friday review."],
      ["Nia Cole", "Confirmed."],
      ["Maya Chen", "Owen documents the reporting deferral for October, linked to the export thread."],
      ["Owen Brooks", "Confirmed."],
      ["Maya Chen", "And Priya's day-two nudge ships to the beta cohort this week, no new date needed."],
      ["Priya Shah", "Confirmed."],
      ["Maya Chen", "That's a narrow list, which is the point. Same time next week."],
      ["Jon Bell", "Sounds good."],
      ["Sam Rivera", "I'll send the export ticket volume to Nia before Friday so the numbers are fresh."],
      ["Nia Cole", "Appreciated."],
      ["Elena Park", "I'll do the same from the account side so it's not just support tickets driving the picture."],
      ["Nia Cole", "Even better — that's the context I didn't have last time."],
      ["Maya Chen", "Good session. Thanks, everyone."],
    ],
  },
];

function makeLongTranscript(): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  let startMin = 0;
  let counter = 0;
  for (const segment of weeklyOpsSegments) {
    const segmentSeconds = (segment.endMin - startMin) * 60;
    const step = segmentSeconds / segment.lines.length;
    segment.lines.forEach(([speaker, text, highlighted], index) => {
      counter += 1;
      const totalSeconds = Math.round(startMin * 60 + index * step);
      const minute = Math.floor(totalSeconds / 60);
      const second = totalSeconds % 60;
      lines.push({
        id: `line-${counter}`,
        timestamp: `${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`,
        speaker,
        text,
        highlighted: Boolean(highlighted),
      });
    });
    startMin = segment.endMin;
  }
  return lines;
}

function makeTranscript(lines: Array<[string, string, string]>): TranscriptLine[] {
  return lines.map(([timestamp, speaker, text], index) => ({ id: `line-${index + 1}`, timestamp, speaker, text, highlighted: false }));
}

const launchTranscript = makeTranscript([
  ["00:18", "Maya Chen", "The release is small enough to explain in one sentence, which is a good sign."],
  ["01:42", "Jon Bell", "I will take the final QA pass and keep the checklist focused on the new invitation flow."],
  ["03:16", "Maya Chen", "The feedback from design is that the empty state needs to tell people what happens next."],
  ["04:38", "Priya Shah", "I can update that copy and add the example workspace before Thursday."],
  ["06:21", "Jon Bell", "Let us keep the rollout to the beta group until the permission audit is complete."],
  ["08:05", "Maya Chen", "That is the right tradeoff. We can measure activation without creating support noise."],
]);

export const meetings: Meeting[] = [
  {
    id: "northstar-launch", title: "Northstar launch planning", date: "2026-09-20T10:00:00", durationMin: 46, type: "Internal",
    participants: ["Maya Chen", "Jon Bell", "Priya Shah", "Owen Brooks"],
    overview: "The team aligned on a focused Northstar launch for the beta group. The conversation centered on making the invitation flow easier to understand, keeping permissions conservative, and giving support a clear handoff before the first customer cohort is invited.",
    actionItems: [
      { id: "launch-1", text: "Share the revised onboarding copy with the beta group", assignee: "Priya Shah", done: false, timestamp: "04:38" },
      { id: "launch-2", text: "Complete the permission audit before rollout", assignee: "Jon Bell", done: false, timestamp: "06:21" },
      { id: "launch-3", text: "Prepare the support handoff checklist", assignee: "Owen Brooks", done: true, timestamp: "08:05" },
    ], transcript: launchTranscript,
  },
  {
    id: "atlas-review", title: "Atlas customer review", date: "2026-09-19T14:30:00", durationMin: 32, type: "Customer Success",
    participants: ["Elena Park", "Sam Rivera", "Luca Moretti"],
    overview: "Atlas is seeing value in shared notes but needs faster ways to find decisions after a call. The team agreed to make highlights more visible, clarify export expectations, and schedule a workflow review with their operations lead.",
    actionItems: [
      { id: "atlas-1", text: "Send the highlights workflow recording", assignee: "Sam Rivera", done: false, timestamp: "12:14" },
      { id: "atlas-2", text: "Confirm export requirements with operations", assignee: "Elena Park", done: false, timestamp: "21:40" },
    ],
    transcript: makeTranscript([
      ["00:24", "Elena Park", "Thanks for making time. We want to understand what happens after a busy customer day."],
      ["02:12", "Luca Moretti", "The summary is useful, but I still lose the exact sentence that changed our plan."],
      ["05:48", "Sam Rivera", "That is where a highlight tied to the transcript can help."],
      ["12:14", "Elena Park", "I will send a short recording showing the workflow to the wider team."],
      ["21:40", "Sam Rivera", "We should confirm whether the export needs to include timestamps and speaker names."],
    ]),
  },
  {
    id: "weekly-ops", title: "Weekly operating review", date: "2026-09-18T09:00:00", durationMin: 61, type: "Internal", participants: speakers,
    overview: "Four threads ran through this review. Jon's launch forecast is three days ahead of schedule, but first-session activation is running about eleven points soft, which the team traced to a missing day-two nudge rather than the invite flow itself — Priya is shipping that this week with no change to the launch date. Theo flagged that on-call load doubled after a run of deploys with no shared rollback checklist; that becomes a single documented process, owned by him, before the next release. Support and customer success independently noticed the same pattern from opposite sides — Sam's ticket volume and Elena's account conversations both point to the same gap, meeting-highlight export — which Nia folded into a ranked list of three account-facing issues (export, search-scope clarity, and long-call summary depth) to bring to Friday review. That surfaced the meeting's one real disagreement: Owen pushed to defer the reporting rebuild rather than split engineering time across three initiatives, and the room agreed to explicitly postpone it to October instead of letting it compete for the same two weeks. The team closed on four owners and no open questions carried forward.",
    actionItems: [
      { id: "ops-1", text: "Publish the reliability checklist for the next release", assignee: "Theo Martin", done: false, timestamp: "18:45" },
      { id: "ops-2", text: "Bring the top three customer issues to Friday review", assignee: "Nia Cole", done: true, timestamp: "40:40" },
      { id: "ops-3", text: "Document the reporting follow-ups for October", assignee: "Owen Brooks", done: false, timestamp: "52:09" },
    ], transcript: makeLongTranscript(),
  },
  {
    id: "meridian-demo", title: "Meridian discovery call", date: "2026-09-17T16:00:00", durationMin: 28, type: "Sales", participants: ["Maya Chen", "Drew Foster", "Ava Singh"],
    overview: "Meridian is evaluating a meeting record that their implementation team can trust without adding more note-taking work. Their strongest needs are consistent action items, searchable decisions, and an easy way to share a moment with a teammate.",
    actionItems: [
      { id: "meridian-1", text: "Send a sample summary to the implementation lead", assignee: "Maya Chen", done: false, timestamp: "09:32" },
      { id: "meridian-2", text: "Schedule a technical follow-up for next week", assignee: "Drew Foster", done: false, timestamp: "19:10" },
    ], transcript: makeTranscript([
      ["00:31", "Maya Chen", "What would make the record useful when the implementation team returns to it later?"],
      ["03:08", "Drew Foster", "Search matters most. We need to find a decision without rewatching the full call."],
      ["09:32", "Ava Singh", "A sample summary would help us compare the workflow with our current notes."],
      ["19:10", "Drew Foster", "Let us bring our technical lead into a follow-up next week."],
    ]),
  },
  {
    id: "one-on-one-jo", title: "Jo and Maya 1:1", date: "2026-09-16T11:30:00", durationMin: 24, type: "1:1", participants: ["Maya Chen", "Jo Alvarez"],
    overview: "Jo and Maya reviewed the current priorities, a customer escalation, and Jo's growth goals for the quarter. They left with a clear plan to protect focus time and make the next project milestone visible.",
    actionItems: [{ id: "jo-1", text: "Draft the milestone outline for the next check-in", assignee: "Jo Alvarez", done: false, timestamp: "15:12" }],
    transcript: makeTranscript([
      ["01:05", "Maya Chen", "Let us start with what is taking more energy than it should."],
      ["06:40", "Jo Alvarez", "The escalation is manageable, but I need a clearer boundary around focus time."],
      ["15:12", "Maya Chen", "Bring a milestone outline to our next check-in and we will shape it together."],
    ]),
  },
];
