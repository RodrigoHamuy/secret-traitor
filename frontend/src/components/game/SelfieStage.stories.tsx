import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelfiePreview } from './SelfiePreview';
import { SelfieStage } from './SelfieStage';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

const meta = {
  title: 'Game/SelfieStage',
  component: SelfieStage,
} satisfies Meta<typeof SelfieStage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  // The real app slots the live <video> feed here.
  args: { children: null },
};

export const WithPreview: Story = {
  args: { children: <SelfiePreview src={SAMPLE_PHOTO} /> },
};
