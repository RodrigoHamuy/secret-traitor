import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { VoteRevealIntroScreen } from './VoteRevealIntroScreen';

export default { title: 'Screens/VoteRevealIntroScreen' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { suspense } = useControls({ suspense: true }, { store });
    return <VoteRevealIntroScreen suspense={suspense} />;
  },
};
