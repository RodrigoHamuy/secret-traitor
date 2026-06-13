import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { SelfiePreview } from './SelfiePreview';
import { SelfieStage } from './SelfieStage';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Game/SelfieStage' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    // The real app slots the live <video> feed in here; toggle a captured preview.
    const { withPreview } = useControls({ withPreview: true }, { store });
    return <SelfieStage>{withPreview ? <SelfiePreview src={SAMPLE_PHOTO} /> : null}</SelfieStage>;
  },
};
