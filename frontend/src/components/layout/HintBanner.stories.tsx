import type { Meta, StoryObj } from '@storybook/react-vite';

import { HintBanner } from './HintBanner';
import { Screen } from './Screen';
import { Spacer } from './Spacer';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Layout/HintBanner',
  component: HintBanner,
  decorators: [withPhone],
} satisfies Meta<typeof HintBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Tap "Create Game" to begin' },
  render: (args) => (
    <>
      <Screen footer={<Button target>Create Game</Button>}>
        <Spacer />
        <Heading center>Title scene</Heading>
        <Spacer />
      </Screen>
      <HintBanner {...args} />
    </>
  ),
};
