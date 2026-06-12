import type { AvatarData } from './Avatar';

import { Avatar } from './Avatar';

export interface DawnPortraitProps {
  avatar: AvatarData;
  /** The portrait starts in full colour and drains to its fate tint:
   * grey for banished, grey + blood-red for slain. Omit for a spared player. */
  fate?: 'banished' | 'slain';
}

/** Dawn reveal: the fallen/spared player's portrait is the focal point. */
export function DawnPortrait({ avatar, fate }: DawnPortraitProps) {
  return (
    <div className="mt-2 mb-4 flex justify-center">
      <Avatar
        {...avatar}
        fate={fate}
        animateFate={Boolean(fate)}
        size="fill"
        className="rounded-[14px] text-[88px]"
      />
    </div>
  );
}
