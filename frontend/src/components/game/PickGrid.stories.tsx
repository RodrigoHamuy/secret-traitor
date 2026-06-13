import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { PickCard } from './PickCard';
import { PickGrid } from './PickGrid';
import { withAppWidth } from '../../storybook/decorators';
import { PLAYERS } from '../../storybook/sampleData';

const meta = {
  title: 'Game/PickGrid',
  component: PickGrid,
  decorators: [withAppWidth],
} satisfies Meta<typeof PickGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

function SelectableGrid({ tint }: { tint?: 'vote' | 'kill' | 'shield' }) {
  const [selected, setSelected] = useState<string | undefined>(PLAYERS[1].name);
  return (
    <PickGrid>
      {PLAYERS.map((p) => (
        <PickCard
          key={p.name}
          avatar={p}
          selected={p.name === selected}
          tint={tint}
          onClick={() => setSelected(p.name)}
        />
      ))}
    </PickGrid>
  );
}

export const VoteSelection: Story = {
  args: { children: null },
  render: () => <SelectableGrid tint="vote" />,
};

export const KillSelection: Story = {
  args: { children: null },
  render: () => <SelectableGrid tint="kill" />,
};

export const ShieldSelection: Story = {
  args: { children: null },
  render: () => <SelectableGrid tint="shield" />,
};
