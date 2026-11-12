# Local page + localhost server, not a static HTML file or a hosted artifact

**Date:** 2026-11-12
**Status:** chosen

## Context
Daniel wants to tick through long lists (installed software, plugins) and have Claude act on the
ticks, invoked repeatedly as a reusable skill. The terminal's multiple-choice question tops out at a
handful of options.

## Options considered
- **Static HTML + localStorage, with a copy/export button.** No server. But results only reach
  Claude if Daniel copies or downloads them, and nothing can flow back into the page.
- **Hosted claude.ai artifact with a shared database.** Claude reads the results directly. But the
  lists are often machine inventories, which shouldn't leave the LAN, and it depends on that
  surface being available.
- **Local stdlib server (chosen).** It autosaves ticks to `response.json`, which Claude reads
  directly. `wait` tells Claude when Daniel presses Submit, and outcomes flow back into the open page.
  It works offline and nothing leaves the machine.
- **Native GUI (Qt).** More work, and adds nothing a browser page can't already do.

## Decision
Local server. It's the only option where results reach Claude with no copy step and the data
stays local.

## Consequences
A background process per open session (`feedback-panel stop` ends it). Only reachable on the
machine it runs on. Reviewing from the phone would need a LAN bind, which is deliberately not
offered yet.
