import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';
import { TextInput } from '../primitives/TextInput';

export interface NameEntryScreenProps {
  /** 1-based position in the pass order. */
  index: number;
  total: number;
  value: string;
  onChange?: (value: string) => void;
  /** False while the name is empty or already taken. */
  canContinue?: boolean;
  onContinue?: () => void;
}

export function NameEntryScreen({
  index,
  total,
  value,
  onChange,
  canContinue = false,
  onContinue,
}: NameEntryScreenProps) {
  return (
    <Screen
      footer={
        <Button disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      }
    >
      <Eyebrow center className="mt-1.5">
        Player {index} of {total}
      </Eyebrow>
      <Heading center>What's your name?</Heading>
      <BodyText center>This is just for you — keep your role secret.</BodyText>
      <Spacer />
      <TextInput
        className="animate-pulse-glow"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Your name"
        maxLength={14}
        aria-label="Your name"
        autoComplete="off"
        spellCheck={false}
      />
      <Spacer />
    </Screen>
  );
}
