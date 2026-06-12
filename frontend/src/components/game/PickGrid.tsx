import type { ReactNode } from 'react';

export interface PickGridProps {
  children: ReactNode;
}

/** Two-column grid of parchment player cards. */
export function PickGrid({ children }: PickGridProps) {
  return <div className="mt-2 grid grid-cols-2 gap-2">{children}</div>;
}
