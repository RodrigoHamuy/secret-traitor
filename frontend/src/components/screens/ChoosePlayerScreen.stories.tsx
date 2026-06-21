import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { ChoosePlayerScreen } from './ChoosePlayerScreen';
import type { ChoosePlayerScreenProps } from './ChoosePlayerScreen';
import { screenStoryConfig } from '../../storybook/decorators';
import { PLAYERS } from '../../storybook/sampleData';

export default { title: 'Screens/ChoosePlayerScreen', ...screenStoryConfig };

const TINT_OPTIONS = ['vote', 'kill', 'shield'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { eyebrow, emoji, title, sub, tint, ctaLabel, ctaEmoji, playerCount, showSteps } =
      useControls(
        {
          eyebrow: 'Round 2 · VOTE',
          emoji: '🗳️',
          title: 'Matteo, who do you vote to banish?',
          sub: 'You only cast a vote — whoever the majority picks is banished.',
          tint: { options: TINT_OPTIONS },
          ctaLabel: 'Cast vote',
          ctaEmoji: '🗳️',
          playerCount: { value: 5, min: 2, max: PLAYERS.length, step: 1 },
          showSteps: false,
        },
        { store },
      );
    const [selected, setSelected] = useState<string | undefined>(undefined);
    return (
      <ChoosePlayerScreen
        steps={showSteps ? { labels: ['Vote', 'Assassinate'], active: 1 } : undefined}
        emoji={emoji || undefined}
        eyebrow={eyebrow || undefined}
        title={title}
        sub={sub || undefined}
        tint={tint as ChoosePlayerScreenProps['tint']}
        players={PLAYERS.slice(0, playerCount)}
        selectedName={selected}
        onSelect={setSelected}
        ctaLabel={ctaLabel}
        ctaEmoji={ctaEmoji || undefined}
      />
    );
  },
};
