import type { Meta, StoryObj } from '@storybook/react-vite';

import { BallotCardFront } from './BallotCardFront';
import { FlipCard } from './FlipCard';
import { withAppWidth } from '../../storybook/decorators';
import { ISABELLA } from '../../storybook/sampleData';

const meta = {
  title: 'Game/BallotCardFront',
  component: BallotCardFront,
  decorators: [
    // Card faces live inside a FlipCard, which positions and styles them.
    (Story) => <FlipCard flipped aspect="ballot" back={null} front={<Story />} />,
    withAppWidth,
  ],
} satisfies Meta<typeof BallotCardFront>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { choice: ISABELLA },
};
