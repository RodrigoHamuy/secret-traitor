import type { AvatarData } from './Avatar';

import { Avatar } from './Avatar';

export interface BallotCardFrontProps {
  choice: AvatarData;
}

export function BallotCardFront({ choice }: BallotCardFrontProps) {
  return (
    <>
      <div className="my-3.5 font-display text-[11px] tracking-[.2em] text-[#8a6a2f] uppercase">
        voted to banish
      </div>
      <div className="flex w-full flex-col-reverse items-center justify-center gap-3 font-display text-xl font-bold">
        <span className="text-blood-ink">{choice.name}</span>
        <Avatar {...choice} size="fill" className="rounded-xl text-[72px]" />
      </div>
    </>
  );
}
