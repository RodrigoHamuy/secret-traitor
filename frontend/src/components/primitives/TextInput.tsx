import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../../lib/cx';

export type TextInputProps = ComponentPropsWithoutRef<'input'>;

/** Parchment text input (the static app's `.name-input`). */
export function TextInput({ className, ...rest }: TextInputProps) {
  return (
    <input
      className={cx(
        'w-full rounded-lg border border-gold-edge bg-linear-to-b from-parch to-parch-deep px-3 py-2.5 font-body text-base text-ink focus:shadow-[0_0_0_3px_rgba(232,200,115,.45)] focus:outline-none',
        className,
      )}
      {...rest}
    />
  );
}
