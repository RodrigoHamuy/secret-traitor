import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../../lib/cx';

export type StepButtonProps = ComponentPropsWithoutRef<'button'>;

export function StepButton({ className, children, ...rest }: StepButtonProps) {
  return (
    <button
      className={cx(
        'size-[46px] cursor-pointer rounded-full border border-gold-edge bg-linear-to-b from-gold-bright to-gold font-display text-2xl font-bold text-btn-ink shadow-[0_2px_0_#5e4720,inset_0_1px_0_rgba(255,255,255,.3)] disabled:cursor-default disabled:opacity-40 disabled:shadow-none',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
