import { create } from 'zustand';

import {
  dealRoles,
  resolveRound,
  tally,
  type Kill,
  type Protect,
  type Resolution,
  type Team,
  type Vote,
} from './engine';
import { defaultNames } from './content';
import { enhancePortrait } from './replicate';
import type { Phase, Player, Settings, SetupDraft } from './types';

interface GameState {
  phase: Phase;
  passed: boolean;
  setup: SetupDraft | null;
  players: Player[];
  settings: Settings;
  round: number;
  lastHolder: string | null;
  order: string[];
  kills: Kill[];
  protects: Protect[];
  votes: Vote[];
  res: Resolution | null;
  revoted: boolean;
  runoff: string[] | null;
  passIndex: number;
  nameDraft: string;
  pendingPhoto: string | null;
  flipped: boolean;
  selectedName: string | null;
  deathSeq: number;
  winnerTeam: Team | null;

  openSetup: () => void;
  decrement: () => void;
  increment: () => void;
  setSuspense: (v: boolean) => void;
  setSelfie: (v: boolean) => void;
  setToken: (v: string) => void;
  deal: () => void;

  setNameDraft: (v: string) => void;
  continueName: () => void;
  snapSelfie: (dataUrl: string) => void;
  skipSelfie: () => void;
  useSelfie: () => void;
  retakeSelfie: () => void;
  flip: () => void;
  nextReveal: () => void;

  beginTurns: () => void;
  select: (name: string) => void;
  castVote: () => void;
  castSpecial: () => void;

  beginVoteReveal: () => void;
  nextBallot: () => void;
  afterVoteReveal: () => void;
  startRevote: () => void;

  nextFromBanish: () => void;
  nextFromBanishReveal: () => void;
  nextFromDawn: () => void;
  nextFromDawnReveal: () => void;

  confirmGate: () => void;
  playAgain: () => void;
}

const FRESH = {
  passed: false,
  players: [] as Player[],
  round: 0,
  lastHolder: null as string | null,
  order: [] as string[],
  kills: [] as Kill[],
  protects: [] as Protect[],
  votes: [] as Vote[],
  res: null as Resolution | null,
  revoted: false,
  runoff: null as string[] | null,
  passIndex: 0,
  nameDraft: '',
  pendingPhoto: null as string | null,
  flipped: false,
  selectedName: null as string | null,
  deathSeq: 0,
  winnerTeam: null as Team | null,
};

// Alive players in seating order, from the seat after `startName` (wraps).
function aliveOrderFrom(players: Player[], startName: string | null): string[] {
  const n = players.length;
  const start = players.findIndex((p) => p.name === startName);
  const out: string[] = [];
  for (let k = 1; k <= n; k++) {
    const p = players[(((start + k) % n) + n) % n];
    if (p.alive) out.push(p.name);
  }
  return out;
}

export function gateRecipient(s: GameState): string | null {
  switch (s.phase) {
    case 'revealName':
      return s.players[s.passIndex]?.name ?? null;
    case 'turnVote':
      return s.order[s.passIndex] ?? null;
    case 'ballotReveal':
      return s.votes[s.passIndex]?.voter ?? null;
    case 'banishRoleReveal':
      return s.res?.banished ?? null;
    case 'dawnRoleReveal':
      return s.res?.victim ?? null;
    default:
      return null;
  }
}

export const useGame = create<GameState>((set, get) => {
  const markDead = (name: string, fate: 'killed' | 'banished') =>
    set((s) => ({
      deathSeq: s.deathSeq + 1,
      players: s.players.map((p) =>
        p.name === name ? { ...p, alive: false, fate, deathOrder: s.deathSeq + 1 } : p,
      ),
    }));

  const resolve = () => {
    const s = get();
    const res = resolveRound({
      players: s.players,
      kills: s.kills,
      protects: s.protects,
      votes: s.votes,
      forceBanish: s.revoted,
    });
    set({ res, selectedName: null, phase: 'voteRevealIntro' });
  };

  const advanceTurn = () => {
    const s = get();
    const next = s.passIndex + 1;
    if (next >= s.order.length) return resolve();
    set({ passIndex: next, selectedName: null, passed: false, phase: 'turnVote' });
  };

  const proceedAfterRound = () => {
    const s = get();
    if (s.res?.winner) return set({ winnerTeam: s.res.winner, phase: 'win' });
    set({ round: s.round + 1, phase: 'roundIntro' });
  };

  return {
    phase: 'title',
    setup: null,
    settings: { suspense: true, selfie: false, replicateToken: '' },
    ...FRESH,

    openSetup: () =>
      set((s) => ({
        setup: s.setup ?? { count: 6, suspense: true, selfie: false, replicateToken: '' },
        phase: 'setup',
      })),
    decrement: () =>
      set((s) => (s.setup ? { setup: { ...s.setup, count: Math.max(3, s.setup.count - 1) } } : {})),
    increment: () =>
      set((s) => (s.setup ? { setup: { ...s.setup, count: Math.min(12, s.setup.count + 1) } } : {})),
    setSuspense: (v) => set((s) => (s.setup ? { setup: { ...s.setup, suspense: v } } : {})),
    setSelfie: (v) => set((s) => (s.setup ? { setup: { ...s.setup, selfie: v } } : {})),
    setToken: (v) => set((s) => (s.setup ? { setup: { ...s.setup, replicateToken: v } } : {})),

    deal: () => {
      const d = get().setup!;
      const players = dealRoles(defaultNames(d.count)).map((p) => ({ ...p, named: false }));
      set({
        ...FRESH,
        players,
        settings: { suspense: d.suspense, selfie: d.selfie, replicateToken: d.replicateToken.trim() },
        phase: 'revealName',
      });
    },

    setNameDraft: (v) => set({ nameDraft: v }),
    continueName: () => {
      const s = get();
      const nm = s.nameDraft.trim();
      const taken = s.players.some(
        (x, k) => k !== s.passIndex && x.name.toLowerCase() === nm.toLowerCase(),
      );
      if (!nm || taken) return;
      const placeholder = s.players[s.passIndex].name;
      set({
        players: s.players.map((p, i) => (i === s.passIndex ? { ...p, name: nm, named: true } : p)),
        lastHolder: s.lastHolder === placeholder ? nm : s.lastHolder,
        nameDraft: '',
        flipped: false,
        phase: s.settings.selfie ? 'revealSelfieCapture' : 'revealRole',
      });
    },
    snapSelfie: (dataUrl) => set({ pendingPhoto: dataUrl, phase: 'revealSelfieConfirm' }),
    skipSelfie: () => set({ phase: 'revealRole', flipped: false }),
    retakeSelfie: () => set({ pendingPhoto: null, phase: 'revealSelfieCapture' }),
    useSelfie: () => {
      const s = get();
      const photo = s.pendingPhoto;
      const idx = s.passIndex;
      if (!photo) return;
      const token = s.settings.replicateToken;
      set({
        players: s.players.map((p, i) => (i === idx ? { ...p, photo, enhancing: true } : p)),
        pendingPhoto: null,
        flipped: false,
        phase: 'revealRole',
      });
      // Fire-and-forget; ignore the result if the player retook the photo meanwhile.
      enhancePortrait(token, photo, idx).then((dataUrl) =>
        set((st) => ({
          players: st.players.map((p, i) =>
            i === idx
              ? { ...p, enhancing: false, ...(dataUrl && p.photo === photo ? { photo: dataUrl } : {}) }
              : p,
          ),
        })),
      );
    },
    flip: () => set({ flipped: true }),
    nextReveal: () => {
      const s = get();
      const next = s.passIndex + 1;
      if (next >= s.players.length) return set({ round: 1, phase: 'roundIntro' });
      set({ passIndex: next, passed: false, nameDraft: '', flipped: false, phase: 'revealName' });
    },

    beginTurns: () => {
      const s = get();
      set({
        order: aliveOrderFrom(s.players, s.lastHolder),
        kills: [],
        protects: [],
        votes: [],
        revoted: false,
        runoff: null,
        passIndex: 0,
        selectedName: null,
        passed: false,
        phase: 'turnVote',
      });
    },
    select: (name) => set({ selectedName: name }),
    castVote: () => {
      const s = get();
      const voter = s.order[s.passIndex];
      if (!s.selectedName) return;
      set({ votes: [...s.votes, { voter, choice: s.selectedName }] });
      if (s.revoted) return advanceTurn();
      const role = s.players.find((p) => p.name === voter)?.role;
      if (role === 'assassin' || role === 'guardian') {
        set({ selectedName: null, phase: 'turnSpecial' });
      } else {
        advanceTurn();
      }
    },
    castSpecial: () => {
      const s = get();
      const actor = s.order[s.passIndex];
      const role = s.players.find((p) => p.name === actor)?.role;
      if (!s.selectedName) return;
      if (role === 'assassin') {
        set({ kills: [...s.kills, { by: actor, target: s.selectedName }] });
      } else {
        set({ protects: [...s.protects, { by: actor, target: s.selectedName }] });
      }
      advanceTurn();
    },

    beginVoteReveal: () => {
      const s = get();
      if (s.settings.suspense) {
        set({ passIndex: 0, flipped: false, passed: false, phase: 'ballotReveal' });
      } else {
        set({ phase: 'voteRevealAll' });
      }
    },
    nextBallot: () => {
      const s = get();
      const next = s.passIndex + 1;
      if (next >= s.votes.length) return get().afterVoteReveal();
      set({ passIndex: next, flipped: false, passed: false, phase: 'ballotReveal' });
    },
    afterVoteReveal: () => {
      const s = get();
      const r = s.res!;
      if (!r.banished && !s.revoted && s.votes.some((v) => v.choice)) {
        set({
          revoted: true,
          runoff: tally(s.votes.map((v) => v.choice)).leaders.slice(),
          phase: 'deadlock',
        });
      } else {
        set({ phase: 'banishResult' });
      }
    },
    startRevote: () => {
      const s = get();
      set({
        order: aliveOrderFrom(s.players, s.lastHolder),
        votes: [],
        passIndex: 0,
        selectedName: null,
        passed: false,
        phase: 'turnVote',
      });
    },

    nextFromBanish: () => {
      const r = get().res!;
      if (!r.banished) return set({ phase: 'dawn' });
      markDead(r.banished, 'banished');
      set({ flipped: false, passed: false, phase: 'banishRoleReveal' });
    },
    nextFromBanishReveal: () => {
      const r = get().res!;
      if (r.winAfterBanish) return set({ winnerTeam: r.winAfterBanish, phase: 'win' });
      set({ phase: 'dawn' });
    },
    nextFromDawn: () => {
      const r = get().res!;
      if (r.outcome === 'killed' && r.victim) {
        markDead(r.victim, 'killed');
        set({ flipped: false, passed: false, phase: 'dawnRoleReveal' });
      } else {
        proceedAfterRound();
      }
    },
    nextFromDawnReveal: () => proceedAfterRound(),

    confirmGate: () => {
      const who = gateRecipient(get());
      set((s) => ({ passed: true, lastHolder: who ?? s.lastHolder }));
    },
    playAgain: () => set({ ...FRESH, phase: 'title' }),
  };
});
