"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Meeting } from "@/lib/seed-data";
import { speakerColor, speakerInitials } from "@/lib/speaker-colors";

type DetailTab = "summary" | "transcript";
type SummaryTemplate = "general" | "sales" | "standup";
type Theme = "dark" | "light";

const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
const formatDuration = (minutes: number) => minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<DetailTab>("summary");
  const [mobileListOpen, setMobileListOpen] = useState(true);
  const [template, setTemplate] = useState<SummaryTemplate>("general");
  const [theme, setTheme] = useState<Theme>("dark");
  const [highlightsOnly, setHighlightsOnly] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Everything comes from the API now — no static seed-data import. This
  // fetches the full list (with nested transcript/action items) once on
  // load; toggles below optimistically patch local state, then confirm
  // against the API so state persists across a reload.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/meetings")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load meetings (${res.status})`);
        return res.json();
      })
      .then((data: Meeting[]) => {
        if (cancelled) return;
        setMeetings(data);
        setSelectedId((current) => current ?? data[0]?.id ?? null);
        setLoading(false);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setLoadError(error.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [query, meetings]);

  function chooseMeeting(meeting: Meeting) { setSelectedId(meeting.id); setTab("summary"); setMobileListOpen(false); setHighlightsOnly(false); }
  function jumpToTimestamp(timestamp: string) {
    setTab("transcript");
    setHighlightsOnly(false);
    window.setTimeout(() => transcriptRef.current?.querySelector(`[data-timestamp="${timestamp}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  function toggleHighlight(lineId: string, currentlyHighlighted: boolean) {
    if (!selected) return;
    const meetingId = selected.id;
    const nextHighlighted = !currentlyHighlighted;
    // Optimistic update, confirmed/reconciled against the API response.
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id !== meetingId
          ? meeting
          : { ...meeting, transcript: meeting.transcript.map((line) => (line.id === lineId ? { ...line, highlighted: nextHighlighted } : line)) }
      )
    );
    fetch(`/api/meetings/${meetingId}/transcript/${lineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ highlighted: nextHighlighted }),
    }).catch(() => {
      // Revert on failure so the UI never silently claims a persisted state it doesn't have.
      setMeetings((current) =>
        current.map((meeting) =>
          meeting.id !== meetingId
            ? meeting
            : { ...meeting, transcript: meeting.transcript.map((line) => (line.id === lineId ? { ...line, highlighted: currentlyHighlighted } : line)) }
        )
      );
    });
  }

  function toggleActionItem(itemId: string, currentlyDone: boolean) {
    if (!selected) return;
    const meetingId = selected.id;
    const nextDone = !currentlyDone;
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id !== meetingId
          ? meeting
          : { ...meeting, actionItems: meeting.actionItems.map((item) => (item.id === itemId ? { ...item, done: nextDone } : item)) }
      )
    );
    fetch(`/api/meetings/${meetingId}/action-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: nextDone }),
    }).catch(() => {
      setMeetings((current) =>
        current.map((meeting) =>
          meeting.id !== meetingId
            ? meeting
            : { ...meeting, actionItems: meeting.actionItems.map((item) => (item.id === itemId ? { ...item, done: currentlyDone } : item)) }
        )
      );
    });
  }

  if (loading) {
    return (
      <main className={`app-shell theme-${theme}`}>
        <p style={{ padding: "2rem" }}>Loading meetings…</p>
      </main>
    );
  }
  if (loadError || !selected) {
    return (
      <main className={`app-shell theme-${theme}`}>
        <p style={{ padding: "2rem" }}>{loadError ?? "No meetings found."}</p>
      </main>
    );
  }

  const highlightCount = selected.transcript.filter((line) => line.highlighted).length;
  const visibleTranscript = highlightsOnly ? selected.transcript.filter((line) => line.highlighted) : selected.transcript;
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
        {tab === "summary" ? <div className="summary-view"><section className="summary-block"><div className="summary-source-row"><div className="source-label"><span className="spark">✦</span> AI summary</div><label className="template-control"><span>Format</span><select value={template} onChange={(event) => setTemplate(event.target.value as SummaryTemplate)} aria-label="Summary format"><option value="general">General</option><option value="sales">Sales call</option><option value="standup">Standup</option></select></label></div><p className="overview">{summaryText}</p></section><section className="action-section"><div className="section-heading"><h2>Action items</h2><span>{selected.actionItems.length} items</span></div><div className="action-list">{selected.actionItems.map((item) => { const isDone = item.done; return <div className={`action-item ${isDone ? "done" : ""}`} key={item.id}><button className="check-button" aria-label={`${isDone ? "Mark incomplete" : "Complete"}: ${item.text}`} onClick={() => toggleActionItem(item.id, isDone)}>{isDone ? "✓" : ""}</button><div className="action-copy"><span>{item.text}</span><div className="action-meta"><span className="assignee">{item.assignee}</span>{item.timestamp && <button className="timestamp" onClick={() => jumpToTimestamp(item.timestamp!)}>@ {item.timestamp}</button>}</div></div></div>; })}</div></section><button className="transcript-prompt" onClick={() => setTab("transcript")}><span>Read the full transcript</span><span>→</span></button></div> : <div className="transcript-view" ref={transcriptRef}><div className="transcript-toolbar"><div><h2>Transcript</h2><span>{selected.transcript.length} lines · {formatDuration(selected.durationMin)}</span></div><button className={`filter-button ${highlightsOnly ? "active" : ""}`} aria-pressed={highlightsOnly} disabled={highlightCount === 0} onClick={() => setHighlightsOnly((current) => !current)}>{highlightsOnly ? "Showing highlights" : "Highlights"} {highlightCount > 0 && `(${highlightCount})`}⌄</button></div><div className="transcript-list">{visibleTranscript.map((line) => { const isHighlighted = line.highlighted; return <article className={`transcript-line ${isHighlighted ? "highlighted" : ""}`} data-timestamp={line.timestamp} key={line.id}><button className="line-time" onClick={() => jumpToTimestamp(line.timestamp)}>{line.timestamp}</button><div className="line-body"><div className="speaker-row"><span className="speaker-avatar" style={{ background: speakerColor(selected, line.speaker) }}>{speakerInitials(line.speaker)}</span>{line.speaker}</div><p>{line.text}</p></div><button className="highlight-button" aria-label={`${isHighlighted ? "Remove highlight from" : "Highlight"} ${line.timestamp}`} onClick={() => toggleHighlight(line.id, isHighlighted)}>{isHighlighted ? "★" : "☆"}</button></article>; })}{visibleTranscript.length === 0 && <p className="empty-search">No highlighted lines yet — star a line to jump back to it here.</p>}</div></div>}
      </section>
    </main>
  );
}
