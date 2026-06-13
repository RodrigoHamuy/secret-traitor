import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { Avatar } from './Avatar';
import type { AvatarProps } from './Avatar';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Game/Avatar' };

const SIZE_OPTIONS = ['xs', 'sm', 'xl', 'fill'];
const FATE_OPTIONS = ['none', 'banished', 'slain'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { name, photo, size, fate, enhancing, animateFate } = useControls(
      {
        name: 'Isabella',
        photo: true,
        size: { value: 'xl', options: SIZE_OPTIONS },
        fate: { options: FATE_OPTIONS },
        enhancing: false,
        animateFate: false,
      },
      { store },
    );
    return (
      <Avatar
        name={name}
        photoUrl={photo ? SAMPLE_PHOTO : undefined}
        size={size as AvatarProps['size']}
        fate={fate === 'none' ? undefined : (fate as AvatarProps['fate'])}
        enhancing={enhancing}
        animateFate={animateFate}
      />
    );
  },
};
