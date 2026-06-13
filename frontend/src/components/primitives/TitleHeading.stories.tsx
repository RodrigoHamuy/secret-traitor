import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { TitleHeading } from './TitleHeading';
import type { TitleHeadingProps } from './TitleHeading';

export default { title: 'Primitives/TitleHeading' };

const TONE_OPTIONS = ['gold', 'virtue', 'blood'];

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children, tone, center } = useControls(
      { children: 'SECRET TRAITOR', tone: { options: TONE_OPTIONS }, center: true },
      { store },
    );
    return (
      <TitleHeading tone={tone as TitleHeadingProps['tone']} center={center}>
        {children}
      </TitleHeading>
    );
  },
};
