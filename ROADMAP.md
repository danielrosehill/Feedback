# Roadmap: one review page per kind of artefact

Every mode follows [`FRAMEWORK.md`](FRAMEWORK.md): voice first, point then talk, categories, a
verdict, pluggable transcription, structured results, rounds. They differ only in **what you point
at** and **which feedback dimensions** make sense. They share one data model:

```jsonc
// comments.json: one record per comment, whatever the mode
{ "id": "c…", "scope": "<mode-specific>", "anchor": { /* mode-specific */ },
  "category": "Wording", "intent": "Rephrase", "audio": "c….webm", "transcript": "…", "note": "…" }
// response.json: per round
{ "status": "submitted", "rounds": 2, "verdict": "Approve with these changes", "general_note": "…" }
```

The shared verdict is always one of **Approve as is / Approve with these changes / Needs another round**.
For a sendable artefact (an email, a post), "Approve as is" means "send it".

| # | Mode | Status | Command (planned) |
|---|---|---|---|
| 1 | Designed document (PDF) | **built** v0.7 | `feedback document file.pdf` |
| 2 | Plain text / Markdown (scripts, drafts, notes) | next | `feedback text file.md` |
| 3 | Email draft | next | `feedback email draft.json` |
| 4 | List of decisions | built | `feedback new items.json` |
| 5 | Diagram | built | `feedback diagram a.dot` |
| 6 | Image (incl. AI-generated, variants) | planned | `feedback image a.png [b.png …]` |
| 7 | Audio (mix, EQ, voice, podcast episode) | planned | `feedback audio file.wav` |
| 8 | Video | planned | `feedback video file.mp4` |
| 9 | Slides / web page | later | via PDF export (mode 1) or screenshot (mode 6) |

---

## 1. Designed document (PDF): built

- **Point at:** a text span (drag across words), an area (draw a box), a spot (pin), a page, the
  whole document.
- **Anchors:** page + normalised rectangles; the text is cut from the PDF with `pdftotext` so
  right-to-left scripts come back in reading order (`quote`, `paragraph`, `line`).
- **Categories** (`--preset designed`): Wording, Structure, Typography, Colour, Layout & spacing,
  Images & charts, Other. `--preset text` or `--categories` for others.
- **Wording intents:** Rephrase, Replace, Delete, Insert, Keep as is.
- **Defaults:** text selection → Wording; area → Layout & spacing.
- Later: selection across page breaks; re-anchoring old comments onto the next version by quote
  (W3C `TextQuoteSelector` exact + prefix + suffix); side-by-side diff of vN and vN+1.

## 2. Plain text / Markdown: scripts, drafts, notes

For anything that is words, not design: podcast scripts, essays, posts, prompts, a README, a
transcript. No PDF round trip.

- **Page:** the text rendered as readable HTML (Markdown rendered, `dir="auto"` per paragraph so
  Hebrew and English mix correctly), paragraphs numbered in the margin.
- **Point at:** a text span (native browser selection), a paragraph (click its number), a section
  (heading), the whole text.
- **Anchors:** character offsets into the source (`TextPositionSelector`) **and** the quote with
  prefix/suffix (`TextQuoteSelector`), so comments survive edits and can be re-found in the next
  version. Line numbers of the source file for the agent.
- **Categories:** Wording, Structure, Tone, Facts, Pacing (scripts), Other. Script preset adds
  **Delivery** (how it will sound read aloud) and **Timing**.
- **Extras for scripts:** estimated read-aloud time per section; "read this section to me" button
  (TTS) so the user can react to how it sounds.
- **Result:** comments in source order with line ranges; the agent edits the source file directly.

## 3. Email draft

Review a draft without opening a mail client. **Field by field**, because each part of an email
fails differently.

- **Page:** a form that looks like the email: From, To, Cc, Bcc, Subject, Attachments (names,
  sizes, open-to-preview), Body (rendered HTML or text, RTL respected). For a batch (e.g. one
  update to several stakeholders), one tab per draft with its own verdict.
- **Point at:** a field (To / Subject / Attachments ...), a span in the subject or body, the whole
  email.
- **Per-field quick answers:** ✓ Fine (one tap, or say "fine") / ✎ Change (then talk or type).
  Subject offers "pick an alternative" when the agent proposes several subject lines.
- **Categories:** Recipients, Subject, Wording, Tone, Facts, Attachments, Other.
- **Verdict:** Approve as is = send now; Approve with these changes = agent edits and sends without
  another round; Needs another round = show again.
- **Input:** `draft.json` `{from, to[], cc[], bcc[], subject | subjects[], body_html | body_text,
  attachments[{path}], lang, dir}`; the agent sends through its own email tool afterwards and
  records the sent message id as the outcome.

## 4. List of decisions: built (`feedback new`)

Forms with one answer per item (Remove / Keep for now / Ask me, Approve / Revise / Reject, rating,
tick box, free text). To add: a voice note per item and per group, same recorder as mode 1.

## 5. Diagram: built (`feedback diagram`)

Clickable Graphviz boxes, connections and zones. To add: the voice recorder per element, and the
category chips (Structure, Naming, Missing, Wrong, Layout).

## 6. Image (AI-generated or any)

- **Page:** the image large, zoomable; for generations, a **grid of variants** (A, B, C …) with the
  prompt and seed beside each.
- **Point at:** an area (box), a spot (pin), the whole image; for variants, the variant itself.
- **Per variant:** ★ pick / ✗ reject / combine ("A's composition with C's colours"), plus voice.
- **Categories:** Composition, Subject, Colour, Lighting, Style, Text in image, Artefacts
  (hands, faces, glitches), Other.
- **Result:** regions in pixel coordinates (for in-painting masks), picks per variant, and the
  agent's next prompt; outcome = the new generation's file.

## 7. Audio: mixes, EQ, voice, podcast episodes

- **Page:** a waveform (and optional spectrogram) with a playhead; play, loop a region, A/B
  between two versions (before/after processing) at the same position.
- **Point at:** a moment (click the timeline → timestamp pin), a region (drag → start/end), the
  whole file. Recording a voice comment pauses playback and anchors to the playhead.
- **Categories:** EQ / tone, Levels & loudness, Dynamics / compression, Noise & artefacts,
  Timing & pacing, Content (what is said), Music & transitions, Other. EQ comments may carry a
  band hint (low / low-mid / mid / high-mid / high) the user taps.
- **Result:** comments with `start_s`/`end_s`; for spoken content, the transcript of that region
  (from the file's own transcript) next to what the user said about it, so the agent edits the
  right words.
- **A/B:** "prefer A / prefer B / neither" per region, recorded as a comment.

## 8. Video

As audio, plus the frame: pin a spot **on the frame** at a timestamp (`t`, `x`, `y`) or draw a box
(`t`, rect). Categories add Framing, Cuts & pacing, Captions, Graphics, Colour grade. Thumbnails
of each commented frame in the result.

## 9. Slides, web pages

Export slides to PDF (mode 1). For a live web page, take full-page screenshots per viewport and use
mode 6 (areas, pins), or later a mode that pins to DOM elements by CSS selector.

---

## Cross-cutting work

- **Recorder everywhere:** one shared recorder component (MediaRecorder, Opus/WebM) for all pages.
- **Category from speech:** after transcription the agent suggests a category when the user didn't
  pick one, shown as "suggested" for confirmation.
- **Re-anchoring across versions:** carry unresolved comments onto vN+1 by quote/time, so a round
  starts from what is still open.
- **Mobile:** review on a phone (tap = pin, long-press-drag = select), since voice review is natural
  away from the desk.
- **Hands-free:** push-to-talk on a key, and "next comment" by voice.
