import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { BodyText } from './BodyText';
import { withAppWidth } from '../../storybook/decorators';

export default { title: 'Primitives/BodyText', decorators: [withAppWidth] };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children, center } = useControls(
      {
        children: 'By night a traitor strikes. By day the Virtuous decide who to trust.',
        center: false,
      },
      { store },
    );
    return <BodyText center={center}>{children}</BodyText>;
  },
};
