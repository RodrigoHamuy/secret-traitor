import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { GateAvatar } from './GateAvatar';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Game/GateAvatar' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { name, photo } = useControls({ name: 'Isabella', photo: true }, { store });
    return <GateAvatar avatar={{ name, photoUrl: photo ? SAMPLE_PHOTO : undefined }} />;
  },
};
