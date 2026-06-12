import type { Meta, StoryObj } from '@storybook/react-vite';

import { DawnResolutionScreen } from './DawnResolutionScreen';
import { withPhone } from '../../storybook/decorators';
import { ISABELLA } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/DawnResolutionScreen',
  component: DawnResolutionScreen,
  decorators: [withPhone],
} satisfies Meta<typeof DawnResolutionScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Killed: Story = {
  args: { outcome: 'killed', victim: ISABELLA, ctaLabel: 'Pass the phone to Isabella' },
};

export const Saved: Story = {
  args: { outcome: 'saved', victim: ISABELLA, ctaLabel: 'Continue' },
};

export const AlreadyDead: Story = {
  args: { outcome: 'already', victim: ISABELLA, ctaLabel: 'Continue' },
};

export const NoBloodshed: Story = {
  args: { outcome: 'none', ctaLabel: 'Continue' },
};
