/* Secret Traitor — app shell: render pipeline, pinned-footer layout, title screen,
 * keyboard-aware viewport. Game logic lives in game.js (Game) and engine.js (Engine). */

const app = document.getElementById('app');
const hintEl = document.getElementById('hint');
const hintText = document.getElementById('hint-text');

function setHint(text) {
  if (!hintEl) return;
  if (!text) { hintEl.hidden = true; return; }
  hintText.textContent = text;
  hintEl.hidden = false;
}

// Render a scene, then highlight the action(s) to tap.
function render(html, { hint, targetSelector } = {}) {
  app.innerHTML = html;
  layoutScreen();
  const content = app.querySelector('.app-content');
  if (content) content.scrollTop = 0;
  setHint(hint);
  if (targetSelector) {
    app.querySelectorAll(targetSelector).forEach((el) => el.classList.add('target'));
  }
}

// Split the screen into a scrollable content area and a CTA footer pinned to the
// bottom, kept clear of the on-screen keyboard.
function layoutScreen() {
  if (typeof app.removeChild !== 'function') return; // non-DOM test stub: skip
  // Drop a trailing spacer; it would push the footer up.
  while (app.lastElementChild && app.lastElementChild.classList.contains('spacer')) {
    app.removeChild(app.lastElementChild);
  }
  // Move the trailing run of .btn elements into the footer, keeping their order.
  const footer = document.createElement('div');
  footer.className = 'cta-footer';
  while (app.lastElementChild && app.lastElementChild.classList.contains('btn')) {
    footer.insertBefore(app.removeChild(app.lastElementChild), footer.firstChild);
  }
  const content = document.createElement('div');
  content.className = 'app-content';
  while (app.firstChild) content.appendChild(app.firstChild);
  app.appendChild(content);
  if (footer.childElementCount) app.appendChild(footer);
}

const scenes = {};

scenes.title = () => {
  render(`
    <div class="spacer"></div>
    <p class="eyebrow center">A game of trust &amp; betrayal</p>
    <h1 class="center">SECRET<br>TRAITOR</h1>
    <div class="divider">❦</div>
    <p class="center">By night a traitor strikes. By day the Virtuous decide who to trust.</p>
    <div class="spacer"></div>
    <button class="btn" id="create">Create Game</button>
    <button class="btn secondary" id="join" disabled>Join Game · online soon</button>
  `, { targetSelector: '#create' });
  app.querySelector('#create').onclick = () => Game.start();
};

// Shrink the phone to the visible viewport (via --vvh) so the keyboard never
// hides the pinned CTA footer.
(function trackViewport() {
  const vv = window.visualViewport;
  if (!vv) return;
  const fit = () => document.documentElement.style.setProperty('--vvh', `${Math.round(vv.height)}px`);
  vv.addEventListener('resize', fit);
  vv.addEventListener('scroll', fit);
  fit();
})();

scenes.title();
