# Answer sets, templates in a separate repo, and a library of kept forms

**Date:** 2026-11-12
**Status:** chosen

## Context
A single tick box can't express "remove / keep for now / ask me". The user also wants ready-made
forms so each one isn't designed from scratch, and a way to keep good forms (e.g. the software
review) and rerun them later.

## Options considered
- **Templates inside the plugin repo.** One repo. But kept forms are the user's data, they change
  often, and they would force plugin version bumps.
- **A separate templates repo (chosen).** It holds only data: `templates/` (generic) and
  `library/` (kept forms, with a recipe for each). The plugin stays code plus skills.
- **One HTML file per template.** Most flexible, but every form would be a fork of the page.
  Instead there's one page with three input modes (`choice`, `check`, `text`); a template may ship
  its own page only when the standard one can't express it.

## Decision
Answer sets are data (`choices`) on one standard page, stored in a sibling repo with `templates/`
and `library/`. `feedback-panel save` turns a session into a library entry with a skeleton recipe.
Claude fills in the recipe while it still has the context.

## Consequences
- The templates repo must be cloned next to the plugin, or `FEEDBACK_PANEL_TEMPLATES` set.
- A library form is only as reusable as its recipe. The library skill requires fixing the recipe
  after every run that finds something missing.
