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

### ⚖️ Virtuous
An ordinary, innocent member of the group, with no special power.
- **Goal:** work out who the Assassins are and vote them out during the day.
- **At night:** sleeps (no action).
- The Virtuous are the majority and win by deduction, debate, and voting.

### 🗡️ Assassin
A secret traitor hiding among the Virtuous. (There may be more than one; they know each
other.)
- **Goal:** eliminate the Virtuous until the Assassins equal or outnumber everyone else.
- **At night:** the Assassins privately agree on **one person to eliminate**.
- By day they pose as one of the Virtuous, deflecting suspicion.

### 🛡️ Guardian
One of the Virtuous, sworn to protect the innocent.
- **Goal:** same as the Virtuous — catch the Assassins.
- **At night:** privately chooses **one person to protect**. If the Assassins target
  that person this night, the strike fails and **no one dies**.
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

Each round is one **Night** followed by one **Day**.

### 🌙 Night
1. Everyone "goes to sleep" — phones show a neutral waiting screen.
2. **Assassins** secretly pick one person to eliminate.
3. **Guardian** secretly picks one person to protect.
4. **The Virtuous** simply wait for night to end.

### ☀️ Dawn
- If the Assassins' target was the same person the Guardian protected → **the strike
  fails, nobody dies.**
- Otherwise → that person is **eliminated** and their role is revealed to everyone.

### 🗣️ Day
1. The survivors debate who they suspect.
2. Everyone **votes** to eliminate one person.
3. The person with the most votes is **eliminated** and their role is revealed.
   *(Tie-handling is an open question — see §6.)*

Then a new round begins, unless someone has already won.

### 🤫 Suspense mode (optional)
A lobby toggle for groups playing **in the same room or on a video call**. When it's on,
the day vote isn't tallied instantly — instead the ballots are uncovered **one player at
a time**. Each person, in turn, "takes the phone" (or shares their screen) and reveals
who they voted for while everyone else waits, before it passes to the next player. Only
after the last reveal is the result tallied. It turns the vote into a tense, dramatic
ritual. With the toggle off, votes resolve instantly for a faster game.

---

## 4. Winning

- ⚖️ **The Virtuous (and the Guardian) win** the moment **every Assassin has been
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
   and fill the roster. A **Suspense mode** toggle is shown (on by default in the demo);
   tap **Start Game**.
3. **Your secret role** — tap the face-down card to reveal **"You are the Guardian."**
4. **Night 1 — protect** — choose someone to protect for the night.
5. **Dawn 1** — "The strike failed — the Guardian made a save! Everyone survived."
6. **Day 1 — vote** — tap a suspect to cast your vote. With Suspense mode on, the
   ballots are then revealed **one at a time** (pass the phone around) before the tally —
   the suspect is eliminated and revealed to be an **Assassin**.
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

1. **M1 — Demo:** static, clickable happy-path that highlights each tap. ← first
2. **Review & iterate** on the rules and the feel.
3. **M2 — Real lobby:** create/join a game by link and code.
4. **M3 — Core loop:** secret roles, night actions, day vote, win detection.
5. **M4 — Polish:** art, sound, animation, accessibility.
