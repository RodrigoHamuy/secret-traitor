import type { ReactNode } from 'react';

import { cx } from '../../lib/cx';

export interface FlipCardProps {
  flipped: boolean;
  /** Ignored once flipped. */
  onFlip?: () => void;
  back: ReactNode;
  front: ReactNode;
  /** role 3:4 · ballot 4:5. */
  aspect?: 'role' | 'ballot';
}

const FACE =
  'absolute inset-0 flex flex-col items-center justify-center rounded-[14px] border border-gold-edge p-[26px] text-center backface-hidden shadow-face';

export function FlipCard({ flipped, onFlip, back, front, aspect = 'role' }: FlipCardProps) {
  return (
    <div className="my-auto perspective-[1200px]">
      <div
        className={cx(
          'relative w-full transform-3d transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)]',
          aspect === 'ballot' ? 'aspect-[4/5]' : 'aspect-[3/4]',
          flipped && 'rotate-y-180',
        )}
        onClick={() => {
          if (!flipped) onFlip?.();
        }}
      >
        <div
          className={cx(
            FACE,
            'cursor-pointer bg-[radial-gradient(120%_90%_at_50%_0%,#2c2013,#160f08)] text-parchment',
          )}
        >
          {back}
        </div>
        <div
          className={cx(
            FACE,
            'rotate-y-180 bg-linear-to-b from-parch to-parch-deep text-ink',
            aspect === 'ballot' && 'p-3.5',
          )}
        >
          {front}
        </div>
      </div>
    </div>
  );
}
