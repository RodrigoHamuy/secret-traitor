import type { Meta, StoryObj } from '@storybook/react-vite';

import { DeadlockScreen } from './DeadlockScreen';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Screens/DeadlockScreen',
  component: DeadlockScreen,
  decorators: [withPhone],
} satisfies Meta<typeof DeadlockScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { tiedNames: ['Isabella', 'Lorenzo'] },
};
