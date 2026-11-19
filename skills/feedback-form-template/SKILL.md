---
name: feedback-form-template
description: Spin up a feedback form from a ready-made template instead of designing one - Remove / Keep for now / Ask me, Keep / Archive / Delete, Approve / Revise / Reject, Now / Soon / Later / Never, Yes / No / Not sure, 1-5 rating, single tick box, or free-text questions - or add a new reusable template when none fits. Use when the user says "I need a feedback form for X with these responses", "give me a form where I can mark each one as ...", "ask me all these questions in a form", or wants a new kind of form available for next time.
---

# Feedback form from a template

Templates live in `~/repos/github/ai-agents-and-prompts/ai-claude-plugins/Feedback-Panel-Templates/templates/<name>/`:

- `form.json`: the answer options and default wording.
- `example-items.json`: what the items look like.

Running them is covered by skill `feedback-panel`.

## Recipe

1. **Match the answers the user asked for to a template.** Run `feedback-panel templates` to list them.

   | He wants | Template |
   |---|---|
   | remove / keep / ask | `remove-keep-ask` |
   | keep / archive / delete | `keep-archive-delete` |
   | approve / change / reject | `approve-reject-revise` |
   | ordering a backlog | `priority` |
   | quick verdicts | `yes-no-unsure` |
   | scoring options | `rating-5` |
   | "tick the ones that ..." | `check` |
   | open questions | `questions` (free text; each item is a question; optional `placeholder`) |

2. **If their answers differ slightly** (other labels, an extra option), don't make a new template.
   Copy the closest template's `choices` into the items file and edit them; the items file wins
   over the template only for title and instructions, so pass **no** `--template` in that case.
   A choice is `{"id", "label", "tone": danger|warn|ok|info|neutral, "hint"}`. Its position sets
   its number key (1, 2, 3…).
3. **Build the items** as in `feedback-panel` step 1. `feedback-panel template <name>` shows the
   template and its example.
4. **Open it:** `feedback-panel new items.json --template <name> [--suggest s.json]`.

## Adding a template

When the user wants a new kind of form to stay available, or the same custom choices come up a
second time:

```bash
T=~/repos/github/ai-agents-and-prompts/ai-claude-plugins/Feedback-Panel-Templates
mkdir -p $T/templates/<name>      # lowercase-kebab, named after its answers
```

Write `form.json` with these fields:

- `name`, `description`
- `use_for`: one line on when to use it
- `title`: may use `{date}` and `{host}`
- `instructions`
- `input`: `choice`, `check` or `text`
- `choices`
- `suggest_choice`: what a bare suggestion means

Then write `example-items.json` with 1-2 items, and add a row to the README table. Commit with
explicit paths and push. Templates are generic; a form tied to one task with a recipe for
building its items belongs in `library/` (skill `feedback-form-library`).

A template can also ship its own page: `"page": "page.html"` in `form.json`, with the file next to
it. Only do this when the standard page can't express the form. The page must use the same API:
`GET /api/session`, `POST /api/response` with `{items: {id: {choice, note, value}}, general_note,
submit}`, and `GET /api/outcomes`. Start from a copy of the plugin's `panel/index.html`.
