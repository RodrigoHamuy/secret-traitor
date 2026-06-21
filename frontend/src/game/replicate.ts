// Optional portrait enhancement (bring-your-own Replicate token). The browser can't
// call api.replicate.com directly (no CORS), so requests go through a token-injecting
// proxy origin — see worker/README.md. PuLID locks onto the selfie's face and paints a
// scene around it.

// Overridable at build time so per-PR previews can point at their own backend Worker.
const PORTRAIT_PROXY_URL =
  import.meta.env?.VITE_PORTRAIT_PROXY_URL || 'https://secret-traitor-replicate.hamuyrodrigo.workers.dev';
const PORTRAIT_VERSION = '43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0';
const IDENTITY_FIDELITY = 1.0;
const FAST_STEPS = 4;

// One 16th-century character per player, attire + backdrop bundled so the look coheres.
const PORTRAIT_CHARACTERS = [
  'a stern judge in black judicial robes and a flat velvet cap, seated before dark oak panelling',
  'a priest in a black cassock and white clerical collar, in a candlelit stone chapel',
  'a humble villager in a coarse linen shirt and brown woollen cap, against a rustic plaster wall',
  'a noblewoman in a richly embroidered gown and pearl headdress, before a deep crimson drape',
  'a merchant in a fur-trimmed coat and gold chain, in a wood-panelled counting house',
  'a soldier in burnished steel armour and a red sash, against a stormy battlefield sky',
  "a scholar in a dark scholar's robe holding spectacles, in a library of leather books",
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

// *7 spreads adjacent players so they rarely collide.
function characterFor(index: number): string {
  const n = PORTRAIT_CHARACTERS.length;
  return PORTRAIT_CHARACTERS[(((index * 7) % n) + n) % n];
}

function portraitPrompt(index: number): string {
  return (
    'A 16th-century Renaissance oil portrait of ' + characterFor(index) + '. ' +
    'Head-and-shoulders close-up, soft warm lighting, muted period colour, ' +
    'painted in the style of an old master, fine detail.'
  );
}

const PORTRAIT_NEGATIVE =
  'different person, distorted face, deformed, disfigured, extra face, multiple faces, ' +
  'plastic skin, cartoon, anime, 3d render, blurry, lowres';

interface Prediction {
  status?: string;
  output?: string | string[];
  error?: string;
  urls?: { get?: string };
}

function runReplicate(token: string, createBody: unknown): Promise<Prediction> {
  const headers = { 'Content-Type': 'application/json', 'X-Replicate-Token': token, Prefer: 'wait' };
  return fetch(PORTRAIT_PROXY_URL + '/v1/predictions', {
    method: 'POST', headers, body: JSON.stringify(createBody),
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((pred: Prediction) => pollPrediction(pred, token));
}

function pollPrediction(pred: Prediction, token: string, tries = 30): Promise<Prediction> {
  const done = (s?: string) => s === 'succeeded' || s === 'failed' || s === 'canceled';
  if (done(pred.status) || tries <= 0) return Promise.resolve(pred);
  const getUrl = pred.urls?.get;
  if (!getUrl) return Promise.resolve(pred);
  const proxied = PORTRAIT_PROXY_URL + new URL(getUrl).pathname;
  return new Promise((resolve) => setTimeout(resolve, 3000))
    .then(() => fetch(proxied, { headers: { 'X-Replicate-Token': token } }))
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
    .then((next: Prediction) => pollPrediction(next, token, tries - 1));
}

// Inline the generated image as a data URL so it survives Replicate's short-lived URL.
function loadImage(url: string): Promise<string> {
  return fetch(url)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('image ' + r.status))))
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = () => reject(fr.error || new Error('read failed'));
          fr.readAsDataURL(blob);
        }),
    );
}

// Fire-and-forget: enhance `selfie` for the player at `index`, then hand the finished
// data URL to `onDone`. Any failure or missing token resolves to null (keep the selfie).
export function enhancePortrait(
  token: string,
  selfie: string,
  index: number,
): Promise<string | null> {
  if (!token || !selfie) return Promise.resolve(null);
  return runReplicate(token, {
    version: PORTRAIT_VERSION,
    input: {
      main_face_image: selfie,
      prompt: portraitPrompt(index),
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
    .catch((err) => {
      console.warn('Portrait enhancement failed:', err);
      return null;
    });
}
