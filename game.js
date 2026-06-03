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

  // ----- Period-portrait enhancement (optional, bring-your-own Replicate token) -----
  // The browser can't call api.replicate.com directly (no CORS), so requests go through
  // a thin transparent CORS proxy that forwards whatever Replicate API path we hit and
  // injects the player's token. Deploy your own and point this at it — see worker/README.md.
  // The proxy stores no secrets. This is the proxy ORIGIN; we append the API path below.
  const PORTRAIT_PROXY_URL = 'https://secret-traitor-replicate.hamuyrodrigo.workers.dev';
  // PuLID: identity-preserving generation. Like InstantID, it extracts a face
  // embedding from the selfie and LOCKS onto it while generating a fresh scene around
  // it — so the costume/background can change freely without the face drifting — but
  // it's a single fast model that stays warm (no cold-start), unlike InstantID's heavy
  // multi-model pipeline. Replicate auto-deletes inputs/outputs within ~1 hour.
  // It's a *community* model, run by version id. We POST { version, input } to
  // /v1/predictions through the proxy. PORTRAIT_MODEL is just a human label for which
  // model PORTRAIT_VERSION pins; bump the version from the model's Replicate page.
  const PORTRAIT_MODEL = 'bytedance/pulid'; // label only — requests use the version
  const PORTRAIT_VERSION = '43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0';
  // The likeness dial (per PuLID's schema). Higher = closer to the real person, less
  // "imagination"; lower = more painterly but drifts. Default is 0.8 (max 5).
  //   IDENTITY_FIDELITY -> identity_scale ("ID scale") — the main face-likeness lever.
  //     Push UP if faces look off. Paired with generation_mode 'fidelity' below.
  const IDENTITY_FIDELITY = 1.0;    // identity_scale (likeness)
  // Speed: PuLID is fast by design. num_steps default is 4; cfg_scale near 1 is the
  // fastest setting (range [1, 1.5]). We generate a single sample (num_samples: 1).
  const FAST_STEPS = 4;             // num_steps

  // Each player gets a randomly assigned 16th-century character so portraits look
  // distinct at a glance — different role, dress, setting and palette per person.
  // Each entry bundles attire + a fitting backdrop so the look stays coherent.
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

  // Deterministic pick per player index so re-renders stay stable and two adjacent
  // players rarely collide (the offset spreads them across the list).
  function characterFor(index) {
    return PORTRAIT_CHARACTERS[((index * 7) % PORTRAIT_CHARACTERS.length + PORTRAIT_CHARACTERS.length) % PORTRAIT_CHARACTERS.length];
  }

  // PuLID generates a fresh scene around the locked face, so the prompt is a
  // positive *description* of the whole portrait (not an edit instruction). The face
  // itself comes from the embedding — we just describe the costume, framing and style.
  function portraitPrompt(index) {
    return 'A 16th-century Renaissance oil portrait of ' + characterFor(index) + '. ' +
      'Head-and-shoulders close-up, soft warm lighting, muted period colour, ' +
      'painted in the style of an old master, fine detail.';
  }

  // Steers the generation away from the failure modes that read as "not them" —
  // distortion, extra/altered faces, cartoonish output.
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

  // Mutable game state. `lastHolder` = who held the phone last, so the next round's
  // pass resumes from the seat beside them (i.e. beside whoever was just revealed).
  const G = { setup: null, players: [], settings: {}, round: 0, lastHolder: null,
              order: [], kills: [], protects: [], votes: [], res: null };

  // --- small helpers ---
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const gColor = (i) => COLORS[((i % COLORS.length) + COLORS.length) % COLORS.length];
  const gInitials = (name) => name.trim().slice(0, 2).toUpperCase() || '??';
  // A dead player's avatar carries a fate class: banished -> greyed out, killed -> red tint.
  const fateClass = (p) => !p || p.alive ? '' : p.fate === 'killed' ? ' slain' : ' banished';
  function gAvatar(name) {
    const i = G.players.findIndex((p) => p.name === name);
    const p = i >= 0 ? G.players[i] : null;
    const fate = fateClass(p);
    if (p && p.photo) {
      // data-player + .enhancing let the background portrait swap in live (see swapAvatar).
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
  // A 2-step "Vote › Special" progress hint for roles that act after voting.
  // steps = { labels: ['Vote', 'Protect'], active: 0 }.
  function stepperHTML(steps) {
    if (!steps) return '';
    const cells = steps.labels.map((label, i) => {
      const cls = i < steps.active ? 'done' : i === steps.active ? 'active' : '';
      return `<span class="step ${cls}"><span class="step-num">${i + 1}</span>${esc(label)}</span>`;
    }).join('<span class="step-sep">›</span>');
    return `<div class="stepper">${cells}</div>`;
  }

  function chooseScene({ emoji, eyebrow, title, sub, list, onPick, skipLabel, cta = 'Confirm', ctaEmoji, steps }) {
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
      <div class="pick-grid">${cells}</div>
      <button class="btn${ctaEmoji ? ' has-emoji' : ''}" id="confirm" disabled>${ctaEmoji
        ? `<span class="cta-side"><span class="emoji">${ctaEmoji}</span></span><span class="cta-label">${esc(cta)}</span><span class="cta-side"></span>`
        : esc(cta)}</button>
      ${skipLabel ? `<button class="btn secondary" id="skip">${esc(skipLabel)}</button>` : ''}
      <div class="spacer"></div>
    `);
    // Select a player first, then tap the CTA to commit. The CTA stays disabled
    // until a pick is made so nobody can advance without choosing.
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

  // ---------- Setup ----------
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
      // Players are dealt with placeholder seat names; each one renames themselves
      // when the phone reaches them on the first pass (see nameStep / reveal).
      G.players = Engine.dealRoles(defaultNames(s.count));
      G.players.forEach((p) => { p.named = false; });
      G.settings = { suspense: s.suspense, selfie: s.selfie, replicateToken: s.replicateToken.trim() };
      G.round = 0;
      reveal(0);
    };
  }

  // ---------- Secret role reveal (pass & play) ----------
  function reveal(i) {
    if (i >= G.players.length) { G.round = 1; return roundIntro(); }
    const p = G.players[i];
    // First pass: the player hasn't named themselves yet, so the gate refers to the
    // seat ("the next player") rather than a name. They type their name, then (if
    // selfies are on) snap a token, then see their role.
    gate(p.name, () => nameStep(i), {
      sub: 'Hand it over before tapping — then type your name.',
      btn: 'I’ve got it',
    });
  }

  // Each player types their own name when the phone reaches them. The typed name
  // replaces the seat placeholder everywhere (state is keyed by name), so it must be
  // non-empty and unique — we fall back to / disambiguate against the seat label.
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
      // Keep lastHolder pointing at this player after the rename (the gate set it to
      // the seat placeholder), so the round's pass resumes from the right seat.
      if (G.lastHolder === p.name) G.lastHolder = nm;
      p.name = nm;
      p.named = true;
      // With selfie avatars on, the player snaps their token before seeing their role.
      G.settings.selfie ? captureSelfie(nm, () => revealCard(i)) : revealCard(i);
    };
  }

  // ---------- Selfie avatars (optional; photos stay in memory only) ----------
  // Crop the live camera frame to a centred square and mirror it like a real selfie.
  function grabSquare(video) {
    // Capture large + high-quality: Kontext preserves likeness far better with
    // more face pixels to anchor to, so we keep a 768px square at q0.92. The token
    // is displayed small, but the full-res copy is what gets sent for enhancement.
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
    // No camera available -> quietly fall back to an initials token.
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

  // Fire-and-forget: if a Replicate token was given, paint the selfie into a period
  // portrait in the background and swap it in when ready. The raw selfie is always the
  // fallback — any failure, timeout, or missing token simply leaves it untouched.
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

    // PuLID input: `main_face_image` is the face to lock onto; identity_scale controls
    // how hard the identity is enforced (see the dial above). generation_mode 'fidelity'
    // favours likeness over stylisation; num_samples: 1 keeps us to a single output.
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
        // Ignore if the player retook the photo while we were generating.
        if (p.photo !== selfie) return;
        p.photo = dataUrl;
        swapAvatar(p.name, dataUrl);
      })
      .catch((err) => console.warn(`Portrait enhancement failed for ${p.name}:`, err))
      .finally(() => { p.enhancing = false; markEnhancing(p.name, false); });
  }

  // ---- Replicate client (talks to the transparent CORS proxy) ----
  // The proxy forwards whatever /v1/* path we hit and injects the token, so the
  // client owns the full contract: create a prediction, then poll it to a terminal
  // state. `Prefer: wait` lets the create call return a finished result in one shot
  // when the model is warm; otherwise we poll the prediction's own get URL.
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
    // The get URL is an absolute api.replicate.com URL; route it back through the proxy.
    const proxied = PORTRAIT_PROXY_URL + new URL(getUrl).pathname;
    return new Promise((resolve) => setTimeout(resolve, 3000))
      .then(() => fetch(proxied, { headers: { 'X-Replicate-Token': token } }))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((next) => pollPrediction(next, token, tries - 1));
  }

  // Fetch the generated image and inline it as a data URL so the avatar keeps working
  // even after Replicate's short-lived output URL expires.
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

  // Live-patch any avatar <img> for this player on the current screen (later scenes
  // pick up the new p.photo automatically on their next render()).
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
      G.kills = []; G.protects = []; G.votes = []; G.revoted = false;
      turn(0);
    };
  }

  function turn(i) {
    if (i >= G.order.length) return resolveRound();
    gate(G.order[i].name, () => actFor(i));
  }

  // The current player's private turn. Everyone votes first; the Assassin and
  // Guardian then take their secret action (a 2-step "Vote › Special" hint shows
  // this progression up top). Plain Virtuous players just vote.
  function actFor(i) {
    const p = G.order[i];
    // The label for this role's special step, or null if they have none.
    const specialLabel = p.role === 'assassin' ? 'Assassinate'
      : p.role === 'guardian' ? 'Protect' : null;
    const steps = specialLabel ? { labels: ['Vote', specialLabel], active: 0 } : null;
    // After voting: special roles do their action (step 2), others move on.
    const afterVote = specialLabel ? () => specialStep(i) : () => turn(i + 1);
    voteStep(i, afterVote, steps);
  }

  // The Assassin's strike or the Guardian's shield — taken after this player votes.
  function specialStep(i) {
    const p = G.order[i];
    if (p.role === 'assassin') {
      const targets = G.players.filter((x) => x.alive && x.role !== 'assassin').map((x) => x.name);
      chooseScene({
        steps: { labels: ['Vote', 'Assassinate'], active: 1 },
        emoji: '🗡️', eyebrow: `Round ${G.round} · ASSASSINATE`, title: 'Mark your victim',
        sub: 'Strike down one of the Virtuous tonight.', list: targets, cta: 'Assassinate', ctaEmoji: '🗡️',
        onPick: (name) => { G.kills.push({ by: p.name, target: name }); turn(i + 1); },
      });
    } else {
      const targets = alivePlayers().filter((x) => x.name !== p.name).map((x) => x.name);
      chooseScene({
        steps: { labels: ['Vote', 'Protect'], active: 1 },
        emoji: '🛡️', eyebrow: `Round ${G.round} · PROTECT`, title: 'Choose who to protect',
        sub: 'They survive any assassination this round.', list: targets, cta: 'Protect', ctaEmoji: '🛡️',
        onPick: (name) => { G.protects.push({ by: p.name, target: name }); turn(i + 1); },
      });
    }
  }

  // The vote screen. `next(i+1)` advances; for special roles it instead chains into
  // their action step. `steps` shows the 2-step hint (omitted for plain Virtuous).
  function voteStep(i, next = (j) => turn(j), steps = null) {
    const p = G.order[i];
    const options = G.players.filter((x) => x.alive && x.name !== p.name).map((x) => x.name);
    chooseScene({
      steps,
      emoji: '🗳️', eyebrow: `Round ${G.round}${G.revoted ? ' · RE-VOTE' : ''} · VOTE`,
      title: `${p.name}, who do you vote to banish?`,
      sub: 'You only cast a vote — whoever the majority picks is banished.', list: options, cta: 'Cast vote', ctaEmoji: '🗳️',
      onPick: (name) => { G.votes.push({ voter: p.name, choice: name }); next(i + 1); },
    });
  }

  // ---------- Resolution ----------
  // Draws aren't allowed. On a first split vote the table debates and votes again;
  // a second split is broken by a random banishment (forceBanish on the re-vote).
  function resolveRound() {
    const plan = Engine.resolveRound({ players: G.players, kills: G.kills,
      protects: G.protects, votes: G.votes, forceBanish: G.revoted });
    // First-round split with at least one vote cast: deadlock -> re-vote.
    if (!plan.banished && !G.revoted && G.votes.some((v) => v.choice)) {
      return deadlockIntro();
    }
    // Apply the deaths the plan decided (banishment always; assassination only if it landed).
    if (plan.banished) { const p = G.players.find((x) => x.name === plan.banished); if (p) { p.alive = false; p.fate = 'banished'; } }
    if (plan.outcome === 'killed') { const p = G.players.find((x) => x.name === plan.victim); if (p) { p.alive = false; p.fate = 'killed'; } }
    G.res = plan;
    return revealVotesIntro();
  }

  // The first vote tied. Announce the deadlock, let the table debate again, then
  // re-collect everyone's vote (kills/protects already chosen this round stand).
  function deadlockIntro() {
    G.revoted = true;
    G.order = aliveOrderFrom(G.lastHolder);
    G.votes = [];
    render(`
      <div class="spacer"></div>
      <div class="scene-emoji">⚖️</div>
      <h2 class="center">The vote is deadlocked</h2>
      <p class="center">No one has a majority. Debate once more — then pass the phone around to vote again.</p>
      <p class="center"><span class="pill">If it's still a tie, fate decides</span></p>
      <div class="spacer"></div>
      <button class="btn" id="next">Vote again</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => revoteTurn(0);
  }

  // Re-vote pass: only collect votes, skipping the role actions (already done).
  function revoteTurn(i) {
    if (i >= G.order.length) return resolveRound();
    gate(G.order[i].name, () => voteStep(i, revoteTurn));
  }

  // After everyone has voted, a reveal phase shows who voted for whom — never a
  // silent anonymous tally. Suspense mode chooses the card pass-around vs all-at-once.
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

  // All ballots on one screen.
  function voteRevealAll() {
    const rows = G.votes.map((v) => `
      <div class="vote-row">${gAvatar(v.voter)}<span class="vr-name">${esc(v.voter)}</span>
        <span class="vr-arrow">→</span>${gAvatar(v.choice)}<span class="vr-name">${esc(v.choice)}</span></div>`).join('');
    render(`
      <p class="eyebrow center" style="margin-top:6px">The ballots</p>
      <h2 class="center">Who voted for whom</h2>
      <div class="vote-list">${rows}</div>
      <div class="spacer"></div>
      <button class="btn" id="next">See the verdict</button>
    `, { targetSelector: '#next' });
    app.querySelector('#next').onclick = () => showBanish();
  }

  // Card pass-around: hand the phone to each voter, who flips their own ballot
  // to reveal it to the table — just like the secret-role reveal at the start.
  function ballotReveal(i) {
    if (i >= G.votes.length) return showBanish();
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
      <button class="btn" id="next" disabled>${last ? 'See the verdict' : 'Show everyone, then pass on'}</button>
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
      <div class="dawn-portrait">${gAvatar(r.banished)}</div>
      ${r.tieBroken
        ? `<p class="center">The table tied again. With no majority, lots are drawn — and they fall on <strong>${esc(r.banished)}</strong>, who is banished.</p>`
        : `<p class="center"><strong>${esc(r.banished)}</strong> is banished.</p>`}
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
        <div class="dawn-portrait slain">${gAvatar(r.victim)}</div>
        <p class="center"><strong>${esc(r.victim)}</strong> was found slain in the night.</p>
        <div class="spacer"></div>
        <button class="btn" id="next">Pass the phone to ${esc(r.victim)}</button>
      `, { targetSelector: '#next' });
      app.querySelector('#next').onclick = () => gate(r.victim, () =>
        revealRoleCard(r.victim, { eyebrow: `Slain · round ${G.round}`, title: `${r.victim}, reveal yourself` }, proceedAfterRound));
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
