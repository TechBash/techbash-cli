# Templates

These markdown templates back the notes and trip-report workflows in `../SKILL.md`. The skill reads them, fills in placeholders (`{{...}}`), and writes the result into the user's working directory.

| Template | Used by workflow |
| --- | --- |
| `session-note.md` | "Log a note from \<session\>" |
| `daily-rollup.md` | "Wrap up my TechBash day" |
| `trip-report.md` | "Draft a TechBash trip report" |

## Editing rules

- Keep placeholders as `{{snake_case}}` so the skill can find and substitute them deterministically.
- YAML frontmatter at the top of `session-note.md` and `daily-rollup.md` is **load-bearing** — the trip-report workflow greps it for filtering. Don't remove `session_id`, `track`, `day`, `rating`, or `type`.
- If you add or remove placeholders, update the relevant workflow in `../SKILL.md` in the same commit.
