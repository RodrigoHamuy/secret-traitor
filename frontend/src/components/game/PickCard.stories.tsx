import type { Meta, StoryObj } from '@storybook/react-vite';

import { PickCard } from './PickCard';
import { ISABELLA, LORENZO } from '../../storybook/sampleData';

const meta = {
  title: 'Game/PickCard',
  component: PickCard,
  decorators: [
    (Story) => (
      <div className="w-44">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PickCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { avatar: LORENZO },
};

export const Selected: Story = {
  args: { avatar: LORENZO, selected: true },
};

export const SelectedVote: Story = {
  args: { avatar: ISABELLA, selected: true, tint: 'vote' },
};

export const SelectedKill: Story = {
  args: { avatar: ISABELLA, selected: true, tint: 'kill' },
};

export const SelectedShield: Story = {
  args: { avatar: ISABELLA, selected: true, tint: 'shield' },
};

export const WinnerCrown: Story = {
  args: {
    avatar: ISABELLA,
    selected: true,
    tint: 'win',
    crown: true,
    roleTag: { label: 'GUARDIAN', color: 'var(--color-guardian)' },
  },
};
