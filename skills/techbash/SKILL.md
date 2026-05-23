---
name: techbash
description: >-
  Your companion for TechBash 2026. Helps developers find sessions relevant to
  their project, look up speakers, plan a personal schedule, capture notes
  during the event, draft trip reports after, and answer sponsor and ticket
  questions from the organizer-maintained Zoho Backstage snapshot. Activate
  when the user mentions TechBash, conference sessions/schedule for TechBash,
  Kalahari Resort, Pocono Manor, a TechBash speaker by name, TechBash
  sponsors, or TechBash tickets. Uses the live Sessionize catalog (no API
  keys required) plus committed snapshot files for Zoho-sourced data.
license: MIT
compatibility: >-
  Uses direct HTTPS fetch against the public Sessionize endpoints for TechBash
  2026 (no auth required). Sponsor and ticket data come from committed JSON
  snapshots under skills/techbash/data/ that are refreshed by a maintainer-run
  GitHub Action — the skill never talks to Zoho directly, and end users never
  need Zoho credentials. A future @techbash/events-cli helper may provide
  local caching and faster fuzzy search; until then, fetch the All view once
  per conversation and filter in-context.
metadata:
  author: TechBash organizers
  version: "0.3.1"
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
| `room` / `roomId` | `null` until the schedule is published; populated from GridSmart once the grid is live |
| `startsAt` / `endsAt` | ISO 8601 timestamps in **UTC** (e.g. `2025-11-04T14:00:00Z` = 10:00 EDT); `null` until the schedule is published. Always convert to Eastern Time before showing to the user. |
| `status` | `Accepted` for confirmed sessions |
| `isServiceSession` | `true` for non-talk slots (meals, breaks, family-day activities) |

### Speaker shape

| Field | Notes |
| --- | --- |
| `id` (GUID) | Use to join from session `speakers[].id` |
| `fullName`, `firstName`, `lastName`, `tagLine`, `bio` | Display fields |

### GridSmart (schedule) shape

When published, GridSmart returns an array of day objects. Until then it returns `[]` — handle that case before trying to index into anything.

```jsonc
[
  {
    "date": "2026-10-13T00:00:00Z",   // day bucket (UTC midnight)
    "isDefault": false,
    "rooms": [
      {
        "id": 60694,
        "name": "Sagewood",
        "hasOnlyPlenumSessions": false,
        "sessions": [
          {
            "id": "919802",
            "title": "...",
            "description": "...",
            "startsAt": "2026-10-13T14:00:00Z",   // ALWAYS UTC ("Z" suffix)
            "endsAt":   "2026-10-13T17:30:00Z",
            "isServiceSession": false,            // meals / breaks / registration
            "isPlenumSession": false,             // keynote / plenary
            "speakers": [{ "id": "<guid>", "name": "Chris Ayers" }],
            "categories": [],
            "roomId": 60694,
            "room": "Sagewood",
            "liveUrl": null,
            "recordingUrl": null,                 // populated post-event when uploads land
            "status": "Accepted",
            "isInformed": true,
            "isConfirmed": true
          }
        ]
      }
    ]
  }
]
```

Notes:

- Times are **UTC**. Always convert to Eastern Time (America/New_York, which is EDT during TechBash week) before displaying. Eastern Time observes DST; the offset is `-04:00` in October.
- `isServiceSession: true` marks meals, breaks, registration, and family-day activities — exclude these from "what talks are on?" answers unless the user explicitly asks.
- `isPlenumSession: true` marks keynotes / shared sessions; they typically appear in every room's `sessions[]` or in a single dedicated room. Deduplicate by session `id`.
- `liveUrl` / `recordingUrl` are usually `null` during the event; the recording URL is populated days-to-weeks after the conference.
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
- Asks about TechBash **sponsors** or **ticket types / prices**

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

## Sponsor and ticket data (from local snapshot)

Sponsor and ticket data come from committed JSON snapshots that organizers refresh manually via a GitHub Action — they are not fetched live and may be slightly out of date.

| File | Content |
| --- | --- |
| `skills/techbash/data/sponsors.json` | `{ event, source, fetchedAt, sponsors[] }` — each sponsor has `id, name, tier, description, websiteUrl`. The description may contain HTML; strip tags before display. |
| `skills/techbash/data/tickets.json` | `{ event, source, fetchedAt, tickets[] }` — each ticket has `id, name, description, price, currency, quantity, sold, saleStartsAt, saleEndsAt, status, isSoldOut, isAvailable`. `price` is a number in the units of `currency` (e.g. `999` + `USD` means $999). |

When answering sponsor/ticket questions:

1. Read the JSON file from disk (relative to the plugin install). If the array is empty or `fetchedAt` is `null`, tell the user the snapshot hasn't been populated yet and link to <https://techbash.com> for sponsors or <https://techbash.zohobackstage.com/TechBash2026> for tickets.
2. Always cite the `fetchedAt` timestamp so the user understands how fresh the data is.
3. For ticket questions, never quote a price without the `currency`. If `isSoldOut` is true, lead with that fact.
4. For **buying / transferring / refunding** tickets, direct the user to <https://techbash.zohobackstage.com/TechBash2026>. The skill does not perform ticket transactions.

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
3. If GridSmart is `[]` (empty array), tell the user the schedule isn't published yet and offer to save the un-timed picks as a markdown shortlist.
4. If GridSmart has data, build a per-day itinerary by iterating each day's `rooms[].sessions[]`, deduplicating sessions that appear in multiple rooms (e.g. plenary sessions), converting `startsAt`/`endsAt` from UTC to Eastern Time, flagging conflicts where the user's picks overlap, and excluding `isServiceSession: true` entries unless asked. Offer to save as `techbash-agenda.md` (and, on request, `techbash-agenda.ics`). Do not write files until the user confirms.

### "What's happening now?" / "What's next in \<room\>?"

1. Fetch GridSmart. If `[]`, report "schedule not yet published" and stop.
2. Get the current time in Eastern Time, convert it to UTC for comparison against session `startsAt`/`endsAt`.
3. Walk every day's `rooms[].sessions[]`, deduplicating by session `id` (plenary sessions can appear in multiple rooms). Exclude `isServiceSession: true` unless the user asked about meals/breaks specifically.
4. Return the matching session(s) with title, speaker, room (display the room `name`, not the `roomId`), and remaining time — formatted in Eastern Time, e.g. "ends at 3:30 PM ET (32 min left)".

### "Log a note from \<session\>"

1. Resolve the session by title (fuzzy match) or by ID. Confirm the match with the user if ambiguous.
2. Load the template at `skills/techbash/templates/session-note.md` (relative to the plugin install). Substitute the `{{...}}` placeholders with what you know from Sessionize (`session_id`, `title`, `speaker`, `track`, `room`, `day`, `starts_at`) and from the user's words (`notes`, `takeaway_1`, `action_item_1`, optional `rating`, etc.). Leave any placeholder you genuinely don't know as an empty value rather than guessing — never fabricate a speaker, room, or time.
3. Append the filled template to `./techbash-notes.md` in the user's current working directory, preceded by a `---` separator if the file already has content. Create the file if it doesn't exist. **Never overwrite.**
4. Confirm what was written and where, and offer to capture more notes for the same session in a follow-up turn.

### "Wrap up my TechBash day" / "Daily rollup"

1. Read `./techbash-notes.md` and extract entries whose frontmatter `day` matches the day the user is wrapping up (ask if not clear).
2. Load `skills/techbash/templates/daily-rollup.md`. Fill in:
   - `day` and `date` from context
   - `sessions_attended` = count of session-note entries for that day
   - `best_session_title` / `best_session_speaker` — ask the user if not obvious from ratings
   - `theme_1` etc. — synthesize from the day's `## Key takeaways` sections
   - `try_at_work_1` etc. — pull from the day's `## Action items`
3. **Always** keep the consent reminder line about contacts in the rendered output.
4. Append the filled rollup to `./techbash-notes.md` (same file, separated by `---`). Confirm what was written.

### "Summarize my TechBash notes" / "Draft a trip report"

1. Read `./techbash-notes.md`. If it doesn't exist or has no session-note entries, tell the user and stop.
2. Parse entries by their YAML frontmatter (`type` distinguishes `daily-rollup` from session notes; if absent, treat as a session note). Group session notes by `track` and by `day`.
3. Load `skills/techbash/templates/trip-report.md` and fill it in:
   - `dates` = span derived from session-note `day` values
   - `top_session_*` = top 3 by `rating` (ties broken by user preference)
   - `themes` = synthesized across all `## Key takeaways`
   - `action_items` table = aggregate every `- [ ]` action item across notes; ask the user for `owner` and `due` if not present
   - `people_to_keep_in_touch_with` = aggregate from daily-rollup `## People I met` sections **only** — do not invent
   - `appendix` = one bullet per session-note entry, formatted as `- [Day] Title — Speaker (rating/5)`
4. Offer to save the result as `./techbash-trip-report.md`. **Confirm before writing**, and never overwrite an existing file without explicit permission (offer a numbered variant like `techbash-trip-report-2.md` instead).
5. Remind the user that anything pulled from speakers' talks should credit the speaker if reshared publicly.

### "Scaffold a project from \<session\>"

1. Ask where to create the project (new directory vs current vs explicit path) — do not assume.
2. Look up the session and pull its description.
3. Identify the technologies it covers from the description and from any speaker context (e.g., Aspire, ASP.NET Core, Postgres).
4. Scaffold a minimal starter that matches: include a `README.md` that links back to the session and the speaker's profile.
5. Note explicitly that the scaffold is inspired by the session description, not by attending — the user should still attend or watch the recording for full context.

### "Who's sponsoring TechBash?" / "What sponsors are at TechBash this year?"

1. Read `skills/techbash/data/sponsors.json`.
2. If empty or `fetchedAt` is null, say "Sponsor list is not in the snapshot yet — see <https://techbash.com> for the current sponsor list." and stop.
3. Group sponsors by `tier` (preserve any order present in the file; otherwise sort tiers in conventional order — Platinum, Gold, Silver, Bronze, Community — falling back to alphabetical for unknown tiers; alphabetize sponsors within a tier by `name`).
4. For each sponsor return `name` + one-line description (strip HTML tags from `description` and truncate longer descriptions to ~200 chars) and the `websiteUrl` if present.
5. The snapshot does not include sponsor logos — for logos, direct the user to <https://techbash.com>. Mention the `fetchedAt` timestamp at the bottom.

### "What ticket types are available?" / "How much is a TechBash ticket?"

1. Read `skills/techbash/data/tickets.json`.
2. If empty or `fetchedAt` is null, say "Ticket data is not in the snapshot yet — see <https://techbash.zohobackstage.com/TechBash2026>." and stop.
3. List ticket types with `name`, description (strip HTML, truncate), and price formatted as `<price> <currency>` (e.g. `$999 USD`). If `currency` is null, just print the number.
4. Flag any ticket where `isSoldOut === true` as **SOLD OUT** at the top of its entry. If `isSoldOut` is false and both `quantity` and `sold` are present, you may add a parenthetical "(N of M left)" where helpful.
5. If `status` is something other than `active` (e.g. `inactive`, `hidden`), de-emphasize or omit those tickets from the main list — they are not currently for sale.
6. Mention the `fetchedAt` timestamp and always close with "To buy, transfer, or refund tickets, go to <https://techbash.zohobackstage.com/TechBash2026>."

## Guardrails

- Never fabricate session IDs, titles, speakers, rooms, times, sponsors, or ticket prices.
- If GridSmart is empty, say so plainly — do not guess at a schedule.
- If a sponsor or ticket snapshot is empty / has a null `fetchedAt`, say so and link to the canonical source — do not invent entries.
- If a Sessionize endpoint returns an error or empty array, surface that to the user and stop.
- Ticketing and registration questions: link the user to <https://techbash.zohobackstage.com/TechBash2026>. Do not attempt to register them.
- For venue, travel, hotel, and family-day logistics not in the Sessionize data, link the user to <https://techbash.com>.
- Be specific. "Mitchel Sellers' Aspire session shows how to add Aspire to an existing .csproj — relevant to the WebApi project in your repo" beats "there are some .NET sessions".
