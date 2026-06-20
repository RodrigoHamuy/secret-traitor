import type { ReactNode } from 'react';

import { CardBack } from '../game/CardBack';
import { FlipCard } from '../game/FlipCard';
import { Screen } from '../layout/Screen';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';

export interface RoleRevealScreenProps {
  eyebrow: string;
  title: string;
  front: ReactNode;
  flipped: boolean;
  onFlip?: () => void;
  ctaLabel: string;
  onNext?: () => void;
}

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
