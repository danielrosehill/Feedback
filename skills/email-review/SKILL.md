---
name: email-review
description: Let the user approve or correct email drafts before they are sent, by voice and taps - a page that shows each draft like an email with Fine / Change on every part (recipients, subject, attachments, body), side-by-side subject options to pick, word selection in subject and body, and a verdict per draft (Approve as is = send). Works for one email or a batch (one tab per draft). Use before sending anything on the user's behalf that they want to see, or when they say "show me the drafts", "let me check the emails first", "review the stakeholder emails".
---

# Email review (drafts, field by field)

Follows `FRAMEWORK.md`. The point is that the user never has to open a mail client to approve
or fix a draft.

## 1. Write the drafts file

One draft (object) or several (list), each:

```json
{"label": "Legal dept", "from": "me@example.com", "to": ["a@example.org"], "cc": [], "bcc": [],
 "subjects": ["Option A", "Option B"], "body_html": "<div dir=\"rtl\">...</div>",
 "lang": "he", "attachments": [{"path": "/abs/letter.pdf"}], "thread": "<optional id to reply in>"}
```

`subject` (one) or `subjects` (alternatives to pick from); `body_html` or `body_text`. Use the
exact body you would send: what the user approves is what goes out. RTL languages get
`dir="rtl"` automatically from `lang` (he, ar, fa, ur).

## 2. Open and wait

```bash
feedback email drafts.json --title "<what these are>"
feedback wait          # in the background
```

Tell the user in one line: ✓ Fine or ✎ Change on each part, pick a subject, select words to
comment on them, a verdict per draft; **Approve as is** means you will send it.

## 3. Read and act

```bash
feedback transcribe
feedback result        # per draft: verdict, picked subject, field answers (Fine / Change), comments
```

- **Approve as is** → send exactly that draft (with the picked subject).
- **Approve with these changes** → apply the comments, then send without another round.
- **Needs another round** or no verdict → apply the comments and open a new `feedback email` round.
- Record each send with `feedback outcome <session> <comment-id> done "sent, message id …"` on the
  draft's whole-email comment, or report the message ids to the user.
- Never send a draft that has no verdict.
