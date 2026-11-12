---
name: feedback-panel
description: Put a long list of items in front of Daniel as a local tick-box web page (search, filter, per-item notes, "Claude suggests" tags, autosave), then read back exactly what he ticked and act on it, round after round. Use whenever a decision covers more items than a terminal multiple-choice question can hold - "which of these should I remove/keep/archive", reviewing dozens of packages, plugins, repos, files, emails, skills, MCP servers, tasks, bookmarks - or when Daniel says "make me a feedback panel", "give me a checklist to tick", "let me tick them in a page", "I've ticked them", "done with the panel".
---

# Feedback panel

A local page Daniel ticks through; a JSON file Claude reads. Nothing leaves the machine: the server
binds 127.0.0.1 only and accepts writes only from its own page.

CLI: `feedback-panel` (on PATH on Daniel's machines via `~/.local/bin`; the source is
`~/repos/github/ai-agents-and-prompts/ai-claude-plugins/Feedback-Panel/bin/feedback-panel`,
stdlib Python). If it is missing: `gh repo clone danielrosehill/Feedback-Panel
~/repos/github/ai-agents-and-prompts/ai-claude-plugins/Feedback-Panel && ln -sf
~/repos/github/ai-agents-and-prompts/ai-claude-plugins/Feedback-Panel/bin/feedback-panel ~/.local/bin/`.
Format of the items file: `SCHEMA.md` at the plugin root.

## 1. Build the items file

Write `items.json` to the scratchpad: `title`, one-line `instructions`, `mark_label` (what a tick
means: "Remove", "Keep", "Archive", "Uninstall"), and `groups` of `items`. Rules:

- **`id` is what you act on later.** Make it self-describing and unique (`deb:vlc`,
  `flatpak:system:org.gimp.GIMP`, `repo:Foo`, `venv:/abs/path`). Put the exact command or target in
  `meta._remove` (or any `_`-prefixed meta key; those are hidden from the page).
- One group per kind/source, so a whole group can be collapsed or cleared. Put big low-value groups
  last with `"collapsed": true`.
- `size_bytes` when there is one; the page can sort by it.
- **Never pre-tick.** Your opinion goes in `suggested` (a short reason string), either in the
  items or as a separate `{id: reason}` file passed with `--suggest`. Keep reasons factual
  ("duplicate: the .deb is installed too", "3 GB, untouched since 2025-04"). Daniel can press
  "Tick suggested" per group if he agrees.

## 2. Open it

```bash
feedback-panel new items.json [--suggest suggestions.json] [--name short-slug]
```

It starts a background server, opens the page in the default browser and prints the session
directory and URL. Tell Daniel in one line: what is in it, how many items, and that he presses
**Submit** and tells you when done. Then either stop and wait for him, or, if there is other work
to do meanwhile, run `feedback-panel wait <session>` in the background (it exits when he presses
Submit) so you are notified.

## 3. Read the result

```bash
feedback-panel result <session>          # readable: ticked items by group, notes, general note
feedback-panel result <session> --json   # ticked[] / notes_only[] with each item's meta (incl. _remove)
```

`status` is `draft` if he has changed things since the last Submit; read it anyway if he says he
is done. Notes on **unticked** items are instructions too ("keep but update", "ask me"): handle
them, don't ignore them. If a note is ambiguous, ask about that item only.

## 4. Act, and report back into the page

Act on the ticked items (for removals: group by tool, one command per tool, e.g. a single
`apt purge a b c`). After each item, record the outcome; the open page shows it as a coloured tag
within 5 s:

```bash
feedback-panel outcome <session> <id> done "apt purge"
feedback-panel outcome <session> <id> failed "held back: needed by X"
feedback-panel outcome <session> <id> skipped "note said keep"
```

Then give Daniel a short summary in chat (done / failed / skipped counts and anything that needs
him). For another round, he can keep ticking in the same page and Submit again (`rounds`
increments), or build a fresh items file and run `new` again.

## Other commands

`feedback-panel status|open|stop [session]`, `feedback-panel list`. `<session>` defaults to the
newest; a unique substring of its directory name works. Sessions live in
`~/.local/share/feedback-panel/sessions/` (override: `FEEDBACK_PANEL_HOME`). Stop the server when
the review is finished.
