import type { AvatarData } from './components/game/Avatar';
import type { RosterEntry } from './components/screens/WinScreen';
import type { Player } from './game/types';

import { RoleCardFront } from './components/game/RoleCardFront';
import { BallotRevealScreen } from './components/screens/BallotRevealScreen';
import { BanishResultScreen } from './components/screens/BanishResultScreen';
import { ChoosePlayerScreen } from './components/screens/ChoosePlayerScreen';
import { DawnResolutionScreen } from './components/screens/DawnResolutionScreen';
import { DeadlockScreen } from './components/screens/DeadlockScreen';
import { GateScreen } from './components/screens/GateScreen';
import { NameEntryScreen } from './components/screens/NameEntryScreen';
import { RoleRevealScreen } from './components/screens/RoleRevealScreen';
import { SelfieConfirmScreen } from './components/screens/SelfieConfirmScreen';
import { SetupScreen } from './components/screens/SetupScreen';
import { TitleScreen } from './components/screens/TitleScreen';
import { VoteRevealAllScreen } from './components/screens/VoteRevealAllScreen';
import { VoteRevealIntroScreen } from './components/screens/VoteRevealIntroScreen';
import { WinScreen } from './components/screens/WinScreen';
import { ROLE_INFO, gColor, plainRoleWord, roleColorVar } from './game/content';
import { GATED_PHASES } from './game/types';
import { gateRecipient, useGame } from './game/store';
import { RoundIntroPhase } from './RoundIntroPhase';
import { SelfieCapturePhase } from './SelfieCapturePhase';

function avatarOf(players: Player[], name: string): AvatarData {
  const i = players.findIndex((p) => p.name === name);
  const p = players[i];
  return {
    name,
    photoUrl: p?.photo,
    color: gColor(i < 0 ? 0 : i),
    fate: p?.fate === 'killed' ? 'slain' : p?.fate === 'banished' ? 'banished' : undefined,
    enhancing: p?.enhancing,
  };
}

function selfRoleFront(p: Player, players: Player[]) {
  const fellow =
    p.role === 'assassin'
      ? players.filter((x) => x.role === 'assassin' && x.name !== p.name).map((x) => x.name)
      : undefined;
  return <RoleCardFront role={p.role} description={ROLE_INFO[p.role].description} fellowAssassins={fellow} />;
}

function eliminationFront(p: Player) {
  return <RoleCardFront role={p.role} description={`${p.name} was ${plainRoleWord(p.role)}.`} />;
}

function buildRoster(players: Player[], team: 'virtuous' | 'assassins'): RosterEntry[] {
  const v = team === 'virtuous';
  const isWinner = (p: Player) => (v ? p.role !== 'assassin' : p.role === 'assassin');
  const isAssassin = (p: Player) => p.role === 'assassin';
  const rank = (p: Player) => (isWinner(p) ? 0 : isAssassin(p) ? 1 : 2);
  const sorted = players.slice().sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return (b.deathOrder || 0) - (a.deathOrder || 0);
  });
  const tintOf = (p: Player): RosterEntry['tint'] =>
    isWinner(p) ? 'win' : p.fate === 'killed' ? 'kill' : p.fate === 'banished' ? 'vote' : undefined;
  return sorted.map((p) => ({
    avatar: avatarOf(players, p.name),
    roleLabel: ROLE_INFO[p.role].label,
    roleColor: roleColorVar(p.role),
    winner: isWinner(p),
    tint: tintOf(p),
  }));
}

export function App() {
  const s = useGame();
  const { players, phase } = s;

  // Privacy gate: gated phases show only "Pass the phone to X" until the recipient taps.
  const who = gateRecipient(s);
  if (GATED_PHASES.has(phase) && !s.passed && who) {
    const recipient = players.find((p) => p.name === who);
    const showAvatar = recipient && (recipient.photo || recipient.named);
    const isReveal = phase === 'revealName';
    return (
      <GateScreen
        playerName={who}
        avatar={showAvatar ? avatarOf(players, who) : undefined}
        sub={isReveal ? 'Hand it over before tapping — then type your name.' : undefined}
        buttonLabel={isReveal ? 'I’ve got it' : undefined}
        onConfirm={s.confirmGate}
      />
    );
  }

  switch (phase) {
    case 'title':
      return <TitleScreen onCreate={s.openSetup} />;

    case 'setup': {
      const d = s.setup!;
      return (
        <SetupScreen
          count={d.count}
          suspense={d.suspense}
          selfie={d.selfie}
          token={d.replicateToken}
          onDecrement={s.decrement}
          onIncrement={s.increment}
          onSuspenseChange={s.setSuspense}
          onSelfieChange={s.setSelfie}
          onTokenChange={s.setToken}
          onDeal={s.deal}
        />
      );
    }

    case 'revealName': {
      const nm = s.nameDraft.trim();
      const taken = players.some(
        (x, k) => k !== s.passIndex && x.name.toLowerCase() === nm.toLowerCase(),
      );
      return (
        <NameEntryScreen
          index={s.passIndex + 1}
          total={players.length}
          value={s.nameDraft}
          onChange={s.setNameDraft}
          canContinue={!!nm && !taken}
          onContinue={s.continueName}
        />
      );
    }

    case 'revealSelfieCapture':
      return <SelfieCapturePhase />;

    case 'revealSelfieConfirm':
      return (
        <SelfieConfirmScreen
          playerName={players[s.passIndex]?.name ?? ''}
          photoSrc={s.pendingPhoto ?? ''}
          onUse={s.useSelfie}
          onRetake={s.retakeSelfie}
        />
      );

    case 'revealRole': {
      const p = players[s.passIndex];
      return (
        <RoleRevealScreen
          eyebrow={`Secret roles · ${s.passIndex + 1} of ${players.length}`}
          title={`${p.name}, this is you`}
          front={selfRoleFront(p, players)}
          flipped={s.flipped}
          onFlip={s.flip}
          ctaLabel="Hide & pass on"
          onNext={s.nextReveal}
        />
      );
    }

    case 'roundIntro':
      return <RoundIntroPhase />;

    case 'turnVote':
    case 'turnSpecial': {
      const current = s.order[s.passIndex];
      const player = players.find((p) => p.name === current)!;
      const aliveNames = players.filter((p) => p.alive).map((p) => p.name);

      if (phase === 'turnVote') {
        const specialLabel =
          player.role === 'assassin' ? 'Assassinate' : player.role === 'guardian' ? 'Protect' : null;
        const pool = s.revoted && s.runoff?.length ? s.runoff : aliveNames;
        const options = pool.filter((n) => n !== current);
        return (
          <ChoosePlayerScreen
            steps={specialLabel ? { labels: ['Vote', specialLabel], active: 0 } : undefined}
            eyebrow={`Round ${s.round}${s.revoted ? ' · RE-VOTE' : ''} · VOTE`}
            title={`${current}, who do you vote to banish?`}
            sub={
              s.revoted
                ? 'Runoff — vote only between the tied players.'
                : 'You only cast a vote — whoever the majority picks is banished.'
            }
            tint="vote"
            players={options.map((n) => avatarOf(players, n))}
            selectedName={s.selectedName ?? undefined}
            onSelect={s.select}
            ctaLabel="Cast vote"
            ctaEmoji="🗳️"
            onConfirm={s.castVote}
          />
        );
      }

      const assassin = player.role === 'assassin';
      const targets = assassin
        ? players.filter((x) => x.alive && x.role !== 'assassin').map((x) => x.name)
        : players.filter((x) => x.alive && x.name !== current).map((x) => x.name);
      return (
        <ChoosePlayerScreen
          steps={{ labels: ['Vote', assassin ? 'Assassinate' : 'Protect'], active: 1 }}
          emoji={assassin ? '🗡️' : '🛡️'}
          eyebrow={`Round ${s.round} · ${assassin ? 'ASSASSINATE' : 'PROTECT'}`}
          title={assassin ? 'Mark your victim' : 'Choose who to protect'}
          sub={assassin ? 'Strike down one of the Virtuous tonight.' : 'They survive any assassination this round.'}
          tint={assassin ? 'kill' : 'shield'}
          players={targets.map((n) => avatarOf(players, n))}
          selectedName={s.selectedName ?? undefined}
          onSelect={s.select}
          ctaLabel={assassin ? 'Assassinate' : 'Protect'}
          ctaEmoji={assassin ? '🗡️' : '🛡️'}
          onConfirm={s.castSpecial}
        />
      );
    }

    case 'voteRevealIntro':
      return <VoteRevealIntroScreen suspense={s.settings.suspense} onNext={s.beginVoteReveal} />;

    case 'ballotReveal': {
      const v = s.votes[s.passIndex];
      const last = s.passIndex + 1 >= s.votes.length;
      return (
        <BallotRevealScreen
          index={s.passIndex + 1}
          total={s.votes.length}
          voterName={v.voter}
          choice={avatarOf(players, v.choice!)}
          flipped={s.flipped}
          onFlip={s.flip}
          ctaLabel={last ? 'See the result' : 'Show everyone, then pass on'}
          onNext={s.nextBallot}
        />
      );
    }

    case 'voteRevealAll':
      return (
        <VoteRevealAllScreen
          votes={s.votes.map((v) => ({ voter: avatarOf(players, v.voter), choice: avatarOf(players, v.choice!) }))}
          onNext={s.afterVoteReveal}
        />
      );

    case 'deadlock':
      return <DeadlockScreen tiedNames={s.runoff ?? []} onNext={s.startRevote} />;

    case 'banishResult': {
      const r = s.res!;
      const variant = !r.banished ? 'noMajority' : r.tieBroken ? 'tieBroken' : 'banished';
      return (
        <BanishResultScreen
          variant={variant}
          banished={r.banished ? avatarOf(players, r.banished) : undefined}
          ctaLabel={r.banished ? `Pass the phone to ${r.banished}` : 'Then, under cover of dark…'}
          onNext={s.nextFromBanish}
        />
      );
    }

    case 'banishRoleReveal': {
      const p = players.find((x) => x.name === s.res!.banished)!;
      return (
        <RoleRevealScreen
          eyebrow={`Banished · round ${s.round}`}
          title={`${p.name}, reveal yourself`}
          front={eliminationFront(p)}
          flipped={s.flipped}
          onFlip={s.flip}
          ctaLabel="Continue"
          onNext={s.nextFromBanishReveal}
        />
      );
    }

    case 'dawn': {
      const r = s.res!;
      const ctaLabel =
        r.outcome === 'killed' ? `Pass the phone to ${r.victim}` : r.winner ? 'See the outcome' : 'Continue';
      return (
        <DawnResolutionScreen
          outcome={r.outcome === 'cancelled' ? 'none' : r.outcome}
          victim={r.victim ? avatarOf(players, r.victim) : undefined}
          ctaLabel={ctaLabel}
          onNext={s.nextFromDawn}
        />
      );
    }

    case 'dawnRoleReveal': {
      const p = players.find((x) => x.name === s.res!.victim)!;
      return (
        <RoleRevealScreen
          eyebrow={`Slain · round ${s.round}`}
          title={`${p.name}, reveal yourself`}
          front={eliminationFront(p)}
          flipped={s.flipped}
          onFlip={s.flip}
          ctaLabel="Continue"
          onNext={s.nextFromDawnReveal}
        />
      );
    }

    case 'win':
      return <WinScreen team={s.winnerTeam!} roster={buildRoster(players, s.winnerTeam!)} onPlayAgain={s.playAgain} />;
  }
}
