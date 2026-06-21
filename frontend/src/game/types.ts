import type { Role } from './engine';

export interface Player {
  name: string;
  role: Role;
  alive: boolean;
  named: boolean;
  photo?: string;
  enhancing?: boolean;
  fate?: 'killed' | 'banished';
  deathOrder?: number;
}

export interface Settings {
  suspense: boolean;
  selfie: boolean;
  replicateToken: string;
}

export interface SetupDraft {
  count: number;
  suspense: boolean;
  selfie: boolean;
  replicateToken: string;
}

export type Phase =
  | 'title'
  | 'setup'
  | 'revealName'
  | 'revealSelfieCapture'
  | 'revealSelfieConfirm'
  | 'revealRole'
  | 'roundIntro'
  | 'turnVote'
  | 'turnSpecial'
  | 'voteRevealIntro'
  | 'ballotReveal'
  | 'voteRevealAll'
  | 'deadlock'
  | 'banishResult'
  | 'banishRoleReveal'
  | 'dawn'
  | 'dawnRoleReveal'
  | 'win';

// Phases fronted by a privacy gate: nothing renders until the recipient taps "I'm X".
export const GATED_PHASES = new Set<Phase>([
  'revealName',
  'turnVote',
  'ballotReveal',
  'banishRoleReveal',
  'dawnRoleReveal',
]);
