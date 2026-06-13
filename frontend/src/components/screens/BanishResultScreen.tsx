import type { AvatarData } from '../game/Avatar';

import { DawnPortrait } from '../game/DawnPortrait';
import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { SceneEmoji } from '../primitives/SceneEmoji';

export interface BanishResultScreenProps {
  /** banished = clear majority · tieBroken = the re-vote tied again and lots
   * were drawn · noMajority = a split first vote, no one falls. */
  variant: 'banished' | 'tieBroken' | 'noMajority';
  /** The banished player (not used for noMajority). */
  banished?: AvatarData;
  /** "Pass the phone to X" / "Then, under cover of dark…". */
  ctaLabel: string;
  onNext?: () => void;
}

/** The verdict after the ballots are revealed. */
export function BanishResultScreen({ variant, banished, ctaLabel, onNext }: BanishResultScreenProps) {
  return (
    <Screen
      footer={
        <Button target onClick={onNext}>
          {ctaLabel}
        </Button>
      }
    >
      <Spacer />
      {variant === 'noMajority' ? (
        <>
          <SceneEmoji>⚖️</SceneEmoji>
          <Heading center>No majority</Heading>
          <BodyText center>The vote is split — the table couldn't agree, so no one is banished.</BodyText>
        </>
      ) : (
        <>
          <SceneEmoji>{variant === 'tieBroken' ? '🎲' : '⚖️'}</SceneEmoji>
          <Heading center>
            {variant === 'tieBroken' ? 'Still deadlocked — fate decides' : 'The majority has decided'}
          </Heading>
          {banished && <DawnPortrait avatar={banished} fate="banished" />}
          <BodyText center>
            {variant === 'tieBroken' ? (
              <>
                The table tied again. With no majority, lots are drawn — and they fall on{' '}
                <strong>{banished?.name}</strong>, who is banished.
              </>
            ) : (
              <>
                <strong>{banished?.name}</strong> is banished.
              </>
            )}
          </BodyText>
        </>
      )}
      <Spacer />
    </Screen>
  );
}
