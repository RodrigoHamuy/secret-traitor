import type { Role } from './engine';

export const COLORS = [
  '#e8c468', '#9fc06f', '#5aa9f0', '#e0564c', '#c58ef0', '#f0975a',
  '#5ad2c0', '#d08fb0', '#b0c070', '#7fa6e0', '#e0a25a', '#90d0a0',
];

export const gColor = (i: number) => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];

export const ROLE_INFO: Record<Role, { label: string; glyph: string; description: string }> = {
  virtuous: {
    label: 'VIRTUOUS', glyph: '🍷',
    description: 'You are innocent. Each round, vote to banish the Assassins before they outnumber you.',
  },
  guardian: {
    label: 'GUARDIAN', glyph: '🛡️',
    description: 'Each round, secretly choose someone to protect from assassination — then cast your vote like everyone else.',
  },
  assassin: {
    label: 'ASSASSIN', glyph: '🗡️',
    description: 'Each round, secretly mark a victim to assassinate — then cast your vote to deflect suspicion.',
  },
};

export const roleColorVar = (r: Role) =>
  r === 'assassin' ? 'var(--color-blood)' : r === 'guardian' ? 'var(--color-guardian)' : 'var(--color-virtue)';

export const plainRoleWord = (r: Role) =>
  r === 'assassin' ? 'an Assassin' : r === 'guardian' ? 'the Guardian' : 'one of the Virtuous';

export const DEBATE_SECONDS = 60;
export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export const defaultNames = (k: number) => Array.from({ length: k }, (_, i) => `Player ${i + 1}`);

// Round 1 has no deaths to discuss, so nudge the table with a playful tell.
export const ROUND1_TEASERS = [
  'Did anyone giggle, or glance away a little too quickly?',
  'Whose smile lingered a beat too long?',
  'Who looked a touch too pleased with their card?',
  'Did a poker face just slip?',
  'Who already looks guilty?',
];

export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
