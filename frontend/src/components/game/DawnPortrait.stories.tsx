import type { Meta, StoryObj } from '@storybook/react-vite';

import { DawnPortrait } from './DawnPortrait';
import { withAppWidth } from '../../storybook/decorators';
import { ISABELLA } from '../../storybook/sampleData';

const meta = {
  title: 'Game/DawnPortrait',
  component: DawnPortrait,
  decorators: [withAppWidth],
} satisfies Meta<typeof DawnPortrait>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spared: Story = {
  args: { avatar: ISABELLA },
};

export const Banished: Story = {
  args: { avatar: ISABELLA, fate: 'banished' },
};

export const Slain: Story = {
  args: { avatar: ISABELLA, fate: 'slain' },
};
