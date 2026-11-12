# items.json schema

```jsonc
{
  "title": "Installed software on danieldesktop",      // page heading
  "instructions": "Tick what should be removed.",      // shown under the heading
  "mark_label": "Remove",                              // what a tick means (default "Ticked")
  "groups": [
    {
      "name": "Flatpaks",                              // section heading
      "description": "optional sentence under the heading",
      "collapsed": false,                              // start folded
      "items": [
        {
          "id": "flatpak:system:org.gimp.GIMP",        // required, unique; what Claude acts on
          "label": "GIMP",                             // required
          "detail": "org.gimp.GIMP",                   // optional second line (clamped to 2 lines)
          "size_bytes": 269000000,                     // optional; enables size sort
          "meta": {                                    // optional chips "key: value"
            "version": "3.0.4",
            "_remove": "flatpak uninstall ..."         // keys starting with _ are hidden
          },
          "tags": ["duplicate"],                       // optional chips
          "suggested": "duplicate of the .deb"         // optional: Claude's tag (string or true)
        }
      ]
    }
  ]
}
```

Extra top-level keys are kept and ignored by the page.

# response.json (written by the page)

```jsonc
{
  "status": "submitted",            // "draft" after any edit since the last Submit
  "general_note": "...",
  "items": { "<id>": { "marked": true, "note": "..." } },   // only ticked or annotated items
  "updated": "...", "created": "...", "submitted_at": "...",
  "rounds": 1                       // number of Submits
}
```

# outcomes.json (written by `feedback-panel outcome`)

```jsonc
{ "<id>": { "state": "done|skipped|failed", "text": "...", "at": "..." } }
```
