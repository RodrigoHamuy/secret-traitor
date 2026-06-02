# Nightfall — Game Plan

> **Working title: "Nightfall"** *(placeholder — easy to change). The name and any
> comparisons to existing TV or tabletop games have been removed so the project stands
> on its own brand.*

A free, web-based, mobile-friendly party game of social deduction. By night a hidden
**Murderer** strikes; by day the village gathers to accuse and vote. Played with a
group in the same room (or on a call), each person uses their phone as a private
"console" that only they can see.

This document focuses on **the rules and the player experience**. Technical details
(hosting, networking, code structure) are intentionally left out for now — we'll spec
those once the rules and the demo feel right.

---

## 1. The game in one breath

Everyone is secretly assigned a role. Each **night**, the Murderers quietly choose
someone to eliminate and the Doctor quietly chooses someone to protect. Each **day**,
the survivors talk it out and vote to eliminate one suspect. The Villagers win when
every Murderer is caught; the Murderers win when they equal or outnumber everyone else.

- **Players:** 5–12 (sweet spot 6–10).
- **Length:** a few minutes to ~15 minutes per game.
- **No accounts, no app install.** Open a link, pick a name, play.

---

## 2. Roles

### 🟢 Villager
An ordinary member of the village with no special power.
- **Goal:** work out who the Murderers are and vote them out during the day.
- **At night:** sleeps (no action).
- Villagers are the majority and win by deduction, discussion, and voting.

### 🔴 Murderer
Secretly works against the village. (There may be more than one; they know each other.)
- **Goal:** eliminate Villagers until the Murderers equal or outnumber everyone else.
- **At night:** the Murderers privately agree on **one person to eliminate**.
- During the day they blend in, pretending to be a helpful Villager.

### 🔵 Doctor
A Villager with the power to save a life.
- **Goal:** same as the Villagers — catch the Murderers.
- **At night:** privately chooses **one person to protect**. If the Murderers target
  that person this night, the attack fails and **no one dies**.
- The Doctor may be allowed to protect themselves (a setting we can tune later).

**Suggested role counts** (starting point, to balance during playtesting):

| Players | Murderers | Doctor | Villagers |
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
2. **Murderers** secretly pick one person to eliminate.
3. **Doctor** secretly picks one person to protect.
4. **Villagers** simply wait for night to end.

### ☀️ Dawn
- If the Murderers' target was the same person the Doctor protected → **the attack
  fails, nobody dies.**
- Otherwise → that person is **eliminated** and their role is revealed to everyone.

### 🗣️ Day
1. Survivors discuss who they suspect.
2. Everyone **votes** to eliminate one person.
3. The person with the most votes is **eliminated** and their role is revealed.
   *(Tie-handling is an open question — see §6.)*

Then a new round begins, unless someone has already won.

---

## 4. Winning

- 🟢 **Villagers (and the Doctor) win** the moment **every Murderer has been
  eliminated.**
- 🔴 **Murderers win** the moment the number of Murderers is **equal to or greater
  than** the number of remaining non-Murderers (at that point they can no longer be
  out-voted).

---

## 5. The happy player journey (what the demo shows)

The first build is a **clickable demo** — static screens that walk one player through a
winning game, **highlighting exactly what to tap at each step**. Nothing real happens
behind the scenes; it exists so we can feel the flow and the card-style mobile UI
before building the real thing. The scripted journey:

1. **Title** — tap **Create Game**.
2. **Lobby** — a room code and a shareable link appear; friends "join" and fill the
   roster; tap **Start Game**.
3. **Your secret role** — tap the face-down card to reveal **"You are the Doctor."**
4. **Night 1 — protect** — choose a player to protect for the night.
5. **Dawn 1** — "The attack failed — the Doctor made a save! Everyone survived."
6. **Day 1 — vote** — tap a suspect to cast your vote; the village eliminates them and
   reveals they were a **Murderer**.
7. **Night 2 — protect** — choose someone to protect again.
8. **Dawn 2** — a Villager is found eliminated (the Doctor guessed wrong this time).
9. **Day 2 — vote** — the village votes out the **last Murderer**.
10. **Victory** — "The Village wins! Every Murderer has been caught." Tap **Play
    Again**.

The demo lives as plain static files (just open it in a browser; trivial to host).

---

## 6. Open questions to settle during playtesting

- **Ties at the day vote:** re-vote, no elimination that day, or random?
- **Can the Doctor protect themselves**, and can they protect the same person two
  nights in a row?
- **Exact role counts** per player count (the table in §2 is a starting guess).
- **Murderer communication at night** — silent in-app pick, or assume they talk in
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
