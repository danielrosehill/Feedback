# Feedback-Panel

A Claude Code plugin for decisions with too many items for a terminal multiple-choice
question. Claude writes a list of items as JSON. `feedback-panel` serves it as a local web page
with tick boxes, search, filters, per-item notes and "Claude suggests" tags. Your ticks autosave
to a JSON file that Claude reads back and acts on. Claude then writes an outcome for each item,
which the open page shows.

```
Claude ──items.json──▶ feedback-panel new ──▶ browser page (tick, note, Submit)
                                                   │ autosave
Claude ◀── feedback-panel result ◀── response.json ┘
Claude ──feedback-panel outcome──▶ outcomes.json ──▶ page shows done / failed / skipped
```

- Stdlib Python 3, no dependencies. The server binds `127.0.0.1` and rejects cross-origin writes.
- One session per review: `~/.local/share/feedback-panel/sessions/<date>-<slug>/`.
- `feedback-panel wait` blocks until you press Submit, so Claude can be notified rather than told.

## Install

```bash
git clone https://github.com/danielrosehill/Feedback-Panel
ln -sf "$PWD/Feedback-Panel/bin/feedback-panel" ~/.local/bin/
```

Skill: `skills/feedback-panel/SKILL.md`. Format: `SCHEMA.md`. Try it:
`feedback-panel new examples/demo-items.json`.

## Used by

- `endpoint-management` › `software-inventory`: every program installed on a Linux machine (apt,
  snap, flatpak, AppImage, /opt, brew, pipx, uv, npm, cargo, venvs, containers), ready for "tick
  what to remove".
