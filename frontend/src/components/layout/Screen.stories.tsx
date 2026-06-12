import type { Meta, StoryObj } from '@storybook/react-vite';

import { Screen } from './Screen';
import { Spacer } from './Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Layout/Screen',
  component: Screen,
  decorators: [withPhone],
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShortContent: Story = {
  args: {
    children: (
      <>
        <Spacer />
        <Heading center>Centred content</Heading>
        <BodyText center>Spacers above and below centre short scenes; the CTA stays pinned.</BodyText>
        <Spacer />
      </>
    ),
    footer: <Button>Continue</Button>,
  },
};

export const ScrollingContent: Story = {
  args: {
    children: (
      <>
        <Heading>A long scroll</Heading>
        {Array.from({ length: 12 }, (_, i) => (
          <BodyText key={i}>
            Paragraph {i + 1}: the content area scrolls behind the pinned footer, with the scrollbar
            hidden.
          </BodyText>
        ))}
      </>
    ),
    footer: <Button>Always visible</Button>,
  },
};
