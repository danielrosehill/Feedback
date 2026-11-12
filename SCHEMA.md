# items.json schema

A form is answer options plus items. Answer options normally come from a template
(`--template`); an items file can also carry them itself.

```jsonc
{
  "title": "Installed software on danieldesktop",      // page heading ({host}/{date} filled from templates)
  "instructions": "...",                               // shown under the heading

  // --- how items are answered (usually from the template) ---
  "input": "choice",                                   // choice | check | text
  "choices": [                                         // input=choice: one per item, click again to clear
    { "id": "remove", "label": "Remove", "tone": "danger", "hint": "tooltip" },
    { "id": "keep",   "label": "Keep for now", "tone": "ok" },
    { "id": "ask",    "label": "Ask me", "tone": "warn" }
  ],                                                   // tones: danger warn ok info neutral; order = number keys 1..n
  "mark_label": "Remove",                              // input=check: what a tick means
  "suggest_choice": "remove",                          // what a bare suggestion recommends (default: first choice)

  "groups": [
    {
      "name": "Flatpaks",
      "description": "optional sentence under the heading",
      "collapsed": false,
      "choices": [ ... ],                              // optional per-group override of the choices
      "items": [
        {
          "id": "flatpak:system:org.gimp.GIMP",        // required, unique; what Claude acts on
          "label": "GIMP",                             // required
          "detail": "org.gimp.GIMP",                   // optional second line (clamped to 2 lines)
          "size_bytes": 269000000,                     // optional; enables size sort
          "meta": { "version": "3.0.4", "_remove": "flatpak uninstall ..." },  // chips; _keys hidden
          "tags": ["duplicate"],
          "placeholder": "...",                        // input=text: hint in the answer box
          "suggested": "duplicate of the .deb",        // Claude's tag (usually via --suggest)
          "suggested_choice": "ask"                    // optional: which choice the tag recommends
        }
      ]
    }
  ]
}
```

`--suggest s.json` takes `{id: "reason"}` or `{id: {"choice": "ask", "reason": "..."}}`.

Precedence with `--template`: the template's `input`, `choices`, `mark_label` and
`suggest_choice` win. For `title`, `instructions` and `submit_hint`, the items file wins when it
sets them.

# form.json (templates/<name>/, library/<name>/)

`name`, `description`, `use_for`, `title`, `instructions`, `input`, `choices`, `mark_label`,
`suggest_choice`, `submit_hint`, plus:

- `page`: a custom page file in the same folder.
- Library entries also have `generator` (a command that writes items.json to `$OUT`),
  `based_on` and `saved`.

# response.json (written by the page)

```jsonc
{
  "status": "submitted",            // "draft" after any edit since the last Submit
  "general_note": "...",
  "items": { "<id>": { "choice": "remove", "note": "...", "value": "free text (input=text)" } },
  "updated": "...", "created": "...", "submitted_at": "...",
  "rounds": 1
}
```

Sessions from v0.1 stored `{ "marked": true }`; `result` reads that as the check choice.

# outcomes.json (written by `feedback-panel outcome`)

```jsonc
{ "<id>": { "state": "done|skipped|failed", "text": "...", "at": "..." } }
```
