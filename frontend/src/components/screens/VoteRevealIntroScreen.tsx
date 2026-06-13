import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { SceneEmoji } from '../primitives/SceneEmoji';

export interface VoteRevealIntroScreenProps {
  /** Suspense mode reveals ballots one by one; otherwise all at once. */
  suspense: boolean;
  onNext?: () => void;
}

export function VoteRevealIntroScreen({ suspense, onNext }: VoteRevealIntroScreenProps) {
  return (
    <Screen
      footer={
        <Button target onClick={onNext}>
          {suspense ? 'Begin the reveal' : 'Reveal the votes'}
        </Button>
      }
    >
      <Spacer />
      <SceneEmoji>🗳️</SceneEmoji>
      <Heading center>The ballots are in</Heading>
      <BodyText center>
        {suspense
          ? 'Pass the phone around once more — each player flips their own ballot for the table.'
          : 'Now everyone reveals who they voted for.'}
      </BodyText>
      <Spacer />
    </Screen>
  );
}
