# Getting Started

You've installed the plugin ([if not, start here](./installation.md)). Here's what to do in your first five minutes.

## The mental model

You're not running commands at the TechBash CLI — you're having a conversation with your AI coding assistant, which now knows about TechBash 2026. Ask questions in plain English. Mention TechBash by name so the assistant knows to use this skill instead of a generic web search.

## 1. Ask what's available

Open Copilot CLI in any project (or in an empty directory) and try:

```text
What can the TechBash skill do?
```

You should see a summary of the workflows: find sessions, look up speakers, browse the workshop day, build a personal agenda, log notes, draft a trip report, and scaffold starter projects.

## 2. Get personalized session recommendations

`cd` into a project you actually work on (one with a `package.json`, `*.csproj`, `requirements.txt`, etc.) and ask:

```text
What TechBash sessions should I attend?
```

The assistant will:

1. Scan your project for stack signals.
2. Fetch the live TechBash 2026 session catalog.
3. Return 3–7 sessions grouped by relevance (directly relevant, adjacent, soft skills).

Example response (abbreviated):

```text
## TechBash 2026 sessions for your stack

Scanned: package.json, Dockerfile
Stack: Node 22, TypeScript, Azure Functions, GitHub Actions

### Directly relevant
1. From Idea to Working Application in 50 minutes! — Andrew Potozniak
   📌 You ship Node+TS apps; hands-on rapid-build session.
   🗓 Schedule not yet published.

### Adjacent
2. .NET Aspire & Existing Projects — Mitchel Sellers
   📌 You also have a .csproj — Aspire can wire it into your dev workflow.

### Soft skills
3. Speak Geek: Unlocking Communication Superpowers — Amy Norris
```

Don't have a project handy? Just tell the assistant your stack:

```text
I work with React, Postgres, and AWS. Recommend TechBash sessions.
```

## 3. Look up a speaker

```text
Tell me about Mitchel Sellers at TechBash.
```

You'll get the speaker's tagline, bio, links (LinkedIn / X / blog / company), and the list of sessions they're presenting at TechBash 2026.

## 4. Browse the workshop day or Family Day

```text
What workshops are happening at TechBash this year?
What's on Family Day at TechBash?
```

These return TechBash sessions whose titles start with `[WORKSHOP]` or `[FAMILY DAY]` — the conventions TechBash uses in the catalog.

## 5. (Once the schedule is published) Build a personal agenda

```text
Build me a TechBash agenda based on my project.
```

If the [GridSmart schedule](./faq.md#why-dont-i-see-session-times-or-rooms) has been published, you'll get a per-day itinerary with rooms and times, plus an offer to save it as `techbash-agenda.md` (or `.ics` to import into your calendar). If the schedule isn't out yet, you'll get an un-timed shortlist instead.

## 6. During the event — log notes

While you're at the venue, after each session you find valuable:

```text
Log a TechBash note from "Restoring Lost Work in Git":
The reflog demo was gold. Try this with the team next sprint.
```

The assistant appends a timestamped entry to `./techbash-notes.md` in the current directory. That file is yours — it never leaves your machine.

## 7. After the event — summarize and ship

```text
Summarize my TechBash notes and draft a trip-report blog post.
```

The assistant reads `techbash-notes.md`, groups themes, surfaces next steps, and offers to save a draft.

## Where to next?

- [Workflow recipes](./workflows.md) — every supported workflow in detail.
- [Event reference](./event.md) — dates, venue, travel, family day.
- [FAQ](./faq.md) — common questions and limitations.
