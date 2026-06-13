import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { SelfieCaptureScreen } from './SelfieCaptureScreen';
import { withPhone } from '../../storybook/decorators';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Screens/SelfieCaptureScreen', decorators: [withPhone] };

// Stands in for the live <video> feed the real app slots in.
const fakeFeed = <img className="block h-full w-full object-cover" src={SAMPLE_PHOTO} alt="" />;

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { playerName, cameraError, snapEnabled } = useControls(
      { playerName: 'Isabella', cameraError: false, snapEnabled: true },
      { store },
    );
    return (
      <SelfieCaptureScreen
        playerName={playerName}
        stage={cameraError ? null : fakeFeed}
        cameraError={cameraError}
        snapEnabled={snapEnabled}
      />
    );
  },
};
