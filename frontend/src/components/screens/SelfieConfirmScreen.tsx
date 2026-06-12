import { SelfiePreview } from '../game/SelfiePreview';
import { SelfieStage } from '../game/SelfieStage';
import { Screen } from '../layout/Screen';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';

export interface SelfieConfirmScreenProps {
  playerName: string;
  photoSrc: string;
  onUse?: () => void;
  onRetake?: () => void;
}

export function SelfieConfirmScreen({ playerName, photoSrc, onUse, onRetake }: SelfieConfirmScreenProps) {
  return (
    <Screen
      footer={
        <>
          <Button target onClick={onUse}>
            Looks good
          </Button>
          <Button variant="secondary" onClick={onRetake}>
            Retake
          </Button>
        </>
      }
    >
      <Eyebrow center className="mt-1.5">
        Selfie · {playerName}
      </Eyebrow>
      <Heading center>Use this photo?</Heading>
      <SelfieStage>
        <SelfiePreview src={photoSrc} />
      </SelfieStage>
    </Screen>
  );
}
