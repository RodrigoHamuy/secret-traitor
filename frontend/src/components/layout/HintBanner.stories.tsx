import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { HintBanner } from './HintBanner';
import { Screen } from './Screen';
import { Spacer } from './Spacer';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';
import { screenStoryConfig } from '../../storybook/decorators';

export default { title: 'Layout/HintBanner', ...screenStoryConfig };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children } = useControls({ children: 'Tap "Create Game" to begin' }, { store });
    return (
      <>
        <Screen footer={<Button target>Create Game</Button>}>
          <Spacer />
          <Heading center>Title scene</Heading>
          <Spacer />
        </Screen>
        <HintBanner>{children}</HintBanner>
      </>
    );
  },
};
