import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { DawnPortrait } from './DawnPortrait';
import type { DawnPortraitProps } from './DawnPortrait';
import { withAppWidth } from '../../storybook/decorators';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Game/DawnPortrait', decorators: [withAppWidth] };

const FATE_OPTIONS = ['none', 'banished', 'slain'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { name, photo, fate } = useControls(
      { name: 'Isabella', photo: true, fate: { options: FATE_OPTIONS } },
      { store },
    );
    return (
      <DawnPortrait
        avatar={{ name, photoUrl: photo ? SAMPLE_PHOTO : undefined }}
        fate={fate === 'none' ? undefined : (fate as DawnPortraitProps['fate'])}
      />
    );
  },
};
