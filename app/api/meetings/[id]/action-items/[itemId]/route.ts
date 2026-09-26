import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/meetings/:id/action-items/:itemId — toggle (or explicitly
// set) an action item's done state. Body: { done?: boolean }. Omitting
// `done` flips the current value.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;
  const body = await request.json().catch(() => ({}));

  const item = await prisma.actionItem.findUnique({ where: { id: itemId } });
  if (!item || item.meetingId !== id) {
    return NextResponse.json({ error: "Action item not found" }, { status: 404 });
  }

  const done = typeof body.done === "boolean" ? body.done : !item.done;
  const updated = await prisma.actionItem.update({
    where: { id: itemId },
    data: { done },
  });

  return NextResponse.json({ id: updated.id, done: updated.done });
}
