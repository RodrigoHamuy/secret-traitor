import type { Meta, StoryObj } from '@storybook/react-vite';

import { VoteList } from './VoteList';
import { VoteRow } from './VoteRow';
import { withAppWidth } from '../../storybook/decorators';
import { PLAYERS } from '../../storybook/sampleData';

const meta = {
  title: 'Game/VoteList',
  component: VoteList,
  decorators: [withAppWidth],
} satisfies Meta<typeof VoteList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllBallots: Story = {
  args: { children: null },
  render: () => (
    <VoteList>
      {PLAYERS.map((p, i) => (
        <VoteRow key={p.name} voter={p} choice={PLAYERS[(i + 2) % PLAYERS.length]} />
      ))}
    </VoteList>
  ),
};
