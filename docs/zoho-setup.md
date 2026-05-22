# Zoho Backstage setup (maintainers only)

This guide is for TechBash organizers who maintain the `techbash-cli` repo. It walks through the one-time setup that lets the **Refresh Zoho Backstage data** GitHub Action pull sponsor and ticket snapshots from Zoho Backstage into the repo.

End users of the plugin never see any of this — they just read the resulting JSON files in `skills/techbash/data/`.

## How this works

```
maintainer triggers GH Action
        │
        ▼
GH Action runs scripts/fetch-zoho.mjs
        │  (uses Zoho refresh token from GH secret)
        ▼
Zoho API → sponsors + tickets
        │
        ▼
Sanitized JSON written to skills/techbash/data/
        │
        ▼
Action commits + pushes the diff
        │
        ▼
End-user plugins pick up the new data on next /plugin update
```

No Zoho credentials ever leave the GitHub Actions runner. There are no live API calls from end-user machines.

## One-time setup

### 1. Pick a Zoho self-client app

In the [Zoho API Console](https://api-console.zoho.com/), create (or reuse) a **Self Client** with these scopes:

- `zohobackstage.sponsor.READ`
- `zohobackstage.eventticket.READ`
- `zohobackstage.portal.READ` *(needed to look up your portal ID once — see step 3)*
- `zohobackstage.event.READ` *(useful for confirming the event ID)*

Note the **Client ID** and **Client Secret** — you'll need them in step 4.

### 2. Generate a refresh token

From the same Self Client tab in the Zoho API Console:

1. Enter the scopes from step 1 (comma-separated).
2. Set a time duration (10 minutes is fine — you just need to exchange the code quickly).
3. Click **Generate Code**. Copy the resulting **authorization code**.
4. Exchange it for a refresh token by POSTing to Zoho's token endpoint. From any terminal:

   ```sh
   curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
     -d "grant_type=authorization_code" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=THE_CODE_FROM_STEP_3"
   ```

5. The response includes `refresh_token` — that's the long-lived credential to save in GitHub Secrets. **Treat it like a password.**

> If your portal is on a non-`.com` data center (`.eu`, `.in`, `.com.au`, `.jp`, `.sa`, `.ca`), use that domain in step 4 and set `ZOHO_API_DOMAIN` / `ZOHO_ACCOUNTS_DOMAIN` accordingly in step 4 below.

### 3. Find your portal ID and event ID

Once you have a refresh token, you can mint an access token and call `/portals`:

```sh
# Get an access token
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"

# Then list portals
curl "https://www.zohoapis.com/backstage/v3/portals" \
  -H "Authorization: Zoho-oauthtoken THE_ACCESS_TOKEN"

# Then list events in the chosen portal
curl "https://www.zohoapis.com/backstage/v3/portals/PORTAL_ID/events" \
  -H "Authorization: Zoho-oauthtoken THE_ACCESS_TOKEN"
```

Save the **portal ID** and the **event ID** for TechBash 2026.

### 4. Configure the GitHub repo

Repo → **Settings** → **Secrets and variables** → **Actions**.

Under **Secrets** add:

| Name | Value |
| --- | --- |
| `ZOHO_CLIENT_ID` | from step 1 |
| `ZOHO_CLIENT_SECRET` | from step 1 |
| `ZOHO_REFRESH_TOKEN` | from step 2 |

Under **Variables** add:

| Name | Value |
| --- | --- |
| `ZOHO_PORTAL_ID` | from step 3 |
| `ZOHO_EVENT_ID` | from step 3 |
| `ZOHO_API_DOMAIN` *(optional)* | only if non-`.com` (e.g. `https://www.zohoapis.eu`) |
| `ZOHO_ACCOUNTS_DOMAIN` *(optional)* | only if non-`.com` (e.g. `https://accounts.zoho.eu`) |

### 5. Run the workflow

Repo → **Actions** → **Refresh Zoho Backstage data** → **Run workflow**. Pick the `main` branch, optionally enter a reason for the audit log, and click **Run workflow**.

The action will:

1. Mint a fresh access token from your refresh token.
2. Fetch sponsors and tickets.
3. Allowlist-sanitize the response (only known-safe fields are kept).
4. Write `skills/techbash/data/sponsors.json` and `tickets.json`.
5. Commit and push the diff if anything changed.

## Refreshing on demand

Run the workflow again any time sponsor or ticket data changes (a new sponsor signs on, a ticket type sells out, etc.). The commit message includes the reason you typed.

## Security notes

- Refresh tokens never expire on their own, but **rotate them annually** or sooner if you suspect compromise. Generate a new one (steps 1–2), update the `ZOHO_REFRESH_TOKEN` secret, revoke the old token in the Zoho API Console.
- The Zoho refresh token only has READ scopes — even if leaked, an attacker could read sponsor/ticket data (which is largely public anyway) but could not modify the event.
- Allowlist sanitization in `scripts/fetch-zoho.mjs` is your last line of defence. If you extend the script to grab new fields, audit them for PII first.

## Troubleshooting

**Action fails with `Token exchange failed: 400 invalid_grant`.** The refresh token has been revoked or the client credentials don't match. Re-generate per steps 1–2.

**Action fails with `GET /portals/.../sponsors failed: 401`.** Access token mint succeeded but the scopes are missing — re-issue the refresh token with the scopes listed in step 1.

**Action runs but the diff is empty.** Either nothing changed since the last run, or the API returned data in a shape the `pickArray` helper in the script doesn't recognize. Inspect the workflow logs (the script logs the counts it wrote) and update the helper if needed.

**Wrong data center.** If your Zoho portal lives on `.eu`/`.in`/etc., set both `ZOHO_API_DOMAIN` and `ZOHO_ACCOUNTS_DOMAIN` repo variables.
