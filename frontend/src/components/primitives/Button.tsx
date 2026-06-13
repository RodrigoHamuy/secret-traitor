import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../../lib/cx';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  /** The "what to tap" highlight: candleglow pulse. */
  target?: boolean;
  /** Leading emoji. The label stays centred exactly as if there were no emoji:
   * two equal-width side columns flank it, the emoji centred in the left one. */
  emoji?: string;
}

const VARIANTS = {
  primary:
    'border border-gold-edge bg-linear-to-b from-gold-bright to-gold text-btn-ink shadow-plaque',
  secondary: 'border border-line bg-transparent text-muted',
  ghost: 'border border-line bg-[#231a10] text-parchment',
};

/** Pressed gold plaque button. */
export function Button({
  variant = 'primary',
  target = false,
  emoji,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        'mt-3.5 block w-full cursor-pointer appearance-none rounded-lg px-[18px] py-4 font-display text-base font-bold tracking-[.08em] uppercase transition-[transform,filter] duration-100 active:translate-y-px active:brightness-[.96] disabled:cursor-default disabled:opacity-40 disabled:shadow-none',
        VARIANTS[variant],
        target && 'relative animate-pulse-glow',
        emoji && 'flex items-center',
        className,
      )}
      {...rest}
    >
      {emoji ? (
        <>
          <span className="flex flex-1 justify-center">
            <span className="font-body text-[220%] leading-none font-normal not-italic">
              {emoji}
            </span>
          </span>
          <span className="flex-none">{children}</span>
          <span className="flex-1" />
        </>
      ) : (
        children
      )}
    </button>
  );
}
