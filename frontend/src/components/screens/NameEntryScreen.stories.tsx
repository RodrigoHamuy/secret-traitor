import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { NameEntryScreen } from './NameEntryScreen';
import { withPhone } from '../../storybook/decorators';

export default { title: 'Screens/NameEntryScreen', decorators: [withPhone] };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { index, total } = useControls(
      {
        index: { value: 2, min: 1, max: 12, step: 1 },
        total: { value: 6, min: 1, max: 12, step: 1 },
      },
      { store },
    );
    // Type into the field to drive `value`/`canContinue`.
    const [value, setValue] = useState('');
    return (
      <NameEntryScreen
        index={index}
        total={total}
        value={value}
        onChange={setValue}
        canContinue={value.trim().length > 0}
      />
    );
  },
};
