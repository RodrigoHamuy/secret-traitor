import type { AvatarData } from './Avatar';

import { Avatar } from './Avatar';

export interface VoteRowProps {
  voter: AvatarData;
  choice: AvatarData;
}

/** One "voter → choice" line in the all-ballots-at-once list. */
export function VoteRow({ voter, choice }: VoteRowProps) {
  return (
    <div className="flex items-center justify-center gap-2 font-display text-[13px] font-semibold">
      <Avatar {...voter} size="xs" />
      <span className="max-w-[5.5em] truncate">{voter.name}</span>
      <span className="mx-0.5 text-muted">→</span>
      <Avatar {...choice} size="xs" />
      <span className="max-w-[5.5em] truncate">{choice.name}</span>
    </div>
  );
}
