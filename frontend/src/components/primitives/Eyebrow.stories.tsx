import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { Eyebrow } from './Eyebrow';

export default { title: 'Primitives/Eyebrow' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children, center } = useControls(
      { children: 'A game of trust & betrayal', center: false },
      { store },
    );
    return <Eyebrow center={center}>{children}</Eyebrow>;
  },
};
