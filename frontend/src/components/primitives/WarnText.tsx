import type { ReactNode } from 'react';

export interface WarnTextProps {
  children: ReactNode;
}

export function WarnText({ children }: WarnTextProps) {
  return <p className="-mt-1 mb-3.5 text-center text-sm leading-[1.55] text-warn">{children}</p>;
}
