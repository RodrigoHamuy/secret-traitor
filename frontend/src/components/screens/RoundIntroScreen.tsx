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
  prompt: string;
  durationSeconds: number;
  /** Pre-formatted countdown, e.g. "1:00". */
  timerLabel: string;
  timeUp?: boolean;
  aliveCount: number;
  ctaLabel: string;
  onNext?: () => void;
}

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
