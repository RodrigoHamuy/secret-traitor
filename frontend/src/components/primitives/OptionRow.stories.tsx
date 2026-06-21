import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { OptionRow } from './OptionRow';

export default { title: 'Primitives/OptionRow' };

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
