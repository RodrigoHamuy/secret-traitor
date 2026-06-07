# Replicate proxy (optional)

Secret Traitor's optional **period-portrait** feature paints each player's selfie into a
16th-century oil portrait using [PuLID](https://replicate.com/bytedance/pulid) on
Replicate. The game is a static site, but browsers can't call `api.replicate.com`
directly — Replicate sends no CORS headers
([known limitation](https://github.com/replicate/replicate-javascript/issues/164)). This
tiny [Cloudflare Worker](./replicate-proxy.js) is a **transparent CORS proxy**: whatever
`/v1/*` path the client hits, it forwards verbatim to `api.replicate.com`, injecting the
player's own token. It knows nothing about predictions or polling — the client owns the
whole Replicate contract — so it works as a generic proxy to any Replicate endpoint.

If you don't deploy it, the game works exactly as before: selfies stay plain initials/photos
and the token field does nothing.

## Request contract

The client sends the token in an `X-Replicate-Token` header (a passed-through
`Authorization: Bearer …` also works) and puts the Replicate API path in the URL:

```
POST {proxy}/v1/predictions            ->  create a prediction  (body forwarded verbatim)
GET  {proxy}/v1/predictions/{id}       ->  poll it to completion
```

Only paths under `/v1/` are forwarded (no open redirect to other hosts). The `Prefer`
header is passed through, so the client can use `Prefer: wait` for a one-shot result.

## Privacy

- **The Worker stores nothing.** The token arrives per request in a header and is used only
  to forward that single call. The one optional exception is the `REPLICATE_API_TOKEN`
  fallback secret (see Deploy) — if you set it, anonymous callers spend *your* Replicate
  credits, so pair it with an origin allowlist.
- **Replicate auto-deletes** all prediction inputs, outputs, and logs within ~1 hour by
  default ([data-retention docs](https://replicate.com/docs/topics/predictions/data-retention)).
- PuLID runs on Replicate's own GPUs (not relayed to a third party), and Replicate
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
- `REPLICATE_API_TOKEN` *(optional)* — a Replicate token the Worker uses as a fallback when a
  caller sends no `X-Replicate-Token`. The workflow uploads it as a Worker secret. Leave it
  unset to keep the Worker strictly bring-your-own-token.

After the first run, the workflow log prints the deployed URL
(`https://secret-traitor-replicate.<your-subdomain>.workers.dev`).

### Per-PR preview deployments

Two extra workflows give every pull request a fully self-contained, throwaway preview —
deployed as **fresh, PR-named Workers** rather than Cloudflare's built-in version previews:

- [`pr-preview-deploy.yml`](../.github/workflows/pr-preview-deploy.yml) (on `pull_request`)
  deploys both a backend Worker (`secret-traitor-be-pr-<N>`, this `worker/` proxy) and a
  frontend Worker (`secret-traitor-fe-pr-<N>`, the static site as an assets-only Worker with
  `PORTRAIT_PROXY_URL` rewritten to that PR's backend). New commits redeploy the same two
  Workers, and the run posts/updates a comment with both `*.workers.dev` URLs.
- [`pr-preview-cleanup.yml`](../.github/workflows/pr-preview-cleanup.yml) (on
  `pull_request_target` `closed`) deletes both Workers via the Cloudflare API when the PR is
  closed or merged.

Both reuse the same `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` (and optional
`REPLICATE_API_TOKEN`) repository secrets listed above.

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
3. *(Optional)* Set the fallback token used when a caller sends none:
   ```sh
   wrangler secret put REPLICATE_API_TOKEN
   ```

### After deploying (either option)

Put the printed URL in [`game.js`](../game.js) as `PORTRAIT_PROXY_URL`.

> **CORS is open (`*`).** Any origin may call the Worker. With bring-your-own-token only,
> that just means "anyone with their own token can use it." **But if you set the
> `REPLICATE_API_TOKEN` fallback, anonymous callers spend your credits** — add an origin
> allowlist (and/or rate limiting) in [`replicate-proxy.js`](./replicate-proxy.js) before
> exposing it publicly.

## How a player uses it

1. In **New game → Selfie avatars**, turn the toggle on; a **Replicate API token** field appears.
2. Paste a token from <https://replicate.com/account/api-tokens> (leave blank to skip).
3. Play normally. Each selfie shows immediately; the painted portrait swaps in a few seconds
   later (a gilt shimmer rings the avatar while it generates). Any failure or timeout silently
   keeps the plain selfie.
