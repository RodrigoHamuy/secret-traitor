import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { TextInput } from './TextInput';
import { withAppWidth } from '../../storybook/decorators';

export default { title: 'Primitives/TextInput', decorators: [withAppWidth] };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { placeholder, maxLength } = useControls(
      { placeholder: 'Your name', maxLength: 14 },
      { store },
    );
    // Left uncontrolled so you can type into it; leva drives the config props.
    return <TextInput placeholder={placeholder} maxLength={maxLength} />;
  },
};
