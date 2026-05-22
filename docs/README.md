# TechBash CLI Documentation

The TechBash CLI is a [GitHub Copilot CLI](https://github.com/features/copilot/cli/) skill that connects your local project to the **TechBash 2026** session catalog. Use it from your terminal to discover sessions, look up speakers, plan your schedule, take notes during the event, and draft a trip report afterward.

> **TechBash 2026** — October 13–16, 2026 · Kalahari Resort & Convention Center, Pocono Manor, PA · <https://techbash.com>

## Start here

| Guide | When to read it |
| --- | --- |
| [Installation](./installation.md) | First time setup — install the plugin in Copilot CLI or Claude Code. |
| [Getting started](./getting-started.md) | Your first 5 minutes — ask your first questions and see what comes back. |
| [Workflow recipes](./workflows.md) | Detailed "how do I…" recipes for every supported workflow. |
| [Event reference](./event.md) | Dates, venue, tracks, family day, workshop day, travel pointers. |
| [FAQ](./faq.md) | Common questions: empty schedule, privacy, refreshing data, ticketing. |
| [Zoho setup](./zoho-setup.md) | **Maintainers only** — refresh sponsor + ticket snapshots. |

## What the skill does (one paragraph)

You ask Copilot CLI a question in plain English while sitting in any project directory. The skill recognizes TechBash-related questions, fetches the live Sessionize catalog for TechBash 2026, optionally scans your dependency files (`package.json`, `*.csproj`, `requirements.txt`, etc.), and returns answers — recommended sessions, speaker bios, workshop lineups, agenda exports, notes appended to a local file. No API keys. No data leaves your machine other than the public Sessionize API calls.

## What it does *not* do

- It will not register, transfer, or refund tickets — those go through the [TechBash 2026 event page on Zoho Backstage](https://techbash.zohobackstage.com/TechBash2026).
- It will not invent session IDs, speakers, times, or rooms. If something isn't published yet (the schedule, for example), it tells you.
- It is not the official TechBash event app — it's a developer-first companion.

## Need help?

Open an issue in [techbash/techbash-cli](https://github.com/techbash/techbash-cli). Bug reports, feature requests, and suggestions for new workflows are all welcome.
