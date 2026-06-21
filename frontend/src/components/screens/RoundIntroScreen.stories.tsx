import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { RoundIntroScreen } from './RoundIntroScreen';
import { screenStoryConfig } from '../../storybook/decorators';

export default { title: 'Screens/RoundIntroScreen', ...screenStoryConfig };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { round, prompt, durationSeconds, timerLabel, timeUp, aliveCount, ctaLabel } =
      useControls(
        {
          round: { value: 1, min: 1, max: 10, step: 1 },
          prompt: 'Who already looks guilty?',
          durationSeconds: { value: 60, min: 0, max: 120, step: 1 },
          timerLabel: '1:00',
          timeUp: false,
          aliveCount: { value: 6, min: 1, max: 12, step: 1 },
          ctaLabel: 'Skip & pass the phone around',
        },
        { store },
      );
    // key restarts the hourglass drain when the duration changes.
    return (
      <RoundIntroScreen
        key={durationSeconds}
        round={round}
        prompt={prompt}
        durationSeconds={durationSeconds}
        timerLabel={timerLabel}
        timeUp={timeUp}
        aliveCount={aliveCount}
        ctaLabel={ctaLabel}
      />
    );
  },
};
