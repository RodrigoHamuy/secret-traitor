import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { BallotRevealScreen } from './BallotRevealScreen';
import { withPhone } from '../../storybook/decorators';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Screens/BallotRevealScreen', decorators: [withPhone] };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { index, total, voterName, choiceName, ctaLabel } = useControls(
      {
        index: { value: 3, min: 1, max: 6, step: 1 },
        total: { value: 6, min: 1, max: 6, step: 1 },
        voterName: 'Lorenzo',
        choiceName: 'Isabella',
        ctaLabel: 'Show everyone, then pass on',
      },
      { store },
    );
    // Tap the ballot to flip it.
    const [flipped, setFlipped] = useState(false);
    return (
      <BallotRevealScreen
        index={index}
        total={total}
        voterName={voterName}
        choice={{ name: choiceName, photoUrl: SAMPLE_PHOTO }}
        flipped={flipped}
        onFlip={() => setFlipped(true)}
        ctaLabel={ctaLabel}
      />
    );
  },
};
