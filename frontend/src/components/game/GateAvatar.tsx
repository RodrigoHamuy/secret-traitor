import type { AvatarData } from './Avatar';

import { Avatar } from './Avatar';

export interface GateAvatarProps {
  avatar: AvatarData;
}

/** Large centred avatar on the "Pass the phone to X" gate. */
export function GateAvatar({ avatar }: GateAvatarProps) {
  return (
    <div className="mx-auto mt-auto mb-3.5 flex justify-center">
      <Avatar {...avatar} size="xl" />
    </div>
  );
}
