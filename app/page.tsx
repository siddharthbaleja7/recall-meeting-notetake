"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionItem, Meeting, TranscriptLine } from "@/lib/seed-data";
import { speakerColor, speakerInitials } from "@/lib/speaker-colors";

type SummaryTemplate = "general" | "sales" | "standup";
type Theme = "dark" | "light";

const formatDayKey = (iso: string) => iso.slice(0, 10);
const formatDayLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(iso));
const formatTime = (iso: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(iso));
const formatDuration = (minutes: number) => (minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`);

function summaryForTemplate(meeting: Meeting, template: SummaryTemplate) {
  if (template === "general") return meeting.overview;
  if (template === "sales") {
    return `${meeting.overview} The commercial signal is clear: confirm the next decision with the customer, keep ownership visible, and use the transcript as the shared source of truth.`;
  }
  return `${meeting.overview} The team left with a short list of owners, a concrete next checkpoint, and one deliberate decision about what to defer.`;
}

// STUB — no real model call. This is a small keyword-overlap search over the
// meeting's own overview and transcript, not an LLM. It's honest about that
// in its own output rather than pretending to converse (same principle as
// the calendar-connect stub: look plausible, never misrepresent what's
// actually happening). A real version would wire this to the Anthropic API
// scoped to this meeting's transcript.
function answerAboutMeeting(meeting: Meeting, question: string): { text: string; matches: TranscriptLine[] } {
  const keywords = question
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .filter((word) => word.length > 2);

  if (keywords.length === 0) {
    return { text: "Ask something about this call — a topic, a decision, or a person's name.", matches: [] };
  }

  const scored = meeting.transcript
    .map((line) => {
      const haystack = line.text.toLowerCase();
      const score = keywords.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
      return { line, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.line);

  if (scored.length === 0) {
    return {
      text: "Nothing in this transcript matches that — try a different phrase, or check the full transcript below.",
      matches: [],
    };
  }

  return {
    text: `Found ${scored.length === 1 ? "one moment" : `${scored.length} moments`} that mention this in the transcript:`,
    matches: scored,
  };
}

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [template, setTemplate] = useState<SummaryTemplate>("general");
  const [theme, setTheme] = useState<Theme>("dark");
  const [highlightsOnly, setHighlightsOnly] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [askQuery, setAskQuery] = useState("");
  const [askResult, setAskResult] = useState<{ text: string; matches: TranscriptLine[] } | null>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  // Everything comes from the API — no static seed-data import. Toggles
  // optimistically update local state, then PATCH the API, reverting on
  // failure so the UI never claims a persisted state it doesn't have.
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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setCommandOpen(true);
      } else if (event.key === "Escape" && commandOpen) {
        setCommandOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandOpen]);

  useEffect(() => {
    if (commandOpen) commandInputRef.current?.focus();
  }, [commandOpen]);

  const dayGroups = useMemo(() => {
    const groups: Array<{ key: string; label: string; meetings: Meeting[] }> = [];
    for (const meeting of meetings) {
      const key = formatDayKey(meeting.date);
      let group = groups.find((candidate) => candidate.key === key);
      if (!group) {
        group = { key, label: formatDayLabel(meeting.date), meetings: [] };
        groups.push(group);
      }
      group.meetings.push(meeting);
    }
    return groups;
  }, [meetings]);

  const commandResults = useMemo(() => {
    const normalized = commandQuery.trim().toLowerCase();
    if (!normalized) return [];
    return meetings
      .map((meeting) => {
        const transcriptMatch = meeting.transcript.find((line) => line.text.toLowerCase().includes(normalized));
        const titleMatch = meeting.title.toLowerCase().includes(normalized) || meeting.overview.toLowerCase().includes(normalized);
        if (!titleMatch && !transcriptMatch) return null;
        return { meeting, excerpt: !titleMatch && transcriptMatch ? transcriptMatch : null };
      })
      .filter((entry): entry is { meeting: Meeting; excerpt: TranscriptLine | null } => entry !== null)
      .slice(0, 20);
  }, [commandQuery, meetings]);

  function openMeeting(id: string) {
    setExpandedId((current) => (current === id ? null : id));
    setHighlightsOnly(false);
    setAskQuery("");
    setAskResult(null);
  }

  function goToMeeting(id: string) {
    setCommandOpen(false);
    setCommandQuery("");
    setExpandedId(id);
    setHighlightsOnly(false);
    window.setTimeout(() => cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function toggleHighlight(meetingId: string, lineId: string, currentlyHighlighted: boolean) {
    const nextHighlighted = !currentlyHighlighted;
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
      setMeetings((current) =>
        current.map((meeting) =>
          meeting.id !== meetingId
            ? meeting
            : { ...meeting, transcript: meeting.transcript.map((line) => (line.id === lineId ? { ...line, highlighted: currentlyHighlighted } : line)) }
        )
      );
    });
  }

  function toggleActionItem(meetingId: string, itemId: string, currentlyDone: boolean) {
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

  function submitAsk(meeting: Meeting) {
    if (!askQuery.trim()) return;
    setAskResult(answerAboutMeeting(meeting, askQuery));
  }

  if (loading) {
    return (
      <main className={`feed-shell theme-${theme}`}>
        <p className="feed-status">Loading meetings…</p>
      </main>
    );
  }
  if (loadError) {
    return (
      <main className={`feed-shell theme-${theme}`}>
        <p className="feed-status">{loadError}</p>
      </main>
    );
  }

  return (
    <main className={`feed-shell theme-${theme}`}>
      <header className="feed-topbar">
        <div className="feed-brand"><span className="brand-mark">R</span><span>Recall</span></div>
        <div className="feed-topbar-actions">
          <button className="feed-search-trigger" onClick={() => setCommandOpen(true)}>
            <span aria-hidden="true">⌕</span> Search meetings <kbd>⌘K</kbd>
          </button>
          <a className="feed-icon-button" href="/calendar" aria-label="Connect a calendar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
          </a>
          <button className="feed-icon-button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}>
            {theme === "dark" ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="feed-body">
        {meetings.length === 0 && <p className="feed-empty">No meetings yet.</p>}
        {dayGroups.map((group) => (
          <section className="feed-day-group" key={group.key}>
            <h2 className="feed-day-heading">{group.label}</h2>
            <div className="feed-cards">
              {group.meetings.map((meeting) => {
                const isExpanded = expandedId === meeting.id;
                const openCount = meeting.actionItems.filter((item) => !item.done).length;
                const highlightCount = meeting.transcript.filter((line) => line.highlighted).length;
                const visibleTranscript = highlightsOnly ? meeting.transcript.filter((line) => line.highlighted) : meeting.transcript;

                return (
                  <article
                    className={`feed-card ${isExpanded ? "expanded" : ""}`}
                    key={meeting.id}
                    ref={(node) => {
                      cardRefs.current[meeting.id] = node;
                    }}
                  >
                    <button className="feed-card-summary" onClick={() => openMeeting(meeting.id)} aria-expanded={isExpanded}>
                      <div className="feed-card-heading">
                        <span className="feed-card-type">{meeting.type}</span>
                        <h3>{meeting.title}</h3>
                        <p className="feed-card-meta">
                          {formatTime(meeting.date)} <i /> {formatDuration(meeting.durationMin)} <i /> {meeting.participants.length} people
                        </p>
                      </div>
                      <div className="feed-card-side">
                        {openCount > 0 && <span className="feed-attention-badge">{openCount} open</span>}
                        <span className="feed-chevron" aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="feed-card-detail">
                        <div className="feed-card-actions-row">
                          <a className="feed-text-link" href={`/share/${meeting.id}`}>Copy share link</a>
                        </div>

                        <section className="feed-section">
                          <div className="feed-section-heading">
                            <div className="feed-source-label"><span className="feed-spark">✦</span> AI summary</div>
                            <label className="feed-template-control">
                              <span>Format</span>
                              <select value={template} onChange={(event) => setTemplate(event.target.value as SummaryTemplate)} aria-label="Summary format">
                                <option value="general">General</option>
                                <option value="sales">Sales call</option>
                                <option value="standup">Standup</option>
                              </select>
                            </label>
                          </div>
                          <p className="feed-overview">{summaryForTemplate(meeting, template)}</p>
                        </section>

                        <section className="feed-section">
                          <div className="feed-section-heading"><h4>Action items</h4><span>{meeting.actionItems.length} items</span></div>
                          <div className="feed-action-list">
                            {meeting.actionItems.map((item: ActionItem) => (
                              <div className={`feed-action-item ${item.done ? "done" : ""}`} key={item.id}>
                                <button
                                  className="feed-check-button"
                                  aria-label={`${item.done ? "Mark incomplete" : "Complete"}: ${item.text}`}
                                  onClick={() => toggleActionItem(meeting.id, item.id, item.done)}
                                >
                                  {item.done ? "✓" : ""}
                                </button>
                                <div className="feed-action-copy">
                                  <span>{item.text}</span>
                                  <div className="feed-action-meta">
                                    <span className="feed-assignee">{item.assignee}</span>
                                    {item.timestamp && (
                                      <button
                                        className="feed-timestamp"
                                        onClick={() => {
                                          setHighlightsOnly(false);
                                          window.setTimeout(
                                            () => cardRefs.current[meeting.id]?.querySelector(`[data-timestamp="${item.timestamp}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
                                            0
                                          );
                                        }}
                                      >
                                        @ {item.timestamp}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="feed-section">
                          <div className="feed-section-heading">
                            <div>
                              <h4>Transcript</h4>
                              <span>{meeting.transcript.length} lines · {formatDuration(meeting.durationMin)}</span>
                            </div>
                            <button
                              className={`feed-filter-button ${highlightsOnly ? "active" : ""}`}
                              aria-pressed={highlightsOnly}
                              disabled={highlightCount === 0}
                              onClick={() => setHighlightsOnly((current) => !current)}
                            >
                              {highlightsOnly ? "Showing highlights" : "Highlights"} {highlightCount > 0 && `(${highlightCount})`}
                            </button>
                          </div>
                          <div className="feed-transcript-list">
                            {visibleTranscript.map((line) => (
                              <article className={`feed-transcript-line ${line.highlighted ? "highlighted" : ""}`} data-timestamp={line.timestamp} key={line.id}>
                                <span className="feed-line-time">{line.timestamp}</span>
                                <div className="feed-line-body">
                                  <div className="feed-speaker-row">
                                    <span className="feed-speaker-avatar" style={{ background: speakerColor(meeting, line.speaker) }}>{speakerInitials(line.speaker)}</span>
                                    {line.speaker}
                                  </div>
                                  <p>{line.text}</p>
                                </div>
                                <button
                                  className="feed-highlight-button"
                                  aria-label={`${line.highlighted ? "Remove highlight from" : "Highlight"} ${line.timestamp}`}
                                  onClick={() => toggleHighlight(meeting.id, line.id, line.highlighted)}
                                >
                                  {line.highlighted ? "★" : "☆"}
                                </button>
                              </article>
                            ))}
                            {visibleTranscript.length === 0 && <p className="feed-empty">No highlighted lines yet — star a line to jump back to it here.</p>}
                          </div>
                        </section>

                        <section className="feed-section feed-ask-section">
                          <div className="feed-section-heading"><h4>Ask about this meeting</h4></div>
                          <form
                            className="feed-ask-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              submitAsk(meeting);
                            }}
                          >
                            <input
                              value={askQuery}
                              onChange={(event) => setAskQuery(event.target.value)}
                              placeholder="e.g. what did we decide about the launch date?"
                              aria-label="Ask about this meeting"
                            />
                            <button type="submit">Ask</button>
                          </form>
                          {askResult && (
                            <div className="feed-ask-answer">
                              <p>{askResult.text}</p>
                              {askResult.matches.map((line) => (
                                <p className="feed-ask-match" key={line.id}>
                                  <span className="feed-line-time">{line.timestamp}</span> {line.speaker}: “{line.text}”
                                </p>
                              ))}
                            </div>
                          )}
                        </section>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {commandOpen && (
        <div className="feed-command-overlay" role="dialog" aria-modal="true" aria-label="Search meetings" onClick={() => setCommandOpen(false)}>
          <div className="feed-command-panel" onClick={(event) => event.stopPropagation()}>
            <label className="feed-command-input-row">
              <span aria-hidden="true">⌕</span>
              <input
                ref={commandInputRef}
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Search meeting titles and transcripts…"
                aria-label="Search meetings and transcripts"
              />
              <kbd>Esc</kbd>
            </label>
            <div className="feed-command-results">
              {commandQuery.trim() === "" && <p className="feed-empty">Start typing a title, topic, or something someone said.</p>}
              {commandQuery.trim() !== "" && commandResults.length === 0 && (
                <p className="feed-empty">No matches — try a shorter phrase or a person&apos;s name.</p>
              )}
              {commandResults.map(({ meeting, excerpt }) => (
                <button className="feed-command-result" key={meeting.id} onClick={() => goToMeeting(meeting.id)}>
                  <span className="feed-card-type">{meeting.type}</span>
                  <strong>{meeting.title}</strong>
                  {excerpt ? (
                    <span className="feed-command-excerpt">@ {excerpt.timestamp} {excerpt.speaker}: “{excerpt.text}”</span>
                  ) : (
                    <span className="feed-command-excerpt">{formatDayLabel(meeting.date)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
