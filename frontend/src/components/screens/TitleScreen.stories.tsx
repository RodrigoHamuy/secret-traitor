import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { TitleScreen } from './TitleScreen';

export default { title: 'Screens/TitleScreen' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { joinDisabled } = useControls({ joinDisabled: true }, { store });
    return <TitleScreen joinDisabled={joinDisabled} />;
  },
};
