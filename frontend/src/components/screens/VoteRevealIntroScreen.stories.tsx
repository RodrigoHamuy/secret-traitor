import type { Meta, StoryObj } from '@storybook/react-vite';

import { VoteRevealIntroScreen } from './VoteRevealIntroScreen';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Screens/VoteRevealIntroScreen',
  component: VoteRevealIntroScreen,
  decorators: [withPhone],
} satisfies Meta<typeof VoteRevealIntroScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Suspense: Story = {
  args: { suspense: true },
};

export const AllAtOnce: Story = {
  args: { suspense: false },
};
