import type { Meta, StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { FlipCard } from './FlipCard';
import { RoleCardFront } from './RoleCardFront';
import type { RoleCardFrontProps } from './RoleCardFront';

export default {
  title: 'Game/RoleCardFront',
  decorators: [
    // Card faces live inside a FlipCard, which positions and styles them.
    (Story) => <FlipCard flipped back={null} front={<Story />} />,
  ],
} satisfies Meta;

const ROLE_OPTIONS = ['virtuous', 'guardian', 'assassin'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { role, glyph, label, description, fellowAssassins } = useControls(
      {
        role: { options: ROLE_OPTIONS },
        glyph: '',
        label: '',
        description:
          'You are innocent. Each round, vote to banish the Assassins before they outnumber you.',
        // Comma-separated; empty → no accomplices line.
        fellowAssassins: '',
      },
      { store },
    );
    const mates = fellowAssassins
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return (
      <RoleCardFront
        role={role as RoleCardFrontProps['role']}
        glyph={glyph || undefined}
        label={label || undefined}
        description={description}
        fellowAssassins={mates.length > 0 ? mates : undefined}
      />
    );
  },
};
