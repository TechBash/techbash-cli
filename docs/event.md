# Event Reference

Quick-reference info about TechBash 2026 that the skill draws on. For anything not here, the canonical source is <https://techbash.com>.

## The basics

| Item | Detail |
| --- | --- |
| **Event** | TechBash 2026 |
| **Dates** | October 13–16, 2026 |
| **Venue** | Kalahari Resort & Convention Center |
| **Location** | Pocono Manor, PA, USA |
| **Timezone** | Eastern Time (UTC-4 in mid-October) |
| **Website** | <https://techbash.com> |
| **Tickets** | <https://techbash.zohobackstage.com/TechBash2026> |
| **Organizer** | TechBash — a non-profit, community-run conference led by developers for developers. |

## Format

TechBash runs four days:

- **Day 1 — Optional workshop day.** Full-day deep-dive workshops (sessions prefixed `[WORKSHOP]` in the catalog). Bring a laptop; workshops typically list their own prerequisites.
- **Days 2–3 — Keynotes + breakouts.** The main conference: keynotes, breakout sessions across the tracks below, social events in the evenings.
- **Day 4 — Family Day + final sessions.** Hands-on activities for families on-site (`[FAMILY DAY]` in the catalog), plus the closing sessions.

## Tracks

The catalog covers:

- **Web** — front-end frameworks, browsers, accessibility, performance.
- **Cloud** — AWS, Azure, GCP, serverless, containers.
- **DevOps** — CI/CD, infrastructure as code, observability, platform engineering.
- **Architecture** — distributed systems, data, integration patterns.
- **Best Practices** — testing, code quality, security, refactoring.
- **Soft Skills** — communication, leadership, career, community.

Plus the dedicated workshop day and Family Day described above.

Ask the skill *"show me TechBash sessions in the \<track\> track"* to filter live.

## Venue: Kalahari Resort

Kalahari is the largest indoor waterpark on the East Coast and a full convention center under one roof. Expect:

- On-site hotel rooms (book the TechBash room block via [techbash.com](https://techbash.com)).
- Multiple on-site restaurants.
- Waterpark access (often included with the TechBash room block — verify on the event site).
- Family-friendly amenities — bringing kids is a real option, not a stretch.

For travel directions, parking, the room block link, and anything logistical not in the session catalog, go to <https://techbash.com>.

## Travel

- **By car** — easiest. Kalahari is in the Pocono Mountains, off I-380.
- **By air** — closest commercial airports are Wilkes-Barre/Scranton (AVP, ~45 min), Lehigh Valley (ABE, ~70 min), Newark (EWR, ~90 min), and Philadelphia (PHL, ~2 hr). Rent a car at the airport.

Ask the skill *"how do I get to TechBash from \<airport\>?"* and it will summarize from the website.

## Tickets

Tickets are managed in Zoho Backstage:

- Event page: <https://techbash.zohobackstage.com/TechBash2026>
- Ticket types, pricing, group discounts, and refund policy are all on that page.

The skill will direct you there for any ticketing action — buying, transferring, refunding. **It cannot register you itself.**

> Sponsor and ticket-type data via the Zoho Backstage API are supported in v0.2+. The data is a manually refreshed snapshot committed to the repo — see [Workflows — Sponsors and tickets](./workflows.md#whos-sponsoring-techbash--what-ticket-types-are-available) and (for organizers) [`docs/zoho-setup.md`](./zoho-setup.md).

## Sessionize event ID

The plugin pulls TechBash 2026 data from Sessionize event `hppwa4hg`. Five public endpoints:

| Endpoint | URL |
| --- | --- |
| All (sessions + speakers + rooms + categories) | <https://sessionize.com/api/v2/hppwa4hg/view/All> |
| Sessions | <https://sessionize.com/api/v2/hppwa4hg/view/Sessions> |
| Speakers | <https://sessionize.com/api/v2/hppwa4hg/view/Speakers> |
| Speaker Wall (thumbnails) | <https://sessionize.com/api/v2/hppwa4hg/view/SpeakerWall> |
| Schedule grid | <https://sessionize.com/api/v2/hppwa4hg/view/GridSmart> |

These are public — no key required. You can curl them directly if you want to see the raw data.

## Code of Conduct & community

TechBash is a non-profit, community-run event. Code of Conduct, accessibility information, and the contact channels for organizers all live on <https://techbash.com>.
