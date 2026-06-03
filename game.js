/* ===== Secret Traitor — real game (single device / pass & play) =====
 * Drives a full game on one shared phone, narrated like a game master.
 * Reuses render()/setHint()/app/scenes from app.js and window.Engine from engine.js.
 * Exposed as window.Game.
 *
 * Note: the real game intentionally passes no `hint`, so the bottom hint banner
 * stays hidden — screen text + button labels carry the instructions. A privacy
 * gate ("Pass the phone to X" → "I'm X") guards every private screen so nothing
 * is revealed while the phone is being handed over.
 */
(function () {
  const COLORS = ['#e8c468', '#9fc06f', '#5aa9f0', '#e0564c', '#c58ef0', '#f0975a',
                  '#5ad2c0', '#d08fb0', '#b0c070', '#7fa6e0', '#e0a25a', '#90d0a0'];

  const ROLE_INFO = {
    virtuous: { label: 'VIRTUOUS', cls: 'role-virtuous', glyph: '🍷',
      desc: 'You are innocent. Find the Assassins and vote them out by day.' },
    guardian: { label: 'GUARDIAN', cls: 'role-guardian', glyph: '🛡️',
      desc: 'Each night, secretly choose someone to protect. If the Assassins strike them, they survive.' },
    assassin: { label: 'ASSASSIN', cls: 'role-assassin', glyph: '🗡️',
      desc: 'Each night, choose a victim. Eliminate the Virtuous until you rule.' },
  };

  // Mutable game state.
  const G = { setup: null, players: [], settings: {}, round: 0, voters: [], votes: [],
              nightVictim: null, nightProtect: null };

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
  const aliveNames = () => G.players.filter((p) => p.alive).map((p) => p.name);
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
          <span class="option-sub">Reveal the votes one at a time.</span></span>
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
    if (i >= G.players.length) { G.round = 1; return nightIntro(); }
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
      <button class="btn" id="next" hidden>Hide &amp; pass on</button>
    `, { targetSelector: '#flip' });

    const flip = app.querySelector('#flip');
    const next = app.querySelector('#next');
    flip.onclick = () => {
      if (flip.classList.contains('flipped')) return;
      flip.classList.add('flipped');
      next.hidden = false; next.classList.add('target');
    };
    next.onclick = () => reveal(i + 1);
  }

  // ---------- Night ----------
  function nightIntro() {
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🌙</div>
      <h2 class="center">Night ${G.round}</h2>
      <p class="center">Everyone, close your eyes. The phone will summon those who stir in the dark.</p>
      <div class="spacer"></div>
      <button class="btn" id="next">Begin the night</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => nightAssassins();
  }

  function nightAssassins() {
    const assassins = G.players.filter((p) => p.role === 'assassin' && p.alive).map((p) => p.name);
    gate(assassins.join(' & '), () => {
      const targets = G.players.filter((p) => p.alive && p.role !== 'assassin').map((p) => p.name);
      chooseScene({
        eyebrow: `Night ${G.round}`, title: 'Choose a victim',
        sub: 'Who do the Assassins strike tonight?', list: targets,
        onPick: (name) => { G.nightVictim = name; passBack('Assassins', nightGuardian); },
      });
    }, { btn: 'We have the phone', sub: 'Assassins only. Everyone else, eyes shut.' });
  }

  function nightGuardian() {
    const g = G.players.find((p) => p.role === 'guardian' && p.alive);
    if (!g) return dawn();
    gate(g.name, () => {
      chooseScene({
        eyebrow: `Night ${G.round}`, title: 'Choose who to protect',
        sub: 'They will survive the Assassins tonight.', list: aliveNames(),
        onPick: (name) => { G.nightProtect = name; passBack(g.name, dawn); },
      });
    }, { sub: 'Guardian only. Everyone else, eyes shut.' });
  }

  // "Close your eyes, pass it back" interstitial between secret turns.
  function passBack(who, then) {
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🌙</div>
      <h2 class="center">Eyes shut, ${esc(who)}</h2>
      <p class="center">Pass the phone back to the table.</p>
      <div class="spacer"></div>
      <button class="btn" id="next">Continue</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => then();
  }

  function dawn() {
    const saved = G.nightVictim && G.nightVictim === G.nightProtect;
    let deadName = null;
    if (!saved && G.nightVictim) {
      const v = G.players.find((p) => p.name === G.nightVictim);
      if (v) { v.alive = false; deadName = v.name; }
    }
    G.nightVictim = null; G.nightProtect = null;

    let body;
    if (saved) {
      body = `<p class="center">A blade flashed in the night… but the Guardian made a save.
        <strong style="color:var(--green)">Everyone survived.</strong></p>`;
    } else if (deadName) {
      const v = G.players.find((p) => p.name === deadName);
      body = `<p class="center">${gAvatar(deadName)} <strong>${esc(deadName)}</strong> was found eliminated.</p>
        <p class="center">${esc(deadName)} was ${roleWord(v.role)}.</p>`;
    } else {
      body = `<p class="center">The night passed quietly. No one was harmed.</p>`;
    }
    const w = Engine.winner(G.players);
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🌅</div>
      <h2 class="center">Dawn breaks</h2>
      ${body}
      <div class="spacer"></div>
      <button class="btn" id="next">${w ? 'See the outcome' : 'To the round table'}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => (w ? win(w) : dayIntro());
  }

  // ---------- Day ----------
  function dayIntro() {
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🗣️</div>
      <h2 class="center">The round table</h2>
      <p class="center">Debate aloud. When you’re ready, everyone casts a secret vote to banish one suspect.</p>
      <p class="center"><span class="pill">${aliveNames().length} still alive</span></p>
      <div class="spacer"></div>
      <button class="btn" id="next">Begin voting</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => { G.voters = aliveNames(); G.votes = []; vote(0); };
  }

  function vote(i) {
    if (i >= G.voters.length) return G.settings.suspense ? voteReveal(0) : resolveDay();
    const voter = G.voters[i];
    gate(voter, () => {
      const options = G.players.filter((p) => p.alive && p.name !== voter).map((p) => p.name);
      chooseScene({
        eyebrow: `Ballot ${i + 1} of ${G.voters.length}`, title: `${voter}, who do you banish?`,
        list: options, skipLabel: 'Abstain',
        onPick: (name) => { G.votes.push({ voter, choice: name }); vote(i + 1); },
      });
    }, { sub: 'Your vote is secret.' });
  }

  function voteReveal(i) {
    if (i >= G.votes.length) return resolveDay();
    gate(G.votes[i].voter, () => voteRevealCard(i));
  }

  function voteRevealCard(i) {
    const { voter, choice } = G.votes[i];
    const last = i + 1 >= G.votes.length;
    const nextLabel = last ? 'Tally the votes' : 'Next ballot';
    render(`
      <p class="eyebrow center" style="margin-top:6px">Reveal ${i + 1} of ${G.votes.length}</p>
      <h2 class="center">${esc(voter)}’s vote</h2>
      <div class="reveal">
        <div class="flip vote" id="flip">
          <div class="face back"><div class="glyph">🤫</div><div class="role-name">Tap to reveal</div></div>
          <div class="face front">
            <div class="vote-line">${gAvatar(voter)}<span>${esc(voter)}</span></div>
            <div class="vote-arrow">${choice ? 'votes to banish' : 'abstained'}</div>
            ${choice ? `<div class="vote-line"><span class="vote-choice">${esc(choice)}</span>${gAvatar(choice)}</div>` : ''}
          </div>
        </div>
      </div>
      <button class="btn" id="next" hidden>${nextLabel}</button>
    `, { targetSelector: '#flip' });

    const flip = app.querySelector('#flip');
    const next = app.querySelector('#next');
    flip.onclick = () => {
      if (flip.classList.contains('flipped')) return;
      flip.classList.add('flipped');
      next.hidden = false; next.classList.add('target');
    };
    next.onclick = () => voteReveal(i + 1);
  }

  function resolveDay() {
    const t = Engine.tally(G.votes.map((v) => v.choice));
    if (t.tie) {
      render(`
        <div class="spacer"></div>
        <div class="scene-emoji">⚖️</div>
        <h2 class="center">${t.max === 0 ? 'No votes were cast' : 'The vote is tied'}</h2>
        <p class="center">No one is banished today. Night falls again.</p>
        <div class="spacer"></div>
        <button class="btn" id="next">To nightfall</button>
      `, { targetSelector: '#next' });
      app.querySelector('#next').onclick = () => { G.round++; nightIntro(); };
      return;
    }
    const name = t.leaders[0];
    const p = G.players.find((x) => x.name === name);
    p.alive = false;
    const w = Engine.winner(G.players);
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">⚖️</div>
      <h2 class="center">The vote is in</h2>
      <p class="center">${gAvatar(name)} <strong>${esc(name)}</strong> is banished with ${t.max} vote${t.max > 1 ? 's' : ''}.</p>
      <p class="center">${esc(name)} was ${roleWord(p.role)}.</p>
      <div class="spacer"></div>
      <button class="btn" id="next">${w ? 'See the outcome' : 'Continue'}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => (w ? win(w) : roundSummary());
  }

  function roundSummary() {
    const alive = aliveNames().length;
    const assassins = G.players.filter((p) => p.role === 'assassin' && p.alive).length;
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🔎</div>
      <h2 class="center">The hunt continues</h2>
      <p class="center"><span class="pill">${alive} still alive</span></p>
      <p class="center"><strong style="color:var(--red)">${assassins} Assassin${assassins > 1 ? 's' : ''}</strong>
        still hide among you.</p>
      <div class="spacer"></div>
      <button class="btn" id="next">To nightfall</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => { G.round++; nightIntro(); };
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
