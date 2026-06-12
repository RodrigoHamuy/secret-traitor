import type { Meta, StoryObj } from '@storybook/react-vite';

import { TitleHeading } from './TitleHeading';

const meta = {
  title: 'Primitives/TitleHeading',
  component: TitleHeading,
} satisfies Meta<typeof TitleHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    center: true,
    children: (
      <>
        SECRET
        <br />
        TRAITOR
      </>
    ),
  },
};

export const VirtuousWin: Story = {
  args: { tone: 'virtue', center: true, className: 'text-3xl', children: 'THE VIRTUOUS WIN' },
};

export const AssassinsWin: Story = {
  args: { tone: 'blood', center: true, className: 'text-3xl', children: 'THE ASSASSINS WIN' },
};
