import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';
import { OptionRow } from '../primitives/OptionRow';
import { PlayerCountStepper } from '../primitives/PlayerCountStepper';
import { TokenField } from '../primitives/TokenField';
import { WarnText } from '../primitives/WarnText';

export interface SetupScreenProps {
  count: number;
  suspense: boolean;
  selfie: boolean;
  token: string;
  onDecrement?: () => void;
  onIncrement?: () => void;
  onSuspenseChange?: (checked: boolean) => void;
  onSelfieChange?: (checked: boolean) => void;
  onTokenChange?: (token: string) => void;
  onDeal?: () => void;
}

export function SetupScreen({
  count,
  suspense,
  selfie,
  token,
  onDecrement,
  onIncrement,
  onSuspenseChange,
  onSelfieChange,
  onTokenChange,
  onDeal,
}: SetupScreenProps) {
  return (
    <Screen
      footer={
        <Button target onClick={onDeal}>
          Deal roles
        </Button>
      }
    >
      <Eyebrow>New game · one shared phone</Eyebrow>
      <Heading>How many are playing?</Heading>
      <BodyText>Pick the number of players. Each one types their name when the phone reaches them.</BodyText>
      <PlayerCountStepper count={count} onDecrement={onDecrement} onIncrement={onIncrement} />
      {count < 5 && (
        <WarnText>⚠ Fewer than 5 players is for quick testing — the game won't be much fun.</WarnText>
      )}
      <OptionRow
        checked={suspense}
        onChange={onSuspenseChange}
        title="Suspense mode"
        description="Reveal the votes one by one before the verdict."
      />
      <OptionRow
        checked={selfie}
        onChange={onSelfieChange}
        title="Selfie avatars"
        description="Each player snaps a selfie as their token. The app saves nothing — photos live only in this game, on this phone. (With a Replicate token below, each selfie is briefly uploaded to Replicate to paint the portrait.)"
      />
      {selfie && (
        <TokenField
          value={token}
          onChange={(e) => onTokenChange?.(e.target.value)}
          placeholder="Replicate API token (optional)"
          autoComplete="off"
          spellCheck={false}
          note="Optional. Paints each selfie into a 16th-century portrait in the background. To do this, each selfie is sent to Replicate (your account) to generate the portrait — not used to train any model, and auto-deleted within an hour. Your token stays on this phone and is never saved. Leave blank for plain selfies that never leave the phone."
        />
      )}
      <Spacer />
    </Screen>
  );
}
