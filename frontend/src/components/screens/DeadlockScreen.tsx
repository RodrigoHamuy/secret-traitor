import { Fragment } from 'react';

import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { Pill } from '../primitives/Pill';
import { SceneEmoji } from '../primitives/SceneEmoji';

export interface DeadlockScreenProps {
  tiedNames: string[];
  onNext?: () => void;
}

export function DeadlockScreen({ tiedNames, onNext }: DeadlockScreenProps) {
  return (
    <Screen
      footer={
        <Button target onClick={onNext}>
          Vote again
        </Button>
      }
    >
      <Spacer />
      <SceneEmoji>⚖️</SceneEmoji>
      <Heading center>The vote is deadlocked</Heading>
      <BodyText center>
        {tiedNames.map((name, i) => (
          <Fragment key={name}>
            {i > 0 && ' & '}
            <strong>{name}</strong>
          </Fragment>
        ))}{' '}
        are tied. Debate once more, then vote again — only between them.
      </BodyText>
      <BodyText center>
        <Pill>If it's still a tie, fate decides</Pill>
      </BodyText>
      <Spacer />
    </Screen>
  );
}
