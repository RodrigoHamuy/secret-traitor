import type { Meta, StoryObj } from '@storybook/react-vite';

import { RoundIntroScreen } from './RoundIntroScreen';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Screens/RoundIntroScreen',
  component: RoundIntroScreen,
  decorators: [withPhone],
} satisfies Meta<typeof RoundIntroScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RoundOne: Story = {
  args: {
    round: 1,
    prompt: 'Who already looks guilty?',
    durationSeconds: 60,
    timerLabel: '1:00',
    aliveCount: 6,
    ctaLabel: 'Skip & pass the phone around',
  },
};

export const TimeUp: Story = {
  args: {
    round: 3,
    prompt: 'Debate aloud — who do you suspect?',
    durationSeconds: 0,
    timerLabel: "Time's up",
    timeUp: true,
    aliveCount: 4,
    ctaLabel: 'Pass the phone around',
  },
};
