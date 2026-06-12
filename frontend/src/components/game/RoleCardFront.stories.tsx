import type { Meta, StoryObj } from '@storybook/react-vite';

import { FlipCard } from './FlipCard';
import { RoleCardFront } from './RoleCardFront';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Game/RoleCardFront',
  component: RoleCardFront,
  decorators: [
    // Card faces live inside a FlipCard, which positions and styles them.
    (Story) => <FlipCard flipped back={null} front={<Story />} />,
    withAppWidth,
  ],
} satisfies Meta<typeof RoleCardFront>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Virtuous: Story = {
  args: {
    role: 'virtuous',
    description:
      'You are innocent. Each round, vote to banish the Assassins before they outnumber you.',
  },
};

export const Guardian: Story = {
  args: {
    role: 'guardian',
    description:
      'Each round, secretly choose someone to protect from assassination — then cast your vote like everyone else.',
  },
};

export const Assassin: Story = {
  args: {
    role: 'assassin',
    description:
      'Each round, secretly mark a victim to assassinate — then cast your vote to deflect suspicion.',
  },
};

export const AssassinWithMates: Story = {
  args: {
    role: 'assassin',
    description:
      'Each round, secretly mark a victim to assassinate — then cast your vote to deflect suspicion.',
    fellowAssassins: ['Lorenzo', 'Bianca'],
  },
};
