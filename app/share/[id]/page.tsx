import { notFound } from "next/navigation";
import { meetings } from "@/lib/seed-data";
import { speakerColor, speakerInitials } from "@/lib/speaker-colors";

// No auth check by design: this route is the P1 "share a call with someone
// who wasn't on it" view from the brief, so it must render for a signed-out
// visitor. It only ever reads the seeded meeting by id — no session,
// cookie, or client-only state is involved, so there is nothing that could
// leak between viewers.
export default async function ShareMeeting({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = meetings.find((item) => item.id === id);
  if (!meeting) notFound();

  return (
    <main className="share-page theme-light">
      <header className="share-header">
        <div className="brand-row"><span className="brand-mark">R</span><span>Recall</span></div>
        <span className="shared-label">Shared meeting record · view only</span>
      </header>
      <section className="share-hero">
        <div className="eyebrow">{meeting.type} call</div>
        <h1>{meeting.title}</h1>
        <p>{new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(meeting.date))} <i /> {meeting.durationMin} minutes <i /> {meeting.participants.length} participants</p>
      </section>
      <div className="share-grid">
        <section className="share-summary"><div className="source-label"><span className="spark">✦</span> AI summary</div><p className="overview">{meeting.overview}</p><div className="section-heading"><h2>Action items</h2><span>{meeting.actionItems.length} items</span></div><div className="action-list">{meeting.actionItems.map((item) => <div className="action-item" key={item.id}><span className="check-button" aria-hidden="true" /> <div className="action-copy"><span>{item.text}</span><div className="action-meta"><span className="assignee">{item.assignee}</span>{item.timestamp && <span className="timestamp">@ {item.timestamp}</span>}</div></div></div>)}</div></section>
        <section className="share-transcript"><div className="transcript-toolbar"><div><h2>Transcript</h2><span>{meeting.transcript.length} lines</span></div></div><div className="transcript-list">{meeting.transcript.map((line) => <article className={`transcript-line ${line.highlighted ? "highlighted" : ""}`} key={line.id}><span className="line-time">{line.timestamp}</span><div className="line-body"><div className="speaker-row"><span className="speaker-avatar" style={{ background: speakerColor(meeting, line.speaker) }}>{speakerInitials(line.speaker)}</span>{line.speaker}</div><p>{line.text}</p></div></article>)}</div></section>
      </div>
      <footer className="share-footer">This meeting was shared from a Recall workspace. No sign-in required to view it.</footer>
    </main>
  );
}
