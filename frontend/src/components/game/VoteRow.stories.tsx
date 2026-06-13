import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { VoteRow } from './VoteRow';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Game/VoteRow' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { voterName, choiceName } = useControls(
      { voterName: 'Isabella', choiceName: 'Lorenzo' },
      { store },
    );
    return (
      <VoteRow voter={{ name: voterName, photoUrl: SAMPLE_PHOTO }} choice={{ name: choiceName }} />
    );
  },
};
