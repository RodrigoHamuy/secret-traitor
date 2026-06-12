import type { Meta, StoryObj } from '@storybook/react-vite';

import { CardBack } from './CardBack';
import { FlipCard } from './FlipCard';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Game/CardBack',
  component: CardBack,
  decorators: [
    // Card faces live inside a FlipCard, which positions and styles them.
    (Story) => <FlipCard flipped={false} back={<Story />} front={null} />,
    withAppWidth,
  ],
} satisfies Meta<typeof CardBack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RoleCard: Story = {
  args: { glyph: '🤫' },
};

export const Ballot: Story = {
  args: { glyph: '🗳️' },
};
