import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { GateScreen } from './GateScreen';
import { screenStoryConfig } from '../../storybook/decorators';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Screens/GateScreen', ...screenStoryConfig };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { playerName, avatar, sub, buttonLabel } = useControls(
      { playerName: 'Isabella', avatar: true, sub: '', buttonLabel: '' },
      { store },
    );
    return (
      <GateScreen
        playerName={playerName}
        avatar={avatar ? { name: playerName, photoUrl: SAMPLE_PHOTO } : undefined}
        sub={sub || undefined}
        buttonLabel={buttonLabel || undefined}
      />
    );
  },
};
