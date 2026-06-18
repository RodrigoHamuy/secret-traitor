import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { CardBack } from './CardBack';
import { FlipCard } from './FlipCard';
import type { FlipCardProps } from './FlipCard';
import { RoleCardFront } from './RoleCardFront';
import { withAppWidth } from '../../storybook/decorators';

export default { title: 'Game/FlipCard', decorators: [withAppWidth] };

const back = <CardBack glyph="🤫" />;
const front = (
  <RoleCardFront
    role="guardian"
    description="Each round, secretly choose someone to protect from assassination — then cast your vote like everyone else."
  />
);

const ASPECT_OPTIONS = ['role', 'ballot'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { aspect } = useControls({ aspect: { options: ASPECT_OPTIONS } }, { store });
    const [flipped, setFlipped] = useState(false);
    return (
      <FlipCard
        flipped={flipped}
        onFlip={() => setFlipped(true)}
        aspect={aspect as FlipCardProps['aspect']}
        back={back}
        front={front}
      />
    );
  },
};
