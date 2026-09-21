# Data model (MVP)

```ts
type Meeting = {
  id: string;
  title: string;
  date: string;        // ISO
  durationMin: number;
  type: "Sales" | "Internal" | "1:1" | "Customer Success";
  participants: string[];
  overview: string;           // AI summary paragraph
  actionItems: ActionItem[];
  transcript: TranscriptLine[];
};

type ActionItem = {
  id: string;
  text: string;
  assignee: string;
  done: boolean;
  timestamp?: string;  // "mm:ss" back into the call this item came from —
                        // confirmed real Fathom behavior (see /recon), keep it
};

type TranscriptLine = {
  id: string;
  timestamp: string;   // "mm:ss"
  speaker: string;
  text: string;
  highlighted: boolean;
};
```

Seed at least 5 `Meeting` records. One must have 8 distinct `participants`, a
`durationMin` around 60, and a `transcript` long enough (100+ lines) to genuinely
stress-test the transcript view — not a token 5-line stand-in.

If P1's summary-template feature is built, add:

```ts
type SummaryTemplate = "general" | "sales" | "standup";
// Meeting.overview becomes Record<SummaryTemplate, string>, or generated on the fly
// from transcript text if a real LLM call is wired up.
```

Keep this in a single typed module (e.g. `lib/seed-data.ts`) rather than scattering
mock data across components — it should be trivial to swap for a real API/DB later.
