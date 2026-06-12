import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from './Avatar';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

const meta = {
  title: 'Game/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: { name: 'Lorenzo' },
};

export const Photo: Story = {
  args: { name: 'Isabella', photoUrl: SAMPLE_PHOTO },
};

export const Sizes: Story = {
  args: { name: 'Lorenzo' },
  render: () => (
    <div className="flex items-end gap-6">
      <Avatar name="Lorenzo" size="xs" />
      <Avatar name="Lorenzo" size="sm" />
      <Avatar name="Lorenzo" size="xl" />
      <div className="w-24">
        <Avatar name="Lorenzo" size="fill" />
      </div>
    </div>
  ),
};

export const Banished: Story = {
  args: { name: 'Isabella', photoUrl: SAMPLE_PHOTO, fate: 'banished', size: 'xl' },
};

export const Slain: Story = {
  args: { name: 'Isabella', photoUrl: SAMPLE_PHOTO, fate: 'slain', size: 'xl' },
};

export const Enhancing: Story = {
  args: { name: 'Isabella', photoUrl: SAMPLE_PHOTO, enhancing: true, size: 'xl' },
};
