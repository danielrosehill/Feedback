---
name: text-review
description: Get the user's feedback on a text by voice - a script (podcast, video), a draft, an essay, a post, a prompt, Markdown or plain text - in a local page where they select words, a paragraph or a section and talk (or type), then transcribe, read the comments anchored to exact character ranges and source lines, edit the file, and run the next round. Use when the user must review words you wrote, says "let me give feedback on the script", "I'll talk through my notes on the draft", "review round on the text".
---

# Text review (voice comments on plain text or Markdown)

Follows `FRAMEWORK.md` at the plugin root. Same loop as `document-review`, without a PDF.

## 1. Open

```bash
feedback text <file.md|file.txt> --title "<what it is, version>"          # --preset text (default)
feedback text script.md --preset script --title "Episode 12 script v2"    # adds Delivery, Timing, Pacing + read-aloud times
```

`.md` files are rendered as Markdown (headings, lists, emphasis, links, code); anything else as
plain text with its line breaks kept (`--markdown` to force). Tell the user in one line: select
words then **Comment on selection**, click a **¶ number** for a paragraph, **🎙 Section** on a
heading, **Whole text** for overall points; tag a category, pick a verdict, **Submit round**.
Run `feedback wait` in the background.

## 2. Transcribe and read

```bash
feedback transcribe
feedback result            # or --json: anchor {start, end, lines, quote, prefix, suffix, section}
```

- Each comment is about exactly `source[start:end]` (lines shown); `prefix`/`suffix` let you
  re-find it if the file changed.
- Category says what kind of change (Wording, Structure, Tone, Facts; for scripts also Delivery,
  Timing, Pacing); a Wording intent says how (Rephrase, Replace, Delete, Insert, Keep as is).
- Verdict: Approve as is → done; Approve with these changes → apply and finish; Needs another
  round → apply, save a new version, open it.

## 3. Act and report

Edit the source file (keep the previous version if it was shared), then
`feedback outcome <session> <id> done|skipped|failed "what you did"` per comment, and open the
next version with `feedback text` for the next round.
