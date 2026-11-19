# 005: Text review and email review

Date: 2026-11-19. Status: built (v0.8.0).

**Need.** The user wants to give voice feedback on more than designed PDFs. Two cases came first:
- plain text: podcast scripts, drafts, notes;
- email drafts, approved without opening a mail client. "This subject is fine", a proposed text,
  send.

**Decision.**
- `feedback text`: the page is rendered from the source by the server.
  - Markdown blocks (headings, paragraphs, list items, fenced code) and inline markup (code, bold,
    italic, links) are parsed in stdlib Python into **segments that keep their source offsets**.
  - The page puts each piece in a `<span data-src>`, so a native browser selection maps to an
    exact `[start, end)` range in the file, markup characters excluded.
  - Comment highlights split segments at comment boundaries, and every piece keeps its offset.
  - Scopes: span, paragraph (¶ number), section (heading to the next heading's line), whole text.
  - Results carry the quote, 40-character prefix and suffix, and the line range.
  - `--preset script` adds Delivery, Timing and Pacing, with 150 wpm read-aloud estimates.
- `feedback email`: drafts JSON (one, or a list shown as tabs).
  - Each field gets **Fine** (a one-tap comment with intent Fine, no recording) or **Change**
    (starts a voice comment).
  - Subject alternatives are picked side by side, giving `picked_subject` per draft.
  - Spans can be selected in the subject or body; offsets are into the rendered text, with quote
    and context.
  - A verdict is recorded per draft.
  - The HTML body is sanitised server-side with an allowlist of tags and dir/lang/style/href/src
    attributes; scripts, handlers and `javascript:` links are dropped. A plain-text version is
    kept for the agent.
  - Attachments are copied into the session and served at `/files/<draft>/<n>`.
- Both modes share `panel/review-common.js` and `review-common.css`: recorder, autosave, cards,
  category and intent chips, verdict chips. They are served from `/static/`. `document.html`
  keeps its own copy.

**Verified 2026-11-19 (curl, no browser).**
- Text:
  - A Markdown script gave 8 blocks and 3 sections with read-aloud times.
  - A span over bold text resolved to `amplified music` (offsets 63–78, line 3).
  - The paragraph and section anchors (lines 5–10) and a Hebrew span `שלום וברכה` came back
    correctly.
  - The verdict and general note came back.
  - A comment with an invalid category and no content was dropped, and an off-origin POST got 403.
  - A spoken WebM on a section comment was transcribed: "make this section shorter and slower."
  - `outcome` and `status` worked.
- Email:
  - Two drafts, one Hebrew HTML, one plain text.
  - The sanitiser removed `<script>`, `onclick` and the `javascript:` href.
  - `dir` came out `rtl` for `lang: he`; the attachment was served as `application/pdf`, and a bad
    index gave 404.
  - Per-field answers (to Fine, cc Change, attachments Fine, body Change), the picked subject (the
    second alternative) and per-draft verdicts came back.
  - Invalid draft indices, verdict keys and subject indices were dropped.
- Document mode regression: area and pin comments resolved as before.
- Page scripts pass `node --check`.

**Not verified.**
- Selection, highlighting and recording in a real browser for text and email.
- Highlighting of earlier selections inside an email body (not built; the comment cards show the
  quote).
