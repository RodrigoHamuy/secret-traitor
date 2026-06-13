import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { RoleRevealScreen } from './RoleRevealScreen';
import { RoleCardFront } from '../game/RoleCardFront';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Screens/RoleRevealScreen',
  component: RoleRevealScreen,
  decorators: [withPhone],
} satisfies Meta<typeof RoleRevealScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const assassinFront = (
  <RoleCardFront
    role="assassin"
    description="Each round, secretly mark a victim to assassinate — then cast your vote to deflect suspicion."
    fellowAssassins={['Bianca']}
  />
);

function TapToReveal() {
  const [flipped, setFlipped] = useState(false);
  return (
    <RoleRevealScreen
      eyebrow="Secret roles · 2 of 6"
      title="Lorenzo, this is you"
      front={assassinFront}
      flipped={flipped}
      onFlip={() => setFlipped(true)}
      ctaLabel="Hide & pass on"
    />
  );
}

export const FaceDown: Story = {
  args: {
    eyebrow: 'Secret roles · 2 of 6',
    title: 'Lorenzo, this is you',
    front: assassinFront,
    flipped: false,
    ctaLabel: 'Hide & pass on',
  },
  render: () => <TapToReveal />,
};

export const RevealedAssassin: Story = {
  args: {
    eyebrow: 'Secret roles · 2 of 6',
    title: 'Lorenzo, this is you',
    front: assassinFront,
    flipped: true,
    ctaLabel: 'Hide & pass on',
  },
};

export const EliminationReveal: Story = {
  args: {
    eyebrow: 'Banished · round 3',
    title: 'Caterina, reveal yourself',
    front: <RoleCardFront role="virtuous" description="Caterina was one of the Virtuous." />,
    flipped: true,
    ctaLabel: 'Continue',
  },
};
