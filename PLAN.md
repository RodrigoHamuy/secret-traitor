# Secret Traitor — Project Plan

A free, web-based, mobile-friendly social-deduction party game. Think **The Traitors**
(minus the side-quest missions) crossed with **Secret Hitler**, presented with the
swipe-a-card feel of **Reigns**.

This document is the build plan. **Stage 1 is a clickable fake demo** (no real game
logic, no networking) so we can validate the look, feel, and user journey before
committing to the real implementation.

---

## 1. Product summary

- **Genre:** hidden-role social deduction, played in real life around a table or
  remotely on a call, with phones as the secret "console" for each player.
- **Players:** 5–12 (sweet spot 6–10).
- **Roles:**
  - **Faithful** — the majority. Goal: identify and banish every Traitor.
  - **Traitors** — a small minority (e.g. 1 per ~4 players). Goal: survive and
    outnumber/equal the Faithful.
- **Loop (no side quests):**
  1. **Roles dealt** secretly to each phone.
  2. **Night** — Traitors privately agree on one Faithful to "murder."
  3. **Reveal** — the murdered player is announced and is out.
  4. **Round Table (Day)** — everyone debates, then votes to **banish** one player.
     The banished player's role is revealed.
  5. Repeat until a win condition is met.
- **Win conditions:**
  - **Faithful win** when all Traitors are banished.
  - **Traitors win** when the number of Traitors ≥ number of Faithful remaining
    (or the round limit is reached with a Traitor alive).

### Why "no side quests"
The TV show pads each day with physical missions to grow a prize pot. We deliberately
skip those — the core is the murder/banish/deduction loop, which is what makes the
game tense and easy to play anywhere.

---

## 2. Core UX principles (the "Reigns" feel)

- **One decision at a time, full screen.** Each prompt is a single large card.
- **Swipe / tap to act.** Swipe left or right (or tap two big buttons) to vote,
  accuse, choose a target, or pass.
- **Card stack metaphor.** Information and actions arrive as a deck you work through.
- **Phone-first.** Everything must be thumb-reachable; large tap targets; works in
  portrait; readable outdoors; survives a screen lock (state is restored on reopen).
- **Secret by design.** Your role and night actions are only ever visible on your own
  device. A "hide screen" / tap-to-reveal guard prevents shoulder-surfing.
- **No accounts.** Pick a name, you're in.

---

## 3. Session / lobby model

- A host taps **Create Session** → gets a short room code (e.g. `XR4K`) and a
  shareable URL like `https://<site>/#/join/XR4K`.
- Players open the link on their phones, enter a display name, and land in the lobby.
- The lobby shows the live roster (joined players, avatars/colors).
- When ready, the host taps **Start** → roles are dealt and the game begins.
- Rejoin: reopening the link with the same room code restores the player into their
  seat (important for phones that lock mid-game).

---

## 4. Tech choices

### Frontend (Stage 1 **and** Stage 2)
- **Plain static files: HTML + CSS + vanilla JavaScript (ES modules).**
- **No build tools** — no npm, no bundler, no transpile step. Files are served as-is.
- Hostable directly on **GitHub Pages** (static only).
- Optional, CDN-only helpers if we want them later (all loadable via `<script>` /
  ES-module import, no install):
  - A tiny swipe-gesture helper, or hand-roll it with Pointer Events (preferred — no
    dependency).
  - We intentionally avoid frameworks (React/Vue) to keep it buildless.

### Realtime backend (Stage 2 only — **not** needed for the Stage 1 demo)

Requirement: works with a **purely static frontend** (GitHub Pages can't run server
code), supports rooms + realtime sync via websockets, has a **generous free tier**,
and is **easy**.

**Recommended: Firebase Realtime Database** (or Cloud Firestore).
- **Why it's the easiest fit:** it's 100% client-side — you load the SDK from a CDN as
  an ES module, no server to write or deploy, no build step. It uses websockets under
  the hood, syncs JSON state to every connected phone in real time, and handles
  presence/disconnect. This pairs perfectly with a static GitHub Pages site.
- **Free tier:** Spark plan is free (generous for a party game: 100 simultaneous
  connections on Realtime DB, 1 GB stored, 10 GB/month download) — far beyond what
  casual sessions need.
- **Room model:** each session is a node keyed by room code; players read/write under
  it; security rules lock writes to the room.

**Alternatives considered:**
| Option | Pros | Cons for us |
|---|---|---|
| **PartyKit** | Purpose-built for multiplayer rooms, lovely DX | Requires a deploy/build step (npm) — conflicts with "no build tools / static only" |
| **Supabase Realtime** | Generous free tier, Postgres-backed, client SDK via CDN | Slightly more setup (tables/policies) than Firebase for simple JSON state |
| **Ably / PubNub** | Big free message quotas, pure pub/sub | We'd hand-build room/state logic on top of raw messaging |
| **Socket.io self-host** | Full control | Needs a server we'd have to host (not static, not free-forever-trivial) |

**Decision:** start Stage 2 on **Firebase Realtime Database** for the lowest-friction
path that keeps the frontend static and free. Revisit only if limits or rules become
painful.

> Note: none of this backend is wired up in Stage 1 — the demo is fully self-contained
> static files.

---

## 5. Stage 1 — the fake demo (this is what we build first)

**Goal:** a polished, clickable walkthrough of the *happy path* with **no real logic
and no networking**. Everything is scripted/faked so we can feel the game and the
mobile card UX. It is just static files we can drop on GitHub Pages.

### What "fake" means
- No websockets, no backend, no role-dealing algorithm, no win detection.
- A single device walks through a pre-baked storyline (canned players, canned events).
- "Other players" are simulated (fake roster, fake votes, fake murder result).
- Navigation is driven by tap/swipe moving through scripted scenes.

### Happy-path script (the demo flow)
1. **Landing / title card** — game name, "Create Session" and "Join Session" buttons.
2. **Create Session** → shows a fake room code `XR4K` + a fake share link with a
   "Copy link" button and a (decorative) QR placeholder.
3. **Lobby** — roster fills in with a few canned players (auto-appear over ~2s to
   simulate others joining). Host sees a **Start** button.
4. **Role reveal** — full-screen secret card with a tap-to-reveal guard
   ("Tap to see your role"). Reveals e.g. **"You are a TRAITOR"** with flavor art.
5. **Night phase** — as a Traitor, swipe through Faithful cards to pick who to
   "murder"; confirm choice. (As Faithful in an alt path: a "Sleep" waiting card.)
6. **Morning reveal** — a card announces who was murdered.
7. **Round Table / vote** — swipe through suspects, cast a banish vote; show a faked
   tally animation.
8. **Banishment reveal** — banished player's role flips over.
9. **Round summary** — who's left, faithful vs traitor counts (faked).
10. **Win screen** — a scripted ending card (e.g. "The Traitors win!") with
    **Play again** returning to the title.

### Pages / files (proposed)
```
/index.html            # entry; hash-router mounts scenes
/styles/
  app.css              # design system: colors, cards, buttons, layout
/scripts/
  router.js            # tiny hash-based scene router (#/lobby, #/night, ...)
  scenes/
    title.js
    create.js
    lobby.js
    role-reveal.js
    night.js
    morning.js
    round-table.js
    banishment.js
    summary.js
    win.js
  swipe.js             # Pointer-Events swipe/tap helper for the card stack
  fakeData.js          # canned players, scripted events, fake tallies
/assets/
  icons, simple art, favicon
README.md              # how to run/preview + deploy to GH Pages
PLAN.md                # this file
```
- **No bundler:** `index.html` loads `scripts/router.js` as
  `<script type="module">`; scenes import each other via relative ES-module paths.
- Works by opening `index.html` directly or via any static server; deploys to GH Pages
  with zero config.

### Stage 1 design tasks
- Define the **visual style** (dark, moody, candlelit "castle" vibe; high-contrast
  cards; one accent color for Traitors red / Faithful gold).
- Build the **reusable card component** (swipe + two-button fallback, accessible).
- Build the **scene router** and wire the 10-step script.
- Tune for **mobile**: viewport meta, safe-area insets, large hit targets, no
  horizontal scroll, 60fps swipe.

### Stage 1 acceptance criteria
- Loads as static files (open `index.html`, no server, no build).
- Full happy-path is clickable end-to-end on a phone-sized viewport.
- Feels like a card game (swipe interactions, full-screen cards).
- Deployable to GitHub Pages as-is.
- No real networking or game logic (all faked) — by design.

---

## 6. Stage 2 — the real game (after we approve the demo)

Only begins once we're happy with Stage 1. High level:

- Wire **Firebase Realtime Database**: create/join room by code, live roster,
  presence, host controls.
- Implement **real role dealing** (server-authoritative-ish via DB rules; secret roles
  per player).
- Implement the **state machine**: lobby → night → morning → round table → banish →
  win check → repeat.
- Real **voting** and **night target** resolution with tie-handling rules.
- **Win-condition** detection.
- Reconnect / rejoin handling, host migration if host drops.
- Anti-cheat hardening via DB security rules (you can only read your own role, only
  write your own vote, etc.).
- Spectator / eliminated-player view.

(Stage 2 is intentionally light on detail here — we'll spec it properly after the demo
is validated.)

---

## 7. Open questions to resolve before Stage 2
- Player count bounds and exact Traitor ratio per count.
- Tie rules at the Round Table (revote? no banishment? host tiebreak?).
- Round/time limits, if any.
- Do Traitors get a "recruit" mechanic (convert a Faithful), like the show? (Default:
  no, to keep v1 simple.)
- Remote vs in-person framing for copy and timers.

---

## 8. Milestones
1. **M1 — Demo (Stage 1):** static clickable happy-path, deployed to GH Pages. ← first
2. **Review & iterate** on feel.
3. **M2 — Realtime lobby:** create/join/roster live via Firebase.
4. **M3 — Core loop:** roles, night, banish, win detection.
5. **M4 — Robustness:** reconnect, security rules, edge cases.
6. **M5 — Polish:** art, sound, animations, accessibility pass.
