import type { ReactNode } from 'react';

export interface PillProps {
  children: ReactNode;
}

export function Pill({ children }: PillProps) {
  return (
    <span className="inline-block rounded-full border border-line px-3 py-[5px] font-display text-[11px] font-semibold tracking-[.06em] text-gold">
      {children}
    </span>
  );
}
