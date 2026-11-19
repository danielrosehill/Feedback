# The feedback framework

How an agent should get feedback from a person on anything it produces: a document, a list, a
diagram, an audio edit, a video cut. Every mode in this plugin follows these rules. A new mode
(audio, video, slides, images) should follow them as well.

## 1. Voice first

The default way for the person to give feedback is **speaking**. Typing is the fallback, never
the requirement.

- Speech is the fastest and most precise channel most people have for reactions. People say
  *why* something is wrong when they talk ("it's choppy, it reads like a list, I want it to flow")
  and leave the why out when they type.
- So every mode puts a record control where the attention is, and recording starts on the gesture
  that picks the target (a click on the page). No separate "start recording" step.
- Every voice comment can also carry, or be replaced by, a typed note. Some things (a spelling, a
  number, a URL) are easier typed.

## 2. Point, then talk

A comment is only as useful as its anchor. Every comment records **what it is about**:

| Artefact | Anchor |
|---|---|
| Document | page + position, resolved to the line and paragraph under the pin |
| List | item id |
| Diagram | node, connection or zone id from the source |
| Audio / video | start (and optional end) timestamp; for video, optionally a frame position |
| Any | "whole artefact" and "this page / this section" scopes for comments that aren't about one spot |

The agent must be able to go from the anchor back to the source and change exactly that spot.

## 3. Transcription is pluggable, and the person chooses where audio goes

Recordings stay in the local session folder until they are transcribed. The transcription backend
is a setting, not code. It is any OpenAI-compatible `/audio/transcriptions` endpoint: a self-hosted
server (faster-whisper, whisper.cpp, Parakeet), a hosted API (OpenAI, Groq), or a local app. Where
no backend fits, the agent transcribes with whatever it has and stores the text against the
comment (`set-transcript`). Keep the audio either way: the transcript is a reading of it, not a
replacement.

## 4. Structured feedback back to the agent

What the agent reads is not a pile of transcripts. Each comment comes back as one record:
`{n, id, scope, anchor, transcript, note, audio, outcome}`, in reading order, from
`feedback result` (`--json` for machines). The agent works through it comment by comment.

## 5. Close the loop

For each comment, the agent records what it did (`feedback outcome <session> <id> done|skipped|failed
"text"`). The open page shows it. Then it produces the next version and opens a new round on it.
Rounds are the unit of work: **show → comment → act → report → show again**. Never ask the person
to restate feedback that is already in a session.

## 6. Local and private by default

The page is served on `127.0.0.1` and accepts writes only from itself. Nothing is sent anywhere
until transcription, and transcription goes only where the person configured it.

## For agents: when to use which mode

- The person must react to something you produced (a draft, an edit, an export) → open it in the
  matching mode **instead of** asking them to describe changes in chat. If the artefact isn't a
  PDF, export it to PDF for document review: Markdown and HTML through the usual toolchain, slides
  to PDF.
- Many independent decisions → list mode (`feedback new`).
- Structure (architecture, flows) → diagram mode.
- Audio or video → until those modes exist, ask for timestamped voice notes and anchor each one by
  timestamp by hand, following rule 2.
