# FAQ

## Setup

### Do I need an account or API key?

No. The TechBash skill reads public Sessionize endpoints and runs entirely through your AI client. The only credentials you need are whatever your AI client (Copilot CLI, Claude Code) already requires.

### Does it work offline?

No. The skill fetches live data from `sessionize.com` on each conversation. Cache an answer if you need it offline later (e.g., save your agenda as `techbash-agenda.md`).

### Which AI clients are supported?

- **GitHub Copilot CLI** — primary target.
- **Claude Code** — supported via the same manifest.
- Any other client that loads markdown skills with YAML frontmatter can use `skills/techbash/SKILL.md` directly.

See [Installation](./installation.md) for client-specific steps.

---

## Recommendations & search

### Why didn't the skill recommend session X?

Recommendations are dependency-driven. If your project doesn't mention the relevant technology in any manifest file, the skill won't connect the dots. Two ways to fix:

1. Tell the assistant your stack explicitly: *"I also work with Postgres and Terraform — does that change your TechBash recommendations?"*
2. Ask for the full list on a topic: *"Show me every TechBash session about AI."*

### Why did the skill recommend a session that's not relevant?

Matching is keyword-based against session titles, descriptions, and categories. Common words like "API" or "design" can cause false positives. Ask the assistant to refine: *"Drop the design sessions and show me more on backend APIs."*

### Can I search by speaker, room, or time?

Yes for speaker and (once the schedule is published) room/time. Ask in plain English: *"What TechBash sessions is Mitchel Sellers giving?"* or *"What's in the main hall at 2pm on Wednesday?"*

---

## Schedule

### Why don't I see session times or rooms?

The TechBash organizers publish the detailed schedule (Sessionize "GridSmart" view) closer to the event. Until they do, the catalog has sessions and speakers but no rooms or times. The skill explicitly tells you when this is the case rather than guessing.

Once the schedule lands, every workflow that uses times (personal agenda, "what's now", "what's next") starts working without any plugin update — the data is live.

### How do I get my agenda into my calendar?

After the schedule is published, ask:

```text
Save my TechBash agenda as an ICS file.
```

You'll get `techbash-agenda.ics` you can import into Google Calendar, Outlook, or Apple Calendar.

---

## Data freshness

### The catalog changed but the skill is showing stale info.

The skill caches data for the duration of one conversation. Ask:

```text
Refresh the TechBash data and try that again.
```

That forces a re-fetch on the next request. Starting a new conversation also resets the cache.

### How current is the data?

It's pulled live each conversation, so it's as current as the organizers' Sessionize event. The only things missing pre-event are rooms/times (until the schedule grid is published) and any sessions added very recently within the same conversation.

---

## Privacy & data

### What data leaves my machine?

- HTTPS requests to `https://sessionize.com/api/v2/hppwa4hg/view/*` to fetch the public catalog.
- Anything you type to your AI client — which goes wherever that client normally sends prompts (Copilot, Anthropic, etc.). The TechBash skill itself does not send your prompts anywhere new.

### What about my project files?

The skill reads dependency manifests (`package.json`, etc.) **only when you ask for project-based recommendations**, and only the parts of those files needed to identify your stack. Your AI client may include that content in the prompt context it sends to its model — review your client's privacy docs.

### Where are my notes stored?

`./techbash-notes.md` in the directory where you ran the command. It's a plain markdown file that you own. The skill only reads it when you explicitly ask for a summary or trip report. Nothing is uploaded anywhere by the skill.

### Can I delete my notes?

Yes — just delete `techbash-notes.md`. The skill keeps no other state.

---

## Tickets, sponsors, registration

### Can the skill buy me a ticket?

No. Ticketing is handled by Zoho Backstage. The skill will link you to <https://techbash.zohobackstage.com/TechBash2026> when you ask.

### Can the skill show me sponsors?

Not yet. Sponsor data via the Zoho Backstage API is on the roadmap for a future release. For now, see <https://techbash.com> for the current sponsor list.

### Can the skill check seat availability for a workshop?

Not yet — same reason. Workshop registration and availability come from Zoho Backstage, which isn't wired up in v0.1.

---

## Family Day & workshops

### Is TechBash really family-friendly?

Yes — there's a dedicated Family Day with hands-on activities for kids, and the venue (Kalahari Resort) has the largest indoor waterpark on the East Coast. Ask: *"What's happening on Family Day at TechBash?"* for the current activity list.

### How do I see the workshop lineup?

```text
What TechBash workshops are available this year?
```

The skill filters for sessions whose titles start with `[WORKSHOP]`. Ask follow-ups about prerequisites and what you need installed for each one.

---

## Troubleshooting

### The skill doesn't activate when I ask.

See [Installation — Troubleshooting](./installation.md#troubleshooting). Quick checklist: confirm the plugin is installed and enabled, restart the session, mention "TechBash" by name.

### The skill returns an error fetching data.

Check that `https://sessionize.com/api/v2/hppwa4hg/view/Sessions` loads in your browser. If it doesn't, your network is blocking Sessionize. If it does and the skill still fails, open an issue: <https://github.com/techbash/techbash-cli/issues>.

### A speaker or session looks wrong.

Source of truth is the Sessionize catalog. If the catalog itself is wrong, contact the TechBash organizers via <https://techbash.com>. If the catalog is right and the skill is reporting it wrong, please open an issue with the question you asked and the response you got.

---

## Still stuck?

Open an issue or start a discussion at <https://github.com/techbash/techbash-cli>.
