import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeMeeting } from "@/lib/serialize-meeting";

// Without this, Next.js treats this GET handler as static (it reads no
// request data) and caches its response indefinitely, so highlight/action-
// item toggles would silently appear to revert on reload even though the
// DB write succeeded — this always hits the DB fresh.
export const dynamic = "force-dynamic";

// GET /api/meetings — list, newest first. Includes full transcript/action
// items (not just list-view fields) so the frontend can do one fetch on
// load and search across transcript content client-side, matching the
// current in-memory search behavior in app/page.tsx.
export async function GET() {
  const meetings = await prisma.meeting.findMany({
    include: { transcript: true, actionItems: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(meetings.map(serializeMeeting));
}
