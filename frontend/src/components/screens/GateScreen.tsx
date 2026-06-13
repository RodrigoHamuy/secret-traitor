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
  /** The recipient's avatar — omit before they have an identity (📱 fallback). */
  avatar?: AvatarData;
  sub?: string;
  buttonLabel?: string;
  onConfirm?: () => void;
}

/** Privacy gate: "Pass the phone to X" — the private screen only renders once
 * the recipient confirms, so nothing leaks while passing. */
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
