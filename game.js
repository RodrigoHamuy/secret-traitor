/* Secret Traitor — single-device pass-&-play game (window.Game).
 * Reuses render()/app/scenes from app.js and Engine from engine.js.
 * Each round the phone passes once; a role-blind "I'm X" gate keeps identities hidden. */
(function () {
  const COLORS = ['#e8c468', '#9fc06f', '#5aa9f0', '#e0564c', '#c58ef0', '#f0975a',
                  '#5ad2c0', '#d08fb0', '#b0c070', '#7fa6e0', '#e0a25a', '#90d0a0'];

  // Optional portrait enhancement (bring-your-own Replicate token). The browser can't
  // call api.replicate.com directly (no CORS), so requests go through a token-injecting
  // proxy origin — see worker/README.md. PuLID locks onto the selfie's face and paints a
  // scene around it; a community model run by version id.
  const PORTRAIT_PROXY_URL = 'https://secret-traitor-replicate.hamuyrodrigo.workers.dev';
  const PORTRAIT_MODEL = 'bytedance/pulid'; // label only — requests use the version
  const PORTRAIT_VERSION = '43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0';
  const IDENTITY_FIDELITY = 1.0;    // identity_scale — push up if faces look off (max 5)
  const FAST_STEPS = 4;             // num_steps

  // One 16th-century character per player, attire + backdrop bundled so the look coheres.
  const PORTRAIT_CHARACTERS = [
    'a stern judge in black judicial robes and a flat velvet cap, seated before dark oak panelling',
    'a priest in a black cassock and white clerical collar, in a candlelit stone chapel',
    'a humble villager in a coarse linen shirt and brown woollen cap, against a rustic plaster wall',
    'a noblewoman in a richly embroidered gown and pearl headdress, before a deep crimson drape',
    'a merchant in a fur-trimmed coat and gold chain, in a wood-panelled counting house',
    'a soldier in burnished steel armour and a red sash, against a stormy battlefield sky',
    'a scholar in a dark scholar\'s robe holding spectacles, in a library of leather books',
    'a physician in a long dark gown and skullcap, by shelves of glass apothecary jars',
    'a court jester in a parti-coloured motley and belled hood, before a tapestry backdrop',
    'a duke in ermine-trimmed crimson velvet and a jewelled medallion, in a gilded hall',
    'a nun in a black-and-white habit and wimple, in a quiet cloister of pale stone',
    'a blacksmith in a leather apron over a rough tunic, lit by the orange glow of a forge',
    'a sea captain in a navy coat with brass buttons and a wide hat, against a harbour at dusk',
    'a friar in a brown hooded habit with a rope belt, in a sunlit monastery garden',
    'a magistrate in deep-green robes trimmed with gold braid, before a heavy green curtain',
    'a young squire in a quilted doublet and feathered cap, against a pale grey-blue sky',
  ];

  // Deterministic per index; *7 spreads adjacent players so they rarely collide.
  function characterFor(index) {
    return PORTRAIT_CHARACTERS[((index * 7) % PORTRAIT_CHARACTERS.length + PORTRAIT_CHARACTERS.length) % PORTRAIT_CHARACTERS.length];
  }

  // Describes the whole portrait (not an edit) — PuLID paints around the locked face.
  function portraitPrompt(index) {
    return 'A 16th-century Renaissance oil portrait of ' + characterFor(index) + '. ' +
      'Head-and-shoulders close-up, soft warm lighting, muted period colour, ' +
      'painted in the style of an old master, fine detail.';
  }

  const PORTRAIT_NEGATIVE = 'different person, distorted face, deformed, disfigured, ' +
    'extra face, multiple faces, plastic skin, cartoon, anime, 3d render, blurry, lowres';

  const ROLE_INFO = {
    virtuous: { label: 'VIRTUOUS', cls: 'role-virtuous', glyph: '🍷',
      desc: 'You are innocent. Each round, vote to banish the Assassins before they outnumber you.' },
    guardian: { label: 'GUARDIAN', cls: 'role-guardian', glyph: '🛡️',
      desc: 'Each round, secretly choose someone to protect from assassination — then cast your vote like everyone else.' },
    assassin: { label: 'ASSASSIN', cls: 'role-assassin', glyph: '🗡️',
      desc: 'Each round, secretly mark a victim to assassinate — then cast your vote to deflect suspicion.' },
  };

  // `lastHolder` = who held the phone last, so each round resumes from the seat beside them.
  const G = { setup: null, players: [], settings: {}, round: 0, lastHolder: null,
              order: [], kills: [], protects: [], votes: [], res: null };

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const gColor = (i) => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];
  const gInitials = (name) => name.trim().slice(0, 2).toUpperCase() || '??';
  const fateClass = (p) => !p || p.alive ? '' : p.fate === 'killed' ? ' slain' : ' banished';
  function gAvatar(name) {
    const i = G.players.findIndex((p) => p.name === name);
    const p = i >= 0 ? G.players[i] : null;
    const fate = fateClass(p);
    if (p && p.photo) {
      // data-player lets the generated portrait swap in live (see swapAvatar).
      const cls = (p.enhancing ? 'avatar enhancing' : 'avatar') + fate;
      return `<span class="${cls}" data-player="${i}"><img class="avatar-img" src="${p.photo}" alt=""></span>`;
    }
    return `<span class="avatar${fate}" data-player="${i}" style="background:${gColor(i < 0 ? 0 : i)}">${esc(gInitials(name))}</span>`;
  }
  const roleColor = (r) => r === 'assassin' ? 'var(--red)' : r === 'guardian' ? '#86a6d0' : 'var(--green)';
  function roleWord(r) {
    if (r === 'assassin') return 'an <strong style="color:var(--red)">Assassin</strong>';
    if (r === 'guardian') return 'the <strong style="color:#86a6d0">Guardian</strong>';
    return 'one of the <strong style="color:var(--green)">Virtuous</strong>';
  }
  const plainRoleWord = (r) => r === 'assassin' ? 'an Assassin' : r === 'guardian' ? 'the Guardian' : 'one of the Virtuous';
  // Alive players in seating order, from the seat after `startName` (wraps).
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
  // Deferred from resolveRound so portraits stay coloured through the vote reveal;
  // `deathOrder` lets the final screen list the fallen newest-first.
  let deathSeq = 0;
  const markDead = (name, fate) => { const p = G.players.find((x) => x.name === name); if (p) { p.alive = false; p.fate = fate; p.deathOrder = ++deathSeq; } };
  const alivePlayers = () => G.players.filter((p) => p.alive);
  const aliveNames = () => alivePlayers().map((p) => p.name);
  const defaultNames = (k) => Array.from({ length: k }, (_, i) => `Player ${i + 1}`);
  const DEBATE_SECONDS = 60;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Round 1 has no deaths to discuss, so nudge the table with a playful tell.
  const ROUND1_TEASERS = [
    'Did anyone giggle, or glance away a little too quickly?',
    'Whose smile lingered a beat too long?',
    'Who looked a touch too pleased with their card?',
    'Did a poker face just slip?',
    'Who already looks guilty?',
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Synthesised two-note bell (no asset to ship); no-ops if audio is blocked.
  let _audioCtx;
  function playChime() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      _audioCtx = _audioCtx || new AC();
      const ctx = _audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      [659.25, 987.77].forEach((freq, k) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + k * 0.18;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.7);
      });
    } catch (e) { /* audio unavailable — stay silent */ }
  }

  // Privacy gate: nothing renders until the recipient taps "I'm X", so nothing leaks
  // while passing. Shows their avatar only once they have an identity, else a 📱.
  function gate(who, then, opts = {}) {
    G.lastHolder = who;
    const p = G.players.find((x) => x.name === who);
    const head = (p && (p.photo || p.named))
      ? `<div class="gate-avatar">${gAvatar(who)}</div>`
      : `<div class="scene-emoji">📱</div>`;
    render(`
      <div class="spacer"></div>
      ${head}
      <h2 class="center">Pass the phone to ${esc(who)}</h2>
      <p class="center">${opts.sub || 'Hand it over before tapping.'}</p>
      <div class="spacer"></div>
      <button class="btn" id="go">${esc(opts.btn || `I’m ${who}`)}</button>
    `, { targetSelector: '#go' });
    app.querySelector('#go').onclick = then;
  }

  // 2-step "Vote › Special" hint; steps = { labels, active }.
  function stepperHTML(steps) {
    if (!steps) return '';
    const cells = steps.labels.map((label, i) => {
      const cls = i < steps.active ? 'done' : i === steps.active ? 'active' : '';
      return `<span class="step ${cls}"><span class="step-num">${i + 1}</span>${esc(label)}</span>`;
    }).join('<span class="step-sep">›</span>');
    return `<div class="stepper">${cells}</div>`;
  }

  function chooseScene({ emoji, eyebrow, title, sub, list, onPick, skipLabel, cta = 'Confirm', ctaEmoji, steps, tint }) {
    const cells = list.map((name) =>
      `<button class="pick" data-name="${esc(name)}">${gAvatar(name)}<span class="name">${esc(name)}</span></button>`
    ).join('');
    const c = emoji ? ' class="center"' : '';
    render(`
      ${stepperHTML(steps)}
      ${emoji ? `<div class="scene-emoji" style="margin-top:8px">${emoji}</div>` : ''}
      ${eyebrow ? `<p class="eyebrow${emoji ? ' center' : ''}">${esc(eyebrow)}</p>` : ''}
      <h2${c}>${esc(title)}</h2>
      ${sub ? `<p${c}>${esc(sub)}</p>` : ''}
      <div class="pick-grid${tint ? ' tint-' + tint : ''}">${cells}</div>
      <button class="btn${ctaEmoji ? ' has-emoji' : ''}" id="confirm" disabled>${ctaEmoji
        ? `<span class="cta-side"><span class="emoji">${ctaEmoji}</span></span><span class="cta-label">${esc(cta)}</span><span class="cta-side"></span>`
        : esc(cta)}</button>
      ${skipLabel ? `<button class="btn secondary" id="skip">${esc(skipLabel)}</button>` : ''}
      <div class="spacer"></div>
    `);
    let selected = null;
    const confirmBtn = app.querySelector('#confirm');
    app.querySelectorAll('.pick').forEach((b) => {
      b.onclick = () => {
        app.querySelectorAll('.pick.selected').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        selected = b.dataset.name;
        confirmBtn.disabled = false;
      };
    });
    confirmBtn.onclick = () => { if (selected) onPick(selected); };
    if (skipLabel) app.querySelector('#skip').onclick = () => onPick(null);
  }

  function setup() {
    if (!G.setup) G.setup = { count: 6, suspense: true, selfie: false, replicateToken: '' };
    const s = G.setup;
    const n = s.count;
    render(`
      <p class="eyebrow">New game · one shared phone</p>
      <h2>How many are playing?</h2>
      <p>Pick the number of players. Each one types their name when the phone reaches them.</p>
      <div class="stepper">
        <button class="step-btn" id="minus" ${n <= 3 ? 'disabled' : ''}>−</button>
        <span class="step-count">${n} players</span>
        <button class="step-btn" id="plus" ${n >= 12 ? 'disabled' : ''}>+</button>
      </div>
      ${n < 5 ? `<p class="center warn">⚠ Fewer than 5 players is for quick testing — the game won’t be much fun.</p>` : ''}
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
          <span class="option-sub">Each player snaps a selfie as their token. The app saves nothing — photos live only in this game, on this phone. (With a Replicate token below, each selfie is briefly uploaded to Replicate to paint the portrait.)</span></span>
      </label>
      <div class="token-field" id="token-field" ${s.selfie ? '' : 'hidden'}>
        <input class="name-input token-input" id="rep-token" type="text" name="rep-token" autocomplete="off"
          autocorrect="off" autocapitalize="off" spellcheck="false" data-1p-ignore data-lpignore="true"
          data-form-type="other" placeholder="Replicate API token (optional)" value="${esc(s.replicateToken)}" />
        <p class="token-note">Optional. Paints each selfie into a 16th-century portrait in the
          background. To do this, each selfie is sent to Replicate (your account) to generate the
          portrait — not used to train any model, and auto-deleted within an hour. Your token stays
          on this phone and is never saved. Leave blank for plain selfies that never leave the phone.</p>
      </div>
      <div class="spacer"></div>
      <button class="btn" id="deal">Deal roles</button>
    `, { targetSelector: '#deal' });

    app.querySelector('#minus').onclick = () => { if (s.count > 3) { s.count--; setup(); } };
    app.querySelector('#plus').onclick = () => { if (s.count < 12) { s.count++; setup(); } };
    app.querySelector('#suspense').onchange = (e) => { s.suspense = e.target.checked; };
    app.querySelector('#selfie').onchange = (e) => {
      s.selfie = e.target.checked;
      const tf = app.querySelector('#token-field');
      if (tf) tf.hidden = !s.selfie;
    };
    const tok = app.querySelector('#rep-token');
    if (tok) tok.oninput = (e) => { s.replicateToken = e.target.value; };
    app.querySelector('#deal').onclick = () => {
      // Dealt with placeholder seat names; each player renames on the first pass.
      G.players = Engine.dealRoles(defaultNames(s.count));
      G.players.forEach((p) => { p.named = false; });
      G.settings = { suspense: s.suspense, selfie: s.selfie, replicateToken: s.replicateToken.trim() };
      G.round = 0;
      reveal(0);
    };
  }

  function reveal(i) {
    if (i >= G.players.length) { G.round = 1; return roundIntro(); }
    const p = G.players[i];
    // First pass: name, then (if selfies are on) a token, then the role reveal.
    gate(p.name, () => nameStep(i), {
      sub: 'Hand it over before tapping — then type your name.',
      btn: 'I’ve got it',
    });
  }

  // State is keyed by name, so the typed name must be non-empty and unique.
  function nameStep(i) {
    const p = G.players[i];
    render(`
      <p class="eyebrow center" style="margin-top:6px">Player ${i + 1} of ${G.players.length}</p>
      <h2 class="center">What’s your name?</h2>
      <p class="center">This is just for you — keep your role secret.</p>
      <div class="spacer"></div>
      <input class="name-input" id="myname" placeholder="Your name" maxlength="14"
        aria-label="Your name" autocomplete="off" autocorrect="off" autocapitalize="words"
        spellcheck="false" data-1p-ignore data-lpignore="true" data-form-type="other" />
      <div class="spacer"></div>
      <button class="btn" id="go" disabled>Continue</button>
    `, { targetSelector: '#myname' });

    const input = app.querySelector('#myname');
    const go = app.querySelector('#go');
    const taken = (nm) => G.players.some((x, k) => k !== i && x.name.toLowerCase() === nm.toLowerCase());
    const refresh = () => { go.disabled = !input.value.trim() || taken(input.value.trim()); };
    input.oninput = refresh;
    input.focus();
    go.onclick = () => {
      let nm = input.value.trim();
      if (!nm || taken(nm)) return;
      // Carry lastHolder across the rename (the gate set it to the seat placeholder).
      if (G.lastHolder === p.name) G.lastHolder = nm;
      p.name = nm;
      p.named = true;
      G.settings.selfie ? captureSelfie(nm, () => revealCard(i)) : revealCard(i);
    };
  }

  // Crop the live camera frame to a centred square and mirror it like a real selfie.
  function grabSquare(video) {
    // 768px @ q0.92: more face pixels preserve likeness when sent for enhancement.
    const size = 768;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const vw = video.videoWidth || size, vh = video.videoHeight || size;
    const s = Math.min(vw, vh);
    ctx.translate(size, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, size, size);
    return c.toDataURL('image/jpeg', 0.92);
  }

  function captureSelfie(name, then) {
    // No camera -> fall back to an initials token.
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return then();
    render(`
      <p class="eyebrow center" style="margin-top:6px">Selfie · ${esc(name)}</p>
      <h2 class="center">${esc(name)}, take a selfie</h2>
      <p class="center">This becomes your token for the game. <strong>The app saves nothing</strong> — your photo
        lives only in this game, and is gone the moment it ends.</p>
      <div class="selfie-stage"><video id="cam" autoplay playsinline muted></video></div>
      <p class="center" id="camnote" hidden>Couldn’t open the camera — you can play with an initials token instead.</p>
      <button class="btn" id="snap" disabled>Take photo</button>
      <button class="btn secondary" id="skip">Skip — use initials</button>
    `, { targetSelector: '#snap' });

    const video = app.querySelector('#cam');
    const snap = app.querySelector('#snap');
    let stream = null;
    const stop = () => { if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; } };

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
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
    app.querySelector('#use').onclick = () => {
      const p = G.players.find((x) => x.name === name);
      if (p) { p.photo = photo; enhancePortrait(p); }
      then();
    };
    app.querySelector('#retake').onclick = () => captureSelfie(name, then);
  }

  // Fire-and-forget: any failure or missing token just leaves the raw selfie in place.
  function enhancePortrait(p) {
    const token = G.settings.replicateToken;
    if (!token || !p.photo) return;
    if (PORTRAIT_PROXY_URL.includes('YOUR-SUBDOMAIN')) {
      console.warn('Portrait enhancement skipped: PORTRAIT_PROXY_URL is not configured.');
      return;
    }
    p.enhancing = true;
    markEnhancing(p.name, true);
    const selfie = p.photo; // capture now in case the player retakes later
    const prompt = portraitPrompt(G.players.indexOf(p));

    // generation_mode 'fidelity' favours likeness over stylisation.
    runReplicate(token, {
      version: PORTRAIT_VERSION,
      input: {
        main_face_image: selfie,
        prompt,
        negative_prompt: PORTRAIT_NEGATIVE,
        identity_scale: IDENTITY_FIDELITY,
        generation_mode: 'fidelity',
        num_steps: FAST_STEPS,
        num_samples: 1,
        output_format: 'jpg',
      },
    })
      .then((pred) => {
        const url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
        if (pred.status !== 'succeeded' || !url) {
          return Promise.reject(new Error(pred.error || 'Enhancement did not succeed'));
        }
        return loadImage(url);
      })
      .then((dataUrl) => {
        // Ignore if the player retook the photo while generating.
        if (p.photo !== selfie) return;
        p.photo = dataUrl;
        swapAvatar(p.name, dataUrl);
      })
      .catch((err) => console.warn(`Portrait enhancement failed for ${p.name}:`, err))
      .finally(() => { p.enhancing = false; markEnhancing(p.name, false); });
  }

  // Create a prediction, then poll to a terminal state. `Prefer: wait` may return a
  // finished result in one shot when the model is warm.
  function runReplicate(token, createBody) {
    const headers = { 'Content-Type': 'application/json', 'X-Replicate-Token': token, 'Prefer': 'wait' };
    return fetch(PORTRAIT_PROXY_URL + '/v1/predictions', {
      method: 'POST', headers, body: JSON.stringify(createBody),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((pred) => pollPrediction(pred, token));
  }

  function pollPrediction(pred, token, tries = 30) {
    const done = (s) => s === 'succeeded' || s === 'failed' || s === 'canceled';
    if (done(pred.status) || tries <= 0) return pred;
    const getUrl = pred && pred.urls && pred.urls.get;
    if (!getUrl) return pred;
    // getUrl is an absolute api.replicate.com URL; route it back through the proxy.
    const proxied = PORTRAIT_PROXY_URL + new URL(getUrl).pathname;
    return new Promise((resolve) => setTimeout(resolve, 3000))
      .then(() => fetch(proxied, { headers: { 'X-Replicate-Token': token } }))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((next) => pollPrediction(next, token, tries - 1));
  }

  // Inline the generated image as a data URL so it survives Replicate's short-lived URL.
  function loadImage(url) {
    return fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('image ' + r.status))))
      .then((blob) => new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => reject(fr.error || new Error('read failed'));
        fr.readAsDataURL(blob);
      }));
  }

  // Live-patch the avatar on the current screen; later screens pick up p.photo on render().
  function swapAvatar(name, src) {
    const i = G.players.findIndex((x) => x.name === name);
    document.querySelectorAll(`.avatar[data-player="${i}"] .avatar-img`).forEach((img) => {
      img.src = src;
    });
  }
  function markEnhancing(name, on) {
    const i = G.players.findIndex((x) => x.name === name);
    document.querySelectorAll(`.avatar[data-player="${i}"]`).forEach((el) => {
      el.classList.toggle('enhancing', on);
    });
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

  function roundIntro() {
    render(`
      <div class="spacer"></div>
      <h2 class="center">Round ${G.round}</h2>
      <p class="center">${G.round === 1 ? pick(ROUND1_TEASERS) : 'Debate aloud — who do you suspect?'}</p>
      <div class="hourglass" style="--dur:${DEBATE_SECONDS}s">
        <span class="cap"></span>
        <span class="bulb top"><span class="sand"></span></span>
        <span class="bulb bottom"><span class="sand"></span></span>
        <span class="cap"></span>
      </div>
      <p class="center timer" id="timer">${fmt(DEBATE_SECONDS)}</p>
      <p class="center"><span class="pill">${aliveNames().length} still alive</span></p>
      <div class="spacer"></div>
      <button class="btn" id="next">Skip &amp; pass the phone around</button>
    `, { targetSelector: '#next' });

    // The clock is ambient; the button always proceeds.
    let left = DEBATE_SECONDS;
    const tEl = app.querySelector('#timer');
    const iv = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(iv);
        playChime();
        if (tEl) { tEl.textContent = 'Time’s up'; tEl.classList.add('up'); }
        const btn = app.querySelector('#next');
        if (btn) { btn.textContent = 'Pass the phone around'; btn.classList.add('target'); }
      } else if (tEl) {
        tEl.textContent = fmt(left);
      }
    }, 1000);

    app.querySelector('#next').onclick = () => {
      clearInterval(iv);
      // Resume beside whoever last held the phone.
      G.order = aliveOrderFrom(G.lastHolder);
      G.kills = []; G.protects = []; G.votes = []; G.revoted = false; G.runoff = null;
      turn(0);
    };
  }

  function turn(i) {
    if (i >= G.order.length) return resolveRound();
    gate(G.order[i].name, () => actFor(i));
  }

  // A private turn: vote, then the Assassin/Guardian take their secret action (step 2).
  function actFor(i) {
    const p = G.order[i];
    const specialLabel = p.role === 'assassin' ? 'Assassinate'
      : p.role === 'guardian' ? 'Protect' : null;
    const steps = specialLabel ? { labels: ['Vote', specialLabel], active: 0 } : null;
    const afterVote = specialLabel ? () => specialStep(i) : () => turn(i + 1);
    voteStep(i, afterVote, steps);
  }

  // The Assassin's strike or the Guardian's shield, after this player votes.
  function specialStep(i) {
    const p = G.order[i];
    if (p.role === 'assassin') {
      const targets = G.players.filter((x) => x.alive && x.role !== 'assassin').map((x) => x.name);
      chooseScene({
        steps: { labels: ['Vote', 'Assassinate'], active: 1 },
        emoji: '🗡️', eyebrow: `Round ${G.round} · ASSASSINATE`, title: 'Mark your victim', tint: 'kill',
        sub: 'Strike down one of the Virtuous tonight.', list: targets, cta: 'Assassinate', ctaEmoji: '🗡️',
        onPick: (name) => { G.kills.push({ by: p.name, target: name }); turn(i + 1); },
      });
    } else {
      const targets = alivePlayers().filter((x) => x.name !== p.name).map((x) => x.name);
      chooseScene({
        steps: { labels: ['Vote', 'Protect'], active: 1 },
        emoji: '🛡️', eyebrow: `Round ${G.round} · PROTECT`, title: 'Choose who to protect', tint: 'shield',
        sub: 'They survive any assassination this round.', list: targets, cta: 'Protect', ctaEmoji: '🛡️',
        onPick: (name) => { G.protects.push({ by: p.name, target: name }); turn(i + 1); },
      });
    }
  }

  // `next(i+1)` advances (special roles chain into their action step instead).
  function voteStep(i, next = (j) => turn(j), steps = null) {
    const p = G.order[i];
    // On a re-vote the choice is restricted to the tied players (the runoff).
    const pool = (G.revoted && G.runoff && G.runoff.length) ? G.runoff : aliveNames();
    const options = pool.filter((n) => n !== p.name);
    chooseScene({
      steps,
      emoji: '🗳️', eyebrow: `Round ${G.round}${G.revoted ? ' · RE-VOTE' : ''} · VOTE`, tint: 'vote',
      title: `${p.name}, who do you vote to banish?`,
      sub: G.revoted ? 'Runoff — vote only between the tied players.'
        : 'You only cast a vote — whoever the majority picks is banished.',
      list: options, cta: 'Cast vote', ctaEmoji: '🗳️',
      onPick: (name) => { G.votes.push({ voter: p.name, choice: name }); next(i + 1); },
    });
  }

  // A first split vote triggers a runoff; a second split forces a random banishment.
  function resolveRound() {
    const plan = Engine.resolveRound({ players: G.players, kills: G.kills,
      protects: G.protects, votes: G.votes, forceBanish: G.revoted });
    // Deaths applied later, at each elimination's own reveal (see markDead).
    G.res = plan;
    return revealVotesIntro();
  }

  // Decided only after every ballot is revealed, so the reveal isn't spoiled.
  function afterVoteReveal() {
    if (!G.res.banished && !G.revoted && G.votes.some((v) => v.choice)) {
      return deadlockIntro();
    }
    return showBanish();
  }

  // First vote tied: debate again, then re-collect votes only between the tied players.
  function deadlockIntro() {
    G.revoted = true;
    G.runoff = Engine.tally(G.votes.map((v) => v.choice)).leaders.slice();
    G.order = aliveOrderFrom(G.lastHolder);
    G.votes = [];
    const tied = G.runoff.map((n) => `<strong>${esc(n)}</strong>`).join(' & ');
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">⚖️</div>
      <h2 class="center">The vote is deadlocked</h2>
      <p class="center">${tied} are tied. Debate once more, then vote again — only between them.</p>
      <p class="center"><span class="pill">If it's still a tie, fate decides</span></p>
      <div class="spacer"></div>
      <button class="btn" id="next">Vote again</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => revoteTurn(0);
  }

  // Re-vote pass: collect votes only, skipping the already-done role actions.
  function revoteTurn(i) {
    if (i >= G.order.length) return resolveRound();
    gate(G.order[i].name, () => voteStep(i, revoteTurn));
  }

  // Suspense mode picks the card pass-around over the all-at-once list.
  function revealVotesIntro() {
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">🗳️</div>
      <h2 class="center">The ballots are in</h2>
      <p class="center">${G.settings.suspense
        ? 'Pass the phone around once more — each player flips their own ballot for the table.'
        : 'Now everyone reveals who they voted for.'}</p>
      <div class="spacer"></div>
      <button class="btn" id="next">${G.settings.suspense ? 'Begin the reveal' : 'Reveal the votes'}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => (G.settings.suspense ? ballotReveal(0) : voteRevealAll());
  }

  function voteRevealAll() {
    const rows = G.votes.map((v) => `
      <div class="vote-row">${gAvatar(v.voter)}<span class="vr-name">${esc(v.voter)}</span>
        <span class="vr-arrow">→</span>${gAvatar(v.choice)}<span class="vr-name">${esc(v.choice)}</span></div>`).join('');
    render(`
      <p class="eyebrow center" style="margin-top:6px">The ballots</p>
      <h2 class="center">Who voted for whom</h2>
      <div class="vote-list">${rows}</div>
      <div class="spacer"></div>
      <button class="btn" id="next">See the result</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => afterVoteReveal();
  }

  // Card pass-around: each voter flips their own ballot for the table.
  function ballotReveal(i) {
    if (i >= G.votes.length) return afterVoteReveal();
    gate(G.votes[i].voter, () => ballotCard(i));
  }

  function ballotCard(i) {
    const { voter, choice } = G.votes[i];
    const last = i + 1 >= G.votes.length;
    render(`
      <p class="eyebrow center" style="margin-top:6px">Ballot ${i + 1} of ${G.votes.length}</p>
      <h2 class="center">${esc(voter)}’s vote</h2>
      <div class="reveal">
        <div class="flip vote" id="flip">
          <div class="face back"><div class="glyph">🗳️</div><div class="role-name">Tap to reveal</div></div>
          <div class="face front">
            <div class="vote-arrow">voted to banish</div>
            <div class="vote-line"><span class="vote-choice">${esc(choice)}</span>${gAvatar(choice)}</div>
          </div>
        </div>
      </div>
      <button class="btn" id="next" disabled>${last ? 'See the result' : 'Show everyone, then pass on'}</button>
    `, { targetSelector: '#flip' });
    const flip = app.querySelector('#flip');
    const next = app.querySelector('#next');
    flip.onclick = () => {
      if (flip.classList.contains('flipped')) return;
      flip.classList.add('flipped');
      next.disabled = false; next.classList.add('target');
    };
    next.onclick = () => { if (!next.disabled) ballotReveal(i + 1); };
  }

  // The just-eliminated player flips a face-down card to reveal their own role.
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
        <h2 class="center">No majority</h2>
        <p class="center">The vote is split — the table couldn’t agree, so no one is banished.</p>
        <div class="spacer"></div>
        <button class="btn" id="next">Then, under cover of dark…</button>
      `, { targetSelector: '#next' });
      app.querySelector('#next').onclick = () => resolveAssassination();
      return;
    }
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">${r.tieBroken ? '🎲' : '⚖️'}</div>
      <h2 class="center">${r.tieBroken ? 'Still deadlocked — fate decides' : 'The majority has decided'}</h2>
      <div class="dawn-portrait fade-banished">${gAvatar(r.banished)}</div>
      ${r.tieBroken
        ? `<p class="center">The table tied again. With no majority, lots are drawn — and they fall on <strong>${esc(r.banished)}</strong>, who is banished.</p>`
        : `<p class="center"><strong>${esc(r.banished)}</strong> is banished.</p>`}
      <div class="spacer"></div>
      <button class="btn" id="next">Pass the phone to ${esc(r.banished)}</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => {
      markDead(r.banished, 'banished'); // commit now so later screens stay grey
      gate(r.banished, () =>
        revealRoleCard(r.banished, { eyebrow: `Banished · round ${G.round}`, title: `${r.banished}, reveal yourself` }, afterBanishReveal));
    };
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
        <div class="dawn-portrait fade-slain">${gAvatar(r.victim)}</div>
        <p class="center"><strong>${esc(r.victim)}</strong> was found slain in the night.</p>
        <div class="spacer"></div>
        <button class="btn" id="next">Pass the phone to ${esc(r.victim)}</button>
      `, { targetSelector: '#next' });
      app.querySelector('#next').onclick = () => {
        markDead(r.victim, 'killed'); // commit now so later screens stay grey
        gate(r.victim, () =>
          revealRoleCard(r.victim, { eyebrow: `Slain · round ${G.round}`, title: `${r.victim}, reveal yourself` }, proceedAfterRound));
      };
      return;
    }
    let body;
    if (r.outcome === 'saved') {
      body = `<div class="dawn-portrait">${gAvatar(r.victim)}</div>
        <p class="center">A blade flashed at <strong>${esc(r.victim)}</strong>…
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
    const isWinner = (p) => (v ? p.role !== 'assassin' : p.role === 'assassin');
    const isAssassin = (p) => p.role === 'assassin';
    // Winners first, then any remaining assassin, then the rest by recency of death.
    const sorted = G.players.slice().sort((a, b) => {
      const rank = (p) => isWinner(p) ? 0 : isAssassin(p) ? 1 : 2;
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      // Newest death first; the living (no deathOrder) last.
      const da = a.deathOrder || 0, db = b.deathOrder || 0;
      return db - da;
    });
    // Card tint: gold = winner, red = killed, dark = banished.
    const tintOf = (p) => isWinner(p) ? 'win' : p.fate === 'killed' ? 'kill' : p.fate === 'banished' ? 'vote' : '';
    const roster = sorted.map((p) => `
      <div class="pick selected pick-tint-${tintOf(p) || 'none'}">
        ${gAvatar(p.name)}
        <span class="name">${esc(p.name)}${isWinner(p) ? ' 👑' : ''}</span>
        <span class="role-tag" style="color:${roleColor(p.role)}">${ROLE_INFO[p.role].label}</span>
      </div>`).join('');
    render(`
      <div class="scene-emoji" style="margin-top:10px">${v ? '🍷' : '🗡️'}</div>
      <p class="eyebrow center">Game over</p>
      <h1 class="center" style="color:${v ? 'var(--green)' : 'var(--red)'};font-size:30px">
        ${v ? 'THE VIRTUOUS WIN' : 'THE ASSASSINS WIN'}</h1>
      <p class="center">${v ? 'Every Assassin has been brought to justice.' : 'The Assassins now rule. Trust no one.'}</p>
      <div class="pick-grid">${roster}</div>
      <div class="spacer"></div>
      <button class="btn" id="again">Play Again</button>
    `, { targetSelector: '#again' });
    app.querySelector('#again').onclick = () => scenes.title();
  }

  window.Game = { start: setup };
})();
