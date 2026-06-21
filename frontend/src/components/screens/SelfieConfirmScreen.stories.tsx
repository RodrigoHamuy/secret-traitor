import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { SelfieConfirmScreen } from './SelfieConfirmScreen';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Screens/SelfieConfirmScreen' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { playerName } = useControls({ playerName: 'Isabella' }, { store });
    return <SelfieConfirmScreen playerName={playerName} photoSrc={SAMPLE_PHOTO} />;
  },
};
