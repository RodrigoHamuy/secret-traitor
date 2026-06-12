import type { Meta, StoryObj } from '@storybook/react-vite';

import { GateScreen } from './GateScreen';
import { withPhone } from '../../storybook/decorators';
import { ISABELLA } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/GateScreen',
  component: GateScreen,
  decorators: [withPhone],
} satisfies Meta<typeof GateScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAvatar: Story = {
  args: { playerName: 'Isabella', avatar: ISABELLA },
};

export const EmojiFallback: Story = {
  args: { playerName: 'Player 3' },
};

export const FirstPass: Story = {
  args: {
    playerName: 'Player 1',
    sub: 'Hand it over before tapping — then type your name.',
    buttonLabel: "I've got it",
  },
};
