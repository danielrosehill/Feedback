# Feedback: agent notes

Public plugin `feedback` (repo `danielrosehill/Feedback`, renamed from Feedback-Panel 2026-11-19).
Voice-first feedback from a person to an agent on anything the agent made. **Read `FRAMEWORK.md`
first**; every mode follows it.

- CLI `bin/feedback` (stdlib Python, one file). `bin/feedback-panel` is a compat symlink. Modes:
  `new` (list forms), `diagram` (Graphviz), `document` (PDF, voice comments). Pages in `panel/`.
- Decisions in `planning/decisions/` (001-004). Item format: `SCHEMA.md`.
- Generic only: no personal names, hosts, IPs or private repo names in code or skills. A user's
  own settings (ASR endpoint, templates repo) live outside the repo:
  `$FEEDBACK_PANEL_HOME/config.json`, `FEEDBACK_PANEL_TEMPLATES`.
- Keep old names working (session dir `~/.local/share/feedback-panel`, `FEEDBACK_PANEL_*` env vars,
  the `feedback-panel` command): other plugins call them.
- Bump `version` in `.claude-plugin/plugin.json` when behaviour or skills change.
- Planned modes: audio and video (comments pinned to timestamps), per FRAMEWORK.md rule 2.
