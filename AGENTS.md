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
- Versioning gate: any meaningful change to `SKILL.md` (agent behavior, commands or workflows agents may follow, endpoint usage, or user-facing guidance) must bump both versioned plugin manifests to the same value. Patch bumps are fine for guidance-only changes. The CI validator (`scripts/validate.mjs`) enforces that all three versions stay in sync.
- Keep `README.md` install/client guidance aligned with plugin manifest or skill changes.
- Add a CHANGELOG.md entry under `[Unreleased]` for every change that ships.

## Releasing

1. Move pending entries from `[Unreleased]` into a new `[X.Y.Z]` section in `CHANGELOG.md`, dated today.
2. Bump `version` in both `.claude-plugin/plugin.json` and `.github/plugin/plugin.json`, and the `metadata.version` in `skills/techbash/SKILL.md`. All three must match.
3. Run `node scripts/validate.mjs` locally — it must pass.
4. Commit and push to `main`. CI runs the same validator on the push.
5. Tag the release: `git tag vX.Y.Z && git push --tags`.
6. The Release workflow validates again, asserts the tag matches the manifest version, then creates a GitHub Release with auto-generated notes.

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

## Sponsor and ticket data (Zoho Backstage)

Sponsor and ticket data come from a maintainer-run GitHub Action (`.github/workflows/refresh-zoho-data.yml`) that calls Zoho Backstage and commits sanitized JSON to `skills/techbash/data/sponsors.json` and `skills/techbash/data/tickets.json`. The skill reads those snapshots — it never talks to Zoho directly, and end-user machines never need Zoho credentials.

When changing the fetch script or the snapshot shape:

- Keep `fetch-zoho.mjs` allowlist-only — never echo unknown fields from Zoho into the snapshot.
- If you add a new field to a snapshot, document it in `skills/techbash/SKILL.md` (the "Sponsor and ticket data" table) so the model knows about it.
- Zoho credentials live as repo secrets (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`) and repo vars (`ZOHO_PORTAL_ID`, `ZOHO_EVENT_ID`, optional `ZOHO_API_DOMAIN` / `ZOHO_ACCOUNTS_DOMAIN`) — never committed. See `docs/zoho-setup.md`.

## Future scope

- `@techbash/events-cli` Node helper for local caching and fuzzy search (mirrors `@microsoft/events-cli`).

## General principles

- Make the smallest synchronized set of edits that keeps plugin manifests, the skill, and user-facing docs coherent.
- Prefer fixing drift between ecosystems immediately over documenting known inconsistency.
