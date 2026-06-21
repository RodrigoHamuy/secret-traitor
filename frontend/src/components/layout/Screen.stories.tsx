import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { Screen } from './Screen';
import { Spacer } from './Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Heading } from '../primitives/Heading';

export default { title: 'Layout/Screen' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { heading, paragraphs, footerLabel } = useControls(
      {
        heading: 'Centred content',
        // 0–1 → short, vertically-centred scene; more → scrolling content.
        paragraphs: { value: 0, min: 0, max: 20, step: 1 },
        footerLabel: 'Continue',
      },
      { store },
    );
    return (
      <Screen footer={<Button>{footerLabel}</Button>}>
        {paragraphs <= 1 ? (
          <>
            <Spacer />
            <Heading center>{heading}</Heading>
            <BodyText center>
              Spacers above and below centre short scenes; the CTA stays pinned.
            </BodyText>
            <Spacer />
          </>
        ) : (
          <>
            <Heading>{heading}</Heading>
            {Array.from({ length: paragraphs }, (_, i) => (
              <BodyText key={i}>
                Paragraph {i + 1}: the content area scrolls behind the pinned footer, with the
                scrollbar hidden.
              </BodyText>
            ))}
          </>
        )}
      </Screen>
    );
  },
};
