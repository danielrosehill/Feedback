# 004: Document review with voice comments; the plugin becomes "Feedback"

Date: 2026-11-19. Status: built (v0.6.0).

**Need.** Review a generated document (first case: a bilingual Hebrew/English statement PDF) with
precise, low-effort feedback. The user's stated preference is voice: record a comment on a
specific section or on the whole document, have it transcribed, and get it back as structured
feedback.

**Decision.**
- A `document` mode in this plugin, not a new plugin. It reuses the session folder, server,
  `wait`, `result`, `outcome` and rounds. The plugin is renamed **Feedback** (repo
  `danielrosehill/Feedback`, CLI `feedback`; `feedback-panel` kept as an alias) because forms
  are now one mode among several. `FRAMEWORK.md` states the rules every mode follows.
- Pages are PNGs from `pdftoppm` served from the session (`/pages/N.png`). Recording uses
  MediaRecorder (Opus/WebM) in the page. `127.0.0.1` is a secure context, so the microphone works
  without TLS. Audio is uploaded to `/api/audio` and stored under `audio/<id>.webm`. Comments
  (`scope` point/page/document, normalised x/y, note, audio) are stored in `comments.json`.
- Anchors are computed at `result` time. `pdftotext -bbox-layout` gives line and block
  rectangles. The text inside them is then cut out with plain `pdftotext -x -y -W -H`, because the
  bbox words of right-to-left scripts come out in visual (reversed) order. Bidi control characters
  are stripped. The nearest line is ranked by vertical distance, with horizontal distance at a
  tenth of the weight, and a pin more than 30 pt from any line gets no anchor.
- Transcription goes to any OpenAI-compatible `/audio/transcriptions` endpoint, set in
  `config.json` or the environment. `--list` and `set-transcript` cover every other route.

**Ruled out.**
- pdf.js in the page: it needs a CDN or a vendored bundle, and PNG pages are enough for pointing.
- In-browser speech recognition (Web Speech API): Chrome sends the audio to Google, quality
  varies, and the audio isn't kept.
- Transcribing inside the server on upload: it couples the page to a backend and would block on a
  slow one.

**Verified 2026-11-19.**
- A 7-page bilingual PDF opened as a session.
- A pinned comment on page 1 resolved to "A. Who I am" plus its paragraph.
- A pin on the Hebrew page resolved to "בכבוד רב," in reading order.
- A synthetic spoken WebM clip was transcribed through a self-hosted Parakeet server
  (OpenAI-compatible) in under 2 s, giving "Please make the opening paragraph more narrative and
  less choppy."
- Not yet verified: recording from a real microphone in the browser (needs a person at the page).

**v0.7.0 (2026-11-19, same day).** Added after the user asked for feedback on font, colour and
layout as distinct from wording, which needs more precise pointing:
- **Text tool:** drag across words, using the word boxes from `-bbox-layout` (positions only);
  within a line the selection is contiguous in visual order, and across lines it extends in each
  line's reading direction (`rtl` flag per line). The quote is cut per line rectangle with
  `pdftotext`.
- **Area tool:** draw a box.
- **Category chips:** preset `designed` / `text`, or `--categories`.
- **Wording intents and a round verdict.**
- Prior art reviewed: Ziflow, a proofing tool, separates copy (text-selection marks: replace,
  delete, insert) from design (pins and shapes). Acrobat and Kami have voice comments but no
  span anchoring or structured transcripts. The W3C Web Annotation selectors (TextQuote,
  TextPosition) are the model for re-anchoring across versions (ROADMAP).
- Verified: selecting words on an English line gives "music from the Machane"; on a Hebrew line,
  "מתנגד לחיי לילה בירושלים." in reading order; area and whole-document comments are grouped by
  category, and the verdict comes back in `result`.
