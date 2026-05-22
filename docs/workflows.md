# Workflow Recipes

Detailed recipes for every workflow the TechBash skill supports. Each recipe shows what to ask, what the assistant does, and what to expect back.

Mention **TechBash** explicitly in your question so the assistant knows to use this skill. Without that keyword, the assistant might answer from generic knowledge instead.

---

## Find sessions that match your project

**Ask:**

```text
What TechBash sessions match my project?
```

**What happens:**

1. The assistant scans the current directory for dependency manifests:
   - `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - `*.csproj`, `*.sln`, `*.fsproj`, `*.vbproj`
   - `requirements.txt`, `pyproject.toml`, `Pipfile`
   - `go.mod`, `Gemfile`, `Cargo.toml`, `pom.xml`, `build.gradle`
   - `Dockerfile`, `*.bicep`, `*.tf`, `.github/workflows/*.yml`
2. It extracts your stack — languages, frameworks, cloud providers, key libraries.
3. It fetches the TechBash 2026 catalog once and matches your stack against session titles, descriptions, and categories.
4. It returns 3–7 sessions grouped by **Directly relevant**, **Adjacent**, and **Soft skills**.

**Tips:**

- No project handy? Tell the assistant your stack in plain English: *"I write Go microservices on Kubernetes. Find TechBash sessions for me."*
- Ask for more depth: *"Show me every TechBash session that mentions AI."*
- Narrow by track: *"What soft-skills sessions are at TechBash?"*

---

## Look up a speaker

**Ask:**

```text
Tell me about Joseph Guadagno at TechBash.
```

**What you get back:**

- Full name, tagline, bio.
- Profile picture URL.
- All sessions they're presenting at TechBash 2026.
- Their links: X (Twitter), LinkedIn, blog, company website.

**Variants:**

```text
Who's speaking on .NET at TechBash?
Find all TechBash speakers from Pennsylvania.
Show me TechBash speakers who are also presenting workshops.
```

The assistant joins the Sessions and Speakers views from Sessionize to answer these.

---

## Browse the workshop day

TechBash 2026 includes a dedicated optional workshop day. Workshop sessions are prefixed `[WORKSHOP]` in the catalog.

**Ask:**

```text
What TechBash workshops are available?
What's the .NET workshop about?
```

The assistant returns the workshop list with abbreviated descriptions, plus the full description on request. Workshops typically have prerequisites — ask the assistant to list them: *"What do I need installed for the .NET workshop?"*

---

## Browse Family Day

TechBash welcomes families on a dedicated day. Family Day sessions are prefixed `[FAMILY DAY]` in the catalog.

**Ask:**

```text
What's happening on Family Day at TechBash?
```

You'll get the activity list (think mad-science labs, hands-on demos, age-appropriate workshops). Great for sharing with a partner before deciding whether to bring the kids.

---

## Build a personal agenda

**Ask:**

```text
Build a TechBash agenda for me based on my project.
```

**What happens:**

1. The assistant runs the project-matching workflow above to pick recommended sessions.
2. It fetches the schedule grid (Sessionize `GridSmart`).
3. **If the schedule is published**, it builds a day-by-day itinerary with rooms and times, flags conflicts, and offers to save the result to `techbash-agenda.md` and/or `techbash-agenda.ics`.
4. **If the schedule isn't published yet**, it returns an un-timed shortlist and offers to save it for later.

**Tips:**

- Ask for an `.ics` file: *"Save my TechBash agenda as a calendar file."* Import the resulting `.ics` into Google Calendar, Outlook, or Apple Calendar.
- Add manual entries: *"Add the speaker dinner Thursday night at 7pm to my TechBash agenda."*
- Re-rank: *"Rebuild my agenda but prioritize hands-on labs over breakouts."*

---

## What's happening right now / next

Useful while you're walking around the venue.

**Ask:**

```text
What's happening at TechBash right now?
What's the next session in the main hall?
What's coming up in the Aspen room?
```

The assistant pulls the current Eastern Time, compares it to the GridSmart schedule, and tells you what's live and what's queued.

**Requires the schedule to be published.** Until then, the assistant will say so.

---

## Log a note from a session

**Ask:**

```text
Log a TechBash note from "From Idea to Design for Non-Designers":
The five-step framework slide is the takeaway. Photo on my phone.
Action: try this on the new dashboard wireframes Monday.
```

**What happens:**

1. The assistant fuzzy-matches the session title (or accepts an ID).
2. If the match is ambiguous, it confirms with you before writing.
3. It appends an entry to `./techbash-notes.md` in your current directory, creating the file if needed:

   ```markdown
   ## 2026-10-14T11:32:00-04:00 — From Idea to Design for Non-Designers
   **Speaker(s):** Abbey Perini
   **Room:** n/a

   The five-step framework slide is the takeaway. Photo on my phone.
   Action: try this on the new dashboard wireframes Monday.
   ```

**Privacy:** the notes file is local. The assistant only reads it when you explicitly ask for a summary or trip report.

---

## Summarize notes / draft a trip report

**Ask:**

```text
Summarize my TechBash notes.
Draft a trip-report blog post from my TechBash notes.
Pull the action items out of my TechBash notes into a checklist.
```

The assistant reads `./techbash-notes.md`, groups by theme or day, surfaces recurring topics, and pulls concrete next steps to the top. For a blog draft it will offer to save the result to a new file — it won't overwrite anything without confirmation.

---

## Scaffold a project from a session

**Ask:**

```text
Scaffold a project based on the .NET Aspire session at TechBash.
```

**What happens:**

1. The assistant **asks where to create the project** — new directory, current directory, or an explicit path. It won't assume.
2. It looks up the session and reads the description.
3. It identifies the technologies (Aspire, ASP.NET Core, Postgres, whatever).
4. It scaffolds a minimal starter with current dependency versions, plus a `README.md` linking back to the session and the speaker's profile.
5. It calls out that the scaffold is inspired by the session description — to get the full value, attend or watch the recording.

---

## Get help on a session you haven't seen yet

**Ask:**

```text
What prerequisites do I need for the TechBash .NET workshop?
Will the "From Idea to Working Application" session help me with my Rails app?
```

The assistant reads the session description and answers from that. It will not guess at content that isn't in the abstract.

---

## Refresh the data

The assistant fetches the catalog once per conversation. If a new session or speaker was just added and you want to see it:

```text
Refresh the TechBash data and try again.
```

This forces a re-fetch on the next request.

---

## What the skill won't do

- **Register, transfer, or refund tickets.** It will direct you to <https://techbash.zohobackstage.com/TechBash2026>.
- **Invent data.** If a session has no room or time yet, it says "schedule not yet published" rather than guessing.
- **Modify the catalog.** It's read-only against Sessionize.
- **Save anything to disk without asking.** Note logging is the one exception — and only the file you named.

---

## Who's sponsoring TechBash? / What ticket types are available?

**Ask:**

```text
Who's sponsoring TechBash this year?
What ticket types are available for TechBash?
How much is a TechBash workshop-day ticket?
```

**What happens:**

The assistant reads a committed JSON snapshot under `skills/techbash/data/` — `sponsors.json` and `tickets.json`. These are refreshed manually by TechBash organizers via a GitHub Action, so the data can be slightly out of date. The assistant will always tell you the snapshot timestamp (`fetchedAt`) so you know how fresh the answer is.

If the snapshot is empty (the organizers haven't run the refresh action yet), the assistant says so plainly and points you at the canonical source: <https://techbash.com> for sponsors, <https://techbash.zohobackstage.com/TechBash2026> for tickets.

**Limitations:**

- **Not real-time.** Sold-out / availability flags reflect the last refresh.
- **Read-only.** The skill cannot buy, transfer, or refund tickets — that's always a hand-off to the Zoho Backstage page.
- **Organizer responsibility.** Refreshing the snapshot is a maintainer action documented in [`docs/zoho-setup.md`](./zoho-setup.md).
