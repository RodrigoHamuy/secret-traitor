import type { AvatarData } from '../game/Avatar';

import { DawnPortrait } from '../game/DawnPortrait';
import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { SceneEmoji } from '../primitives/SceneEmoji';

export interface DawnResolutionScreenProps {
  /** killed = strike landed · saved = Guardian's shield held · already = target already banished · none = no strike. */
  outcome: 'killed' | 'saved' | 'already' | 'none';
  victim?: AvatarData;
  ctaLabel: string;
  onNext?: () => void;
}

export function DawnResolutionScreen({ outcome, victim, ctaLabel, onNext }: DawnResolutionScreenProps) {
  return (
    <Screen
      footer={
        <Button target onClick={onNext}>
          {ctaLabel}
        </Button>
      }
    >
      <Spacer />
      <SceneEmoji>🌅</SceneEmoji>
      <Heading center>Dawn breaks</Heading>
      {outcome === 'killed' && victim && (
        <>
          <DawnPortrait avatar={victim} fate="slain" />
          <BodyText center>
            <strong>{victim.name}</strong> was found slain in the night.
          </BodyText>
        </>
      )}
      {outcome === 'saved' && victim && (
        <>
          <DawnPortrait avatar={victim} />
          <BodyText center>
            A blade flashed at <strong>{victim.name}</strong>… but the Guardian's shield held.{' '}
            <strong className="text-virtue">They survive.</strong>
          </BodyText>
        </>
      )}
      {outcome === 'already' && (
        <BodyText center>
          The Assassins crept toward {victim?.name}… but justice had already claimed them.
        </BodyText>
      )}
      {outcome === 'none' && (
        <BodyText center>No blade finds its mark. The night passes without bloodshed.</BodyText>
      )}
      <Spacer />
    </Screen>
  );
}
