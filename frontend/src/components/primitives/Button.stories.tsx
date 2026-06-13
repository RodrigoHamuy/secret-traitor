import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { Button } from './Button';
import type { ButtonProps } from './Button';
import { withAppWidth } from '../../storybook/decorators';

export default { title: 'Primitives/Button', decorators: [withAppWidth] };

const VARIANT_OPTIONS = ['primary', 'secondary', 'ghost'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children, variant, target, disabled, emoji } = useControls(
      {
        children: 'Deal roles',
        variant: { options: VARIANT_OPTIONS },
        target: false,
        disabled: false,
        emoji: '',
      },
      { store },
    );
    return (
      <Button
        variant={variant as ButtonProps['variant']}
        target={target}
        disabled={disabled}
        emoji={emoji || undefined}
      >
        {children}
      </Button>
    );
  },
};
