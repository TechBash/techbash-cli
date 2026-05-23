# Changelog

All notable changes to the TechBash CLI plugin are documented here.
This project follows [Semantic Versioning](https://semver.org/) and
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.3.1] — 2026-05-22

### Added
- `scripts/validate.mjs` — repo validator that runs in CI and locally.
- `.github/workflows/ci.yml` — runs validation on every push and PR.
- `.github/workflows/release.yml` — cuts a GitHub Release on `vX.Y.Z` tag push.
- This `CHANGELOG.md`.

### Fixed
- SKILL.md now correctly documents Sessionize `GridSmart` times as UTC
  (not ET), with explicit `America/New_York` conversion guidance.
- Agenda and now/next workflows traverse the real
  `days[].rooms[].sessions[]` shape and dedupe plenary sessions.
- `scripts/fetch-zoho.mjs` follows each sponsor's list row with a
  `GET /sponsors/{id}` detail call, since the Zoho list endpoint
  returns a duplicated description for every sponsor.

## [0.3.0] — 2026-05-22

### Added
- Three markdown templates under `skills/techbash/templates/`:
  session note, daily rollup, trip report — all with YAML frontmatter
  and `{{placeholder}}` substitution.
- New SKILL.md workflows: structured note capture, end-of-day rollup,
  trip report aggregation with action items and contact-consent reminder.
- `docs/notes-and-trip-reports.md` end-user guide.

## [0.2.0] — 2026-05-21

### Added
- Zoho Backstage integration via maintainer-run GitHub Action.
  Sponsors and tickets refreshed by `.github/workflows/refresh-zoho-data.yml`
  and committed as sanitized JSON snapshots under `skills/techbash/data/`.
- `scripts/fetch-zoho.mjs` with allowlist-only sanitization to prevent
  PII leakage across schema changes.
- `docs/zoho-setup.md` maintainer setup walkthrough.

## [0.1.0] — 2026-05-20

### Added
- Initial scaffold: TechBash CLI plugin for GitHub Copilot CLI and
  Claude Code, backed by the Sessionize catalog for TechBash 2026.
- SKILL.md with session/speaker matching, agenda, now/next workflows.
- Comprehensive end-user docs under `docs/`.

[Unreleased]: https://github.com/TechBash/techbash-cli/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/TechBash/techbash-cli/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/TechBash/techbash-cli/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/TechBash/techbash-cli/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/TechBash/techbash-cli/releases/tag/v0.1.0
