import type { ReactNode } from 'react';

import { cx } from '../../lib/cx';

export interface EyebrowProps {
  children: ReactNode;
  center?: boolean;
  className?: string;
}

export function Eyebrow({ children, center = false, className }: EyebrowProps) {
  return (
    <p
      className={cx(
        'mb-3 font-display text-[11px] font-semibold tracking-[.34em] text-gold uppercase',
        center && 'text-center',
        className,
      )}
    >
      {children}
    </p>
  );
}
