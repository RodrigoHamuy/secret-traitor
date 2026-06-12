import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { NameEntryScreen } from './NameEntryScreen';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Screens/NameEntryScreen',
  component: NameEntryScreen,
  decorators: [withPhone],
} satisfies Meta<typeof NameEntryScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveNameEntry({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <NameEntryScreen
      index={2}
      total={6}
      value={value}
      onChange={setValue}
      canContinue={value.trim().length > 0}
    />
  );
}

export const Empty: Story = {
  args: { index: 2, total: 6, value: '' },
  render: () => <InteractiveNameEntry initial="" />,
};

export const Valid: Story = {
  args: { index: 2, total: 6, value: 'Isabella', canContinue: true },
  render: () => <InteractiveNameEntry initial="Isabella" />,
};
