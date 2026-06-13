import type { ReactNode } from 'react';

export interface VoteListProps {
  children: ReactNode;
}

/** Stack of VoteRows. */
export function VoteList({ children }: VoteListProps) {
  return <div className="my-3 flex flex-col gap-2">{children}</div>;
}
