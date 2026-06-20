import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { PickCard } from './PickCard';
import type { PickCardProps } from './PickCard';
import { PickGrid } from './PickGrid';
import { withAppWidth } from '../../storybook/decorators';
import { PLAYERS } from '../../storybook/sampleData';

export default { title: 'Game/PickGrid', decorators: [withAppWidth] };

const TINT_OPTIONS = ['vote', 'kill', 'shield'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { tint, count } = useControls(
      {
        tint: { options: TINT_OPTIONS },
        count: { value: PLAYERS.length, min: 1, max: PLAYERS.length, step: 1 },
      },
      { store },
    );
    const [selected, setSelected] = useState<string | undefined>(PLAYERS[1].name);
    return (
      <PickGrid>
        {PLAYERS.slice(0, count).map((p) => (
          <PickCard
            key={p.name}
            avatar={p}
            selected={p.name === selected}
            tint={tint as PickCardProps['tint']}
            onClick={() => setSelected(p.name)}
          />
        ))}
      </PickGrid>
    );
  },
};
