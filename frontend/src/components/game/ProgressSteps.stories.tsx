import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { ProgressSteps } from './ProgressSteps';

export default { title: 'Game/ProgressSteps' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { steps, active } = useControls(
      {
        // Comma-separated step labels.
        steps: 'Vote, Assassinate',
        active: { value: 0, min: 0, max: 5, step: 1 },
      },
      { store },
    );
    const labels = steps
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return <ProgressSteps steps={labels} active={active} />;
  },
};
