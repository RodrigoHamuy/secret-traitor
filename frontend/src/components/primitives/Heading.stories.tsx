import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { Heading } from './Heading';

export default { title: 'Primitives/Heading' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children, center } = useControls(
      { children: 'How many are playing?', center: false },
      { store },
    );
    return <Heading center={center}>{children}</Heading>;
  },
};
