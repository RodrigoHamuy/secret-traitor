import type { Meta, StoryObj } from '@storybook/react-vite';

import { GateAvatar } from './GateAvatar';
import { ISABELLA, LORENZO } from '../../storybook/sampleData';

const meta = {
  title: 'Game/GateAvatar',
  component: GateAvatar,
} satisfies Meta<typeof GateAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Photo: Story = {
  args: { avatar: ISABELLA },
};

export const Initials: Story = {
  args: { avatar: LORENZO },
};
