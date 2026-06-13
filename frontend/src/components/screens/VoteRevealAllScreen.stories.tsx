import type { Meta, StoryObj } from '@storybook/react-vite';

import { VoteRevealAllScreen } from './VoteRevealAllScreen';
import { withPhone } from '../../storybook/decorators';
import { PLAYERS } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/VoteRevealAllScreen',
  component: VoteRevealAllScreen,
  decorators: [withPhone],
} satisfies Meta<typeof VoteRevealAllScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    votes: PLAYERS.map((p, i) => ({ voter: p, choice: PLAYERS[(i + 2) % PLAYERS.length] })),
  },
};
