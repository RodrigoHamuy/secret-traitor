import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelfieCaptureScreen } from './SelfieCaptureScreen';
import { withPhone } from '../../storybook/decorators';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/SelfieCaptureScreen',
  component: SelfieCaptureScreen,
  decorators: [withPhone],
} satisfies Meta<typeof SelfieCaptureScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stands in for the live <video> feed the real app slots in.
const fakeFeed = <img className="block h-full w-full object-cover" src={SAMPLE_PHOTO} alt="" />;

export const Ready: Story = {
  args: { playerName: 'Isabella', stage: fakeFeed, snapEnabled: true },
};

export const CameraError: Story = {
  args: { playerName: 'Isabella', stage: null, cameraError: true },
};
