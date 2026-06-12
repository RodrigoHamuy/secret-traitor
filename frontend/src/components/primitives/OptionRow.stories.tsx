import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { OptionRow } from './OptionRow';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Primitives/OptionRow',
  component: OptionRow,
  decorators: [withAppWidth],
} satisfies Meta<typeof OptionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveOption({ initial }: { initial: boolean }) {
  const [checked, setChecked] = useState(initial);
  return (
    <OptionRow
      checked={checked}
      onChange={setChecked}
      title="Suspense mode"
      description="Reveal the votes one by one before the verdict."
    />
  );
}

export const Unchecked: Story = {
  args: { checked: false, title: 'Suspense mode' },
  render: () => <InteractiveOption initial={false} />,
};

export const Checked: Story = {
  args: { checked: true, title: 'Suspense mode' },
  render: () => <InteractiveOption initial={true} />,
};
