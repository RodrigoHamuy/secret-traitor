import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { TokenField } from './TokenField';

export default { title: 'Primitives/TokenField' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { placeholder, note } = useControls(
      {
        placeholder: 'Replicate API token (optional)',
        note: 'Optional. Paints each selfie into a 16th-century portrait in the background. Your token stays on this phone and is never saved.',
      },
      { store },
    );
    return (
      <TokenField
        placeholder={placeholder}
        note={note || undefined}
        defaultValue="r8_example_token"
      />
    );
  },
};
