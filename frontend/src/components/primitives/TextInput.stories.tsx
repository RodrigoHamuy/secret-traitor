import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextInput } from './TextInput';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Primitives/TextInput',
  component: TextInput,
  decorators: [withAppWidth],
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { placeholder: 'Your name', maxLength: 14 },
};

export const Filled: Story = {
  args: { defaultValue: 'Isabella', maxLength: 14 },
};
