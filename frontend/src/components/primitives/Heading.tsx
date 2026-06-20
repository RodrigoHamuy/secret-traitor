import type { ReactNode } from 'react';

import { cx } from '../../lib/cx';

export interface HeadingProps {
  children: ReactNode;
  center?: boolean;
  className?: string;
}

export function Heading({ children, center = false, className }: HeadingProps) {
  return (
    <h2
      className={cx(
        'mb-2 font-display text-[22px] font-semibold tracking-[.04em] text-gold-bright',
        center && 'text-center',
        className,
      )}
    >
      {children}
    </h2>
  );
}
