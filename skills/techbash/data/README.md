# Snapshot data

This directory holds **sanitized snapshots** of TechBash 2026 data that comes from sources outside Sessionize — currently sponsors and ticket types from Zoho Backstage.

These files are read by `skills/techbash/SKILL.md` so the skill can answer sponsor/ticket questions without needing live API credentials on end-user machines.

## Files

| File | Source | Refresh |
| --- | --- | --- |
| `sponsors.json` | Zoho Backstage v3 `/sponsors` | Manual (organizer-triggered GitHub Action) |
| `tickets.json` | Zoho Backstage v3 `/tickets` | Manual (organizer-triggered GitHub Action) |

## How to refresh

Maintainers only. See [`docs/zoho-setup.md`](../../../docs/zoho-setup.md) for a one-time setup walkthrough.

To refresh: GitHub repo → **Actions** → **Refresh Zoho Backstage data** → **Run workflow**.

## Schema

Each file is a small JSON object with a `fetchedAt` timestamp and an array of allowlist-sanitized records — see `scripts/fetch-zoho.mjs` for the exact allowlist. Anything not in the allowlist is dropped, so a future Zoho schema change cannot accidentally leak new fields into the public repo.
