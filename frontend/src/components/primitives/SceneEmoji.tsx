import type { ReactNode } from 'react';

import { cx } from '../../lib/cx';

export interface SceneEmojiProps {
  children: ReactNode;
  className?: string;
}

/** Big sepia-toned banner emoji that headlines a scene. */
export function SceneEmoji({ children, className }: SceneEmojiProps) {
  return (
    <div
      className={cx(
        'mx-auto mt-auto mb-1.5 text-center font-body text-[56px] brightness-95 drop-shadow-[0_2px_8px_rgba(0,0,0,.5)] saturate-[1.3] sepia-[.6]',
        className,
      )}
    >
      {children}
    </div>
  );
}
