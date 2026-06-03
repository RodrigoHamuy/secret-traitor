/* ===== Secret Traitor — scripted happy-path demo =====
 * No real game logic, no networking. Each scene is hand-scripted and the
 * hint banner + pulsing ring show the user exactly what to tap next.
 */

const app = document.getElementById('app');
const hintEl = document.getElementById('hint');
const hintText = document.getElementById('hint-text');

// Where the game lives (GitHub Pages). Join links + QR codes point here.
const BASE_URL = 'https://rodrigohamuy.github.io/secret-traitor/';
const ROOM = 'XR4K';
const JOIN_URL = `${BASE_URL}#/join/${ROOM}`;
// Shorter, friendlier form for the on-screen link.
const JOIN_URL_SHORT = `rodrigohamuy.github.io/secret-traitor/#/join/${ROOM}`;

// Build a scannable QR <img> for a URL (falls back gracefully if the lib is blocked).
function qrImage(text) {
  if (typeof qrcode !== 'function') return '<div class="qr-fallback">QR</div>';
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createImgTag(5, 12, 'Scan to join');
}

// Demo mode runs the scripted teaching walkthrough; off runs the real game.
let demoMode = false;

// ----- Cast (you + 6 friends). Assassins are Eli & Finn. -----
const COLORS = ['#e8c468', '#57c98a', '#5aa9f0', '#e0564c', '#c58ef0', '#f0975a', '#5af0d2'];
let players = [
  { name: 'You',  role: 'guardian', alive: true, you: true },
  { name: 'Ava',  role: 'virtuous', alive: true },
  { name: 'Ben',  role: 'virtuous', alive: true },
  { name: 'Cleo', role: 'virtuous', alive: true },
  { name: 'Dot',  role: 'virtuous', alive: true },
  { name: 'Eli',  role: 'assassin', alive: true },
  { name: 'Finn', role: 'assassin', alive: true },
];
const find = (n) => players.find((p) => p.name === n);

// Game options:
//  singleDevice — everyone shares one phone and passes it around (vs. own devices).
//  suspense     — reveal votes one at a time (vs. all at once).
let singleDevice = true;
let suspense = true;

// Scripted day-vote ballots per round (only the players alive that day).
// In both rounds the highlighted suspect ends up with the majority.
const VOTES = {
  1: [['You', 'Eli'], ['Ava', 'Eli'], ['Ben', 'Eli'], ['Cleo', 'Finn'],
      ['Dot', 'Eli'], ['Eli', 'Dot'], ['Finn', 'Cleo']],
  2: [['You', 'Finn'], ['Ava', 'Finn'], ['Ben', 'Finn'], ['Cleo', 'Finn'], ['Finn', 'Ava']],
};

// ----- helpers -----
function initials(name) { return name === 'You' ? 'YOU' : name.slice(0, 2).toUpperCase(); }
function color(i) { return COLORS[i % COLORS.length]; }

function avatar(name) {
  const i = players.findIndex((p) => p.name === name);
  return `<span class="avatar" style="background:${color(i < 0 ? 0 : i)}">${initials(name)}</span>`;
}

function setHint(text) {
  if (!text) { hintEl.hidden = true; return; }
  hintText.textContent = text;
  hintEl.hidden = false;
}

// Render a scene's HTML, then mark the action(s) the user should tap.
function render(html, { hint, targetSelector } = {}) {
  app.innerHTML = html;
  app.scrollTop = 0;
  setHint(hint);
  if (targetSelector) {
    app.querySelectorAll(targetSelector).forEach((el) => el.classList.add('target'));
  }
}

// Grid of players to pick from, followed by a confirm button.
// `highlight` = the scripted "correct" pick. `onConfirm(name)` fires when the
// player has selected someone and tapped the CTA (disabled until a pick is made).
function pickGrid(highlight, onConfirm, { cta = 'Confirm' } = {}) {
  const cells = players.map((p) => {
    if (p.you) return ''; // you don't pick yourself in this demo
    const cls = p.alive ? 'pick' : 'pick dead';
    return `<button class="${cls}" data-name="${p.name}" ${p.alive ? '' : 'disabled'}>
      ${avatar(p.name)}<span class="name">${p.name}</span>
    </button>`;
  }).join('');
  setTimeout(() => {
    let selected = null;
    const confirmBtn = app.querySelector('#pick-confirm');
    if (highlight) {
      const t = app.querySelector(`.pick[data-name="${highlight}"]`);
      if (t) t.classList.add('target');
    }
    app.querySelectorAll('.pick:not(.dead)').forEach((btn) => {
      btn.addEventListener('click', () => {
        app.querySelectorAll('.pick.selected').forEach((b) => b.classList.remove('selected'));
        // First pick clears the scripted hint pulse so the CTA can take over.
        app.querySelectorAll('.pick.target').forEach((b) => b.classList.remove('target'));
        btn.classList.add('selected');
        selected = btn.dataset.name;
        confirmBtn.disabled = false;
        confirmBtn.classList.add('target');
      });
    });
    confirmBtn.onclick = () => { if (selected) onConfirm(selected); };
  }, 0);
  return `<div class="pick-grid">${cells}</div>
    <button class="btn" id="pick-confirm" disabled>${cta}</button>`;
}

// ===================== SCENES =====================
const scenes = {};

scenes.title = () => {
  render(`
    <div class="spacer"></div>
    <p class="eyebrow center">A game of trust &amp; betrayal</p>
    <h1 class="center">SECRET<br>TRAITOR</h1>
    <div class="divider">❦</div>
    <p class="center">By night a traitor strikes. By day the Virtuous decide who to trust.</p>
    <div class="spacer"></div>
    <label class="option" style="margin-bottom:4px">
      <input type="checkbox" id="demo" ${demoMode ? 'checked' : ''} />
      <span class="option-box"></span>
      <span class="option-text"><strong>Demo mode</strong>
        <span class="option-sub">A guided, scripted walkthrough to teach the game.</span></span>
    </label>
    <button class="btn" id="create">${demoMode ? 'Start walkthrough' : 'Create Game'}</button>
    <button class="btn secondary" id="join" disabled>Join Game · online soon</button>
  `, { hint: demoMode ? "Tap “Start walkthrough”" : "Tap “Create Game” to begin", targetSelector: '#create' });
  app.querySelector('#demo').onchange = (e) => { demoMode = e.target.checked; scenes.title(); };
  app.querySelector('#create').onclick = () => (demoMode ? scenes.lobby() : Game.start());
};

scenes.lobby = () => {
  // Start with just you, then friends "join" one by one.
  const order = ['Ava', 'Ben', 'Cleo', 'Dot', 'Eli', 'Finn'];
  const drawRoster = (count) => {
    const list = ['You', ...order.slice(0, count)];
    return list.map((n) => `
      <div class="seat ${n === 'You' ? 'you' : ''}">${avatar(n)}<span class="name">${n}</span></div>
    `).join('');
  };
  const screen = (count, ready) => {
    render(`
      <p class="eyebrow">Game lobby</p>
      <div class="code-box">
        <p class="qr-label">Scan to join</p>
        <div class="qr-wrap">${qrImage(JOIN_URL)}</div>
        <div class="code">${ROOM}</div>
        <div class="share"><span class="url">${JOIN_URL_SHORT}</span>
          <span class="pill">Copy</span></div>
      </div>
      <p style="margin-bottom:8px">${ready ? 'Everyone’s in!' : 'Waiting for players to join…'}
        <span class="pill">${count + 1} / 7</span></p>
      <div class="roster" id="roster">${drawRoster(count)}</div>
      ${ready ? `
      <label class="option">
        <input type="checkbox" id="single-device" ${singleDevice ? 'checked' : ''} />
        <span class="option-box"></span>
        <span class="option-text"><strong>One phone only</strong>
          <span class="option-sub">Everyone shares this device and passes it around.
            Turn off if each player has their own phone.</span></span>
      </label>
      <label class="option">
        <input type="checkbox" id="suspense" ${suspense ? 'checked' : ''} />
        <span class="option-box"></span>
        <span class="option-text"><strong>Suspense mode</strong>
          <span class="option-sub">Reveal votes one at a time instead of all at once.
            Great in the same room or on a video call.</span></span>
      </label>` : ''}
      <div class="spacer"></div>
      <button class="btn" id="start" ${ready ? '' : 'disabled'}>Start Game</button>
    `, ready
      ? { hint: "Everyone joined — tap “Start Game”", targetSelector: '#start' }
      : { hint: "Share the link… friends are joining" });
    if (ready) {
      app.querySelector('#single-device').onchange = (e) => { singleDevice = e.target.checked; };
      app.querySelector('#suspense').onchange = (e) => { suspense = e.target.checked; };
      app.querySelector('#start').onclick = () => scenes.roleGuard();
    }
  };
  let count = 0;
  screen(count, false);
  const iv = setInterval(() => {
    count++;
    screen(count, count >= order.length);
    if (count >= order.length) clearInterval(iv);
  }, 650);
};

scenes.roleGuard = () => {
  render(`
    <p class="eyebrow center">Your secret role</p>
    <p class="center">Keep your screen private — this is for your eyes only.</p>
    <div class="reveal">
      <div class="flip" id="flip">
        <div class="face back">
          <div class="glyph">🕯️</div>
          <div class="role-name">Tap to reveal</div>
        </div>
        <div class="face front">
          <div class="glyph">🛡️</div>
          <div class="role-name role-guardian">GUARDIAN</div>
          <p style="margin-top:12px">Each night, secretly choose someone to protect.
            If the Assassins strike them, they survive.</p>
        </div>
      </div>
    </div>
    <button class="btn" id="ready" hidden>I’m ready</button>
  `, { hint: "Tap the card to reveal your role", targetSelector: '#flip' });

  const flip = app.querySelector('#flip');
  const ready = app.querySelector('#ready');
  flip.onclick = () => {
    if (flip.classList.contains('flipped')) return;
    flip.classList.add('flipped');
    ready.hidden = false;
    ready.classList.add('target');
    setHint("You’re the Guardian — tap “I’m ready”");
  };
  ready.onclick = () => scenes.night(1);
};

scenes.night = (round) => {
  render(`
    <div class="spacer"></div>
    <div class="scene-emoji">🌙</div>
    <h2 class="center">Night ${round}</h2>
    <p class="center">Everyone sleeps. As the Guardian, choose someone to protect tonight.</p>
    ${pickGrid(round === 1 ? 'Cleo' : 'Ava', (name) => scenes.nightWait(round, name), { cta: 'Protect' })}
    <div class="spacer"></div>
  `, { hint: round === 1
        ? "Protect Cleo — tap her card, then “Protect”"
        : "Protect Ava — tap her card, then “Protect”" });
};

scenes.nightWait = (round, saved) => {
  render(`
    <div class="spacer"></div>
    <div class="scene-emoji">🛡️</div>
    <h2 class="center">You protected ${saved}</h2>
    <p class="center">Waiting for the night to end…</p>
    <div class="spacer"></div>
    <button class="btn" id="next">See what happened</button>
  `, { hint: "Tap to see the morning", targetSelector: '#next' });
  app.querySelector('#next').onclick = () => scenes.dawn(round);
};

scenes.dawn = (round) => {
  if (round === 1) {
    // Killers targeted Cleo; you protected Cleo → save.
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🌅</div>
      <h2 class="center">Dawn breaks</h2>
      <p class="center">A blade flashed in the night… but the strike failed.
        <strong style="color:var(--green)">The Guardian made a save — everyone survived!</strong></p>
      <div class="spacer"></div>
      <button class="btn" id="next">Begin the day</button>
    `, { hint: "Tap “Begin the day”", targetSelector: '#next' });
    app.querySelector('#next').onclick = () => scenes.day(1);
  } else {
    // Killers targeted Dot; you protected Ava → Dot dies.
    find('Dot').alive = false;
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🌅</div>
      <h2 class="center">Dawn breaks</h2>
      <p class="center">${avatar('Dot')} <strong>Dot</strong> was found eliminated.</p>
      <p class="center">Dot was <strong style="color:var(--green)">Virtuous</strong>.</p>
      <div class="spacer"></div>
      <button class="btn" id="next">Begin the day</button>
    `, { hint: "Tap “Begin the day”", targetSelector: '#next' });
    app.querySelector('#next').onclick = () => scenes.day(2);
  }
};

scenes.day = (round) => {
  const target = round === 1 ? 'Eli' : 'Finn';
  render(`
    <p class="eyebrow">Day ${round} · Round table</p>
    <h2>Who do you accuse?</h2>
    <p>Talk it over, then vote to eliminate one suspect.</p>
    ${pickGrid(target, () => suspense ? scenes.voteReveal(round, 0) : scenes.dayReveal(round, target), { cta: 'Cast vote' })}
    <div class="spacer"></div>
  `, { hint: `Suspicion falls on ${target} — tap their card, then “Cast vote”` });
};

// Suspense mode: one player at a time uncovers their vote; the rest wait.
scenes.voteReveal = (round, i) => {
  const votes = VOTES[round];
  const target = round === 1 ? 'Eli' : 'Finn';
  if (i >= votes.length) return scenes.dayReveal(round, target);

  const [voter, choice] = votes[i];
  const isYou = voter === 'You';
  const last = i + 1 >= votes.length;
  const nextLabel = last ? 'Tally the votes' : 'Next voter';
  // On own devices, other players reveal privately on their own phone — their result
  // simply arrives here. Only your own ballot is yours to flip. With one shared phone,
  // every ballot is flipped here as it's passed around.
  const arrives = !singleDevice && !isYou;

  const heading = isYou ? 'Your vote'
    : singleDevice ? `Pass the phone to ${voter}`
    : `${voter} has voted`;
  const hint = arrives
    ? `${voter} revealed on their own phone — tap “${nextLabel}”`
    : isYou ? 'Tap the card to show your vote'
    : `Hand the phone to ${voter}, then tap to reveal`;

  render(`
    <p class="eyebrow center" style="margin-top:6px">Ballot ${i + 1} of ${votes.length}</p>
    <h2 class="center">${heading}</h2>
    <div class="reveal">
      <div class="flip vote ${arrives ? 'flipped' : ''}" id="flip">
        <div class="face back">
          <div class="glyph">🤫</div>
          <div class="role-name">${isYou ? 'Your vote' : 'Tap to reveal'}</div>
        </div>
        <div class="face front">
          <div class="vote-line">${avatar(voter)}<span>${voter}</span></div>
          <div class="vote-arrow">votes to banish</div>
          <div class="vote-line"><span class="vote-choice">${choice}</span>${avatar(choice)}</div>
        </div>
      </div>
    </div>
    <button class="btn" id="next" ${arrives ? '' : 'hidden'}>${nextLabel}</button>
  `, { hint, targetSelector: arrives ? '#next' : '#flip' });

  const flip = app.querySelector('#flip');
  const next = app.querySelector('#next');
  if (arrives) {
    next.classList.add('target');
  } else {
    flip.onclick = () => {
      if (flip.classList.contains('flipped')) return;
      flip.classList.add('flipped');
      next.hidden = false;
      next.classList.add('target');
      setHint(`Tap “${nextLabel}”`);
    };
  }
  next.onclick = () => scenes.voteReveal(round, i + 1);
};

scenes.dayReveal = (round, name) => {
  const p = find(name);
  p.alive = false;
  const isKiller = p.role === 'assassin';
  const assassinsLeft = players.filter((x) => x.role === 'assassin' && x.alive).length;
  render(`
    <div class="spacer"></div>
    <div class="scene-emoji">⚖️</div>
    <h2 class="center">The vote is in</h2>
    <p class="center">${avatar(name)} <strong>${name}</strong> is eliminated.</p>
    <p class="center">${name} was ${isKiller
      ? 'an <strong class="role-assassin">ASSASSIN</strong>'
      : '<strong class="role-virtuous">Virtuous</strong>'}!</p>
    <div class="spacer"></div>
    <button class="btn" id="next">Continue</button>
  `, { hint: "Tap “Continue”", targetSelector: '#next' });
  app.querySelector('#next').onclick = () =>
    assassinsLeft === 0 ? scenes.win() : scenes.roundSummary(round);
};

scenes.roundSummary = (round) => {
  const alive = players.filter((p) => p.alive).length;
  const killers = players.filter((p) => p.role === 'assassin' && p.alive).length;
  render(`
    <div class="spacer"></div>
    <div class="scene-emoji">🔎</div>
    <h2 class="center">The hunt continues</h2>
    <p class="center"><span class="pill">${alive} still alive</span></p>
    <p class="center"><strong style="color:var(--red)">${killers} Assassin</strong>
      still hides among you.</p>
    <div class="spacer"></div>
    <button class="btn" id="next">To nightfall</button>
  `, { hint: "Tap “To nightfall”", targetSelector: '#next' });
  app.querySelector('#next').onclick = () => scenes.night(round + 1);
};

scenes.win = () => {
  render(`
    <div class="spacer"></div>
    <div class="scene-emoji">🍷</div>
    <p class="eyebrow center">Victory</p>
    <h1 class="center" style="color:var(--green);font-size:34px">THE VIRTUOUS WIN</h1>
    <p class="center">Every Assassin has been caught. The Virtuous are safe… until next time.</p>
    <div class="spacer"></div>
    <button class="btn" id="again">Play Again</button>
  `, { hint: "Tap “Play Again” to restart the demo", targetSelector: '#again' });
  app.querySelector('#again').onclick = () => {
    players.forEach((p) => { p.alive = true; });
    scenes.title();
  };
};

// kick things off
scenes.title();
