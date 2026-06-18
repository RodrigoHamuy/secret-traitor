import type { AvatarData } from '../game/Avatar';

import { BallotCardFront } from '../game/BallotCardFront';
import { CardBack } from '../game/CardBack';
import { FlipCard } from '../game/FlipCard';
import { Screen } from '../layout/Screen';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';

export interface BallotRevealScreenProps {
  /** 1-based ballot position. */
  index: number;
  total: number;
  voterName: string;
  choice: AvatarData;
  flipped: boolean;
  onFlip?: () => void;
  ctaLabel: string;
  onNext?: () => void;
}

export function BallotRevealScreen({
  index,
  total,
  voterName,
  choice,
  flipped,
  onFlip,
  ctaLabel,
  onNext,
}: BallotRevealScreenProps) {
  return (
    <Screen
      footer={
        <Button disabled={!flipped} target={flipped} onClick={onNext}>
          {ctaLabel}
        </Button>
      }
    >
      <Eyebrow center className="mt-1.5">
        Ballot {index} of {total}
      </Eyebrow>
      <Heading center>{voterName}'s vote</Heading>
      <FlipCard
        aspect="ballot"
        flipped={flipped}
        onFlip={onFlip}
        back={<CardBack glyph="🗳️" />}
        front={<BallotCardFront choice={choice} />}
      />
    </Screen>
  );
}
