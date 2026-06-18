import type { ReactNode } from 'react';

import { SelfieStage } from '../game/SelfieStage';
import { Screen } from '../layout/Screen';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';

export interface SelfieCaptureScreenProps {
  playerName: string;
  /** The live camera feed — a `<video>` element supplied by the caller. */
  stage: ReactNode;
  cameraError?: boolean;
  snapEnabled?: boolean;
  onSnap?: () => void;
  onSkip?: () => void;
}

export function SelfieCaptureScreen({
  playerName,
  stage,
  cameraError = false,
  snapEnabled = false,
  onSnap,
  onSkip,
}: SelfieCaptureScreenProps) {
  return (
    <Screen
      footer={
        <>
          <Button disabled={!snapEnabled} target={snapEnabled} onClick={onSnap}>
            Take photo
          </Button>
          <Button variant="secondary" onClick={onSkip}>
            Skip — use initials
          </Button>
        </>
      }
    >
      <Eyebrow center className="mt-1.5">
        Selfie · {playerName}
      </Eyebrow>
      <Heading center>{playerName}, take a selfie</Heading>
      <BodyText center>
        This becomes your token for the game. <strong>The app saves nothing</strong> — your photo
        lives only in this game, and is gone the moment it ends.
      </BodyText>
      <SelfieStage>{stage}</SelfieStage>
      {cameraError && (
        <BodyText center>Couldn't open the camera — you can play with an initials token instead.</BodyText>
      )}
    </Screen>
  );
}
