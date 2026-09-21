"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { meetings, type Meeting } from "@/lib/seed-data";

type DetailTab = "summary" | "transcript";
type SummaryTemplate = "general" | "sales" | "standup";
type Theme = "dark" | "light";

const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
const formatDuration = (minutes: number) => minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;

// Muted, mid-toned hues (not the teal accent or amber flag) so speakers stay
// scannable at a glance in an 8-person transcript, not just distinguishable
// by reading the name text. Order is stable per meeting via participants[].
const SPEAKER_PALETTE = ["#3E5C8A", "#8A3E52", "#6B7A3E", "#6B4C7A", "#A15C3B", "#4F5B6B", "#2E6F63", "#7A5A3E"];
function speakerColor(meeting: Meeting, name: string) {
  const index = meeting.participants.indexOf(name);
  return SPEAKER_PALETTE[(index === -1 ? 0 : index) % SPEAKER_PALETTE.length];
}
function speakerInitials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export default function Home() {
  const [selectedId, setSelectedId] = useState(meetings[0].id);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<DetailTab>("summary");
  const [mobileListOpen, setMobileListOpen] = useState(true);
  const [highlighted, setHighlighted] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [template, setTemplate] = useState<SummaryTemplate>("general");
  const [theme, setTheme] = useState<Theme>("dark");
  const [highlightsOnly, setHighlightsOnly] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = meetings.find((meeting) => meeting.id === selectedId) ?? meetings[0];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileListOpen(true);
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const filteredMeetings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return meetings;
    return meetings.filter((meeting) => [meeting.title, meeting.type, meeting.overview, ...meeting.transcript.map((line) => line.text)].join(" ").toLowerCase().includes(normalized));
  }, [query]);

  function chooseMeeting(meeting: Meeting) { setSelectedId(meeting.id); setTab("summary"); setMobileListOpen(false); setHighlightsOnly(false); }
  function jumpToTimestamp(timestamp: string) {
    setTab("transcript");
    setHighlightsOnly(false);
    window.setTimeout(() => transcriptRef.current?.querySelector(`[data-timestamp="${timestamp}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }
  const highlightCount = selected.transcript.filter((line) => highlighted[line.id] ?? line.highlighted).length;
  const visibleTranscript = highlightsOnly ? selected.transcript.filter((line) => highlighted[line.id] ?? line.highlighted) : selected.transcript;
  const summaryText = template === "general" ? selected.overview : template === "sales" ? `${selected.overview} The commercial signal is clear: confirm the next decision with the customer, keep ownership visible, and use the transcript as the shared source of truth.` : `${selected.overview} The team left with a short list of owners, a concrete next checkpoint, and one deliberate decision about what to defer.`;

  return (
    <main className={`app-shell theme-${theme}`}>
      <aside className={`sidebar ${mobileListOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="brand-row"><span className="brand-mark">R</span><span>Recall</span><span className="brand-status">Private workspace</span></div>
        <label className="search-box"><span aria-hidden="true">⌕</span><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search meetings" aria-label="Search meetings" /><kbd>⌘ K</kbd></label>
        <div className="list-heading"><span>My calls</span><span>{filteredMeetings.length}</span></div>
        <div className="meeting-list">
          {filteredMeetings.map((meeting) => <button className={`meeting-item ${selected.id === meeting.id ? "selected" : ""}`} key={meeting.id} onClick={() => chooseMeeting(meeting)}><span className="meeting-type">{meeting.type}</span><strong>{meeting.title}</strong><span className="meeting-meta">{formatDate(meeting.date)} <i /> {formatDuration(meeting.durationMin)} <i /> {meeting.participants.length} people</span></button>)}
          {filteredMeetings.length === 0 && <p className="empty-search">Try a meeting title, speaker, or phrase from the transcript.</p>}
        </div>
        <div className="sidebar-footer"><span className="avatar">MC</span><span>Maya Chen</span><button aria-label="Open account menu">•••</button></div>
      </aside>

      <section className="detail-pane">
        <button className="mobile-back" onClick={() => setMobileListOpen(true)}>← All meetings</button>
        <header className="meeting-header"><div><div className="eyebrow">{selected.type} call</div><h1>{selected.title}</h1><p>{formatDate(selected.date)} <i /> {formatDuration(selected.durationMin)} <i /> {selected.participants.length} participants</p></div><div className="header-actions"><button className="icon-button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}>{theme === "dark" ? "☼" : "☾"}</button><a className="icon-button link-button" href={`/share/${selected.id}`} aria-label="Open share view">↗</a><a className="icon-button link-button" href="/calendar" aria-label="Open calendar connection">⌁</a><button className="icon-button" aria-label="More meeting actions">•••</button></div></header>
        <nav className="tabs" aria-label="Meeting views"><button className={tab === "summary" ? "active" : ""} onClick={() => setTab("summary")}>Summary</button><button className={tab === "transcript" ? "active" : ""} onClick={() => setTab("transcript")}>Transcript {highlightCount > 0 && <span className="count">{highlightCount}</span>}</button></nav>
        {tab === "summary" ? <div className="summary-view"><section className="summary-block"><div className="summary-source-row"><div className="source-label"><span className="spark">✦</span> AI summary</div><label className="template-control"><span>Format</span><select value={template} onChange={(event) => setTemplate(event.target.value as SummaryTemplate)} aria-label="Summary format"><option value="general">General</option><option value="sales">Sales call</option><option value="standup">Standup</option></select></label></div><p className="overview">{summaryText}</p></section><section className="action-section"><div className="section-heading"><h2>Action items</h2><span>{selected.actionItems.length} items</span></div><div className="action-list">{selected.actionItems.map((item) => { const isDone = completed[item.id] ?? item.done; return <div className={`action-item ${isDone ? "done" : ""}`} key={item.id}><button className="check-button" aria-label={`${isDone ? "Mark incomplete" : "Complete"}: ${item.text}`} onClick={() => setCompleted((current) => ({ ...current, [item.id]: !isDone }))}>{isDone ? "✓" : ""}</button><div className="action-copy"><span>{item.text}</span><div className="action-meta"><span className="assignee">{item.assignee}</span>{item.timestamp && <button className="timestamp" onClick={() => jumpToTimestamp(item.timestamp!)}>@ {item.timestamp}</button>}</div></div></div>; })}</div></section><button className="transcript-prompt" onClick={() => setTab("transcript")}><span>Read the full transcript</span><span>→</span></button></div> : <div className="transcript-view" ref={transcriptRef}><div className="transcript-toolbar"><div><h2>Transcript</h2><span>{selected.transcript.length} lines · {formatDuration(selected.durationMin)}</span></div><button className={`filter-button ${highlightsOnly ? "active" : ""}`} aria-pressed={highlightsOnly} disabled={highlightCount === 0} onClick={() => setHighlightsOnly((current) => !current)}>{highlightsOnly ? "Showing highlights" : "Highlights"} {highlightCount > 0 && `(${highlightCount})`}⌄</button></div><div className="transcript-list">{visibleTranscript.map((line) => { const isHighlighted = highlighted[line.id] ?? line.highlighted; return <article className={`transcript-line ${isHighlighted ? "highlighted" : ""}`} data-timestamp={line.timestamp} key={line.id}><button className="line-time" onClick={() => jumpToTimestamp(line.timestamp)}>{line.timestamp}</button><div className="line-body"><div className="speaker-row"><span className="speaker-avatar" style={{ background: speakerColor(selected, line.speaker) }}>{speakerInitials(line.speaker)}</span>{line.speaker}</div><p>{line.text}</p></div><button className="highlight-button" aria-label={`${isHighlighted ? "Remove highlight from" : "Highlight"} ${line.timestamp}`} onClick={() => setHighlighted((current) => ({ ...current, [line.id]: !isHighlighted }))}>{isHighlighted ? "★" : "☆"}</button></article>; })}{visibleTranscript.length === 0 && <p className="empty-search">No highlighted lines yet — star a line to jump back to it here.</p>}</div></div>}
      </section>
    </main>
  );
}
