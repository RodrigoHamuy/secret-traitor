import type { Meta, StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { CardBack } from './CardBack';
import { FlipCard } from './FlipCard';

export default {
  title: 'Game/CardBack',
  decorators: [
    // Card faces live inside a FlipCard, which positions and styles them.
    (Story) => <FlipCard flipped={false} back={<Story />} front={null} />,
  ],
} satisfies Meta;

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { glyph, label } = useControls({ glyph: '🤫', label: 'Tap to reveal' }, { store });
    return <CardBack glyph={glyph} label={label || undefined} />;
  },
};
