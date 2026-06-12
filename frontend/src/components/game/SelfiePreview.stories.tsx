import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelfiePreview } from './SelfiePreview';
import { SelfieStage } from './SelfieStage';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

const meta = {
  title: 'Game/SelfiePreview',
  component: SelfiePreview,
  decorators: [
    (Story) => (
      <SelfieStage>
        <Story />
      </SelfieStage>
    ),
  ],
} satisfies Meta<typeof SelfiePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { src: SAMPLE_PHOTO },
};
