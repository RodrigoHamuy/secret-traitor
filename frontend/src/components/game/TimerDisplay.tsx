import { cx } from '../../lib/cx';

export interface TimerDisplayProps {
  /** Pre-formatted time, e.g. "1:00" — or "Time's up". No internal ticking. */
  label: string;
  /** Time has run out: turns wax-seal red and pulses. */
  up?: boolean;
}

/** Ambient debate countdown shown under the hourglass. */
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
