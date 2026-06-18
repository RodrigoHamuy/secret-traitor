import type { AvatarData } from './Avatar';

import { cx } from '../../lib/cx';
import { Avatar } from './Avatar';

export interface PickCardProps {
  avatar: AvatarData;
  selected?: boolean;
  /** Action tint on the chosen card (vote=dark, kill=red, shield=blue, win=gold):
   * colours the frame and name and washes over the portrait. */
  tint?: 'vote' | 'kill' | 'shield' | 'win';
  /** End-game role tag shown under the name. */
  roleTag?: { label: string; color: string };
  /** Winner's crown after the name (end-game roster). */
  crown?: boolean;
  onClick?: () => void;
}

const TINTS = {
  vote: {
    card: 'border-vote-tint shadow-[inset_0_0_0_2px_var(--color-vote-tint),0_4px_16px_rgba(0,0,0,.5)]',
    name: 'text-vote-tint',
    wash: 'bg-vote-tint',
  },
  kill: {
    card: 'border-blood shadow-[inset_0_0_0_2px_var(--color-blood),0_4px_18px_rgba(200,83,63,.55)]',
    name: 'text-blood-ink',
    wash: 'bg-blood',
  },
  shield: {
    card: 'border-shield shadow-[inset_0_0_0_2px_var(--color-shield),0_4px_18px_rgba(63,111,176,.55)]',
    name: 'text-[#2f4f86]',
    wash: 'bg-shield',
  },
  win: {
    card: 'border-gold-bright shadow-[inset_0_0_0_2px_var(--color-gold-bright),0_4px_18px_rgba(201,162,74,.55)]',
    name: 'text-[#5a3210]',
    wash: 'bg-gold-bright',
  },
};

/** Parchment player card for the pick grid and the end-game roster. */
export function PickCard({ avatar, selected = false, tint, roleTag, crown = false, onClick }: PickCardProps) {
  const t = selected ? (tint ? TINTS[tint] : null) : null;
  return (
    <button
      className={cx(
        'flex cursor-pointer flex-col items-center gap-[5px] rounded-[10px] border bg-linear-to-b from-parch to-parch-deep px-1 pt-1 pb-[7px] font-display text-sm font-semibold text-ink transition-transform duration-100 active:scale-[.96]',
        selected
          ? (t?.card ??
            'border-gold-bright shadow-[inset_0_0_0_2px_var(--color-gold-bright),0_4px_16px_rgba(201,162,74,.45)]')
          : 'border-gold-edge shadow-[inset_0_0_0_1px_rgba(122,93,40,.3),0_4px_12px_rgba(0,0,0,.35)]',
      )}
      onClick={onClick}
    >
      <span className="relative w-full">
        <Avatar {...avatar} size="fill" />
        {selected && t && (
          <span
            aria-hidden
            className={cx('pointer-events-none absolute inset-0 rounded-lg opacity-[.42] mix-blend-multiply', t.wash)}
          />
        )}
      </span>
      <span className={cx(selected && (t?.name ?? 'text-[#5a3210]'))}>
        {avatar.name}
        {crown && ' 👑'}
      </span>
      {roleTag && (
        <span
          className="font-display text-[10px] font-bold tracking-[.08em]"
          style={{ color: roleTag.color }}
        >
          {roleTag.label}
        </span>
      )}
    </button>
  );
}
