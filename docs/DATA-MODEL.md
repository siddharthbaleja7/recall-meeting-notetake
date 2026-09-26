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

## Implementation note

This shape is now backed by a real database, not an in-memory module. `prisma/schema.prisma`
defines `Meeting` / `TranscriptLine` / `ActionItem` as Postgres tables (hosted on Neon),
`prisma/seed.ts` seeds the same 5 meetings described above, and the API routes under
`app/api/meetings/` read/write through Prisma. `lib/serialize-meeting.ts` maps each DB row
back to exactly the TypeScript shapes above, so the frontend consumes the same types either
way. `lib/seed-data.ts` still exports these types and the meeting data — it's what
`prisma/seed.ts` seeds from — but the running app no longer reads meeting data from it at
runtime; every read/write goes through the API.
