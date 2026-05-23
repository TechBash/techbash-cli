#!/usr/bin/env node
// Validates the TechBash CLI plugin repo. Runs in CI and locally:
//   node scripts/validate.mjs
//
// Fails (non-zero exit) on any of:
//   - JSON manifests don't parse
//   - Required manifest fields missing
//   - Version drift between .claude-plugin, .github/plugin, and SKILL.md
//   - SKILL.md or template files missing/invalid YAML frontmatter
//   - Snapshot JSONs missing expected wrapper fields
//   - .mjs scripts fail node --check
import { readFile, readdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const failures = [];

function fail(check, msg) {
  failures.push({ check, msg });
}
function ok(check, msg) {
  console.log(`  ✓ ${check}${msg ? ` — ${msg}` : ""}`);
}

async function readJson(rel) {
  const path = join(ROOT, rel);
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (err) {
    fail(rel, `JSON parse: ${err.message}`);
    return null;
  }
}

function parseFrontmatter(text, rel) {
  // Strip UTF-8 BOM and normalize CRLF so the parser is platform-agnostic.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) {
    fail(rel, "missing leading --- frontmatter delimiter");
    return null;
  }
  const end = text.indexOf("\n---", 4);
  if (end === -1) {
    fail(rel, "missing closing --- frontmatter delimiter");
    return null;
  }
  const body = text.slice(4, end);
  const keys = new Set();
  // Track top-level keys only — sufficient for our presence checks.
  for (const line of body.split("\n")) {
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/);
    if (m) keys.add(m[1]);
  }
  return { body, keys };
}

async function checkManifests() {
  console.log("\n▶ Manifests");
  const claude = await readJson(".claude-plugin/plugin.json");
  const copilot = await readJson(".github/plugin/plugin.json");
  const required = ["name", "description", "version", "license", "repository"];
  for (const [rel, data] of [
    [".claude-plugin/plugin.json", claude],
    [".github/plugin/plugin.json", copilot],
  ]) {
    if (!data) continue;
    for (const f of required) {
      if (data[f] == null || data[f] === "") {
        fail(rel, `missing required field "${f}"`);
      }
    }
    if (!/^\d+\.\d+\.\d+$/.test(data.version ?? "")) {
      fail(rel, `version "${data.version}" is not SemVer x.y.z`);
    }
    ok(rel, `v${data.version}`);
  }
  return { claude, copilot };
}

async function checkSkill() {
  console.log("\n▶ SKILL.md");
  const rel = "skills/techbash/SKILL.md";
  const text = await readFile(join(ROOT, rel), "utf8");
  const fm = parseFrontmatter(text, rel);
  if (!fm) return null;
  for (const k of ["name", "description", "license", "metadata"]) {
    if (!fm.keys.has(k)) fail(rel, `frontmatter missing "${k}"`);
  }
  // Nested metadata.version — pull from raw body.
  const vMatch = fm.body.match(/^\s{2,}version:\s*["']?(\d+\.\d+\.\d+)["']?\s*$/m);
  if (!vMatch) {
    fail(rel, "metadata.version not found or not SemVer");
    return null;
  }
  ok(rel, `v${vMatch[1]}`);
  return { version: vMatch[1] };
}

function checkVersionSync(claude, copilot, skill) {
  console.log("\n▶ Version sync");
  if (!claude || !copilot || !skill) return;
  const versions = {
    ".claude-plugin/plugin.json": claude.version,
    ".github/plugin/plugin.json": copilot.version,
    "skills/techbash/SKILL.md (metadata.version)": skill.version,
  };
  const unique = new Set(Object.values(versions));
  if (unique.size > 1) {
    fail(
      "version-sync",
      `versions diverge: ${Object.entries(versions).map(([k, v]) => `${k}=${v}`).join(", ")}`,
    );
  } else {
    ok("version-sync", `all three at v${[...unique][0]}`);
  }
}

async function checkTemplates() {
  console.log("\n▶ Templates");
  const dir = "skills/techbash/templates";
  const entries = await readdir(join(ROOT, dir));
  const expectedKeys = {
    "session-note.md": ["session_id", "title", "speaker"],
    "daily-rollup.md": ["type", "day"],
    // trip-report.md is intentionally pure prose with no frontmatter
  };
  for (const name of entries) {
    if (!name.endsWith(".md") || name === "README.md") continue;
    const rel = `${dir}/${name}`;
    const needed = expectedKeys[name];
    if (!needed) {
      // Template file with no required frontmatter (e.g. pure prose templates).
      ok(rel, "no frontmatter required");
      continue;
    }
    const text = await readFile(join(ROOT, rel), "utf8");
    const fm = parseFrontmatter(text, rel);
    if (!fm) continue;
    for (const k of needed) {
      if (!fm.keys.has(k)) fail(rel, `frontmatter missing "${k}"`);
    }
    ok(rel, `frontmatter keys ok`);
  }
}

async function checkSnapshots() {
  console.log("\n▶ Snapshots");
  const cases = [
    { rel: "skills/techbash/data/sponsors.json", arr: "sponsors" },
    { rel: "skills/techbash/data/tickets.json", arr: "tickets" },
  ];
  for (const { rel, arr } of cases) {
    const data = await readJson(rel);
    if (!data) continue;
    for (const k of ["event", "source", "fetchedAt", arr]) {
      if (!(k in data)) fail(rel, `missing wrapper field "${k}"`);
    }
    if (!Array.isArray(data[arr])) {
      fail(rel, `"${arr}" must be an array`);
    } else {
      ok(rel, `${data[arr].length} item(s)`);
    }
  }
}

async function checkScripts() {
  console.log("\n▶ Scripts (node --check)");
  const dir = join(ROOT, "scripts");
  const entries = await readdir(dir);
  for (const name of entries) {
    if (!name.endsWith(".mjs")) continue;
    const rel = relative(ROOT, join(dir, name)).split("\\").join("/");
    const code = await new Promise((res) => {
      const p = spawn(process.execPath, ["--check", join(dir, name)], {
        stdio: ["ignore", "ignore", "pipe"],
      });
      let stderr = "";
      p.stderr.on("data", (d) => (stderr += d));
      p.on("close", (c) => {
        if (c !== 0) fail(rel, `node --check: ${stderr.trim().split("\n").pop()}`);
        res(c);
      });
    });
    if (code === 0) ok(rel, "syntax ok");
  }
}

async function main() {
  console.log(`TechBash CLI repo validation — ${ROOT}`);
  const { claude, copilot } = await checkManifests();
  const skill = await checkSkill();
  checkVersionSync(claude, copilot, skill);
  await checkTemplates();
  await checkSnapshots();
  await checkScripts();

  console.log("");
  if (failures.length) {
    console.error(`✗ ${failures.length} failure(s):`);
    for (const f of failures) {
      console.error(`  - [${f.check}] ${f.msg}`);
    }
    process.exit(1);
  }
  console.log("✓ All checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
