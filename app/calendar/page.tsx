"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalendarPage() {
  const [connected, setConnected] = useState(false);

  return (
    <main className="calendar-page">
      <div className="calendar-panel">
        <div className="brand-row"><span className="brand-mark">R</span><span>Recall</span></div>
        <div className="eyebrow">Calendar connection</div>
        <h1>{connected ? "Calendar connected" : "Bring your meetings into Recall"}</h1>
        <p>{connected ? "Your demo calendar is connected. New meetings will appear in your workspace." : "Choose a calendar to prepare your meeting record. This demo keeps the connection local and does not contact Google or Microsoft."}</p>
        {connected ? <div className="connected-state"><span className="connected-icon">✓</span><div><strong>Demo calendar connected</strong><span>Calendar access is simulated for this prototype.</span></div></div> : <div className="calendar-options"><button onClick={() => setConnected(true)}><span className="calendar-logo google">G</span><span><strong>Connect Google Calendar</strong><small>Demo connection</small></span><span>→</span></button><button onClick={() => setConnected(true)}><span className="calendar-logo outlook">O</span><span><strong>Connect Outlook Calendar</strong><small>Demo connection</small></span><span>→</span></button></div>}
        <Link className="back-link" href="/">← Back to meetings</Link>
      </div>
    </main>
  );
}
