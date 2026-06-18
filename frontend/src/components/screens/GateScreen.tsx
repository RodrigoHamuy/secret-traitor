import type { AvatarData } from '../game/Avatar';

import { GateAvatar } from '../game/GateAvatar';
import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { SceneEmoji } from '../primitives/SceneEmoji';

export interface GateScreenProps {
  playerName: string;
  /** Omit before the recipient has an identity (📱 fallback). */
  avatar?: AvatarData;
  sub?: string;
  buttonLabel?: string;
  onConfirm?: () => void;
}

// Privacy gate: the private screen renders only after the recipient confirms.
export function GateScreen({
  playerName,
  avatar,
  sub = 'Hand it over before tapping.',
  buttonLabel,
  onConfirm,
}: GateScreenProps) {
  return (
    <Screen
      footer={
        <Button target onClick={onConfirm}>
          {buttonLabel ?? `I'm ${playerName}`}
        </Button>
      }
    >
      <Spacer />
      {avatar ? <GateAvatar avatar={avatar} /> : <SceneEmoji>📱</SceneEmoji>}
      <Heading center>Pass the phone to {playerName}</Heading>
      <BodyText center>{sub}</BodyText>
      <Spacer />
    </Screen>
  );
}
