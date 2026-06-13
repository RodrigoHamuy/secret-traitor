import type { ReactNode } from 'react';

export interface OptionRowProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
}

/** Lobby option — themed checkbox row with a title and fine print. */
export function OptionRow({ checked, onChange, title, description }: OptionRowProps) {
  return (
    <label className="mt-3.5 flex cursor-pointer items-start gap-3 rounded-[10px] border border-line bg-panel p-3.5 text-left">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="mt-0.5 grid size-6 flex-none place-items-center rounded-md border border-gold-edge bg-linear-to-b from-parch to-parch-deep font-display text-base font-bold text-[#7a3b16] peer-focus-visible:shadow-[0_0_0_3px_rgba(232,200,115,.5)]">
        {checked ? '✓' : ''}
      </span>
      <span>
        <strong className="mb-0.5 block font-display text-sm font-semibold tracking-[.04em] text-gold-bright uppercase">
          {title}
        </strong>
        {description && <span className="text-sm leading-[1.4] text-muted">{description}</span>}
      </span>
    </label>
  );
}
