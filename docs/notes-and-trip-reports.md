# Notes and trip reports

The TechBash skill can help you capture session notes during the event and draft a structured trip report afterward. It uses three markdown templates that ship with the plugin and writes everything into your current working directory — your notes stay on your machine.

## File layout

Everything lives in two files, both in whatever folder you launched Copilot CLI from:

| File | Created by | Contents |
| --- | --- | --- |
| `techbash-notes.md` | Session note + daily rollup workflows | Append-only log of session notes and end-of-day rollups. Each entry has YAML frontmatter so the skill can parse it later. |
| `techbash-trip-report.md` | Trip-report workflow | A structured report you can share with your team or post to your blog. Created on demand; never overwritten. |

> **Tip:** Run Copilot CLI from a folder you'll have synced (Dropbox, OneDrive, a git repo) if you want your notes to survive a laptop wipe.

## Capturing a session note

Ask anything like:

```text
Log a note for the Aspire session
Take notes on session 1234567
Note for the AI keynote: <your raw thoughts>
```

The skill will:

1. Find the session in the Sessionize catalog (asks you to disambiguate if multiple match).
2. Pre-fill what it knows: title, speaker, track, room, day, start time.
3. Ask for your raw notes (and optionally a 1–5 rating).
4. Append a structured entry to `techbash-notes.md`.

Each entry has YAML frontmatter like:

```yaml
---
session_id: "1234567"
title: "Building agentic apps with .NET Aspire"
speaker: "Jane Doe"
track: "Cloud"
room: "Kilimanjaro"
day: "Thu"
starts_at: "2026-10-15T10:00:00-04:00"
rating: "5"
tags: [aspire, agents, dotnet]
---
```

…followed by sections for **Key takeaways**, **Quotes / code**, **Action items** (as a checklist), **Follow-ups**, and **Raw notes**. The skill never overwrites the file — every note is appended with a `---` separator.

## Wrapping up your day

At the end of each conference day, ask:

```text
Wrap up my TechBash day
Daily rollup for Thursday
```

The skill reads that day's session notes, synthesizes the themes, lists the action items you captured, and asks you for the highlight of the day. The rollup is appended to the same `techbash-notes.md` so everything stays in one place.

The rollup template includes a section for **people you met**. The skill always keeps a one-line consent reminder there: only write down contacts you have permission to remember. If someone asks you not to put them in your notes, respect that.

## Drafting a trip report

After the conference (or any time), ask:

```text
Draft a TechBash trip report
Summarize my TechBash notes
```

The skill will read `techbash-notes.md`, group sessions by track and day, surface your top-rated sessions, aggregate every `- [ ]` action item into a single table, and produce a structured trip report. You'll be asked who the audience is — your team, your manager, your blog — so it can adjust the tone.

The result is offered for review **before** anything is written to disk. If you accept, it lands at `techbash-trip-report.md`. If that file already exists, the skill writes `techbash-trip-report-2.md` rather than overwriting it.

## Editing the templates

The templates live inside the installed plugin at `skills/techbash/templates/`. You're welcome to fork the repo and adjust them to match your team's report format — see [`skills/techbash/templates/README.md`](../skills/techbash/templates/README.md) for the rules (which placeholders are load-bearing, which sections drive the trip-report workflow, etc.).

## Privacy

- Notes are written to disk **only** when you explicitly ask the skill to log one.
- Nothing is uploaded anywhere. The skill never POSTs your notes to Sessionize, Zoho, or any other service.
- Consent reminders for contacts are part of the templates by design; don't strip them.
