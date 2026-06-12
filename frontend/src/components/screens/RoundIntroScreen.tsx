import { Hourglass } from '../game/Hourglass';
import { TimerDisplay } from '../game/TimerDisplay';
import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { Pill } from '../primitives/Pill';

export interface RoundIntroScreenProps {
  round: number;
  /** Debate prompt — a round-one teaser or "Debate aloud — who do you suspect?". */
  prompt: string;
  /** Hourglass drain time in seconds. */
  durationSeconds: number;
  /** Pre-formatted countdown, e.g. "1:00" — or "Time's up". */
  timerLabel: string;
  timeUp?: boolean;
  aliveCount: number;
  /** "Skip & pass the phone around" while counting, "Pass the phone around" after. */
  ctaLabel: string;
  onNext?: () => void;
}

/** Round intro: the table debates aloud while the hourglass drains. */
export function RoundIntroScreen({
  round,
  prompt,
  durationSeconds,
  timerLabel,
  timeUp = false,
  aliveCount,
  ctaLabel,
  onNext,
}: RoundIntroScreenProps) {
  return (
    <Screen
      footer={
        <Button target onClick={onNext}>
          {ctaLabel}
        </Button>
      }
    >
      <Spacer />
      <Heading center>Round {round}</Heading>
      <BodyText center>{prompt}</BodyText>
      <Hourglass durationSeconds={durationSeconds} />
      <TimerDisplay label={timerLabel} up={timeUp} />
      <p className="mb-3.5 text-center">
        <Pill>{aliveCount} still alive</Pill>
      </p>
      <Spacer />
    </Screen>
  );
}
