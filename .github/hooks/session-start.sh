#!/usr/bin/env bash
# Fires on Copilot's sessionStart hook. Creates a session id and the
# session's log file header, so the prompt/response hooks below have
# somewhere consistent to append to.
set -e
SID=$(python3 -c "import uuid; print(str(uuid.uuid4())[:8])")
DATE=$(date -u +%Y-%m-%d)
mkdir -p .github/hooks .agent-logs
echo -n "$SID" > .github/hooks/.current-session
echo -n "$DATE" > .github/hooks/.current-date

LOGFILE=".agent-logs/${DATE}_${SID}.md"
if [ ! -f "$LOGFILE" ]; then
  {
    echo "---"
    echo "session_id: $SID"
    echo "date: $DATE"
    echo "model: github-copilot"
    echo "tool: copilot-cli"
    echo "---"
    echo ""
    echo "# Session Log - $DATE"
    echo ""
  } >> "$LOGFILE"
fi
