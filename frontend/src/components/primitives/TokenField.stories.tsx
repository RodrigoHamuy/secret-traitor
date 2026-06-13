import type { Meta, StoryObj } from '@storybook/react-vite';

import { TokenField } from './TokenField';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Primitives/TokenField',
  component: TokenField,
  decorators: [withAppWidth],
} satisfies Meta<typeof TokenField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Replicate API token (optional)',
    defaultValue: 'r8_example_token',
    note: 'Optional. Paints each selfie into a 16th-century portrait in the background. Your token stays on this phone and is never saved.',
  },
};
