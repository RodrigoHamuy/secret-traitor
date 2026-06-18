import type { AvatarData } from '../game/Avatar';

import { PickCard } from '../game/PickCard';
import { PickGrid } from '../game/PickGrid';
import { Screen } from '../layout/Screen';
import { Spacer } from '../layout/Spacer';
import { BodyText } from '../primitives/BodyText';
import { Button } from '../primitives/Button';
import { Eyebrow } from '../primitives/Eyebrow';
import { SceneEmoji } from '../primitives/SceneEmoji';
import { TitleHeading } from '../primitives/TitleHeading';

export interface RosterEntry {
  avatar: AvatarData;
  roleLabel: string;
  roleColor: string;
  winner: boolean;
  /** gold = winner, red = assassinated, dark = banished. */
  tint?: 'win' | 'kill' | 'vote';
}

export interface WinScreenProps {
  team: 'virtuous' | 'assassins';
  /** Display order: winners first, then fallen assassins, then the rest. */
  roster: RosterEntry[];
  onPlayAgain?: () => void;
}

export function WinScreen({ team, roster, onPlayAgain }: WinScreenProps) {
  const virtuous = team === 'virtuous';
  return (
    <Screen
      footer={
        <Button target onClick={onPlayAgain}>
          Play Again
        </Button>
      }
    >
      <SceneEmoji className="mt-2.5">{virtuous ? '🍷' : '🗡️'}</SceneEmoji>
      <Eyebrow center>Game over</Eyebrow>
      <TitleHeading center tone={virtuous ? 'virtue' : 'blood'} className="text-3xl">
        {virtuous ? 'THE VIRTUOUS WIN' : 'THE ASSASSINS WIN'}
      </TitleHeading>
      <BodyText center>
        {virtuous ? 'Every Assassin has been brought to justice.' : 'The Assassins now rule. Trust no one.'}
      </BodyText>
      <PickGrid>
        {roster.map((entry) => (
          <PickCard
            key={entry.avatar.name}
            avatar={entry.avatar}
            selected
            tint={entry.tint}
            crown={entry.winner}
            roleTag={{ label: entry.roleLabel, color: entry.roleColor }}
          />
        ))}
      </PickGrid>
      <Spacer />
    </Screen>
  );
}
