import type { Meta, StoryObj } from '@storybook/react-vite';

import { BodyText } from './BodyText';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Primitives/BodyText',
  component: BodyText,
  decorators: [withAppWidth],
} satisfies Meta<typeof BodyText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'By night a traitor strikes. By day the Virtuous decide who to trust.' },
};
