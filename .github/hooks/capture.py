#!/usr/bin/env python3
"""
Called by Copilot's userPromptSubmitted and agentStop hooks (see
capture-hooks.json). Copilot posts JSON on stdin for each hook event; the
exact field names for that JSON aren't published in the docs I could reach,
so this tries several plausible keys and, if none match, dumps the raw
payload into the log instead of silently losing the entry. If you see the
raw-payload fallback during the canary test, open .agent-logs/ to see the
actual field name Copilot used and add it to CANDIDATE_KEYS below.
"""
import sys, json, os, datetime

CANDIDATE_KEYS = ["prompt", "text", "content", "message", "response",
                  "output", "finalResponse", "value", "userPrompt"]


def read_state(name, default):
    path = os.path.join(".github", "hooks", name)
    if os.path.exists(path):
        return open(path).read().strip()
    return default


def extract_text(data):
    if not isinstance(data, dict):
        return None
    for key in CANDIDATE_KEYS:
        v = data.get(key)
        if isinstance(v, str) and v.strip():
            return v
        if isinstance(v, dict):
            for k2 in ("text", "content"):
                v2 = v.get(k2)
                if isinstance(v2, str) and v2.strip():
                    return v2
        if isinstance(v, list):
            texts = [b.get("text", "") for b in v if isinstance(b, dict) and b.get("text")]
            if texts:
                return "\n".join(texts)
    return None


def main():
    kind = sys.argv[1] if len(sys.argv) > 1 else "prompt"
    try:
        raw = sys.stdin.read()
        data = json.loads(raw) if raw.strip() else {}
    except Exception:
        data = {}

    session_id = read_state(".current-session", "unknown-session")
    date = read_state(".current-date", datetime.datetime.utcnow().strftime("%Y-%m-%d"))
    now = datetime.datetime.utcnow().isoformat() + "Z"

    os.makedirs(".agent-logs", exist_ok=True)
    logfile = f".agent-logs/{date}_{session_id}.md"
    label = "PROMPT" if kind == "prompt" else "RESPONSE"
    text = extract_text(data)

    with open(logfile, "a") as f:
        f.write(f"[LOG_ENTRY type={label} session={session_id}]\n")
        f.write(f"timestamp: {now}\n\n")
        if text:
            f.write(text.strip() + "\n\n\n")
        else:
            f.write(
                "(no known field matched \u2014 raw hook payload below; "
                "check the field name and add it to CANDIDATE_KEYS in "
                "capture.py)\n"
            )
            f.write("```json\n" + json.dumps(data, indent=2)[:4000] + "\n```\n\n\n")


if __name__ == "__main__":
    main()
