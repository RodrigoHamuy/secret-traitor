/* ===== Secret Traitor — scripted happy-path demo =====
 * No real game logic, no networking. Each scene is hand-scripted and the
 * hint banner + pulsing ring show the user exactly what to tap next.
 */

const app = document.getElementById('app');
const hintEl = document.getElementById('hint');
const hintText = document.getElementById('hint-text');

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

// Grid of players to pick from. `highlight` = the scripted "correct" tap.
function pickGrid(highlight, onPick) {
  const cells = players.map((p) => {
    if (p.you) return ''; // you don't pick yourself in this demo
    const cls = p.alive ? 'pick' : 'pick dead';
    return `<button class="${cls}" data-name="${p.name}" ${p.alive ? '' : 'disabled'}>
      ${avatar(p.name)}<span class="name">${p.name}</span>
    </button>`;
  }).join('');
  setTimeout(() => {
    if (highlight) {
      const t = app.querySelector(`.pick[data-name="${highlight}"]`);
      if (t) t.classList.add('target');
    }
    app.querySelectorAll('.pick:not(.dead)').forEach((btn) => {
      btn.addEventListener('click', () => onPick(btn.dataset.name));
    });
  }, 0);
  return `<div class="pick-grid">${cells}</div>`;
}

// ===================== SCENES =====================
const scenes = {};

scenes.title = () => {
  render(`
    <div class="spacer"></div>
    <p class="eyebrow center">A game of trust &amp; betrayal</p>
    <h1 class="center">SECRET<br>TRAITOR</h1>
    <p class="center">By night a traitor strikes. By day the Virtuous decide who to trust.</p>
    <div class="spacer"></div>
    <button class="btn" id="create">Create Game</button>
    <button class="btn secondary" disabled>Join Game</button>
  `, { hint: "Tap “Create Game” to begin", targetSelector: '#create' });
  app.querySelector('#create').onclick = () => scenes.lobby();
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
        <div class="code">XR4K</div>
        <div class="share"><span class="url">secrettraitor.game/#/join/XR4K</span>
          <span class="pill">Copy</span></div>
      </div>
      <p style="margin-bottom:8px">${ready ? 'Everyone’s in!' : 'Waiting for players to join…'}
        <span class="pill">${count + 1} / 7</span></p>
      <div class="roster" id="roster">${drawRoster(count)}</div>
      <div class="spacer"></div>
      <button class="btn" id="start" ${ready ? '' : 'disabled'}>Start Game</button>
    `, ready
      ? { hint: "Everyone joined — tap “Start Game”", targetSelector: '#start' }
      : { hint: "Share the link… friends are joining" });
    if (ready) app.querySelector('#start').onclick = () => scenes.roleGuard();
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
          <div class="glyph">🂠</div>
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
    ${pickGrid(round === 1 ? 'Cleo' : 'Ava', (name) => scenes.nightWait(round, name))}
    <div class="spacer"></div>
  `, { hint: round === 1
        ? "Protect Cleo — tap her card"
        : "Protect Ava — tap her card" });
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
    ${pickGrid(target, (name) => scenes.dayReveal(round, name))}
    <div class="spacer"></div>
  `, { hint: `Suspicion falls on ${target} — tap to vote` });
};

scenes.dayReveal = (round, name) => {
  const p = find(name);
  p.alive = false;
  const isKiller = p.role === 'assassin';
  const assassinsLeft = players.filter((x) => x.role === 'assassin' && x.alive).length;
  render(`
    <div class="spacer"></div>
    <div class="scene-emoji">🗳️</div>
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
    <div class="scene-emoji">🎉</div>
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
