import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { OptionRow } from './OptionRow';
import { withAppWidth } from '../../storybook/decorators';

export default { title: 'Primitives/OptionRow', decorators: [withAppWidth] };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { title, description } = useControls(
      {
        title: 'Suspense mode',
        description: 'Reveal the votes one by one before the verdict.',
      },
      { store },
    );
    // Checked state stays click-driven — toggle the row to see both states.
    const [checked, setChecked] = useState(false);
    return (
      <OptionRow
        checked={checked}
        onChange={setChecked}
        title={title}
        description={description || undefined}
      />
    );
  },
};
