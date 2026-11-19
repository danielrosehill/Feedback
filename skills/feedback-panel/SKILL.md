---
name: feedback-panel
description: Put a long list of items in front of the user as a local web form (one answer per item from a set like Remove / Keep for now / Ask me, a single tick box, or free text; search, filters, notes, "Claude suggests" tags, autosave), then read back exactly what they chose and act on it, round after round. Use whenever a decision covers more items than a terminal multiple-choice question can hold - reviewing dozens of packages, plugins, repos, files, emails, skills, MCP servers, tasks - or many open questions at once; or when the user says "make me a feedback panel/form", "give me a checklist", "let me tick them in a page", "I've ticked them", "done with the panel". Start from a template or a saved library form (skills feedback-form-template, feedback-form-library).
---

# Feedback panel

A local page the user works through and a JSON file Claude reads. Nothing leaves the machine: the
server binds 127.0.0.1 and accepts writes only from its own pages.

- CLI `feedback` (alias `feedback-panel`), stdlib Python, on PATH via `~/.local/bin`; source
  `<plugin root>/bin/feedback`. If it's missing: `ln -sf <plugin root>/bin/feedback ~/.local/bin/`.
- Templates, the library and the forms themselves: the forms repo (below).
- For feedback on a document (PDF), use skill `document-review` instead; principles in `FRAMEWORK.md`.
- Item format: `SCHEMA.md` at the plugin root.
- If either repo is missing, `gh repo clone` it to that path, then
  `ln -sf <Feedback>/bin/feedback ~/.local/bin/`.

## Where forms live: one server, one port, review → done

Every form (lists, diagrams, documents, text, email) is served by **one shared local server on a
fixed port** (default 8790; `"port"` in `$FEEDBACK_PANEL_HOME/config.json` or `FEEDBACK_PORT`).
Never start a server per form and never pick a port: `feedback new|text|document|email` start the
shared server if needed (and replace it when the plugin code changed) and print the form's URL,
`http://127.0.0.1:8790/f/<session>/`. `http://127.0.0.1:8790/` lists every open form.

Forms live in the forms repo (`../Feedback-Forms` next to the plugin, or `FEEDBACK_FORMS` /
`"forms_repo"` in config.json), which also holds `templates/` and `library/`:

- `review/<session>/`: open forms, waiting for the user (gitignored).
- `done/<session>/`: closed forms, committed as a record.

Close a form with `feedback done <session>` as soon as it's acted on: the last outcome is written,
the user has moved on, or you open the next version of the same thing (document v4 → close v3).
Then commit `done/<session>` in the forms repo and push. `feedback reopen <session>` brings one
back. A done form stays viewable at its URL. Leave nothing in `review/` that isn't waiting for the user.

## 0. Pick the form first

- `feedback-panel templates` lists the generic **templates** (remove-keep-ask,
  keep-archive-delete, approve-reject-revise, priority, yes-no-unsure, rating-5, check, questions)
  and the user's saved **library** forms.
- If a library form fits the request, use it: skill `feedback-form-library`. It carries its own
  recipe for building the items.
- Otherwise pick the template whose answers match what the user asked for: skill
  `feedback-form-template`.
- If the user names their own answers ("remove, keep for now, ask me"), use a template with those choices
  or put `choices` straight into the items file.

## 1. Build the items file

Write `items.json` to the scratchpad with `groups` of `items`; see `SCHEMA.md`. Answer options
come from the template; don't repeat them in the items file.

- **`id` is what you act on later.** Make it self-describing (`deb:vlc`,
  `flatpak:system:org.gimp.GIMP`, `repo:Foo`, `venv:/abs/path`). Put the exact command or target
  in a hidden `meta._remove` (any `_`-prefixed key is hidden).
- One group per kind or source. Put big, low-value groups last with `"collapsed": true`.
- Add `size_bytes` where an item has a size, so the page can sort by it.
- **Never pre-answer.** Your opinion goes in a suggestions file passed with `--suggest`, in one of
  two forms:
  - `{id: "reason"}` suggests the form's default `suggest_choice`.
  - `{id: {"choice": "ask", "reason": "..."}}` suggests a specific answer.

  Keep reasons factual ("duplicate: the .deb is installed too", "3 GB, untouched since 2025-04").
  The user can press "Apply suggestions" for each group.

### Diagrams: review an architecture element by element

When the thing to review is a diagram (architecture, network, ER, any Graphviz `.dot`), don't
list its parts: make the diagram the form.

```bash
feedback-panel diagram a.dot [b.dot ...] [--font-dir DIR] [--label NAME ...] -o items.json
feedback-panel new items.json --template architecture-review [--suggest s.json]
```

Every node, edge and cluster becomes an item (`<stem>:node:<name>`, `<stem>:edge:<a>-><b>`,
`<stem>:zone:<cluster>`); one tab per file. The user clicks elements on the diagram, answers
Fine / Rethink / Move / Remove / Explain and writes notes; a note with no answer is normal here,
so read `notes_only` in the result as well. Suggestions (`--suggest`) show as tags on the element.
Act on the diagram's *source*: when the `.dot` is generated, edit the generator, rebuild, and run a
fresh `diagram` + `new` for the next round.

## 2. Open it

```bash
feedback-panel new items.json --template <name> [--suggest suggestions.json] [--name slug]
```

This puts the form in `review/`, makes sure the shared server is up, opens the page and prints the
session directory and URL. Tell
The user in one line what's in it, how many items there are, and to press **Submit**. Then wait for
them, or run `feedback-panel wait <session>` in the background (it exits on Submit) if you have
other work to do meanwhile.

## 3. Read the result

```bash
feedback-panel result <session>          # answers grouped by choice, notes, free-text answers
feedback-panel result <session> --json   # by_choice{choice: [rows]}, answers[], notes_only[], with meta (incl. _remove)
```

- `status: draft` means the user changed something since the last Submit. Read it anyway if they say
  they're done.
- Notes are instructions, including notes on unanswered items. If one is ambiguous, ask about that
  item only.

## 4. Act, then report back into the page

Act per choice; for removals, batch by tool. After each item:

```bash
feedback-panel outcome <session> <id> done|failed|skipped "what happened"
```

The open page shows each outcome as a coloured tag within 5 s. Then give a short summary in chat.

### Repeating rounds

One session serves a list that is worked through over several rounds: the user answers a batch,
Submits, Claude acts, the user answers the next batch on the same page.

- Items whose outcome is `done` drop out of the page (every view except "With outcome" and
  "Finished"); groups with nothing left disappear; the header shows "N finished, hidden". Bulk
  buttons never touch finished items. `skipped` and `failed` items stay visible.
- `feedback-panel wait <session> --next` blocks until a Submit newer than the current round
  (plain `wait` returns at once on an already-submitted session). Run it in the background.
- `feedback-panel result <session> --new [--json]` lists only answers with no outcome yet (or a
  `failed` one), i.e. what this round adds. Act on that, write outcomes, then `wait --next` again.

## 5. Offer to keep the form

If this form wasn't from the library and is likely to come back (a periodic review, a recurring
triage), ask in one line: "Keep this form in the library as `<name>`?" On a yes, follow
`feedback-form-library` › Save. Don't ask for one-off lists.

Then close it: `feedback done <session>`, commit `done/<session>` in the forms repo, push.

## Other commands

- `feedback status|open [session]`: check a form, reopen its page.
- `feedback done <session>...` / `feedback reopen <session>`: move between `review/` and `done/`.
- `feedback list [--all]`: open forms (`--all` adds done ones).
- `feedback server status|start|stop|restart`: the shared server. Leave it running; it's one process.
- `feedback migrate`: move sessions from the old `~/.local/share/feedback-panel/sessions/` into
  `done/` (skips any whose old per-form server is still running).
- `<session>` defaults to the newest; a unique substring of its name also works (open forms win).
