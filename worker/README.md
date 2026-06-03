# Replicate proxy (optional)

Secret Traitor's optional **period-portrait** feature paints each player's selfie into a
16th-century oil portrait using [FLUX.1 Kontext](https://replicate.com/black-forest-labs/flux-kontext-pro)
on Replicate. The game is a static site, but browsers can't call `api.replicate.com`
directly — Replicate sends no CORS headers
([known limitation](https://github.com/replicate/replicate-javascript/issues/164)). This
tiny [Cloudflare Worker](./replicate-proxy.js) is a stateless pass-through that adds CORS
and forwards the player's own token to Replicate.

If you don't deploy it, the game works exactly as before: selfies stay plain initials/photos
and the token field does nothing.

## Privacy

- **The Worker stores nothing.** The token arrives in the request body and is used only to
  forward that single call. No secrets are baked into the Worker.
- **Replicate auto-deletes** all prediction inputs, outputs, and logs within ~1 hour by
  default ([data-retention docs](https://replicate.com/docs/topics/predictions/data-retention)).
- FLUX.1 Kontext runs on Replicate's own GPUs (not relayed to a third party), and Replicate
  states it does not sell or share personal information ([privacy policy](https://replicate.com/privacy)).
- The token lives only in memory on the player's phone — the app never saves it.

## Deploy

### Option A — GitHub Actions (recommended)

The [`deploy-worker.yml`](../.github/workflows/deploy-worker.yml) workflow deploys the Worker
on any push that touches `worker/` (or manually via **Actions → Deploy Replicate proxy Worker
→ Run workflow**). Set these as repository secrets under **Settings → Secrets and variables →
Actions**:

- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token with the **Edit Cloudflare Workers** permission.
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID (Workers & Pages → Account details).

After the first run, the workflow log prints the deployed URL
(`https://secret-traitor-replicate.<your-subdomain>.workers.dev`).

### Option B — Manual

1. Install Wrangler and log in to Cloudflare:
   ```sh
   npm install -g wrangler
   wrangler login
   ```
2. From this `worker/` directory, deploy:
   ```sh
   wrangler deploy
   ```
   Wrangler prints a URL like `https://secret-traitor-replicate.<your-subdomain>.workers.dev`.

### After deploying (either option)

Put the printed URL in [`game.js`](../game.js) as `PORTRAIT_PROXY_URL`.

> **CORS is open (`*`).** Any origin may call the Worker. That's fine because it holds no
> secrets — every request must carry the caller's *own* Replicate token, so an open policy
> just means "anyone with their own token can use it." If request volume ever becomes a
> concern, restrict it with an origin allowlist in [`replicate-proxy.js`](./replicate-proxy.js).

## How a player uses it

1. In **New game → Selfie avatars**, turn the toggle on; a **Replicate API token** field appears.
2. Paste a token from <https://replicate.com/account/api-tokens> (leave blank to skip).
3. Play normally. Each selfie shows immediately; the painted portrait swaps in a few seconds
   later (a gilt shimmer rings the avatar while it generates). Any failure or timeout silently
   keeps the plain selfie.
