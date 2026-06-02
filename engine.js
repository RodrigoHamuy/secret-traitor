/* ===== Secret Traitor — game engine =====
 * Pure, DOM-free game logic. Reused by single-device play now and online play later.
 * Exposed as window.Engine.
 */
(function () {
  // Random integer helper + Fisher–Yates shuffle.
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Role counts by player total (mirrors the table in PLAN.md §2).
  function roleCounts(n) {
    const assassins = n >= 8 ? 2 : 1;
    const guardians = 1;
    return { assassins, guardians, virtuous: n - assassins - guardians };
  }

  // Assign secret roles to a list of player names -> [{name, role, alive}].
  function dealRoles(names) {
    const { assassins, guardians } = roleCounts(names.length);
    const roles = [];
    for (let i = 0; i < assassins; i++) roles.push('assassin');
    for (let i = 0; i < guardians; i++) roles.push('guardian');
    while (roles.length < names.length) roles.push('virtuous');
    shuffle(roles);
    return names.map((name, i) => ({ name, role: roles[i], alive: true }));
  }

  // Who has won, if anyone. Returns 'virtuous' | 'assassins' | null.
  function winner(players) {
    const alive = players.filter((p) => p.alive);
    const assassins = alive.filter((p) => p.role === 'assassin').length;
    const others = alive.length - assassins;
    if (assassins === 0) return 'virtuous';
    if (assassins >= others) return 'assassins';
    return null;
  }

  // Tally an array of vote targets (names; null/undefined = abstain).
  // Returns { counts, leaders, max, tie }.
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

  window.Engine = { shuffle, roleCounts, dealRoles, winner, tally };
})();
