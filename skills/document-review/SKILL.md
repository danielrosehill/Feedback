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
- Categories: `--preset designed` (default: Wording, Structure, Typography, Colour, Layout &
  spacing, Images & charts) for laid-out documents, `--preset text` (Wording, Structure, Tone,
  Facts) for prose, or `--categories "A,B,C"`.
- Tell the user in one line: Text (drag across words), Area (draw a box) or Pin, then talk;
  Stop or Esc ends a comment; tag a category; "Whole document" for overall points; pick a
  verdict and **Submit round**.
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

- Treat each comment as an instruction about its anchor: a text comment is about exactly the
  `selected` quote; an area comment about that region's look; the category says which dimension
  (wording vs typography vs layout) to change, the intent how (rephrase, delete ...).
  "Whole document" comments come first and usually set the direction for the rest.
- The **verdict** decides what happens next: Approve as is → finalise (or send); Approve with these
  changes → apply them and finalise without another round; Needs another round → apply, rebuild,
  open the next version.
- A comment with no category: suggest one from the transcript when you report back.
- If a transcript is ambiguous, play nothing back and don't guess. Ask about that comment by
  number, quoting the transcript.
- Make the changes in the **source** (not the PDF), rebuild, and keep the previous version.

## 4. Report and go again

```bash
feedback outcome <session> <id> done "rewrote §A as prose"     # or skipped / failed, with why
```

Then open the new version as a fresh session (`feedback document new.pdf --title "... v4"`), close
the previous one (`feedback done <old session>`), and say in one line what changed. A round is done when the user submits with no new comments, or says so.

## Notes

- Anchor text is cut from the PDF with `pdftotext` per line and paragraph, so Hebrew and Arabic come
  out in reading order. Pins in margins or on images have no anchor text; use the page number.
- Audio is kept in the session folder (`audio/<id>.webm`) next to the transcript.
- Forms are served by the one shared server and live in the forms repo's `review/`, then `done/`
  (skill `feedback-panel` › Where forms live). Close each round's form once the next is open.
