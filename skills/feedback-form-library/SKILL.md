---
name: feedback-form-library
description: the user's library of saved feedback forms - forms that worked well enough to keep, each with its answer options and a recipe for rebuilding its items (e.g. software-review - every installed program, Remove / Keep for now / Ask me). Run a saved form again, or save the current feedback-panel session into the library. Use on "run the software review again", "use the form we had for X", "what forms do we have saved", "keep this form", "save this to the library", "this one's great, let's keep it".
---

# Feedback form library

The library is `library/<category>/<name>/` (e.g. `library/system-maintenance/software-review`) in
the forms repo: `../Feedback-Forms` next to the plugin, or `FEEDBACK_FORMS`. The same repo holds
`templates/`, open forms (`review/`) and closed ones (`done/`). Each library entry holds:

- `form.json`: answer options, wording with `{host}`/`{date}` placeholders, and an optional
  `generator` command.
- `recipe.md`: when to use it, how to build the items, what to suggest, and what each answer means
  in practice.
- `example-items.json`: a few items, showing the shape.

To list it: `feedback-panel templates` (the `## library` section).

## Run a saved form

1. Read the recipe first: `feedback-panel template <name>`. It's how the form was meant to run;
   follow it rather than improvising.
2. Build the items:
   - If `form.json` has a `generator`, run it with `OUT` set to a scratchpad path. For example,
     software-review uses `OUT=$SCRATCH/items.json; software-inventory --out "$OUT"`.
   - Otherwise gather the items the way the recipe says.
3. Write the suggestions the recipe asks for, then open the form:
   `feedback-panel new "$OUT" --template <name> --suggest $SCRATCH/suggestions.json`.
4. Continue with skill `feedback-panel` from step 2. Act on the answers as the recipe's "Acting on
   the answers" section says.
5. If anything in the recipe turned out wrong or missing (a new heuristic, a step that failed),
   fix `recipe.md` and commit. The library should improve each time it's used.

## Save a session to the library

When the user says to keep a form, or answers yes to the "keep this form?" offer:

```bash
feedback-panel save <session> <name> [--generator 'cmd writing items.json to "$OUT"'] [--description "one line"]
```

- `<name>` is `<category>/<task>` in lowercase-kebab (`system-maintenance/btrfs-snapshots`,
  `plugins/prune`). Reuse an existing category where one fits; each category has a README
  table of its forms (add a row).
- `save` writes `form.json` (keeping `{host}`/`{date}` placeholders where they came from a
  template), the `page.html` if there is one, a 3-item `example-items.json`, and a skeleton
  `recipe.md`.
- Add `--force` to update an existing entry.

Then **fill in `recipe.md` yourself while you still have the context**:

- **When to use:** the request that should bring this form back.
- **Build the items:** the exact commands or sources you used. If they were ad-hoc and the form
  will recur, turn them into a script: put it in the owning plugin and reference it as the
  `generator`.
- **Suggestions:** the heuristics you tagged by.
- **Acting on the answers:** what each choice triggers, and where outcomes get recorded.

Finally commit and push with explicit paths:

```bash
git -C <templates repo> add library/<category>
git -C <templates repo> commit -m "library: <name>"
git -C <templates repo> push
```
