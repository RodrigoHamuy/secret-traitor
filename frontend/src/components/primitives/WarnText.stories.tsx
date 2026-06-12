import type { Meta, StoryObj } from '@storybook/react-vite';

import { WarnText } from './WarnText';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Primitives/WarnText',
  component: WarnText,
  decorators: [withAppWidth],
} satisfies Meta<typeof WarnText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "⚠ Fewer than 5 players is for quick testing — the game won't be much fun." },
};
