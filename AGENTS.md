# AGENTS.md

This repo packages the **TechBash** assistant plugin — a GitHub Copilot CLI / Claude Code skill that helps agents reason about the live TechBash 2026 session catalog hosted on Sessionize.

## Plugin ecosystems

The repo publishes plugin metadata for GitHub Copilot CLI and Claude Code. Keep shared product identity fields aligned across the manifests when changing the plugin name, description, version, author, repository, keywords, license, or skills path.

**Shared assets** used by the plugin ecosystems:
- `skills/techbash/SKILL.md` — the active skill prompt (the product contract)

**Versioned plugin manifests**:
- **GitHub Copilot CLI** — `.github/plugin/plugin.json` is the Copilot marketplace manifest and points at the repo root.
- **Claude Code** — `.claude-plugin/plugin.json` defines the Claude Code plugin package.

## Sync rules

- Treat `skills/techbash/SKILL.md` as the product contract for catalog behavior. Never invent session IDs, titles, speakers, or schedules — always fetch them from the live Sessionize endpoints listed in the skill.
- Versioning gate: any meaningful change to `SKILL.md` (agent behavior, commands or workflows agents may follow, endpoint usage, or user-facing guidance) must bump both versioned plugin manifests to the same value. Patch bumps are fine for guidance-only changes.
- Keep `README.md` install/client guidance aligned with plugin manifest or skill changes.

## Sessionize endpoints (TechBash 2026)

| View | URL |
| --- | --- |
| All data | `https://sessionize.com/api/v2/hppwa4hg/view/All` |
| Sessions | `https://sessionize.com/api/v2/hppwa4hg/view/Sessions` |
| Speakers | `https://sessionize.com/api/v2/hppwa4hg/view/Speakers` |
| Speaker wall | `https://sessionize.com/api/v2/hppwa4hg/view/SpeakerWall` |
| Schedule grid | `https://sessionize.com/api/v2/hppwa4hg/view/GridSmart` |

The Sessionize endpoint ID `hppwa4hg` is event-specific. When TechBash rolls forward to a new year, replace the ID across `SKILL.md` and update the event constants block at the top of that file in lockstep.

## Schedule status

The `GridSmart` endpoint may return an empty grid until organizers publish the schedule. Skill behavior must degrade gracefully: report "schedule not yet published" rather than fabricating times or rooms, and continue to return session/speaker data from the other endpoints.

## Future scope

- `@techbash/events-cli` Node helper for local caching and fuzzy search (mirrors `@microsoft/events-cli`).
- Zoho Backstage integration for sponsors + ticketing. Credentials must be loaded from `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN` env vars — never committed.

## General principles

- Make the smallest synchronized set of edits that keeps plugin manifests, the skill, and user-facing docs coherent.
- Prefer fixing drift between ecosystems immediately over documenting known inconsistency.
