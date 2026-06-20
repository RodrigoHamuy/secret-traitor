import { cx } from '../../lib/cx';

export interface TimerDisplayProps {
  /** Pre-formatted; no internal ticking. */
  label: string;
  up?: boolean;
}

export function TimerDisplay({ label, up = false }: TimerDisplayProps) {
  return (
    <p
      className={cx(
        'mt-0.5 mb-2 text-center font-display text-[22px] tracking-[.12em]',
        up ? 'animate-pulse-glow text-blood [animation-duration:1.2s]' : 'text-gold-bright',
      )}
    >
      {label}
    </p>
  );
}
