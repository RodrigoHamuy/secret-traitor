import type { Meta, StoryObj } from '@storybook/react-vite';

import { BanishResultScreen } from './BanishResultScreen';
import { withPhone } from '../../storybook/decorators';
import { ISABELLA } from '../../storybook/sampleData';

const meta = {
  title: 'Screens/BanishResultScreen',
  component: BanishResultScreen,
  decorators: [withPhone],
} satisfies Meta<typeof BanishResultScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Banished: Story = {
  args: {
    variant: 'banished',
    banished: ISABELLA,
    ctaLabel: 'Pass the phone to Isabella',
  },
};

export const TieBroken: Story = {
  args: {
    variant: 'tieBroken',
    banished: ISABELLA,
    ctaLabel: 'Pass the phone to Isabella',
  },
};

export const NoMajority: Story = {
  args: {
    variant: 'noMajority',
    ctaLabel: 'Then, under cover of dark…',
  },
};
