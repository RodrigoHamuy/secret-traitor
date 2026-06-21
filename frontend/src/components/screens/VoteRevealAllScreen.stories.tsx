import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { VoteRevealAllScreen } from './VoteRevealAllScreen';
import { screenStoryConfig } from '../../storybook/decorators';
import { PLAYERS } from '../../storybook/sampleData';

export default { title: 'Screens/VoteRevealAllScreen', ...screenStoryConfig };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { count } = useControls(
      { count: { value: PLAYERS.length, min: 1, max: PLAYERS.length, step: 1 } },
      { store },
    );
    const votes = PLAYERS.slice(0, count).map((p, i) => ({
      voter: p,
      choice: PLAYERS[(i + 2) % PLAYERS.length],
    }));
    return <VoteRevealAllScreen votes={votes} />;
  },
};
