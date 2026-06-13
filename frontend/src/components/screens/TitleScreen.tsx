import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Divider } from '../primitives/Divider';
import { Eyebrow } from '../primitives/Eyebrow';
import { TitleHeading } from '../primitives/TitleHeading';

export interface TitleScreenProps {
  onCreate?: () => void;
  onJoin?: () => void;
  joinDisabled?: boolean;
}

export function TitleScreen({ onCreate, onJoin, joinDisabled = true }: TitleScreenProps) {
  return (
    <Screen
      footer={
        <>
          <Button target onClick={onCreate}>
            Create Game
          </Button>
          <Button variant="secondary" disabled={joinDisabled} onClick={onJoin}>
            Join Game · online soon
          </Button>
        </>
      }
    >
      <Spacer />
      <Eyebrow center>A game of trust &amp; betrayal</Eyebrow>
      <TitleHeading center>
        SECRET
        <br />
        TRAITOR
      </TitleHeading>
      <Divider />
      <BodyText center>By night a traitor strikes. By day the Virtuous decide who to trust.</BodyText>
      <Spacer />
    </Screen>
  );
}
