# One shared form server on a fixed port; forms move review/ → done/ in the forms repo

**Date:** 2026-11-19
**Status:** chosen (supersedes the "background process per open session" consequence of 001)

## Context
The plugin got used many times a day. Each form started its own server on a random free port and
nothing stopped them, so ports and processes piled up (two still running on 2026-11-19, 23
sessions in `~/.local/share/feedback-panel/sessions/`, most finished but indistinguishable from
open ones). The user wanted one predecided port and a lifecycle: forms presented, then moved out
when done, in one repo that also holds the templates and the library.

## Options considered
- **Keep per-form servers, add auto-stop on Submit.** Still a new port per form, and multi-round
  reviews need the page after Submit.
- **One server on a fixed port, forms under `/f/<session>/`, folders as state (chosen).** One
  process; state is visible as folders; a done form is still viewable.
- **systemd user service.** Always-on, but per-machine install work; on-demand start plus
  self-replacement when the code changes gives the same result with no setup.

## Decision
- `feedback server run` on 127.0.0.1:PORT (8790 default; `port` in config.json, `FEEDBACK_PORT`).
  Every create command calls `ensure_server()`: reuse it if `/api/ping` answers with the same code
  stamp (mtime of `bin/feedback`) and forms repo, otherwise replace it. A non-feedback program on the
  port is an error, never a silent fallback to another port.
- Pages use relative URLs so they work under `/f/<session>/` and on legacy `--port N` servers at `/`.
- The templates repo became the forms repo (renamed Feedback-Panel-Templates → Feedback-Forms):
  `templates/`, `library/`, `review/` (open, gitignored), `done/` (committed record; audio, page
  PNGs, attachments and layout.json gitignored as bulky or regenerable).
- `feedback done` / `reopen` move folders; `migrate` moves old sessions into `done/`.

## Consequences
- A form's URL changes from `127.0.0.1:<random>/` to `127.0.0.1:8790/f/<session>/`.
- Old sessions in `~/.local/share/feedback-panel/sessions/` still resolve (state `legacy`).
- Template pages (`page.html` in a template) must use relative URLs.
