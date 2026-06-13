import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { VoteList } from './VoteList';
import { VoteRow } from './VoteRow';
import { withAppWidth } from '../../storybook/decorators';
import { PLAYERS } from '../../storybook/sampleData';

export default { title: 'Game/VoteList', decorators: [withAppWidth] };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { count } = useControls(
      { count: { value: PLAYERS.length, min: 1, max: PLAYERS.length, step: 1 } },
      { store },
    );
    return (
      <VoteList>
        {PLAYERS.slice(0, count).map((p, i) => (
          <VoteRow key={p.name} voter={p} choice={PLAYERS[(i + 2) % PLAYERS.length]} />
        ))}
      </VoteList>
    );
  },
};
