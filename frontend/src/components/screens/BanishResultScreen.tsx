import type { AvatarData } from '../game/Avatar';

import { Avatar } from '../game/Avatar';
import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { SceneEmoji } from '../primitives/SceneEmoji';

export interface BanishResultScreenProps {
  /** banished = clear majority · tieBroken = re-vote tied again, lots drawn · noMajority = split first vote, no one falls. */
  variant: 'banished' | 'tieBroken' | 'noMajority';
  banished?: AvatarData;
  ctaLabel: string;
  onNext?: () => void;
}

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
          {banished && (
            <div className="mt-2 mb-4 flex justify-center">
              <Avatar {...banished} fate="banished" animateFate size="fill" className="rounded-[14px] text-[88px]" />
            </div>
          )}
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
