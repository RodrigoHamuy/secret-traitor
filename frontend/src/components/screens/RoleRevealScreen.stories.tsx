import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { RoleRevealScreen } from './RoleRevealScreen';
import { RoleCardFront } from '../game/RoleCardFront';
import type { RoleCardFrontProps } from '../game/RoleCardFront';

export default { title: 'Screens/RoleRevealScreen' };

const ROLE_OPTIONS = ['virtuous', 'guardian', 'assassin'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { eyebrow, title, role, description, ctaLabel } = useControls(
      {
        eyebrow: 'Secret roles · 2 of 6',
        title: 'Lorenzo, this is you',
        role: { options: ROLE_OPTIONS },
        description:
          'Each round, secretly mark a victim to assassinate — then cast your vote to deflect suspicion.',
        ctaLabel: 'Hide & pass on',
      },
      { store },
    );
    const [flipped, setFlipped] = useState(false);
    return (
      <RoleRevealScreen
        eyebrow={eyebrow}
        title={title}
        front={
          <RoleCardFront role={role as RoleCardFrontProps['role']} description={description} />
        }
        flipped={flipped}
        onFlip={() => setFlipped(true)}
        ctaLabel={ctaLabel}
      />
    );
  },
};
