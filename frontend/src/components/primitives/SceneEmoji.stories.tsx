import type { Meta, StoryObj } from '@storybook/react-vite';

import { SceneEmoji } from './SceneEmoji';

const meta = {
  title: 'Primitives/SceneEmoji',
  component: SceneEmoji,
} satisfies Meta<typeof SceneEmoji>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: '🗳️' },
};
