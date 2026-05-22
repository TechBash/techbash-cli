---
name: techbash
description: >-
  Your companion for TechBash 2026. Helps developers find sessions relevant to
  their project, look up speakers, plan a personal schedule, capture notes
  during the event, and draft trip reports after. Activate when the user
  mentions TechBash, conference sessions/schedule for TechBash, Kalahari
  Resort, Pocono Manor, or a TechBash speaker by name. Uses the live
  Sessionize catalog (no API keys required).
license: MIT
compatibility: >-
  Uses direct HTTPS fetch against the public Sessionize endpoints for TechBash
  2026 (no auth required). A future @techbash/events-cli helper may provide
  local caching and faster fuzzy search; until then, fetch the All view once
  per conversation and filter in-context.
metadata:
  author: TechBash organizers
  version: "0.1"
  domain: techbash
---

# TechBash CLI

> The single source of truth for TechBash session metadata is the live Sessionize catalog. Never invent session IDs, titles, speaker names, rooms, or times. If a field is empty, say so.

## Event context

| Setting | Value |
| --- | --- |
| Event | TechBash 2026 |
| Dates | October 13–16, 2026 |
| Venue | Kalahari Resort & Convention Center, Pocono Manor, PA |
| Timezone | Eastern Time (ET, UTC-4 in October) |
| Website | <https://techbash.com> |
| Ticketing | <https://techbash.zohobackstage.com/TechBash2026> |
| Tracks | Web, Cloud, DevOps, Architecture, Best Practices, Soft Skills, plus a Family Day and an optional workshop day |

### Sessionize endpoints (event ID `hppwa4hg`)

| View | URL | Use |
| --- | --- | --- |
| All | `https://sessionize.com/api/v2/hppwa4hg/view/All` | One-shot fetch of sessions + speakers + rooms + categories |
| Sessions | `https://sessionize.com/api/v2/hppwa4hg/view/Sessions` | Just the session list |
| Speakers | `https://sessionize.com/api/v2/hppwa4hg/view/Speakers` | Speakers with bios, links, and session references |
| SpeakerWall | `https://sessionize.com/api/v2/hppwa4hg/view/SpeakerWall` | Lightweight speaker thumbnails |
| GridSmart | `https://sessionize.com/api/v2/hppwa4hg/view/GridSmart` | Schedule grid (rooms × time slots) — **may be empty until the schedule is published** |

Prefer the **All** view for any workflow that needs both sessions and speakers — it minimizes round-trips. Cache the response for the lifetime of the conversation; do not re-fetch on every user turn.

### Session shape (Sessionize)

Key fields from the Sessions / All views:

| Field | Notes |
| --- | --- |
| `id` | Numeric session ID (string) |
| `title` | Session title; `[WORKSHOP]` and `[FAMILY DAY]` prefixes are conventions used by TechBash |
| `description` | Full abstract (markdown-ish; may contain `\r\n`) |
| `speakers[]` | Array of `{ id, name }` — join to the Speakers view for bios/links |
| `categories[]` | Track/level/format tags (may be empty pre-publish) |
| `room` / `roomId` | `null` until the schedule is published |
| `startsAt` / `endsAt` | ISO timestamps in ET; `null` until the schedule is published |
| `status` | `Accepted` for confirmed sessions |
| `isServiceSession` | `true` for non-talk slots (meals, breaks, family-day activities) |

### Speaker shape

| Field | Notes |
| --- | --- |
| `id` (GUID) | Use to join from session `speakers[].id` |
| `fullName`, `firstName`, `lastName`, `tagLine`, `bio` | Display fields |
| `profilePicture` | URL to the headshot |
| `sessions[]` | `{ id, name }` — reverse index back to sessions |
| `links[]` | `{ title, url, linkType }` — Twitter / LinkedIn / Blog / Company_Website / etc. |

## When to use this skill

Activate when the user:

- Mentions TechBash, TechBash 2026, Pocono Manor, or Kalahari Resort
- Asks about conference sessions, speakers, workshops, or a personal agenda **in a TechBash context**
- References a TechBash speaker by name (cross-check against the Speakers view)
- Asks "what's on the workshop day?" or "what's Family Day?"
- Asks to find sessions that match their project, dependencies, or tech stack for TechBash
- Wants to log notes from a session or draft a trip report

Do not activate when the user:

- Asks about a different conference (Build, Ignite, KubeCon, etc.) — defer to that event's skill
- Asks to register, transfer, or refund tickets (direct them to the Zoho Backstage event page)

## Fetching the catalog

Use `curl` (or the agent's HTTP fetch tool) — no API key required.

```sh
# Everything in one shot (preferred)
curl -s https://sessionize.com/api/v2/hppwa4hg/view/All

# Just sessions
curl -s https://sessionize.com/api/v2/hppwa4hg/view/Sessions

# Just speakers
curl -s https://sessionize.com/api/v2/hppwa4hg/view/Speakers

# Schedule grid (may be empty pre-publish)
curl -s https://sessionize.com/api/v2/hppwa4hg/view/GridSmart
```

Fetch each endpoint **at most once per conversation** and reuse the result. If the user asks a follow-up that needs the same data, do not re-fetch.

## Core workflows

### "What TechBash sessions match my project?"

1. Scan the project root for stack signals: `package.json`, `requirements.txt`, `*.csproj`, `*.sln`, `go.mod`, `Gemfile`, `Cargo.toml`, `pom.xml`, `Dockerfile`, `bicep`/`terraform`, `.github/workflows`.
2. Extract dependencies, frameworks, languages, and cloud providers.
3. Fetch the **All** view once.
4. For each stack signal, match against session `title` + `description` + `categories[]` (case-insensitive substring match is fine for v1; rank by number of matches).
5. Present 3–7 sessions grouped by relevance tier:
   - **Directly relevant** — session names something the user actively uses (e.g., `.NET Aspire` for a `.csproj` project).
   - **Adjacent** — complementary tech or next-step capability (e.g., DevOps sessions for an app project).
   - **Soft-skills / career** — at least one suggestion from the soft-skills track.
6. For each session include: title, speaker(s), one-line reason it's relevant, and (if available) the room and time. If room/time are null, say "*schedule not yet published*".

**Output format:**

```
## TechBash 2026 sessions for your stack

Scanned: package.json, Dockerfile
Stack: Node 22, TypeScript, Azure Functions, GitHub Actions

### Directly relevant
1. **From Idea to Working Application in 50 minutes!** — Andrew Potozniak
   📌 You ship Node+TS apps; this is a hands-on rapid-build session.
   🗓  Schedule not yet published.

### Adjacent
2. **.NET Aspire & Existing Projects** — Mitchel Sellers
   📌 You also have a .csproj in the repo — Aspire can wire it into your existing dev workflow.

### Soft skills
3. **Speak Geek: Unlocking Communication Superpowers** — Amy Norris
   📌 Useful for anyone who pairs technical work with stakeholder updates.
```

### "Tell me about \<speaker name\>"

1. Fetch the **Speakers** view (or reuse the All view).
2. Find the speaker by `fullName` (case-insensitive). If multiple match, list them and ask.
3. Return: tagline, bio, profile picture URL, list of their TechBash sessions, and their links (Twitter/X, LinkedIn, Blog, Company).
4. Never invent links or bios; if a field is missing, omit it.

### "What's on the workshop day?" / "What's Family Day?"

1. Fetch Sessions.
2. Filter sessions whose `title` starts with `[WORKSHOP]` or `[FAMILY DAY]` (these are TechBash conventions).
3. Return the list with descriptions truncated to ~2 sentences.

### "Build me a personal agenda"

1. Run the matching workflow above to pick recommended sessions.
2. Fetch GridSmart.
3. If GridSmart is empty (no `startSlot`/`rooms`), tell the user the schedule isn't published yet and offer to save the un-timed picks as a markdown shortlist.
4. If GridSmart has data, build a per-day itinerary, flag conflicts, and offer to save as `techbash-agenda.md` (and, on request, `techbash-agenda.ics`). Do not write files until the user confirms.

### "What's happening now?" / "What's next in \<room\>?"

1. Fetch GridSmart. If empty, report "schedule not yet published".
2. Compare the current time (Eastern Time) to session `startsAt`/`endsAt`.
3. Return the matching session(s) with title, speaker, room, and remaining time.

### "Log a note from \<session\>"

1. Resolve the session by title (fuzzy match) or by ID. Confirm the match with the user if ambiguous.
2. Append to `./techbash-notes.md` in the current working directory, creating the file if it doesn't exist. Use this entry shape:

   ```markdown
   ## <ISO timestamp> — <Session title>
   **Speaker(s):** <names>
   **Room:** <room or "n/a">

   <user's note>
   ```

3. Confirm what was written and where.

### "Summarize my TechBash notes" / "Draft a trip report"

1. Read `./techbash-notes.md` if it exists.
2. Group by track or by day, surface recurring themes, and call out concrete next steps the user wrote down.
3. For a trip-report draft, offer to save the result to a new file but do not overwrite existing files without confirmation.

### "Scaffold a project from \<session\>"

1. Ask where to create the project (new directory vs current vs explicit path) — do not assume.
2. Look up the session and pull its description.
3. Identify the technologies it covers from the description and from any speaker context (e.g., Aspire, ASP.NET Core, Postgres).
4. Scaffold a minimal starter that matches: include a `README.md` that links back to the session and the speaker's profile.
5. Note explicitly that the scaffold is inspired by the session description, not by attending — the user should still attend or watch the recording for full context.

## Guardrails

- Never fabricate session IDs, titles, speakers, rooms, times, sponsors, or ticket prices.
- If GridSmart is empty, say so plainly — do not guess at a schedule.
- If a Sessionize endpoint returns an error or empty array, surface that to the user and stop.
- Ticketing and registration questions: link the user to <https://techbash.zohobackstage.com/TechBash2026>. Do not attempt to register them.
- For venue, travel, hotel, and family-day logistics not in the Sessionize data, link the user to <https://techbash.com>.
- Be specific. "Mitchel Sellers' Aspire session shows how to add Aspire to an existing .csproj — relevant to the WebApi project in your repo" beats "there are some .NET sessions".
