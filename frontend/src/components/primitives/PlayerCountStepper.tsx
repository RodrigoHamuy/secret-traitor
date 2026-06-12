import { StepButton } from './StepButton';

export interface PlayerCountStepperProps {
  count: number;
  min?: number;
  max?: number;
  onDecrement?: () => void;
  onIncrement?: () => void;
}

/** Player-count stepper: − / "N players" / +. */
export function PlayerCountStepper({
  count,
  min = 3,
  max = 12,
  onDecrement,
  onIncrement,
}: PlayerCountStepperProps) {
  return (
    <div className="my-1.5 mb-4 flex items-center justify-center gap-[18px]">
      <StepButton disabled={count <= min} onClick={onDecrement} aria-label="Fewer players">
        −
      </StepButton>
      <span className="min-w-[116px] text-center font-display text-lg tracking-[.04em] text-gold-bright">
        {count} players
      </span>
      <StepButton disabled={count >= max} onClick={onIncrement} aria-label="More players">
        +
      </StepButton>
    </div>
  );
}
