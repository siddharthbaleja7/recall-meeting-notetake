import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/meetings/:id/transcript/:lineId — toggle (or explicitly set)
// a transcript line's highlight state. Body: { highlighted?: boolean }.
// Omitting `highlighted` flips the current value.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const { id, lineId } = await params;
  const body = await request.json().catch(() => ({}));

  const line = await prisma.transcriptLine.findUnique({ where: { id: lineId } });
  if (!line || line.meetingId !== id) {
    return NextResponse.json({ error: "Transcript line not found" }, { status: 404 });
  }

  const highlighted = typeof body.highlighted === "boolean" ? body.highlighted : !line.highlighted;
  const updated = await prisma.transcriptLine.update({
    where: { id: lineId },
    data: { highlighted },
  });

  return NextResponse.json({ id: updated.id, highlighted: updated.highlighted });
}
