import type { Meeting } from "./seed-data";

// Muted, mid-toned hues (not the teal accent or amber flag) so speakers stay
// scannable at a glance in an 8-person transcript, not just distinguishable
// by reading the name text. Order is stable per meeting via participants[].
const SPEAKER_PALETTE = ["#3E5C8A", "#8A3E52", "#6B7A3E", "#6B4C7A", "#A15C3B", "#4F5B6B", "#2E6F63", "#7A5A3E"];

export function speakerColor(meeting: Meeting, name: string) {
  const index = meeting.participants.indexOf(name);
  return SPEAKER_PALETTE[(index === -1 ? 0 : index) % SPEAKER_PALETTE.length];
}

export function speakerInitials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}
