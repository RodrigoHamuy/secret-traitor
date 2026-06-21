import { useEffect, useMemo, useState } from 'react';

import { RoundIntroScreen } from './components/screens/RoundIntroScreen';
import { playChime } from './chime';
import { DEBATE_SECONDS, ROUND1_TEASERS, fmt, pick } from './game/content';
import { useGame } from './game/store';

export function RoundIntroPhase() {
  const round = useGame((s) => s.round);
  const aliveCount = useGame((s) => s.players.filter((p) => p.alive).length);
  const beginTurns = useGame((s) => s.beginTurns);

  const [left, setLeft] = useState(DEBATE_SECONDS);
  const [timeUp, setTimeUp] = useState(false);
  const prompt = useMemo(
    () => (round === 1 ? pick(ROUND1_TEASERS) : 'Debate aloud — who do you suspect?'),
    [round],
  );

  useEffect(() => {
    setLeft(DEBATE_SECONDS);
    setTimeUp(false);
    const iv = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(iv);
          setTimeUp(true);
          playChime();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [round]);

  return (
    <RoundIntroScreen
      round={round}
      prompt={prompt}
      durationSeconds={DEBATE_SECONDS}
      timerLabel={timeUp ? 'Time’s up' : fmt(left)}
      timeUp={timeUp}
      aliveCount={aliveCount}
      ctaLabel={timeUp ? 'Pass the phone around' : 'Skip & pass the phone around'}
      onNext={beginTurns}
    />
  );
}
