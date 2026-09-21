"use client";

/**
 * STUB, not real auth or capture: there is no OAuth redirect here — clicking
 * a provider just advances local component state, and the capture mode
 * choice does not configure any recording pipeline (the brief explicitly
 * scopes a real recording bot out of the MVP). Nothing here contacts
 * Google, Microsoft, or any calendar API. Kept as three explicit steps
 * (provider -> capture mode -> connected) so it stays honest about what a
 * real integration would ask for, without pretending to be one.
 */

import { useState } from "react";
import Link from "next/link";

type Provider = "google" | "outlook";
type CaptureMode = "audio-video" | "audio-only" | "transcript-only" | "off";
type Step = "choose-provider" | "choose-capture" | "connected";

const CAPTURE_MODES: Array<{ id: CaptureMode; label: string; description: string }> = [
  { id: "audio-video", label: "Audio & video", description: "Record the call and keep a synced transcript." },
  { id: "audio-only", label: "Audio only", description: "Keep the audio and transcript, skip video." },
  { id: "transcript-only", label: "Transcript only", description: "No recording kept — just the written transcript." },
  { id: "off", label: "Off", description: "Don't join this calendar's meetings at all." },
];

const PROVIDER_LABEL: Record<Provider, string> = { google: "Google Calendar", outlook: "Outlook Calendar" };

export default function CalendarPage() {
  const [step, setStep] = useState<Step>("choose-provider");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>("audio-video");

  function chooseProvider(next: Provider) { setProvider(next); setStep("choose-capture"); }
  const selectedMode = CAPTURE_MODES.find((mode) => mode.id === captureMode)!;

  return (
    <main className="calendar-page theme-light">
      <div className="calendar-panel">
        <div className="brand-row"><span className="brand-mark">R</span><span>Recall</span></div>
        <div className="eyebrow">Calendar connection</div>

        {step === "choose-provider" && <>
          <h1>Bring your meetings into Recall</h1>
          <p>Choose a calendar to prepare your meeting record. This is a prototype flow — it does not contact Google or Microsoft.</p>
          <div className="calendar-options">
            <button onClick={() => chooseProvider("google")}><span className="calendar-logo google">G</span><span><strong>Connect Google Calendar</strong><small>Demo connection</small></span><span>→</span></button>
            <button onClick={() => chooseProvider("outlook")}><span className="calendar-logo outlook">O</span><span><strong>Connect Outlook Calendar</strong><small>Demo connection</small></span><span>→</span></button>
          </div>
        </>}

        {step === "choose-capture" && provider && <>
          <h1>What should Recall capture?</h1>
          <p>Set the default for meetings on {PROVIDER_LABEL[provider]}. You can change this per meeting later.</p>
          <div className="capture-mode-options" role="radiogroup" aria-label="Capture mode">
            {CAPTURE_MODES.map((mode) => (
              <button key={mode.id} type="button" role="radio" aria-checked={captureMode === mode.id} className={`capture-mode-option ${captureMode === mode.id ? "selected" : ""}`} onClick={() => setCaptureMode(mode.id)}>
                <span className="capture-mode-radio" aria-hidden="true" />
                <span><strong>{mode.label}</strong><small>{mode.description}</small></span>
              </button>
            ))}
          </div>
          <div className="calendar-step-actions">
            <button className="back-link as-button" onClick={() => setStep("choose-provider")}>← Choose a different calendar</button>
            <button className="continue-button" onClick={() => setStep("connected")}>Continue</button>
          </div>
        </>}

        {step === "connected" && provider && <>
          <h1>Calendar connected</h1>
          <p>Your demo {PROVIDER_LABEL[provider]} is connected. New meetings will appear in your workspace using the capture mode below.</p>
          <div className="connected-state">
            <span className="connected-icon">✓</span>
            <div><strong>{PROVIDER_LABEL[provider]} — {selectedMode.label}</strong><span>Calendar access and capture are simulated for this prototype; no meetings are actually recorded.</span></div>
          </div>
          <button className="back-link as-button" onClick={() => setStep("choose-capture")}>← Change capture mode</button>
        </>}

        <Link className="back-link" href="/">← Back to meetings</Link>
      </div>
    </main>
  );
}
