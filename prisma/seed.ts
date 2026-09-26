import { PrismaClient } from "@prisma/client";
import { meetings } from "../lib/seed-data";

const prisma = new PrismaClient();

// Maps the app-facing MeetingType strings (which include "1:1" and
// "Customer Success" — not valid Prisma enum identifiers) to the enum
// member names declared in schema.prisma. The @map() attributes on those
// members keep the actual stored/db-facing values identical to the
// original strings, so nothing downstream has to know about this remap.
const typeToEnum: Record<string, "Sales" | "Internal" | "OneOnOne" | "CustomerSuccess"> = {
  Sales: "Sales",
  Internal: "Internal",
  "1:1": "OneOnOne",
  "Customer Success": "CustomerSuccess",
};

async function main() {
  // Wipe in dependency order so re-running the seed is idempotent.
  await prisma.actionItem.deleteMany();
  await prisma.transcriptLine.deleteMany();
  await prisma.meeting.deleteMany();

  for (const meeting of meetings) {
    await prisma.meeting.create({
      data: {
        id: meeting.id,
        title: meeting.title,
        date: new Date(meeting.date),
        durationMin: meeting.durationMin,
        type: typeToEnum[meeting.type],
        participants: meeting.participants,
        overview: meeting.overview,
        transcript: {
          create: meeting.transcript.map((line, index) => ({
            // Source ids like "line-1" reset per meeting in lib/seed-data.ts
            // and collide once flattened into one global table — namespace
            // them by meeting id to keep them globally unique.
            id: `${meeting.id}-${line.id}`,
            timestamp: line.timestamp,
            speaker: line.speaker,
            text: line.text,
            highlighted: line.highlighted,
            order: index,
          })),
        },
        actionItems: {
          create: meeting.actionItems.map((item, index) => ({
            id: item.id,
            text: item.text,
            assignee: item.assignee,
            done: item.done,
            timestamp: item.timestamp,
            order: index,
          })),
        },
      },
    });
  }

  const count = await prisma.meeting.count();
  const longest = await prisma.meeting.findFirst({
    where: { durationMin: { gte: 60 } },
    include: { transcript: true },
  });
  console.log(`Seeded ${count} meetings.`);
  if (longest) {
    console.log(
      `Long meeting check: "${longest.title}" — ${longest.durationMin}min, ${longest.participants.length} participants, ${longest.transcript.length} transcript lines.`
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
