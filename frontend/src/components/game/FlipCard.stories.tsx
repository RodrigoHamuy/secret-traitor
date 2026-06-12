import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { CardBack } from './CardBack';
import { FlipCard } from './FlipCard';
import { RoleCardFront } from './RoleCardFront';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Game/FlipCard',
  component: FlipCard,
  decorators: [withAppWidth],
} satisfies Meta<typeof FlipCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const back = <CardBack glyph="🤫" />;
const front = (
  <RoleCardFront
    role="guardian"
    description="Each round, secretly choose someone to protect from assassination — then cast your vote like everyone else."
  />
);

function TapToFlip() {
  const [flipped, setFlipped] = useState(false);
  return <FlipCard flipped={flipped} onFlip={() => setFlipped(true)} back={back} front={front} />;
}

export const FaceDown: Story = {
  args: { flipped: false, back, front },
  render: () => <TapToFlip />,
};

export const Flipped: Story = {
  args: { flipped: true, back, front },
};
