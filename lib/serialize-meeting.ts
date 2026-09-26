import type { Meeting as PrismaMeeting, TranscriptLine as PrismaTranscriptLine, ActionItem as PrismaActionItem } from "@prisma/client";
import type { Meeting, MeetingType } from "./seed-data";

// Reverses the enum-identifier remap from prisma/seed.ts so API responses
// keep exactly the MeetingType strings ("1:1", "Customer Success") the
// frontend and lib/seed-data.ts types already expect.
const enumToType: Record<string, MeetingType> = {
  Sales: "Sales",
  Internal: "Internal",
  OneOnOne: "1:1",
  CustomerSuccess: "Customer Success",
};

type MeetingWithRelations = PrismaMeeting & {
  transcript: PrismaTranscriptLine[];
  actionItems: PrismaActionItem[];
};

export function serializeMeeting(meeting: MeetingWithRelations): Meeting {
  return {
    id: meeting.id,
    title: meeting.title,
    date: meeting.date.toISOString(),
    durationMin: meeting.durationMin,
    type: enumToType[meeting.type],
    participants: meeting.participants,
    overview: meeting.overview,
    actionItems: [...meeting.actionItems]
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        id: item.id,
        text: item.text,
        assignee: item.assignee,
        done: item.done,
        timestamp: item.timestamp ?? undefined,
      })),
    transcript: [...meeting.transcript]
      .sort((a, b) => a.order - b.order)
      .map((line) => ({
        id: line.id,
        timestamp: line.timestamp,
        speaker: line.speaker,
        text: line.text,
        highlighted: line.highlighted,
      })),
  };
}
