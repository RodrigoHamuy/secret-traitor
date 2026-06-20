import type { ReactNode } from 'react';

import { cx } from '../../lib/cx';

export interface BodyTextProps {
  children: ReactNode;
  center?: boolean;
  className?: string;
}

export function BodyText({ children, center = false, className }: BodyTextProps) {
  return (
    <p
      className={cx(
        'mb-3.5 text-lg leading-[1.55] text-parchment',
        center && 'text-center',
        className,
      )}
    >
      {children}
    </p>
  );
}
