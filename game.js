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

  // Mutable game state. `lastHolder` = who held the phone last, so the next round's
  // pass resumes from the seat beside them (i.e. beside whoever was just revealed).
  const G = { setup: null, players: [], settings: {}, round: 0, lastHolder: null,
              order: [], kills: [], protects: [], votes: [], res: null };

  // --- small helpers ---
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const gColor = (i) => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];
  const gInitials = (name) => name.trim().slice(0, 2).toUpperCase() || '??';
  function gAvatar(name) {
    const i = G.players.findIndex((p) => p.name === name);
    const p = i >= 0 ? G.players[i] : null;
    if (p && p.photo) return `<span class="avatar"><img class="avatar-img" src="${p.photo}" alt=""></span>`;
    return `<span class="avatar" style="background:${gColor(i < 0 ? 0 : i)}">${esc(gInitials(name))}</span>`;
  }
  const roleColor = (r) => r === 'assassin' ? 'var(--red)' : r === 'guardian' ? '#86a6d0' : 'var(--green)';
  function roleWord(r) {
    if (r === 'assassin') return 'an <strong style="color:var(--red)">Assassin</strong>';
    if (r === 'guardian') return 'the <strong style="color:#86a6d0">Guardian</strong>';
    return 'one of the <strong style="color:var(--green)">Virtuous</strong>';
  }
  // Uncoloured form for use on the parchment card face (the big label carries the colour).
  const plainRoleWord = (r) => r === 'assassin' ? 'an Assassin' : r === 'guardian' ? 'the Guardian' : 'one of the Virtuous';
  // Alive players in seating order, starting from the seat AFTER `startName` (wraps).
  function aliveOrderFrom(startName) {
    const n = G.players.length;
    let start = G.players.findIndex((p) => p.name === startName);
    const out = [];
    for (let k = 1; k <= n; k++) {
      const p = G.players[(start + k + n) % n];
      if (p.alive) out.push(p);
    }
    return out;
  }
  const alivePlayers = () => G.players.filter((p) => p.alive);
  const aliveNames = () => alivePlayers().map((p) => p.name);
  const defaultNames = (k) => Array.from({ length: k }, (_, i) => `Player ${i + 1}`);

  // Privacy gate: "Pass the phone to X" with a single "I'm X" button. The private
  // screen only renders once the recipient confirms — nothing leaks while passing.
  function gate(who, then, opts = {}) {
    G.lastHolder = who; // whoever takes the phone is now the latest holder
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

  // A "choose a player" screen. `emoji` is a big banner icon so a player doing two
  // selections in a turn can tell at a glance which action they're on.
  function chooseScene({ emoji, eyebrow, title, sub, list, onPick, skipLabel }) {
    const cells = list.map((name) =>
      `<button class="pick" data-name="${esc(name)}">${gAvatar(name)}<span class="name">${esc(name)}</span></button>`
    ).join('');
    const c = emoji ? ' class="center"' : '';
    render(`
      ${emoji ? `<div class="scene-emoji" style="margin-top:8px">${emoji}</div>` : ''}
      ${eyebrow ? `<p class="eyebrow${emoji ? ' center' : ''}">${esc(eyebrow)}</p>` : ''}
      <h2${c}>${esc(title)}</h2>
      ${sub ? `<p${c}>${esc(sub)}</p>` : ''}
      <div class="pick-grid">${cells}</div>
      ${skipLabel ? `<button class="btn secondary" id="skip">${esc(skipLabel)}</button>` : ''}
      <div class="spacer"></div>
    `);
    app.querySelectorAll('.pick').forEach((b) => { b.onclick = () => onPick(b.dataset.name); });
    if (skipLabel) app.querySelector('#skip').onclick = () => onPick(null);
  }

  // ---------- Setup ----------
  function setup() {
    if (!G.setup) G.setup = { names: defaultNames(6), suspense: true, selfie: false };
    const s = G.setup;
    const n = s.names.length;
    render(`
      <p class="eyebrow">New game · one shared phone</p>
      <h2>Who’s playing?</h2>
      <p>Add 5–12 players, then pass this phone around the table.</p>
      <div class="stepper">
        <button class="step-btn" id="minus" ${n <= 3 ? 'disabled' : ''}>−</button>
        <span class="step-count">${n} players</span>
        <button class="step-btn" id="plus" ${n >= 12 ? 'disabled' : ''}>+</button>
      </div>
      ${n < 5 ? `<p class="center warn">⚠ Fewer than 5 players is for quick testing — the game won’t be much fun.</p>` : ''}
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
      <label class="option">
        <input type="checkbox" id="selfie" ${s.selfie ? 'checked' : ''} />
        <span class="option-box"></span>
        <span class="option-text"><strong>Selfie avatars</strong>
          <span class="option-sub">Each player snaps a selfie as their token. Nothing is saved — photos live only in this game, on this phone.</span></span>
      </label>
      <div class="spacer"></div>
      <button class="btn" id="deal">Deal roles</button>
    `, { targetSelector: '#deal' });

    app.querySelector('#minus').onclick = () => { if (s.names.length > 3) { s.names.pop(); setup(); } };
    app.querySelector('#plus').onclick = () => { if (s.names.length < 12) { s.names.push(`Player ${s.names.length + 1}`); setup(); } };
    app.querySelectorAll('.name-input').forEach((inp) => {
      inp.oninput = (e) => { s.names[+e.target.dataset.i] = e.target.value; };
    });
    app.querySelector('#suspense').onchange = (e) => { s.suspense = e.target.checked; };
    app.querySelector('#selfie').onchange = (e) => { s.selfie = e.target.checked; };
    app.querySelector('#deal').onclick = () => {
      const names = s.names.map((nm, i) => (nm.trim() || `Player ${i + 1}`));
      G.players = Engine.dealRoles(names);
      G.settings = { suspense: s.suspense, selfie: s.selfie };
      G.round = 0;
      reveal(0);
    };
  }

  // ---------- Secret role reveal (pass & play) ----------
  function reveal(i) {
    if (i >= G.players.length) { G.round = 1; return roundIntro(); }
    const name = G.players[i].name;
    // With selfie avatars on, the player snaps their token before seeing their role.
    gate(name, () => (G.settings.selfie ? captureSelfie(name, () => revealCard(i)) : revealCard(i)));
  }

  // ---------- Selfie avatars (optional; photos stay in memory only) ----------
  // Crop the live camera frame to a centred square and mirror it like a real selfie.
  function grabSquare(video) {
    const size = 240;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const vw = video.videoWidth || size, vh = video.videoHeight || size;
    const s = Math.min(vw, vh);
    ctx.translate(size, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, size, size);
    return c.toDataURL('image/jpeg', 0.8);
  }

  function captureSelfie(name, then) {
    // No camera available -> quietly fall back to an initials token.
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return then();
    render(`
      <p class="eyebrow center" style="margin-top:6px">Selfie · ${esc(name)}</p>
      <h2 class="center">${esc(name)}, take a selfie</h2>
      <p class="center">This becomes your token for the game. <strong>Nothing is saved</strong> — your photo
        lives only in this game, on this phone, and is gone the moment it ends.</p>
      <div class="selfie-stage"><video id="cam" autoplay playsinline muted></video></div>
      <p class="center" id="camnote" hidden>Couldn’t open the camera — you can play with an initials token instead.</p>
      <button class="btn" id="snap" disabled>Take photo</button>
      <button class="btn secondary" id="skip">Skip — use initials</button>
    `, { targetSelector: '#snap' });

    const video = app.querySelector('#cam');
    const snap = app.querySelector('#snap');
    let stream = null;
    const stop = () => { if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } };

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((s) => { stream = s; video.srcObject = s; snap.disabled = false; snap.classList.add('target'); })
      .catch(() => { const n = app.querySelector('#camnote'); if (n) n.hidden = false; });

    snap.onclick = () => { if (!stream) return; const photo = grabSquare(video); stop(); confirmSelfie(name, photo, then); };
    app.querySelector('#skip').onclick = () => { stop(); then(); };
  }

  function confirmSelfie(name, photo, then) {
    render(`
      <p class="eyebrow center" style="margin-top:6px">Selfie · ${esc(name)}</p>
      <h2 class="center">Use this photo?</h2>
      <div class="selfie-stage"><img class="selfie-preview" src="${photo}" alt=""></div>
      <button class="btn" id="use">Looks good</button>
      <button class="btn secondary" id="retake">Retake</button>
    `, { targetSelector: '#use' });
    app.querySelector('#use').onclick = () => { const p = G.players.find((x) => x.name === name); if (p) p.photo = photo; then(); };
    app.querySelector('#retake').onclick = () => captureSelfie(name, then);
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
      // Resume beside whoever last held the phone (the player just revealed).
      G.order = aliveOrderFrom(G.lastHolder);
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
        emoji: '🗡️', eyebrow: `Round ${G.round} · ASSASSINATE`, title: 'Mark your victim',
        sub: 'Strike down one of the Virtuous tonight.', list: targets,
        onPick: (name) => { G.kills.push({ by: p.name, target: name }); voteStep(i); },
      });
    } else if (p.role === 'guardian') {
      chooseScene({
        emoji: '🛡️', eyebrow: `Round ${G.round} · PROTECT`, title: 'Choose who to protect',
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
      emoji: '🗳️', eyebrow: `Round ${G.round} · VOTE`, title: `${p.name}, who do you vote to banish?`,
      sub: 'You only cast a vote — whoever the majority picks is banished. No abstaining.', list: options,
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

  // A face-down card the just-eliminated player flips to reveal their own role to
  // the table — the app announces who fell, but never spoils their allegiance.
  function revealRoleCard(name, { eyebrow, title }, then) {
    const p = G.players.find((x) => x.name === name);
    const info = ROLE_INFO[p.role];
    render(`
      <p class="eyebrow center" style="margin-top:6px">${esc(eyebrow)}</p>
      <h2 class="center">${esc(title)}</h2>
      <div class="reveal">
        <div class="flip" id="flip">
          <div class="face back"><div class="glyph">🤫</div><div class="role-name">Tap to reveal</div></div>
          <div class="face front">
            <div class="glyph">${info.glyph}</div>
            <div class="role-name ${info.cls}">${info.label}</div>
            <p style="margin-top:12px">${esc(name)} was ${plainRoleWord(p.role)}.</p>
          </div>
        </div>
      </div>
      <button class="btn" id="next" disabled>Continue</button>
    `, { targetSelector: '#flip' });
    const flip = app.querySelector('#flip');
    const next = app.querySelector('#next');
    flip.onclick = () => {
      if (flip.classList.contains('flipped')) return;
      flip.classList.add('flipped');
      next.disabled = false; next.classList.add('target');
    };
    next.onclick = () => { if (!next.disabled) then(); };
  }

  function showBanish() {
    const r = G.res;
    if (!r.banished) {
      render(`
        <div class="spacer"></div>
        <div class="scene-emoji">⚖️</div>
        <h2 class="center">The vote is in</h2>
        <p class="center">${r.bVotes === 0 ? 'No votes were cast.' : 'The vote was tied.'} No one is banished.</p>
        <div class="spacer"></div>
        <button class="btn" id="next">Then, under cover of dark…</button>
      `, { targetSelector: '#next' });
      app.querySelector('#next').onclick = () => resolveAssassination();
      return;
    }
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">⚖️</div>
      <h2 class="center">The vote is in</h2>
      <p class="center">${gAvatar(r.banished)} <strong>${esc(r.banished)}</strong> is banished with ${r.bVotes} vote${r.bVotes > 1 ? 's' : ''}.</p>
      <p class="center">Hand them the phone to reveal their allegiance.</p>
      <div class="spacer"></div>
      <button class="btn" id="next">Pass the phone to ${esc(r.banished)}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => gate(r.banished, () =>
      revealRoleCard(r.banished, { eyebrow: `Banished · round ${G.round}`, title: `${r.banished}, reveal yourself` }, afterBanishReveal));
  }

  function afterBanishReveal() {
    const r = G.res;
    return r.winAfterBanish ? win(r.winner) : resolveAssassination();
  }

  function resolveAssassination() {
    const r = G.res;
    if (r.outcome === 'killed') {
      render(`
        <div class="spacer"></div>
        <div class="scene-emoji">🌅</div>
        <h2 class="center">Dawn breaks</h2>
        <p class="center">${gAvatar(r.victim)} <strong>${esc(r.victim)}</strong> was found slain in the night.</p>
        <p class="center">Hand them the phone to reveal their allegiance.</p>
        <div class="spacer"></div>
        <button class="btn" id="next">Pass the phone to ${esc(r.victim)}</button>
      `, { targetSelector: '#next' });
      app.querySelector('#next').onclick = () => gate(r.victim, () =>
        revealRoleCard(r.victim, { eyebrow: `Slain · round ${G.round}`, title: `${r.victim}, reveal yourself` }, proceedAfterRound));
      return;
    }
    let body;
    if (r.outcome === 'saved') {
      body = `<p class="center">A blade flashed at ${gAvatar(r.victim)} <strong>${esc(r.victim)}</strong>…
        but the Guardian’s shield held. <strong style="color:var(--green)">They survive.</strong></p>`;
    } else if (r.outcome === 'already') {
      body = `<p class="center">The Assassins crept toward ${esc(r.victim)}… but justice had already claimed them.</p>`;
    } else {
      body = `<p class="center">No blade finds its mark. The night passes without bloodshed.</p>`;
    }
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🌅</div>
      <h2 class="center">Dawn breaks</h2>
      ${body}
      <div class="spacer"></div>
      <button class="btn" id="next">${r.winner ? 'See the outcome' : 'Continue'}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => proceedAfterRound();
  }

  function proceedAfterRound() {
    if (G.res.winner) return win(G.res.winner);
    G.round++;
    roundIntro();
  }

  function win(team) {
    const v = team === 'virtuous';
    const roster = G.players.map((p) => `
      <div class="seat">
        ${gAvatar(p.name)}
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
