import type { ReactNode } from 'react';

import { cx } from '../../lib/cx';

export type Role = 'virtuous' | 'guardian' | 'assassin';

export interface RoleCardFrontProps {
  role: Role;
  glyph?: string;
  label?: string;
  description: ReactNode;
  fellowAssassins?: string[];
}

const ROLES: Record<Role, { glyph: string; label: string; color: string }> = {
  virtuous: { glyph: '🍷', label: 'VIRTUOUS', color: 'text-virtue-ink' },
  guardian: { glyph: '🛡️', label: 'GUARDIAN', color: 'text-guardian-ink' },
  assassin: { glyph: '🗡️', label: 'ASSASSIN', color: 'text-blood' },
};

export function RoleCardFront({ role, glyph, label, description, fellowAssassins }: RoleCardFrontProps) {
  const info = ROLES[role];
  return (
    <>
      <div className="mb-4 font-body text-[58px] brightness-95 saturate-[1.3] sepia-[.6]">
        {glyph ?? info.glyph}
      </div>
      <div className={cx('font-display text-3xl font-bold tracking-[.08em]', info.color)}>
        {label ?? info.label}
      </div>
      <p className="mt-3 mb-3.5 text-[17px] leading-[1.55] text-[#4a3719]">
        {description}
        {fellowAssassins && fellowAssassins.length > 0 && (
          <>
            <br />
            <br />
            Your fellow Assassin{fellowAssassins.length > 1 ? 's' : ''}:{' '}
            <strong>{fellowAssassins.join(', ')}</strong>.
          </>
        )}
      </p>
    </>
  );
}
