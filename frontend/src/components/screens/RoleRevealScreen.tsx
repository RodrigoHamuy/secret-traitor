import type { ReactNode } from 'react';

import { CardBack } from '../game/CardBack';
import { FlipCard } from '../game/FlipCard';
import { Screen } from '../layout/Screen';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';

export interface RoleRevealScreenProps {
  /** "Secret roles · 2 of 6", "Banished · round 3", … */
  eyebrow: string;
  /** "Alice, this is you", "Alice, reveal yourself", … */
  title: string;
  /** Card front — typically a `<RoleCardFront>`. */
  front: ReactNode;
  flipped: boolean;
  onFlip?: () => void;
  /** "Hide & pass on" for the deal, "Continue" for an elimination reveal. */
  ctaLabel: string;
  onNext?: () => void;
}

/** A face-down card the player flips to see (or reveal) a secret role. */
export function RoleRevealScreen({
  eyebrow,
  title,
  front,
  flipped,
  onFlip,
  ctaLabel,
  onNext,
}: RoleRevealScreenProps) {
  return (
    <Screen
      footer={
        <Button disabled={!flipped} target={flipped} onClick={onNext}>
          {ctaLabel}
        </Button>
      }
    >
      <Eyebrow center className="mt-1.5">
        {eyebrow}
      </Eyebrow>
      <Heading center>{title}</Heading>
      <FlipCard flipped={flipped} onFlip={onFlip} back={<CardBack glyph="🤫" />} front={front} />
    </Screen>
  );
}
