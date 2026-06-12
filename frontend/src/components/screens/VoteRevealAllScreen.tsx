import type { AvatarData } from '../game/Avatar';

import { VoteList } from '../game/VoteList';
import { VoteRow } from '../game/VoteRow';
import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { Heading } from '../primitives/Heading';

export interface VoteRevealAllScreenProps {
  votes: Array<{ voter: AvatarData; choice: AvatarData }>;
  onNext?: () => void;
}

/** All ballots on one screen. */
export function VoteRevealAllScreen({ votes, onNext }: VoteRevealAllScreenProps) {
  return (
    <Screen
      footer={
        <Button target onClick={onNext}>
          See the result
        </Button>
      }
    >
      <Eyebrow center className="mt-1.5">
        The ballots
      </Eyebrow>
      <Heading center>Who voted for whom</Heading>
      <VoteList>
        {votes.map((v) => (
          <VoteRow key={v.voter.name} voter={v.voter} choice={v.choice} />
        ))}
      </VoteList>
      <Spacer />
    </Screen>
  );
}
