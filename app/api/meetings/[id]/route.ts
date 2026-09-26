import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeMeeting } from "@/lib/serialize-meeting";

// See app/api/meetings/route.ts — same static-caching pitfall applies here.
export const dynamic = "force-dynamic";

// GET /api/meetings/:id — single meeting's full detail (summary, action
// items, transcript). Used by both the main app and the unauthenticated
// /share/[id] view.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { transcript: true, actionItems: true },
  });
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  return NextResponse.json(serializeMeeting(meeting));
}
