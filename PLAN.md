# Secret Traitor — Game Plan

> Comparisons to existing TV or tabletop games have been kept out of this document so
> the project stands on its own. The loyal majority are the **Virtuous**; hidden among
> them are the **Assassins**, and a lone **Guardian** tries to keep the innocent alive.

A free, web-based, mobile-friendly party game of social deduction. By night a hidden
**Assassin** strikes; by day everyone gathers to accuse and vote. Played with a group
in the same room (or on a call), each person uses their phone as a private "console"
that only they can see.

This document focuses on **the rules and the player experience**. Technical details
(hosting, networking, code structure) are intentionally left out for now — we'll spec
those once the rules and the demo feel right.

---

## 1. The game in one breath

Everyone is secretly assigned a role. Each **night**, the Assassins quietly choose
someone to eliminate and the Guardian quietly chooses someone to protect. Each **day**,
the survivors debate and vote to eliminate one suspect. The Virtuous win when every
Assassin is caught; the Assassins win when they equal or outnumber everyone else.

- **Players:** 5–12 (sweet spot 6–10).
- **Length:** a few minutes to ~15 minutes per game.
- **No accounts, no app install.** Open a link, pick a name, play.

---

## 2. Roles

### 🍷 Virtuous
An ordinary, innocent member of the group, with no special power.
- **Goal:** work out who the Assassins are and vote them out.
- **On their turn:** just cast a vote (no special action).
- The Virtuous are the majority and win by deduction, debate, and voting.

### 🗡️ Assassin
A secret traitor hiding among the Virtuous. (There may be more than one; they know each
other.)
- **Goal:** eliminate the Virtuous until the Assassins equal or outnumber everyone else.
- **On their turn:** secretly mark **one victim**, then vote like everyone else. If there
  are two Assassins, their marks are tallied — they must agree on a target to land a kill.
- They pose as Virtuous, deflecting suspicion.

### 🛡️ Guardian
One of the Virtuous, sworn to protect the innocent.
- **Goal:** same as the Virtuous — catch the Assassins.
- **On their turn:** secretly chooses **one person to protect**, then votes. If the
  Assassins strike that person this round, the strike fails and **no one dies**.
- The Guardian may be allowed to protect themselves (a setting we can tune later).

**Suggested role counts** (starting point, to balance during playtesting):

| Players | Assassins | Guardian | Virtuous |
|:------:|:--------:|:------:|:--------:|
| 5      | 1        | 1      | 3        |
| 6–7    | 1        | 1      | 4–5      |
| 8–9    | 2        | 1      | 5–6      |
| 10–12  | 2        | 1      | 7–9      |

---

## 3. How a round works

On one shared phone there is **no separate night and day** — coordinating "everyone
close your eyes" while also passing a phone around is fiddly, and naming whose turn it is
("pass to the Assassins") would leak roles. Instead each round is **one pass around the
table**, and every action — assassinate, protect, vote — happens on a player's own private
turn. Because everyone takes the phone in turn order and the prompt only ever says
"Pass the phone to *X*", identities stay hidden.

### 🕯️ The pass (each player, in turn, behind the "I'm X" gate)
- **Assassin** → secretly marks a victim, **then** casts their vote *(2 selections)*.
- **Guardian** → secretly picks someone to protect, **then** votes *(2 selections)*.
- **Virtuous** → just votes *(1 selection)*.

### ⚖️ Resolution (after the pass)
1. **Tally the votes** → the player with the most votes is **banished** and their role is
   revealed. *(A tie or no votes = nobody is banished.)*
2. **Cancellations:**
   - A **banished Assassin's** mark is **cancelled**. If that was the **last Assassin**,
     the game is already over (Virtuous win) and the strike never lands.
   - A **banished Guardian's** shield is **cancelled** — but play continues.
3. **The strike lands.** Surviving Assassins' marks are tallied into one victim, who is
   **slain unless an active Guardian protected them** (then the strike fails and nobody
   dies). The victim's role is revealed.

Then a new round begins, unless someone has already won.

### Lobby options (two independent toggles)

**📱 One phone only (pass & play).** Whether the group **shares a single device** or
**each player uses their own phone**.
- *On:* everyone shares one phone and passes it around; secret moments (your role, your
  vote) are shown on this device when it's handed to you.
- *Off:* each player joins on their own phone, so secret moments happen privately on each
  person's own screen — nothing needs to be passed around.

**🤫 Suspense mode.** Whether the day vote is revealed **one ballot at a time** or **all
at once**.
- *On:* ballots are uncovered one player at a time while everyone else waits, then the
  result is tallied — a tense, dramatic ritual. Great in the same room or on a call.
- *Off:* votes resolve instantly for a faster game.

**🤳 Selfie avatars.** Whether each player's token is a **selfie** or **their initials**.
- *On:* when the phone reaches a player for their secret role, they snap a selfie that
  becomes their avatar everywhere (votes, eliminations, the final reveal).
- **Privacy:** photos are **never saved or uploaded** — they live only in memory for this
  one game session, on this device, and are gone when the game ends. Each capture screen
  says so, and a "Skip — use initials" option is always offered (and is the automatic
  fallback if the camera is unavailable or permission is denied).

These combine naturally: with suspense on, "one phone only" means literally handing the
phone to each player in turn to reveal; on separate devices, each player reveals on their
own screen and the results arrive one by one.

---

## 4. Winning

- 🍷 **The Virtuous (and the Guardian) win** the moment **every Assassin has been
  eliminated.**
- 🗡️ **The Assassins win** the moment the number of Assassins is **equal to or greater
  than** the number of remaining Virtuous (at that point they can no longer be
  out-voted).

---

## 5. The happy player journey (what the demo shows)

The first build is a **clickable demo** — static screens that walk one player through a
winning game, **highlighting exactly what to tap at each step**. Nothing real happens
behind the scenes; it exists so we can feel the flow and the card-style mobile UI
before building the real thing. The scripted journey:

1. **Title** — tap **Create Game**.
2. **Lobby** — a room code, a scannable QR, and a shareable link appear; friends "join"
   and fill the roster. Two toggles are shown (both on by default in the demo): **One
   phone only** and **Suspense mode**; tap **Start Game**.
3. **Your secret role** — tap the face-down card to reveal **"You are the Guardian."**
4. **Night 1 — protect** — choose someone to protect for the night.
5. **Dawn 1** — "The strike failed — the Guardian made a save! Everyone survived."
6. **Day 1 — vote** — tap a suspect to cast your vote. With Suspense mode on, the ballots
   are then revealed **one at a time** before the tally — handed around (one phone) or
   arriving from each player's own device — and the suspect is eliminated and revealed to
   be an **Assassin**.
7. **Night 2 — protect** — choose someone to protect again.
8. **Dawn 2** — one of the Virtuous is found eliminated (the Guardian guessed wrong this
   time).
9. **Day 2 — vote** — the group votes out the **last Assassin**.
10. **Victory** — "The Virtuous win! Every Assassin has been caught." Tap **Play
    Again**.

The demo lives as plain static files (just open it in a browser; trivial to host).

---

## 6. Open questions to settle during playtesting

- **Ties at the day vote:** re-vote, no elimination that day, or random?
- **Can the Guardian protect themselves**, and can they protect the same person two
  nights in a row?
- **Exact role counts** per player count (the table in §2 is a starting guess).
- **Assassin communication at night** — silent in-app pick, or assume they talk in
  person?
- **Eliminated players' view** — do they watch silently, or see all roles?
- **Optional flavor:** themed copy, art, and sound for the night/day cycle.

---

## 7. Milestones

1. ✅ **M1 — Demo:** static, clickable happy-path that highlights each tap. *(Kept as a
   "Demo mode" toggle on the title screen for teaching the game.)*
2. ✅ **M2 — Single-device game (one shared phone):** real, fully playable pass-&-play
   game — setup & role dealing, secret role reveal, narrated night (Assassins + Guardian),
   dawn resolution, secret day vote with optional suspense reveal, and win detection.
   No backend required (pure static). Logic lives in `engine.js`; UI in `game.js`.
3. **M3 — Online lobby (link/QR join):** cross-device play over a **zero-setup P2P**
   transport (Trystero via CDN) so the "create a session, share a link" flow works on
   static hosting. Reuses the same `engine.js`.
4. **M4 — Polish:** art, sound, animation, reconnection, accessibility.
