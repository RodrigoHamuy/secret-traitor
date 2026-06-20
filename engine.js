/* Secret Traitor — pure, DOM-free game logic (window.Engine). */
(function () {
  // Fisher–Yates shuffle.
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Role counts by player total (see PLAN.md §2).
  function roleCounts(n) {
    const assassins = n >= 8 ? 2 : 1;
    const guardians = 1;
    return { assassins, guardians, virtuous: n - assassins - guardians };
  }

  // names -> [{name, role, alive}], roles dealt at random.
  function dealRoles(names) {
    const { assassins, guardians } = roleCounts(names.length);
    const roles = [];
    for (let i = 0; i < assassins; i++) roles.push('assassin');
    for (let i = 0; i < guardians; i++) roles.push('guardian');
    while (roles.length < names.length) roles.push('virtuous');
    shuffle(roles);
    return names.map((name, i) => ({ name, role: roles[i], alive: true }));
  }

  // -> 'virtuous' | 'assassins' | null.
  function winner(players) {
    const alive = players.filter((p) => p.alive);
    const assassins = alive.filter((p) => p.role === 'assassin').length;
    const others = alive.length - assassins;
    if (assassins === 0) return 'virtuous';
    if (assassins >= others) return 'assassins';
    return null;
  }

  // Tally vote targets (null/undefined = abstain) -> { counts, leaders, max, tie }.
  function tally(votes) {
    const counts = {};
    votes.forEach((v) => { if (v) counts[v] = (counts[v] || 0) + 1; });
    let max = 0;
    let leaders = [];
    for (const name in counts) {
      if (counts[name] > max) { max = counts[name]; leaders = [name]; }
      else if (counts[name] === max) leaders.push(name);
    }
    return { counts, leaders, max, tie: max === 0 || leaders.length !== 1 };
  }

  // Resolve one round (pure; returns a plan, doesn't mutate `state`).
  //   state = { players:[{name,role,alive}], kills:[{by,target}],
  //             protects:[{by,target}], votes:[{voter,choice}] }
  // Banishing an Assassin cancels their mark; banishing the Guardian cancels their
  // shield. Surviving Assassins' marks resolve to one victim, who dies unless an
  // active Guardian protects them. A split vote banishes no one and the caller
  // re-votes; `forceBanish` breaks a second deadlock by banishing a random leader.
  function resolveRound(state) {
    const { players, kills = [], protects = [], votes = [], forceBanish = false } = state;
    const alive = {}, roleOf = {};
    players.forEach((p) => { alive[p.name] = p.alive; roleOf[p.name] = p.role; });
    const winnerNow = () => winner(players.map((p) => ({ role: p.role, alive: alive[p.name] })));

    const vt = tally(votes.map((v) => v.choice));
    // A real tie is broken randomly only when forced; an all-abstain tally (max 0)
    // can never be forced into a banishment.
    const banished = vt.tie
      ? (forceBanish && vt.max > 0 ? vt.leaders[Math.floor(Math.random() * vt.leaders.length)] : null)
      : vt.leaders[0];
    if (banished) alive[banished] = false;
    const bRole = banished ? roleOf[banished] : null;
    const tieBroken = vt.tie && !!banished;   // banished by random tiebreak, not a clear majority

    const winAfterBanish = winnerNow();
    if (winAfterBanish) {
      return { banished, bRole, bVotes: vt.max, tieBroken, winAfterBanish,
               victim: null, outcome: 'cancelled', victimRole: null,
               protectedName: null, winner: winAfterBanish };
    }

    const activeKills = kills.filter((k) => alive[k.by]);     // banished assassin cancelled
    const prot = protects[0];
    const protectedName = (prot && alive[prot.by]) ? prot.target : null; // banished guardian cancelled
    const at = tally(activeKills.map((k) => k.target));
    const victim = at.tie ? null : at.leaders[0];

    let outcome = 'none', victimRole = null;
    if (victim) {
      if (!alive[victim]) outcome = 'already';               // already banished this round
      else if (victim === protectedName) outcome = 'saved';
      else { alive[victim] = false; outcome = 'killed'; victimRole = roleOf[victim]; }
    }
    return { banished, bRole, bVotes: vt.max, tieBroken, winAfterBanish: null,
             victim, outcome, victimRole, protectedName, winner: winnerNow() };
  }

  window.Engine = { shuffle, roleCounts, dealRoles, winner, tally, resolveRound };
})();
