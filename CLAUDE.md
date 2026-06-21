# Secret Traitor — repo guide

## Code style

Don't comment what the code already says. Self-explanatory code needs no comment — skip narration of what a line does, restating a name, or section-header banners. Comment only the non-obvious: a *why*, a gotcha, a workaround, an external constraint. When in doubt, leave it out. Prefer clearer names over explanatory comments.

## Layout

This is a **pnpm workspace** (monorepo): `pnpm-workspace.yaml` at the root lists the member packages (currently just `frontend`), and there is a single root lockfile (`pnpm-lock.yaml`) — do **not** add a per-package lockfile. Run `pnpm install` once at the root to install every package. The root static game and `worker/` have no `package.json` (the worker deploys via wrangler), so they aren't workspace members.

- **Repo root** — the legacy game: a vanilla static-HTML app (`index.html`, `app.css`, `app.js`, `engine.js`, `game.js`). No build step; serve the files as-is (`pnpm dev`). The root `package.json` also exposes `pnpm storybook` / `pnpm build-storybook`, which delegate to the `frontend` package via `pnpm --filter`. It is being replaced by the React SPA in `frontend/`; both ship in parallel during the migration.
- **`worker/`** — optional Cloudflare Worker that proxies Replicate API calls (see `worker/README.md`).
- **`frontend/`** — TypeScript + Vite + React package (pnpm workspace member). Hosts both the **React SPA** (the migration target; `index.html` + `src/main.tsx` → `src/App.tsx`) and the Storybook component library it's built from.
  - **SPA:** game state lives in a [zustand](https://github.com/pmndrs/zustand) store (`src/game/store.ts`); pure rules are ported to `src/game/engine.ts`, with `App.tsx` routing the store's `phase` to the matching screen. From inside `frontend/`: `pnpm dev` (Vite dev server), `pnpm build` (typecheck + build to `dist/`), `pnpm preview`.
  - From the root: `pnpm storybook` / `pnpm build-storybook`. From inside `frontend/`: `pnpm storybook` (dev server) / `pnpm build-storybook` (static build to `storybook-static/`).
  - Storybook is intentionally addon-free (`addons: []` in `.storybook/main.ts`); don't add addons unless asked.
  - **Story convention:** one story per component, named `Playground`, with props driven live by a [leva](https://github.com/pmndrs/leva) panel (leva is a runtime dep, not an SB addon). The per-story leva store + panel are wired once, globally, in `.storybook/preview.tsx` (`LevaStory`, keyed on `context.id` so controls reset on navigation). A story reads that store with `useStoreContext()` and passes it to `useControls(schema, { store })`. Don't add per-state stories or Storybook `args`; add a leva control instead. Components with no varying props (only callbacks) keep a single plain `Default` story.
- **`PLAN.md`** — game design document (rules, milestones, player journey).

## CI / deployments

- `.github/workflows/pr-preview-deploy.yml` — per-PR previews as dedicated Cloudflare Workers: backend (`secret-traitor-be-pr-<N>`), the SPA (`secret-traitor-fe-pr-<N>`, built from `frontend/`), the legacy static game (`secret-traitor-fe-legacy-pr-<N>`), and Storybook (`secret-traitor-sb-pr-<N>`). Posts a sticky comment with the URLs.
- `.github/workflows/pr-preview-cleanup.yml` — deletes all four Workers when the PR closes. If a new per-PR Worker is added to the deploy workflow, its name must also be added to the cleanup loop here.
- `.github/workflows/deploy-pages.yml` — deploys the legacy static game to GitHub Pages on merge to main.
- `.github/workflows/deploy-spa.yml` — deploys the production SPA (built from `frontend/`) to a dedicated Worker (`secret-traitor-fe`) on merge to main, on changes to `frontend/**`. The production counterpart to the per-PR SPA preview.
- `.github/workflows/deploy-worker.yml` — deploys the production Replicate proxy Worker.
- `.github/workflows/deploy-storybook.yml` — deploys the production Storybook (built from `frontend/`) to a dedicated Worker (`secret-traitor-sb`) on merge to main, on changes to `frontend/**`. The production counterpart to the per-PR Storybook preview.

## Migration: static HTML → React SPA (in progress)

The static HTML game at the repo root is being migrated into the React SPA in `frontend/`, reusing the story-first components already built in Storybook. The SPA now has full feature parity (zustand store + ported engine + phase router). Both versions ship in parallel — the SPA at `secret-traitor-fe`, the legacy static game on GitHub Pages — until the SPA is promoted to sole default in a later, explicit step. Keep the two in sync when changing game rules: the source of truth for logic is `frontend/src/game/engine.ts` + `store.ts`.
