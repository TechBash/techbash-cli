# Installation

The TechBash CLI is distributed as a plugin/skill for AI coding assistants. Pick the client you already use.

## Prerequisites

- A supported AI client (see below).
- A working internet connection — the skill fetches live data from <https://sessionize.com>.
- *(Optional)* A project directory you'd like recommendations for. Recommendations work best when your project has a dependency manifest like `package.json`, `*.csproj`, `requirements.txt`, `go.mod`, `Gemfile`, `Cargo.toml`, or `pom.xml`. If you don't have one, you can just tell the assistant what stack you work in.

No API keys, accounts, or sign-ins are required. The Sessionize endpoints we read are public.

## Supported clients

### GitHub Copilot CLI

1. Install the [GitHub Copilot CLI](https://github.com/features/copilot/cli/) if you haven't already, and authenticate it.
2. From any terminal:

   ```text
   /plugin install techbash/techbash-cli
   ```

3. Restart your Copilot CLI session:

   ```text
   /restart
   ```

4. Verify it loaded. In a new session, ask:

   ```text
   What can the TechBash skill do?
   ```

   Copilot should respond with TechBash-specific capabilities (find sessions, look up speakers, build an agenda, etc.). If the response is generic, the plugin didn't load — see [Troubleshooting](#troubleshooting).

### Claude Code

1. Add the marketplace:

   ```text
   /plugin marketplace add techbash/techbash-cli
   ```

2. Install:

   ```text
   /plugin install techbash@techbash-marketplace
   ```

3. Restart Claude Code.

### Other agents (manual install)

The skill is a self-contained markdown file with YAML frontmatter at `skills/techbash/SKILL.md`. Any agent that supports markdown skills with frontmatter can use it — clone the repo and copy that file into your agent's skill directory.

```sh
git clone https://github.com/techbash/techbash-cli.git
# then copy skills/techbash/SKILL.md into your agent's skill folder
```

Refer to your agent's documentation for the correct skill location.

## Updating

The plugin reads the live Sessionize catalog on every conversation, so **session data is always current** — you do not need to update the plugin to see newly added sessions or speakers.

You should update the plugin itself when:

- Workflows have been added or improved (release notes will say so).
- The TechBash organizers swap to a new Sessionize event ID (happens once per year).

To update:

```text
/plugin update techbash/techbash-cli
/restart
```

## Uninstalling

```text
/plugin uninstall techbash/techbash-cli
```

This removes the skill from your client. It does not touch any notes you've saved (`./techbash-notes.md` in your project directories).

## Troubleshooting

**"Plugin not found" when installing.**
Confirm the slug is `techbash/techbash-cli`. The repo is at <https://github.com/techbash/techbash-cli>.

**The skill doesn't activate when I ask about TechBash.**
1. Run `/plugin list` (Copilot CLI) or your client's equivalent and confirm `techbash` is listed and enabled.
2. Restart the session — skills are loaded at startup.
3. Mention "TechBash" explicitly in your question. The skill activates on TechBash-related keywords; a question like "what sessions should I attend?" without any event context is ambiguous.

**Recommendations are bad or generic.**
The skill is dependency-driven. From your project root, check that you have a manifest file the skill can read. If not, just tell the assistant what you work with: *"I write TypeScript and React. What TechBash sessions match?"*

**The schedule is empty / no times shown.**
That's expected when the organizers haven't published the GridSmart schedule yet. See [FAQ — Why don't I see session times?](./faq.md#why-dont-i-see-session-times-or-rooms).

**Network or fetch errors.**
The skill talks to `sessionize.com` over HTTPS. If your network blocks that host, the skill cannot work. Try the URL in your browser: <https://sessionize.com/api/v2/hppwa4hg/view/Sessions>.

Still stuck? Open an issue: <https://github.com/techbash/techbash-cli/issues>.
