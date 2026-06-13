import type { Meta, StoryObj } from '@storybook/react-vite';

import { Eyebrow } from './Eyebrow';

const meta = {
  title: 'Primitives/Eyebrow',
  component: Eyebrow,
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'A game of trust & betrayal' },
};
