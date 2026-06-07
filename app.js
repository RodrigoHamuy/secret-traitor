/* ===== Secret Traitor — app shell =====
 * Shared UI helpers used by the real game (game.js): the render pipeline, the
 * pinned-footer layout, the title screen, and the keyboard-aware viewport sizing.
 * The game logic lives in game.js (window.Game) and engine.js (window.Engine).
 */

const app = document.getElementById('app');
const hintEl = document.getElementById('hint');
const hintText = document.getElementById('hint-text');

function setHint(text) {
  if (!hintEl) return;
  if (!text) { hintEl.hidden = true; return; }
  hintText.textContent = text;
  hintEl.hidden = false;
}

// Render a scene's HTML, then mark the action(s) the user should tap.
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

// Split the rendered screen into a scrollable content area and a pinned CTA footer,
// so the call-to-action buttons are always anchored to the bottom (even when the
// content is short) and stay visible above the on-screen keyboard.
function layoutScreen() {
  if (typeof app.removeChild !== 'function') return; // non-DOM test stub: skip
  // Drop any spacer sitting after the buttons (it would push the footer up).
  while (app.lastElementChild && app.lastElementChild.classList.contains('spacer')) {
    app.removeChild(app.lastElementChild);
  }
  // Pull the trailing run of .btn elements into the footer (keeps their order).
  const footer = document.createElement('div');
  footer.className = 'cta-footer';
  while (app.lastElementChild && app.lastElementChild.classList.contains('btn')) {
    footer.insertBefore(app.removeChild(app.lastElementChild), footer.firstChild);
  }
  // Everything else becomes the scrollable content area.
  const content = document.createElement('div');
  content.className = 'app-content';
  while (app.firstChild) content.appendChild(app.firstChild);
  app.appendChild(content);
  if (footer.childElementCount) app.appendChild(footer);
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
    <button class="btn" id="create">Create Game</button>
    <button class="btn secondary" id="join" disabled>Join Game · online soon</button>
  `, { targetSelector: '#create' });
  app.querySelector('#create').onclick = () => Game.start();
};

// Track the on-screen keyboard: shrink the phone to the visible viewport (via
// --vvh) so the pinned CTA footer is never hidden behind the keyboard.
(function trackViewport() {
  const vv = window.visualViewport;
  if (!vv) return;
  const fit = () => document.documentElement.style.setProperty('--vvh', `${Math.round(vv.height)}px`);
  vv.addEventListener('resize', fit);
  vv.addEventListener('scroll', fit);
  fit();
})();

// kick things off
scenes.title();
