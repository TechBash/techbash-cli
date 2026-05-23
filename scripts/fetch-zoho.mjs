#!/usr/bin/env node
// fetch-zoho.mjs
//
// Pulls TechBash sponsor and ticket data from the Zoho Backstage API and
// writes sanitized JSON snapshots under skills/techbash/data/.
//
// Intended to be run by a maintainer-triggered GitHub Action — NOT by end
// users of the plugin. Secrets must be present as environment variables:
//
//   ZOHO_CLIENT_ID        (secret)  Zoho API console client ID
//   ZOHO_CLIENT_SECRET    (secret)  Zoho API console client secret
//   ZOHO_REFRESH_TOKEN    (secret)  Self-client refresh token w/ scopes:
//                                     zohobackstage.sponsor.READ
//                                     zohobackstage.eventticket.READ
//   ZOHO_PORTAL_ID        (var)     TechBash Zoho Backstage portal ID
//   ZOHO_EVENT_ID         (var)     TechBash 2026 event ID
//   ZOHO_API_DOMAIN       (var, optional, default https://www.zohoapis.com)
//   ZOHO_ACCOUNTS_DOMAIN  (var, optional, default https://accounts.zoho.com)
//
// Requires Node 22+.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..");
const OUT_DIR = join(REPO_ROOT, "skills", "techbash", "data");

const REQUIRED_ENV = [
  "ZOHO_CLIENT_ID",
  "ZOHO_CLIENT_SECRET",
  "ZOHO_REFRESH_TOKEN",
  "ZOHO_PORTAL_ID",
  "ZOHO_EVENT_ID",
];

function envOr(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === null || v.trim() === "") return fallback;
  return v.trim().replace(/\/+$/, "");
}

const ACCOUNTS = envOr("ZOHO_ACCOUNTS_DOMAIN", "https://accounts.zoho.com");
const API = envOr("ZOHO_API_DOMAIN", "https://www.zohoapis.com");

function requireEnv() {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }
}

async function mintAccessToken() {
  const body = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });
  const url = `${ACCOUNTS}/oauth/v2/token`;
  console.log(`Token endpoint: ${url}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  if (!json.access_token) {
    throw new Error(`Token exchange returned no access_token: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

async function zohoGet(path, token) {
  const url = `${API}/backstage/v3${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Allowlist-based sanitization — anything not listed here is dropped, so a
// schema change at Zoho cannot accidentally leak new fields (e.g. PII from
// `contact` or `created_by`) into the public repo.
function sanitizeSponsor(raw) {
  return {
    id: raw.id ?? null,
    name: raw.company_name ?? raw.name ?? null,
    tier: raw.sponsorship_type_name ?? raw.tier ?? null,
    description: raw.description ?? null,
    websiteUrl: raw.website_url ?? raw.websiteUrl ?? null,
  };
}

function sanitizeTicket(raw) {
  const quantity = raw.quantity ?? null;
  const sold = raw.sold ?? null;
  const statusString = raw.status_string ?? null;
  const hidden = raw.hidden ?? null;

  const isSoldOut =
    statusString === "sold_out"
      ? true
      : typeof quantity === "number" && typeof sold === "number"
        ? sold >= quantity
        : null;

  const isAvailable =
    statusString === "active" && hidden === false
      ? true
      : statusString != null || hidden != null
        ? false
        : null;

  return {
    id: raw.id ?? null,
    name: raw.name ?? null,
    description: raw.description ?? null,
    price: raw.amount ?? raw.price ?? null,
    currency: raw.currency_code ?? raw.currency ?? null,
    quantity,
    sold,
    saleStartsAt: raw.sales_start_date ?? null,
    saleEndsAt: raw.sales_end_date ?? null,
    status: statusString,
    isSoldOut,
    isAvailable,
  };
}

function pickArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.sponsors)) return payload.sponsors;
  if (Array.isArray(payload?.ticket_classes)) return payload.ticket_classes;
  if (Array.isArray(payload?.ticketClasses)) return payload.ticketClasses;
  if (Array.isArray(payload?.tickets)) return payload.tickets;
  return [];
}

async function main() {
  requireEnv();

  const portalId = process.env.ZOHO_PORTAL_ID;
  const eventId = process.env.ZOHO_EVENT_ID;

  console.log("Minting Zoho access token…");
  const token = await mintAccessToken();

  console.log("Fetching sponsors…");
  const sponsorsListRaw = await zohoGet(
    `/portals/${portalId}/events/${eventId}/sponsors`,
    token,
  );

  // The list endpoint returns abbreviated records — in particular `description`
  // tends to come back duplicated across sponsors. Fetch each sponsor's detail
  // endpoint to get the real per-sponsor fields, falling back to the list row
  // if the detail call fails.
  const sponsorsList = pickArray(sponsorsListRaw);
  const sponsorsRaw = [];
  for (const row of sponsorsList) {
    if (!row?.id) {
      sponsorsRaw.push(row);
      continue;
    }
    try {
      const detail = await zohoGet(
        `/portals/${portalId}/events/${eventId}/sponsors/${row.id}`,
        token,
      );
      sponsorsRaw.push(detail?.sponsor ?? detail ?? row);
    } catch (err) {
      console.warn(
        `  ! detail fetch failed for sponsor ${row.id}: ${err.message} — falling back to list row`,
      );
      sponsorsRaw.push(row);
    }
  }

  console.log("Fetching tickets…");
  const ticketsRaw = await zohoGet(
    `/portals/${portalId}/events/${eventId}/ticket_classes`,
    token,
  );

  const fetchedAt = new Date().toISOString();

  const sponsors = {
    event: "TechBash 2026",
    source: "Zoho Backstage v3",
    fetchedAt,
    sponsors: sponsorsRaw.map(sanitizeSponsor),
  };

  const tickets = {
    event: "TechBash 2026",
    source: "Zoho Backstage v3",
    fetchedAt,
    tickets: pickArray(ticketsRaw).map(sanitizeTicket),
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    join(OUT_DIR, "sponsors.json"),
    JSON.stringify(sponsors, null, 2) + "\n",
  );
  await writeFile(
    join(OUT_DIR, "tickets.json"),
    JSON.stringify(tickets, null, 2) + "\n",
  );

  console.log(
    `Wrote ${sponsors.sponsors.length} sponsors, ${tickets.tickets.length} tickets to ${OUT_DIR}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
