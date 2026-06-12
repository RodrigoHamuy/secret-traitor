import type { Meta, StoryObj } from '@storybook/react-vite';

import { VoteRow } from './VoteRow';
import { ISABELLA, LORENZO } from '../../storybook/sampleData';

const meta = {
  title: 'Game/VoteRow',
  component: VoteRow,
} satisfies Meta<typeof VoteRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { voter: ISABELLA, choice: LORENZO },
};
