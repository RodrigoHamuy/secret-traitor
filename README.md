# Secret Traitor

A free, web-based, mobile-friendly party game of social deduction. The loyal
majority are the **Virtuous**; hidden among them are the **Assassins**, and a lone
**Guardian** tries to keep the innocent alive. By night a hidden Assassin strikes;
by day everyone gathers to accuse and vote. Played with a group in the same room
(or on a call) — each person uses their phone as a private "console" that only
they can see. No accounts, no install: open a link, pick a name, play.

See [`PLAN.md`](./PLAN.md) for the full rules and design.

## Live

| | Link |
| --- | --- |
| 🎮 **Game** (frontend) | https://rodrigohamuy.github.io/secret-traitor/ |
| 🛰️ **Backend** (Replicate proxy Worker) | https://secret-traitor-replicate.hamuyrodrigo.workers.dev |
| 📚 **Storybook** (component library) | https://secret-traitor-sb.hamuyrodrigo.workers.dev |

## Layout

- **Repo root** — the game itself: a vanilla static-HTML app (`index.html`,
  `app.css`, `app.js`, `engine.js`, `game.js`). No build step — serve the files
  as-is (`pnpm dev`). Deployed to GitHub Pages.
- **`worker/`** — optional Cloudflare Worker that proxies Replicate API calls to
  turn a selfie into a period portrait (see [`worker/README.md`](./worker/README.md)).
- **`frontend/`** — TypeScript + Vite + React component library, developed
  story-first in Storybook (`pnpm storybook`). The future home of the React SPA.

## Development

```sh
# Static game (repo root)
pnpm dev

# Component library
cd frontend
pnpm install
pnpm storybook        # dev server
pnpm build-storybook  # static build to storybook-static/
```
