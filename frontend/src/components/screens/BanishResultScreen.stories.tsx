import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { BanishResultScreen } from './BanishResultScreen';
import type { BanishResultScreenProps } from './BanishResultScreen';
import { screenStoryConfig } from '../../storybook/decorators';
import { SAMPLE_PHOTO } from '../../storybook/sampleData';

export default { title: 'Screens/BanishResultScreen', ...screenStoryConfig };

const VARIANT_OPTIONS = ['banished', 'tieBroken', 'noMajority'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { variant, banishedName, ctaLabel } = useControls(
      {
        variant: { options: VARIANT_OPTIONS },
        banishedName: 'Isabella',
        ctaLabel: 'Pass the phone to Isabella',
      },
      { store },
    );
    return (
      <BanishResultScreen
        variant={variant as BanishResultScreenProps['variant']}
        banished={{ name: banishedName, photoUrl: SAMPLE_PHOTO }}
        ctaLabel={ctaLabel}
      />
    );
  },
};
