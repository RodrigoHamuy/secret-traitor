import type { AvatarData } from './Avatar';

import { Avatar } from './Avatar';

export interface DawnPortraitProps {
  avatar: AvatarData;
  fate?: 'banished' | 'slain';
}

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
