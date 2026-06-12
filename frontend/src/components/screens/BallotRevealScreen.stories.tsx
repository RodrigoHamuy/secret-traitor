import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { BallotRevealScreen } from './BallotRevealScreen';
import { withPhone } from '../../storybook/decorators';
import { ISABELLA } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/BallotRevealScreen',
  component: BallotRevealScreen,
  decorators: [withPhone],
} satisfies Meta<typeof BallotRevealScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

function TapToReveal() {
  const [flipped, setFlipped] = useState(false);
  return (
    <BallotRevealScreen
      index={3}
      total={6}
      voterName="Lorenzo"
      choice={ISABELLA}
      flipped={flipped}
      onFlip={() => setFlipped(true)}
      ctaLabel="Show everyone, then pass on"
    />
  );
}

export const FaceDown: Story = {
  args: {
    index: 3,
    total: 6,
    voterName: 'Lorenzo',
    choice: ISABELLA,
    flipped: false,
    ctaLabel: 'Show everyone, then pass on',
  },
  render: () => <TapToReveal />,
};

export const Revealed: Story = {
  args: {
    index: 3,
    total: 6,
    voterName: 'Lorenzo',
    choice: ISABELLA,
    flipped: true,
    ctaLabel: 'Show everyone, then pass on',
  },
};

export const LastBallot: Story = {
  args: {
    index: 6,
    total: 6,
    voterName: 'Matteo',
    choice: ISABELLA,
    flipped: true,
    ctaLabel: 'See the result',
  },
};
