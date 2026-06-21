import type { Meta, StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { BallotCardFront } from './BallotCardFront';
import { FlipCard } from './FlipCard';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default {
  title: 'Game/BallotCardFront',
  decorators: [
    // Card faces live inside a FlipCard, which positions and styles them.
    (Story) => <FlipCard flipped aspect="ballot" back={null} front={<Story />} />,
  ],
} satisfies Meta;

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { name, photo } = useControls({ name: 'Isabella', photo: true }, { store });
    return <BallotCardFront choice={{ name, photoUrl: photo ? SAMPLE_PHOTO : undefined }} />;
  },
};
