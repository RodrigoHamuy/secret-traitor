import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelfiePreview } from './SelfiePreview';
import { SelfieStage } from './SelfieStage';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

// SelfiePreview just renders a captured image — nothing to drive from leva.
export default {
  title: 'Game/SelfiePreview',
  decorators: [
    (Story) => (
      <SelfieStage>
        <Story />
      </SelfieStage>
    ),
  ],
} satisfies Meta;

export const Default: StoryObj = {
  render: () => <SelfiePreview src={SAMPLE_PHOTO} />,
};
