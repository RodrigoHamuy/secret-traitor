import type { Meta, StoryObj } from '@storybook/react-vite';

import { PhoneFrame } from './PhoneFrame';
import { Screen } from './Screen';
import { Spacer } from './Spacer';
import { BodyText } from '../primitives/BodyText';
import { Heading } from '../primitives/Heading';

const meta = {
  title: 'Layout/PhoneFrame',
  component: PhoneFrame,
} satisfies Meta<typeof PhoneFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <div className="h-[720px] w-[400px]">
      <PhoneFrame>
        <Screen>
          <Spacer />
          <Heading center>A candlelit chamber</Heading>
          <BodyText center>Dark leather, gold piping, and a gently flickering glow.</BodyText>
          <Spacer />
        </Screen>
      </PhoneFrame>
    </div>
  ),
};
