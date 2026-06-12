import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ChoosePlayerScreenProps } from './ChoosePlayerScreen';

import { ChoosePlayerScreen } from './ChoosePlayerScreen';
import { withPhone } from '../../storybook/decorators';
import { PLAYERS } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/ChoosePlayerScreen',
  component: ChoosePlayerScreen,
  decorators: [withPhone],
} satisfies Meta<typeof ChoosePlayerScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveChoose(args: ChoosePlayerScreenProps) {
  const [selected, setSelected] = useState(args.selectedName);
  return <ChoosePlayerScreen {...args} selectedName={selected} onSelect={setSelected} />;
}

const voteArgs: ChoosePlayerScreenProps = {
  emoji: '🗳️',
  eyebrow: 'Round 2 · VOTE',
  title: 'Matteo, who do you vote to banish?',
  sub: 'You only cast a vote — whoever the majority picks is banished.',
  tint: 'vote',
  players: PLAYERS.slice(0, 5),
  ctaLabel: 'Cast vote',
  ctaEmoji: '🗳️',
};

export const Vote: Story = {
  args: voteArgs,
  render: (args) => <InteractiveChoose {...args} />,
};

export const VoteSelected: Story = {
  args: { ...voteArgs, selectedName: PLAYERS[1].name },
  render: (args) => <InteractiveChoose {...args} />,
};

export const Assassinate: Story = {
  args: {
    steps: { labels: ['Vote', 'Assassinate'], active: 1 },
    emoji: '🗡️',
    eyebrow: 'Round 2 · ASSASSINATE',
    title: 'Mark your victim',
    sub: 'Strike down one of the Virtuous tonight.',
    tint: 'kill',
    players: PLAYERS.slice(0, 4),
    selectedName: PLAYERS[0].name,
    ctaLabel: 'Assassinate',
    ctaEmoji: '🗡️',
  },
  render: (args) => <InteractiveChoose {...args} />,
};

export const Protect: Story = {
  args: {
    steps: { labels: ['Vote', 'Protect'], active: 1 },
    emoji: '🛡️',
    eyebrow: 'Round 2 · PROTECT',
    title: 'Choose who to protect',
    sub: 'They survive any assassination this round.',
    tint: 'shield',
    players: PLAYERS.slice(0, 5),
    selectedName: PLAYERS[2].name,
    ctaLabel: 'Protect',
    ctaEmoji: '🛡️',
  },
  render: (args) => <InteractiveChoose {...args} />,
};

export const Runoff: Story = {
  args: {
    emoji: '🗳️',
    eyebrow: 'Round 2 · RE-VOTE · VOTE',
    title: 'Matteo, who do you vote to banish?',
    sub: 'Runoff — vote only between the tied players.',
    tint: 'vote',
    players: PLAYERS.slice(0, 2),
    ctaLabel: 'Cast vote',
    ctaEmoji: '🗳️',
  },
  render: (args) => <InteractiveChoose {...args} />,
};
