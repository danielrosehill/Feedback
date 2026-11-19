---
name: document-review
description: Get the user's feedback on a document by voice - open the PDF as a local page where they click a spot and talk (or type), comments pinned to page, line and paragraph, plus "this page" and "whole document" - then transcribe the recordings, read the structured feedback, revise, report per-comment outcomes and open the next round. Use whenever the user must review a draft, letter, report, statement, paper or any document you produced, or says "let me give feedback on the PDF", "I want to talk through my comments", "voice notes on the document", "review round".
---

# Document review (voice comments on a PDF)

Follows `FRAMEWORK.md` at the plugin root: voice first, point then talk, pluggable transcription,
structured results, close the loop.

## 1. Open

```bash
feedback document <file.pdf> --title "<what it is, version>"
```

- Not a PDF yet? Export it first (Typst/LaTeX compile, `pandoc`, LibreOffice
  `soffice --headless --convert-to pdf`).
- Tell the user in one line: click a spot and talk, **Stop** or Esc to finish a comment,
  "This page" / "Whole document" for broader comments, then **Submit round**.
- Run `feedback wait` in the background (it returns on Submit), or wait for the user to say
  they're done.

## 2. Transcribe

```bash
feedback transcribe            # every recording that has no transcript yet
```

The backend comes from `$FEEDBACK_PANEL_HOME/config.json` (`asr.url`, `model`, `key_env`) or
`FEEDBACK_ASR_*`. If none is set, or it fails twice, use any transcription route you have: run
`feedback transcribe --list` to get the files, transcribe them, then store each result with
`feedback set-transcript <session> <id> -f out.txt --by <engine>`. Don't run heavy local models on a
machine the user has said not to load.

## 3. Read and act

```bash
feedback result                # reading order: anchor (line + paragraph), what they said, what they wrote
feedback result --json         # same, as records
```

- Treat each comment as an instruction about its anchor. "Whole document" comments come first and
  usually set the direction for the rest.
- If a transcript is ambiguous, play nothing back and don't guess. Ask about that comment by
  number, quoting the transcript.
- Make the changes in the **source** (not the PDF), rebuild, and keep the previous version.

## 4. Report and go again

```bash
feedback outcome <session> <id> done "rewrote §A as prose"     # or skipped / failed, with why
```

Then open the new version as a fresh session (`feedback document new.pdf --title "... v4"`) and say
in one line what changed. A round is done when the user submits with no new comments, or says so.

## Notes

- Anchor text is cut from the PDF with `pdftotext` per line and paragraph, so Hebrew and Arabic come
  out in reading order. Pins in margins or on images have no anchor text; use the page number.
- Audio is kept in the session folder (`audio/<id>.webm`) next to the transcript.
- Sessions live in `~/.local/share/feedback-panel/sessions/` (old name kept for compatibility).
