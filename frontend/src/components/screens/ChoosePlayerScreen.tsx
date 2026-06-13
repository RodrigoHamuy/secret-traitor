import type { AvatarData } from '../game/Avatar';

import { PickCard } from '../game/PickCard';
import { PickGrid } from '../game/PickGrid';
import { ProgressSteps } from '../game/ProgressSteps';
import { Screen } from '../layout/Screen';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';
import { SceneEmoji } from '../primitives/SceneEmoji';

export interface ChoosePlayerScreenProps {
  /** 2-step "Vote › Special" hint for roles that act after voting. */
  steps?: { labels: string[]; active: number };
  /** Big banner icon so a player doing two selections in a turn can tell at a
   * glance which action they're on. */
  emoji?: string;
  eyebrow?: string;
  title: string;
  sub?: string;
  /** Tint applied to the chosen card: vote = dark, kill = red, shield = blue. */
  tint?: 'vote' | 'kill' | 'shield';
  players: AvatarData[];
  selectedName?: string;
  onSelect?: (name: string) => void;
  ctaLabel: string;
  ctaEmoji?: string;
  onConfirm?: () => void;
  skipLabel?: string;
  onSkip?: () => void;
}

/** A "choose a player" screen: pick a card, then commit with the CTA. */
export function ChoosePlayerScreen({
  steps,
  emoji,
  eyebrow,
  title,
  sub,
  tint,
  players,
  selectedName,
  onSelect,
  ctaLabel,
  ctaEmoji,
  onConfirm,
  skipLabel,
  onSkip,
}: ChoosePlayerScreenProps) {
  return (
    <Screen
      footer={
        <>
          <Button disabled={!selectedName} emoji={ctaEmoji} onClick={onConfirm}>
            {ctaLabel}
          </Button>
          {skipLabel && (
            <Button variant="secondary" onClick={onSkip}>
              {skipLabel}
            </Button>
          )}
        </>
      }
    >
      {steps && <ProgressSteps steps={steps.labels} active={steps.active} />}
      {emoji && <SceneEmoji className="mt-2">{emoji}</SceneEmoji>}
      {eyebrow && <Eyebrow center={Boolean(emoji)}>{eyebrow}</Eyebrow>}
      <Heading center={Boolean(emoji)}>{title}</Heading>
      {sub && <BodyText center={Boolean(emoji)}>{sub}</BodyText>}
      <PickGrid>
        {players.map((p) => (
          <PickCard
            key={p.name}
            avatar={p}
            selected={p.name === selectedName}
            tint={tint}
            onClick={() => onSelect?.(p.name)}
          />
        ))}
      </PickGrid>
    </Screen>
  );
}
