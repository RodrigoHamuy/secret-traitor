# Secret Traitor — repo guide

## Layout

- **Repo root** — the current game: a vanilla static-HTML app (`index.html`, `app.css`, `app.js`, `engine.js`, `game.js`). No build step; serve the files as-is (`pnpm dev`).
- **`worker/`** — optional Cloudflare Worker that proxies Replicate API calls (see `worker/README.md`).
- **`frontend/`** — TypeScript + Vite + React package (pnpm). Currently a Storybook-only component library; it is the future home of the React SPA (see roadmap below).
  - `pnpm storybook` — dev server, `pnpm build-storybook` — static build to `storybook-static/`.
  - Storybook is intentionally addon-free (`addons: []` in `.storybook/main.ts`); don't add addons unless asked.
  - **Story convention:** one story per component, named `Playground`, with props driven live by a [leva](https://github.com/pmndrs/leva) panel (leva is a runtime dep, not an SB addon). The per-story leva store + panel are wired once, globally, in `.storybook/preview.tsx` (`LevaStory`, keyed on `context.id` so controls reset on navigation). A story reads that store with `useStoreContext()` and passes it to `useControls(schema, { store })`. Don't add per-state stories or Storybook `args`; add a leva control instead. Components with no varying props (only callbacks) keep a single plain `Default` story.
- **`PLAN.md`** — game design document (rules, milestones, player journey).

## CI / deployments

- `.github/workflows/pr-preview-deploy.yml` — per-PR previews as dedicated Cloudflare Workers: backend (`secret-traitor-be-pr-<N>`), frontend (`secret-traitor-fe-pr-<N>`), and Storybook (`secret-traitor-sb-pr-<N>`, built from `frontend/`). Posts a sticky comment with the URLs.
- `.github/workflows/pr-preview-cleanup.yml` — deletes all three Workers when the PR closes. If a new per-PR Worker is added to the deploy workflow, its name must also be added to the cleanup loop here.
- `.github/workflows/deploy-pages.yml` — deploys the static game to GitHub Pages on merge to main.
- `.github/workflows/deploy-worker.yml` — deploys the production Replicate proxy Worker.
- Storybook is **PR-preview only** by design — it is not deployed on merge to main.

## Roadmap (not yet started — do NOT do this unless explicitly asked)

Long term, the static HTML game at the repo root is to be migrated into a React SPA living in `frontend/`, building components story-first in the existing Storybook. Until that migration is requested, treat the root static app as the production game and `frontend/` as Storybook-only.
