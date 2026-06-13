import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { TitleScreen } from './TitleScreen';
import { withPhone } from '../../storybook/decorators';

export default { title: 'Screens/TitleScreen', decorators: [withPhone] };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { joinDisabled } = useControls({ joinDisabled: true }, { store });
    return <TitleScreen joinDisabled={joinDisabled} />;
  },
};
