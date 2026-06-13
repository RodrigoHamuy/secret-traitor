import type { Meta, StoryObj } from '@storybook/react-vite';
import type { RosterEntry } from './WinScreen';

import { WinScreen } from './WinScreen';
import { withPhone } from '../../storybook/decorators';
import { BIANCA, CATERINA, ISABELLA, LORENZO, MATTEO, NICCOLO } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/WinScreen',
  component: WinScreen,
  decorators: [withPhone],
} satisfies Meta<typeof WinScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const VIRTUOUS = 'var(--color-virtue)';
const GUARDIAN = 'var(--color-guardian)';
const ASSASSIN = 'var(--color-blood)';

const virtuousWinRoster: RosterEntry[] = [
  { avatar: ISABELLA, roleLabel: 'GUARDIAN', roleColor: GUARDIAN, winner: true, tint: 'win' },
  { avatar: CATERINA, roleLabel: 'VIRTUOUS', roleColor: VIRTUOUS, winner: true, tint: 'win' },
  { avatar: MATTEO, roleLabel: 'VIRTUOUS', roleColor: VIRTUOUS, winner: true, tint: 'win' },
  { avatar: { ...NICCOLO, fate: 'slain' }, roleLabel: 'VIRTUOUS', roleColor: VIRTUOUS, winner: true, tint: 'win' },
  { avatar: { ...LORENZO, fate: 'banished' }, roleLabel: 'ASSASSIN', roleColor: ASSASSIN, winner: false, tint: 'vote' },
  { avatar: { ...BIANCA, fate: 'banished' }, roleLabel: 'ASSASSIN', roleColor: ASSASSIN, winner: false, tint: 'vote' },
];

const assassinsWinRoster: RosterEntry[] = [
  { avatar: LORENZO, roleLabel: 'ASSASSIN', roleColor: ASSASSIN, winner: true, tint: 'win' },
  { avatar: BIANCA, roleLabel: 'ASSASSIN', roleColor: ASSASSIN, winner: true, tint: 'win' },
  { avatar: { ...ISABELLA, fate: 'slain' }, roleLabel: 'GUARDIAN', roleColor: GUARDIAN, winner: false, tint: 'kill' },
  { avatar: { ...CATERINA, fate: 'slain' }, roleLabel: 'VIRTUOUS', roleColor: VIRTUOUS, winner: false, tint: 'kill' },
  { avatar: { ...MATTEO, fate: 'banished' }, roleLabel: 'VIRTUOUS', roleColor: VIRTUOUS, winner: false, tint: 'vote' },
  { avatar: NICCOLO, roleLabel: 'VIRTUOUS', roleColor: VIRTUOUS, winner: false },
];

export const VirtuousWin: Story = {
  args: { team: 'virtuous', roster: virtuousWinRoster },
};

export const AssassinsWin: Story = {
  args: { team: 'assassins', roster: assassinsWinRoster },
};
