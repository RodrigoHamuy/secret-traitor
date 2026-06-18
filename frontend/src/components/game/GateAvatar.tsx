import type { AvatarData } from './Avatar';

import { Avatar } from './Avatar';

export interface GateAvatarProps {
  avatar: AvatarData;
}

export function GateAvatar({ avatar }: GateAvatarProps) {
  return (
    <div className="mx-auto mt-auto mb-3.5 flex justify-center">
      <Avatar {...avatar} size="xl" />
    </div>
  );
}
