import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { WinScreen } from './WinScreen';
import type { RosterEntry, WinScreenProps } from './WinScreen';
import { screenStoryConfig } from '../../storybook/decorators';
import { BIANCA, CATERINA, ISABELLA, LORENZO, MATTEO, NICCOLO } from '../../storybook/sampleData';

export default { title: 'Screens/WinScreen', ...screenStoryConfig };

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

const TEAM_OPTIONS = ['virtuous', 'assassins'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { team } = useControls({ team: { options: TEAM_OPTIONS } }, { store });
    const winTeam = team as WinScreenProps['team'];
    return (
      <WinScreen
        team={winTeam}
        roster={winTeam === 'assassins' ? assassinsWinRoster : virtuousWinRoster}
      />
    );
  },
};
