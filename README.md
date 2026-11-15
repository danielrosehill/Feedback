# Feedback-Panel

A Claude Code plugin for decisions with too many items for a terminal multiple-choice question.
Claude writes the items as JSON. `feedback-panel` serves them as a local web form, where each item
gets one answer from a set (e.g. **Remove / Keep for now / Ask me**), a single tick box, or a
free-text reply. The form has search, filters, per-item notes, "Claude suggests" tags and number
keys. Answers autosave to a JSON file that Claude reads back and acts on. Claude then writes an
outcome for each item, which the open page shows.

![The software-review form part-way through: Remove / Keep for now / Ask me per item, with per-answer counts, filters and number-key hints](docs/screenshot.png)

```
template / library form ─┐
Claude ──items.json──────┴▶ feedback-panel new ──▶ browser form (answer, note, Submit)
                                                        │ autosave
Claude ◀── feedback-panel result ◀── response.json ─────┘
Claude ──feedback-panel outcome──▶ outcomes.json ──▶ page shows done / failed / skipped
```

- Stdlib Python 3, no dependencies. The server binds `127.0.0.1` and rejects cross-origin writes.
- One session per review in `~/.local/share/feedback-panel/sessions/`. `feedback-panel wait`
  blocks until Submit.
- Forms come from the sibling repo
  [Feedback-Panel-Templates](https://github.com/danielrosehill/Feedback-Panel-Templates):
  - `templates/`: generic answer sets.
  - `library/`: forms worth keeping, each with a recipe for rebuilding its items.
  - `feedback-panel save` puts a good session into the library.

## Diagram review

For architecture diagrams, network maps and ER diagrams: the form *is* the diagram. Any Graphviz
`.dot` file becomes a pan-and-zoom page where every box, connection and zone (cluster) is
clickable. Pick an answer (the `architecture-review` template: **Fine / Rethink / Move / Remove /
Explain**) and/or write a note; marked elements get a coloured outline and a badge, the side panel
lists what each element connects to, and a running list of your comments jumps back to each one.

![Diagram review of the Home Canopy poster: the gateway marked Move with a note, a connection and the Cloudflare zone marked Rethink, catalogue selected with its connections listed](docs/diagram-review.png)

```bash
feedback-panel diagram a.dot b.dot --font-dir fonts/ -o items.json   # one tab per file
feedback-panel new items.json --template architecture-review
```

- Item ids are `<file-stem>:node:<name>`, `<file-stem>:edge:<a>-><b>` (`#2`, `#3` for repeats) and
  `<file-stem>:zone:<cluster_name>`, the names from the `.dot` source, so answers map straight back
  to it.
- `--font-dir` makes `dot` measure text with those fonts and embeds them in the page, so labels
  fit their boxes as in the PDF. `--skip NAME` leaves nodes out (default: `legend`; it is still drawn).
- If the `.dot` is generated (by a build script), the edit belongs in the generator, not the `.dot`.

## Skills

| Skill | For |
|---|---|
| `feedback-panel` | The loop: build items, open, read the result, act, report outcomes, offer to keep the form |
| `feedback-form-template` | Pick a template for the answers Daniel wants, or add a new template |
| `feedback-form-library` | Run a saved form from its recipe, or save a session into the library |

## Install

```bash
cd ~/repos/github/ai-agents-and-prompts/ai-claude-plugins
gh repo clone danielrosehill/Feedback-Panel
gh repo clone danielrosehill/Feedback-Panel-Templates     # found as ../Feedback-Panel-Templates
ln -sf "$PWD/Feedback-Panel/bin/feedback-panel" ~/.local/bin/
```

Override locations with `FEEDBACK_PANEL_TEMPLATES` and `FEEDBACK_PANEL_HOME`. Format: `SCHEMA.md`.

## Used by

- `endpoint-management` › `software-inventory`: every installed program on a Linux machine.
  Its form is the library entry `software-review`.
