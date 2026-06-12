import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelfieConfirmScreen } from './SelfieConfirmScreen';
import { withPhone } from '../../storybook/decorators';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/SelfieConfirmScreen',
  component: SelfieConfirmScreen,
  decorators: [withPhone],
} satisfies Meta<typeof SelfieConfirmScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { playerName: 'Isabella', photoSrc: SAMPLE_PHOTO },
};
