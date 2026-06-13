import type { Meta, StoryObj } from '@storybook/react-vite';

import { TitleScreen } from './TitleScreen';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Screens/TitleScreen',
  component: TitleScreen,
  decorators: [withPhone],
} satisfies Meta<typeof TitleScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
