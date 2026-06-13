import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { StepButton } from './StepButton';

export default { title: 'Primitives/StepButton' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children, disabled } = useControls({ children: '+', disabled: false }, { store });
    return <StepButton disabled={disabled}>{children}</StepButton>;
  },
};
