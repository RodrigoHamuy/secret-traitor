/* ===== Secret Traitor — real game (single device / pass & play) =====
 * Drives a full game on one shared phone, narrated like a game master.
 * Reuses render()/setHint()/app/scenes from app.js and window.Engine from engine.js.
 * Exposed as window.Game.
 *
 * Flow: there is no separate night/day with "eyes shut". Each round the phone
 * passes around the table once. On their private turn (behind the "I'm X" gate),
 * an Assassin picks a victim then votes, a Guardian picks who to protect then
 * votes, and everyone else just votes. Because every player takes the phone in
 * turn order and the gate never names a role, identities stay hidden.
 *
 * Resolution: tally votes -> banish -> resolve the assassination. A banished
 * Assassin's strike is cancelled (and if it was the last Assassin, the game is
 * already over). A banished Guardian's shield is cancelled, but play continues.
 *
 * The real game passes no `hint`, so the bottom hint banner stays hidden.
 */
(function () {
  const COLORS = ['#e8c468', '#9fc06f', '#5aa9f0', '#e0564c', '#c58ef0', '#f0975a',
                  '#5ad2c0', '#d08fb0', '#b0c070', '#7fa6e0', '#e0a25a', '#90d0a0'];

  const ROLE_INFO = {
    virtuous: { label: 'VIRTUOUS', cls: 'role-virtuous', glyph: '🍷',
      desc: 'You are innocent. Each round, vote to banish the Assassins before they outnumber you.' },
    guardian: { label: 'GUARDIAN', cls: 'role-guardian', glyph: '🛡️',
      desc: 'Each round, secretly choose someone to protect from assassination — then cast your vote like everyone else.' },
    assassin: { label: 'ASSASSIN', cls: 'role-assassin', glyph: '🗡️',
      desc: 'Each round, secretly mark a victim to assassinate — then cast your vote to deflect suspicion.' },
  };

  // Mutable game state.
  const G = { setup: null, players: [], settings: {}, round: 0,
              order: [], kills: [], protects: [], votes: [], res: null };

  // --- small helpers ---
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const gColor = (i) => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];
  const gInitials = (name) => name.trim().slice(0, 2).toUpperCase() || '??';
  function gAvatar(name) {
    const i = G.players.findIndex((p) => p.name === name);
    return `<span class="avatar" style="background:${gColor(i < 0 ? 0 : i)}">${esc(gInitials(name))}</span>`;
  }
  const roleColor = (r) => r === 'assassin' ? 'var(--red)' : r === 'guardian' ? '#86a6d0' : 'var(--green)';
  function roleWord(r) {
    if (r === 'assassin') return 'an <strong style="color:var(--red)">Assassin</strong>';
    if (r === 'guardian') return 'the <strong style="color:#86a6d0">Guardian</strong>';
    return 'one of the <strong style="color:var(--green)">Virtuous</strong>';
  }
  const alivePlayers = () => G.players.filter((p) => p.alive);
  const aliveNames = () => alivePlayers().map((p) => p.name);
  const aliveAssassins = () => G.players.filter((p) => p.role === 'assassin' && p.alive).length;
  const defaultNames = (k) => Array.from({ length: k }, (_, i) => `Player ${i + 1}`);

  // Privacy gate: "Pass the phone to X" with a single "I'm X" button. The private
  // screen only renders once the recipient confirms — nothing leaks while passing.
  function gate(who, then, opts = {}) {
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">📱</div>
      <h2 class="center">Pass the phone to ${esc(who)}</h2>
      <p class="center">${opts.sub || 'Hand it over before tapping.'}</p>
      <div class="spacer"></div>
      <button class="btn" id="go">${esc(opts.btn || `I’m ${who}`)}</button>
    `, { targetSelector: '#go' });
    app.querySelector('#go').onclick = then;
  }

  // A "choose a player" screen (free choice — the title makes the ask clear).
  function chooseScene({ eyebrow, title, sub, list, onPick, skipLabel }) {
    const cells = list.map((name) =>
      `<button class="pick" data-name="${esc(name)}">${gAvatar(name)}<span class="name">${esc(name)}</span></button>`
    ).join('');
    render(`
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h2>${esc(title)}</h2>
      ${sub ? `<p>${esc(sub)}</p>` : ''}
      <div class="pick-grid">${cells}</div>
      ${skipLabel ? `<button class="btn secondary" id="skip">${esc(skipLabel)}</button>` : ''}
      <div class="spacer"></div>
    `);
    app.querySelectorAll('.pick').forEach((b) => { b.onclick = () => onPick(b.dataset.name); });
    if (skipLabel) app.querySelector('#skip').onclick = () => onPick(null);
  }

  // ---------- Setup ----------
  function setup() {
    if (!G.setup) G.setup = { names: defaultNames(6), suspense: true };
    const s = G.setup;
    const n = s.names.length;
    render(`
      <p class="eyebrow">New game · one shared phone</p>
      <h2>Who’s playing?</h2>
      <p>Add 5–12 players, then pass this phone around the table.</p>
      <div class="stepper">
        <button class="step-btn" id="minus" ${n <= 5 ? 'disabled' : ''}>−</button>
        <span class="step-count">${n} players</span>
        <button class="step-btn" id="plus" ${n >= 12 ? 'disabled' : ''}>+</button>
      </div>
      <div class="name-list">
        ${s.names.map((nm, i) =>
          `<input class="name-input" data-i="${i}" value="${esc(nm)}" maxlength="14" aria-label="Player ${i + 1} name" />`).join('')}
      </div>
      <label class="option">
        <input type="checkbox" id="suspense" ${s.suspense ? 'checked' : ''} />
        <span class="option-box"></span>
        <span class="option-text"><strong>Suspense mode</strong>
          <span class="option-sub">Reveal the votes one by one before the verdict.</span></span>
      </label>
      <div class="spacer"></div>
      <button class="btn" id="deal">Deal roles</button>
    `, { targetSelector: '#deal' });

    app.querySelector('#minus').onclick = () => { if (s.names.length > 5) { s.names.pop(); setup(); } };
    app.querySelector('#plus').onclick = () => { if (s.names.length < 12) { s.names.push(`Player ${s.names.length + 1}`); setup(); } };
    app.querySelectorAll('.name-input').forEach((inp) => {
      inp.oninput = (e) => { s.names[+e.target.dataset.i] = e.target.value; };
    });
    app.querySelector('#suspense').onchange = (e) => { s.suspense = e.target.checked; };
    app.querySelector('#deal').onclick = () => {
      const names = s.names.map((nm, i) => (nm.trim() || `Player ${i + 1}`));
      G.players = Engine.dealRoles(names);
      G.settings = { suspense: s.suspense };
      G.round = 0;
      reveal(0);
    };
  }

  // ---------- Secret role reveal (pass & play) ----------
  function reveal(i) {
    if (i >= G.players.length) { G.round = 1; return roundIntro(); }
    gate(G.players[i].name, () => revealCard(i));
  }

  function revealCard(i) {
    const p = G.players[i];
    const info = ROLE_INFO[p.role];
    const mates = p.role === 'assassin'
      ? G.players.filter((x) => x.role === 'assassin' && x.name !== p.name).map((x) => x.name) : [];
    render(`
      <p class="eyebrow center" style="margin-top:6px">Secret roles · ${i + 1} of ${G.players.length}</p>
      <h2 class="center">${esc(p.name)}, this is you</h2>
      <div class="reveal">
        <div class="flip" id="flip">
          <div class="face back"><div class="glyph">🤫</div><div class="role-name">Tap to reveal</div></div>
          <div class="face front">
            <div class="glyph">${info.glyph}</div>
            <div class="role-name ${info.cls}">${info.label}</div>
            <p style="margin-top:12px">${info.desc}${mates.length
              ? `<br><br>Your fellow Assassin${mates.length > 1 ? 's' : ''}: <strong>${esc(mates.join(', '))}</strong>.` : ''}</p>
          </div>
        </div>
      </div>
      <button class="btn" id="next" disabled>Hide &amp; pass on</button>
    `, { targetSelector: '#flip' });

    const flip = app.querySelector('#flip');
    const next = app.querySelector('#next');
    flip.onclick = () => {
      if (flip.classList.contains('flipped')) return;
      flip.classList.add('flipped');
      next.disabled = false; next.classList.add('target');
    };
    next.onclick = () => { if (!next.disabled) reveal(i + 1); };
  }

  // ---------- A round: one pass around the table ----------
  function roundIntro() {
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🕯️</div>
      <h2 class="center">Round ${G.round}</h2>
      <p class="center">Debate aloud. Then pass the phone around — on their turn, each player secretly acts and votes.</p>
      <p class="center"><span class="pill">${aliveNames().length} still alive</span></p>
      <div class="spacer"></div>
      <button class="btn" id="next">Pass the phone around</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => {
      G.order = alivePlayers();
      G.kills = []; G.protects = []; G.votes = [];
      turn(0);
    };
  }

  function turn(i) {
    if (i >= G.order.length) return resolveRound();
    gate(G.order[i].name, () => actFor(i));
  }

  // The current player's private turn: role action (if any), then their vote.
  function actFor(i) {
    const p = G.order[i];
    if (p.role === 'assassin') {
      const targets = G.players.filter((x) => x.alive && x.role !== 'assassin').map((x) => x.name);
      chooseScene({
        eyebrow: `Round ${G.round} · in secret`, title: 'Mark your victim',
        sub: 'Strike down one of the Virtuous tonight.', list: targets,
        onPick: (name) => { G.kills.push({ by: p.name, target: name }); voteStep(i); },
      });
    } else if (p.role === 'guardian') {
      chooseScene({
        eyebrow: `Round ${G.round} · in secret`, title: 'Choose who to protect',
        sub: 'They survive any assassination this round.', list: aliveNames(),
        onPick: (name) => { G.protects.push({ by: p.name, target: name }); voteStep(i); },
      });
    } else {
      voteStep(i);
    }
  }

  function voteStep(i) {
    const p = G.order[i];
    const options = G.players.filter((x) => x.alive && x.name !== p.name).map((x) => x.name);
    chooseScene({
      eyebrow: `Round ${G.round} · your vote`, title: `${p.name}, who do you banish?`,
      sub: 'This vote is yours alone.', list: options, skipLabel: 'Abstain',
      onPick: (name) => { G.votes.push({ voter: p.name, choice: name }); turn(i + 1); },
    });
  }

  // ---------- Resolution ----------
  function resolveRound() {
    const plan = Engine.resolveRound({ players: G.players, kills: G.kills, protects: G.protects, votes: G.votes });
    // Apply the deaths the plan decided (banishment always; assassination only if it landed).
    if (plan.banished) { const p = G.players.find((x) => x.name === plan.banished); if (p) p.alive = false; }
    if (plan.outcome === 'killed') { const p = G.players.find((x) => x.name === plan.victim); if (p) p.alive = false; }
    G.res = plan;
    return G.settings.suspense ? voteRevealPublic(0) : showBanish();
  }

  // Public, narrator-style reveal of every ballot (no passing — everyone watches).
  function voteRevealPublic(i) {
    if (i >= G.votes.length) return showBanish();
    const { voter, choice } = G.votes[i];
    const last = i + 1 >= G.votes.length;
    render(`
      <div class="spacer"></div>
      <p class="eyebrow center">Votes · ${i + 1} of ${G.votes.length}</p>
      <div class="vote-line">${gAvatar(voter)}<span>${esc(voter)}</span></div>
      <div class="vote-arrow center">${choice ? 'voted to banish' : 'abstained'}</div>
      ${choice ? `<div class="vote-line"><span class="vote-choice">${esc(choice)}</span>${gAvatar(choice)}</div>` : ''}
      <div class="spacer"></div>
      <button class="btn" id="next">${last ? 'Tally the votes' : 'Next vote'}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => voteRevealPublic(i + 1);
  }

  function showBanish() {
    const r = G.res;
    let body;
    if (!r.banished) {
      body = `<p class="center">${r.bVotes === 0 ? 'No votes were cast.' : 'The vote was tied.'} No one is banished.</p>`;
    } else {
      body = `<p class="center">${gAvatar(r.banished)} <strong>${esc(r.banished)}</strong> is banished with ${r.bVotes} vote${r.bVotes > 1 ? 's' : ''}.</p>
        <p class="center">${esc(r.banished)} was ${roleWord(r.bRole)}.</p>`;
    }
    // If banishing ended the game (e.g. the last Assassin is caught), the strike never lands.
    const cancelled = r.winAfterBanish && r.bRole === 'assassin';
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">⚖️</div>
      <h2 class="center">The vote is in</h2>
      ${body}
      ${cancelled ? `<p class="center">With the last Assassin caught, their strike never lands.</p>` : ''}
      <div class="spacer"></div>
      <button class="btn" id="next">${r.winAfterBanish ? 'See the outcome' : 'Then, under cover of dark…'}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => (r.winAfterBanish ? win(r.winner) : resolveAssassination());
  }

  function resolveAssassination() {
    const r = G.res;
    let body;
    if (r.outcome === 'none') {
      body = `<p class="center">No blade finds its mark. The night passes without bloodshed.</p>`;
    } else if (r.outcome === 'already') {
      body = `<p class="center">The Assassins crept toward ${esc(r.victim)}… but justice had already claimed them.</p>`;
    } else if (r.outcome === 'saved') {
      body = `<p class="center">A blade flashed at ${gAvatar(r.victim)} <strong>${esc(r.victim)}</strong>…
        but the Guardian’s shield held. <strong style="color:var(--green)">They survive.</strong></p>`;
    } else { // killed
      body = `<p class="center">${gAvatar(r.victim)} <strong>${esc(r.victim)}</strong> was found slain.</p>
        <p class="center">${esc(r.victim)} was ${roleWord(r.victimRole)}.</p>`;
    }
    const w = r.winner;
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🌅</div>
      <h2 class="center">Dawn breaks</h2>
      ${body}
      <div class="spacer"></div>
      <button class="btn" id="next">${w ? 'See the outcome' : 'Continue'}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => (w ? win(w) : roundSummary());
  }

  function roundSummary() {
    const alive = aliveNames().length;
    const assassins = aliveAssassins();
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🔎</div>
      <h2 class="center">The hunt continues</h2>
      <p class="center"><span class="pill">${alive} still alive</span></p>
      <p class="center"><strong style="color:var(--red)">${assassins} Assassin${assassins > 1 ? 's' : ''}</strong>
        still hide among you.</p>
      <div class="spacer"></div>
      <button class="btn" id="next">Begin the next round</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => { G.round++; roundIntro(); };
  }

  function win(team) {
    const v = team === 'virtuous';
    const roster = G.players.map((p, i) => `
      <div class="seat">
        <span class="avatar" style="background:${gColor(i)}">${esc(gInitials(p.name))}</span>
        <span class="name">${esc(p.name)}</span>
        <span class="role-tag" style="color:${roleColor(p.role)}">${ROLE_INFO[p.role].label}</span>
      </div>`).join('');
    render(`
      <div class="scene-emoji" style="margin-top:10px">${v ? '🍷' : '🗡️'}</div>
      <p class="eyebrow center">Game over</p>
      <h1 class="center" style="color:${v ? 'var(--green)' : 'var(--red)'};font-size:30px">
        ${v ? 'THE VIRTUOUS WIN' : 'THE ASSASSINS WIN'}</h1>
      <p class="center">${v ? 'Every Assassin has been brought to justice.' : 'The Assassins now rule. Trust no one.'}</p>
      <div class="reveal-roles">${roster}</div>
      <div class="spacer"></div>
      <button class="btn" id="again">Play Again</button>
    `, { targetSelector: '#again' });
    app.querySelector('#again').onclick = () => scenes.title();
  }

  window.Game = { start: setup };
})();
