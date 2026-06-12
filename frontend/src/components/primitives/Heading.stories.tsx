import type { Meta, StoryObj } from '@storybook/react-vite';

import { Heading } from './Heading';

const meta = {
  title: 'Primitives/Heading',
  component: Heading,
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'How many are playing?' },
};
