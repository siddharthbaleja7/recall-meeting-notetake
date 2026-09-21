#!/usr/bin/env python3
"""Claude Code Stop hook: append the last prompt/response pair to .agent-logs/."""
import datetime
import json
import sys
from pathlib import Path


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def extract_text(content):
    """Flatten a transcript message's `content` field to plain text."""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                text = block.get("text", "")
                if text:
                    parts.append(text)
        return "\n".join(parts).strip()
    return ""


def last_prompt_and_response(transcript_path):
    """Scan the session JSONL and return (last user text, last assistant text).

    Only a fallback for the response half: the transcript file writes
    asynchronously and can lag behind the Stop event, so the hook payload's
    own `last_assistant_message` field is preferred when present.
    """
    last_user = None
    last_assistant = None
    try:
        lines = Path(transcript_path).read_text().splitlines()
    except OSError:
        return None, None

    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue

        message = entry.get("message") or {}
        entry_type = entry.get("type")

        if entry_type == "user" and message.get("role") == "user" and not entry.get("isMeta"):
            text = extract_text(message.get("content"))
            if text:
                last_user = text
        elif entry_type == "assistant" and message.get("role") == "assistant":
            text = extract_text(message.get("content"))
            if text:
                last_assistant = text

    return last_user, last_assistant


def main():
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        payload = {}

    session_id = payload.get("session_id", "unknown-session")
    transcript_path = payload.get("transcript_path")

    last_user, last_assistant = (None, None)
    if transcript_path:
        last_user, last_assistant = last_prompt_and_response(transcript_path)

    if payload.get("last_assistant_message"):
        last_assistant = payload["last_assistant_message"]

    date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
    logfile = Path(".agent-logs") / f"{date}_{session_id}.md"
    logfile.parent.mkdir(parents=True, exist_ok=True)

    timestamp = now_iso()
    with open(logfile, "a", encoding="utf-8") as f:
        f.write(f"[LOG_ENTRY type=PROMPT session={session_id}]\n")
        f.write(f"timestamp: {timestamp}\n\n")
        f.write((last_user or "(no user message found in transcript)") + "\n\n")
        f.write(f"[LOG_ENTRY type=RESPONSE session={session_id}]\n")
        f.write(f"timestamp: {timestamp}\n\n")
        f.write((last_assistant or "(no assistant response found in transcript)") + "\n\n")


if __name__ == "__main__":
    main()
