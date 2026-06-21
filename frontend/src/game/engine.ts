// Pure, DOM-free game logic — a typed port of the static app's engine.js.

export type Role = 'virtuous' | 'guardian' | 'assassin';
export type Team = 'virtuous' | 'assassins';

export interface EnginePlayer {
  name: string;
  role: Role;
  alive: boolean;
}

export interface Kill {
  by: string;
  target: string;
}
export interface Protect {
  by: string;
  target: string;
}
export interface Vote {
  voter: string;
  choice: string | null;
}

export interface ResolveInput {
  players: EnginePlayer[];
  kills?: Kill[];
  protects?: Protect[];
  votes?: Vote[];
  forceBanish?: boolean;
}

export type Outcome = 'killed' | 'saved' | 'already' | 'none' | 'cancelled';

export interface Resolution {
  banished: string | null;
  bRole: Role | null;
  bVotes: number;
  tieBroken: boolean;
  winAfterBanish: Team | null;
  victim: string | null;
  outcome: Outcome;
  victimRole: Role | null;
  protectedName: string | null;
  winner: Team | null;
}

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Role counts by player total (see PLAN.md §2).
export function roleCounts(n: number): { assassins: number; guardians: number; virtuous: number } {
  const assassins = n >= 8 ? 2 : 1;
  const guardians = 1;
  return { assassins, guardians, virtuous: n - assassins - guardians };
}

export function dealRoles(names: string[]): EnginePlayer[] {
  const { assassins, guardians } = roleCounts(names.length);
  const roles: Role[] = [];
  for (let i = 0; i < assassins; i++) roles.push('assassin');
  for (let i = 0; i < guardians; i++) roles.push('guardian');
  while (roles.length < names.length) roles.push('virtuous');
  shuffle(roles);
  return names.map((name, i) => ({ name, role: roles[i], alive: true }));
}

export function winner(players: EnginePlayer[]): Team | null {
  const alive = players.filter((p) => p.alive);
  const assassins = alive.filter((p) => p.role === 'assassin').length;
  const others = alive.length - assassins;
  if (assassins === 0) return 'virtuous';
  if (assassins >= others) return 'assassins';
  return null;
}

export interface Tally {
  counts: Record<string, number>;
  leaders: string[];
  max: number;
  tie: boolean;
}

export function tally(votes: Array<string | null | undefined>): Tally {
  const counts: Record<string, number> = {};
  votes.forEach((v) => {
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  let max = 0;
  let leaders: string[] = [];
  for (const name in counts) {
    if (counts[name] > max) {
      max = counts[name];
      leaders = [name];
    } else if (counts[name] === max) {
      leaders.push(name);
    }
  }
  return { counts, leaders, max, tie: max === 0 || leaders.length !== 1 };
}

// Resolve one round (pure; returns a plan, doesn't mutate `state`). Banishing an
// Assassin cancels their mark; banishing the Guardian cancels their shield. A split
// vote banishes no one; `forceBanish` breaks a second deadlock by banishing a random
// leader.
export function resolveRound(state: ResolveInput): Resolution {
  const { players, kills = [], protects = [], votes = [], forceBanish = false } = state;
  const alive: Record<string, boolean> = {};
  const roleOf: Record<string, Role> = {};
  players.forEach((p) => {
    alive[p.name] = p.alive;
    roleOf[p.name] = p.role;
  });
  const winnerNow = () => winner(players.map((p) => ({ name: p.name, role: p.role, alive: alive[p.name] })));

  const vt = tally(votes.map((v) => v.choice));
  const banished = vt.tie
    ? forceBanish && vt.max > 0
      ? vt.leaders[Math.floor(Math.random() * vt.leaders.length)]
      : null
    : vt.leaders[0];
  if (banished) alive[banished] = false;
  const bRole = banished ? roleOf[banished] : null;
  const tieBroken = vt.tie && !!banished;

  const winAfterBanish = winnerNow();
  if (winAfterBanish) {
    return {
      banished, bRole, bVotes: vt.max, tieBroken, winAfterBanish,
      victim: null, outcome: 'cancelled', victimRole: null,
      protectedName: null, winner: winAfterBanish,
    };
  }

  const activeKills = kills.filter((k) => alive[k.by]);
  const prot = protects[0];
  const protectedName = prot && alive[prot.by] ? prot.target : null;
  const at = tally(activeKills.map((k) => k.target));
  const victim = at.tie ? null : at.leaders[0];

  let outcome: Outcome = 'none';
  let victimRole: Role | null = null;
  if (victim) {
    if (!alive[victim]) outcome = 'already';
    else if (victim === protectedName) outcome = 'saved';
    else {
      alive[victim] = false;
      outcome = 'killed';
      victimRole = roleOf[victim];
    }
  }
  return {
    banished, bRole, bVotes: vt.max, tieBroken, winAfterBanish: null,
    victim, outcome, victimRole, protectedName, winner: winnerNow(),
  };
}
