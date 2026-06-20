import type { ReactNode } from 'react';

import { cx } from '../../lib/cx';

export interface TitleHeadingProps {
  children: ReactNode;
  tone?: 'gold' | 'virtue' | 'blood';
  center?: boolean;
  className?: string;
}

const TONES = {
  gold: 'text-gold-bright',
  virtue: 'text-virtue',
  blood: 'text-blood',
};

export function TitleHeading({ children, tone = 'gold', center = false, className }: TitleHeadingProps) {
  return (
    <h1
      className={cx(
        'mb-2.5 font-display text-[40px] leading-[1.08] font-bold tracking-[.06em] [text-shadow:0_1px_0_#2a1d0d,0_0_24px_rgba(201,162,74,.35)]',
        TONES[tone],
        center && 'text-center',
        className,
      )}
    >
      {children}
    </h1>
  );
}
