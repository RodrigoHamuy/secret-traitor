import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { PhoneFrame } from './PhoneFrame';
import { Screen } from './Screen';
import { Spacer } from './Spacer';
import { BodyText } from '../primitives/BodyText';
import { Heading } from '../primitives/Heading';

export default { title: 'Layout/PhoneFrame' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { heading, body } = useControls(
      {
        heading: 'A candlelit chamber',
        body: 'Dark leather, gold piping, and a gently flickering glow.',
      },
      { store },
    );
    return (
      <div className="h-[720px] w-[400px]">
        <PhoneFrame>
          <Screen>
            <Spacer />
            <Heading center>{heading}</Heading>
            <BodyText center>{body}</BodyText>
            <Spacer />
          </Screen>
        </PhoneFrame>
      </div>
    );
  },
};
