import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { DawnResolutionScreen } from './DawnResolutionScreen';
import type { DawnResolutionScreenProps } from './DawnResolutionScreen';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Screens/DawnResolutionScreen' };

const OUTCOME_OPTIONS = ['killed', 'saved', 'already', 'none'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { outcome, victimName, ctaLabel } = useControls(
      {
        outcome: { options: OUTCOME_OPTIONS },
        victimName: 'Isabella',
        ctaLabel: 'Pass the phone to Isabella',
      },
      { store },
    );
    return (
      <DawnResolutionScreen
        outcome={outcome as DawnResolutionScreenProps['outcome']}
        victim={{ name: victimName, photoUrl: SAMPLE_PHOTO }}
        ctaLabel={ctaLabel}
      />
    );
  },
};
