import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { PickCard } from './PickCard';
import type { PickCardProps } from './PickCard';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default {
  title: 'Game/PickCard',
  decorators: [
    (Story) => (
      <div className="w-44">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

const TINT_OPTIONS = ['vote', 'kill', 'shield', 'win'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { name, photo, tint, crown, roleTag } = useControls(
      {
        name: 'Isabella',
        photo: true,
        tint: { options: TINT_OPTIONS },
        crown: false,
        roleTag: false,
      },
      { store },
    );
    // Tint/crown/tag only show on a selected card — click to toggle selection.
    const [selected, setSelected] = useState(true);
    return (
      <PickCard
        avatar={{ name, photoUrl: photo ? SAMPLE_PHOTO : undefined }}
        selected={selected}
        onClick={() => setSelected((s) => !s)}
        tint={tint as PickCardProps['tint']}
        crown={crown}
        roleTag={roleTag ? { label: 'GUARDIAN', color: 'var(--color-guardian)' } : undefined}
      />
    );
  },
};
