/* Secret Traitor — Replicate proxy (Cloudflare Worker)
 *
 * Why this exists: the browser can't call api.replicate.com directly because
 * Replicate sends no CORS headers, so a static site (GitHub Pages) gets blocked.
 * This Worker is a thin, STATELESS pass-through: it adds CORS headers and forwards
 * the player's own token to Replicate's official-model prediction endpoint.
 *
 * It stores NO secrets and keeps NO data — the token arrives in the request body
 * from the player and is used only for that one forwarded call. Replicate itself
 * auto-deletes prediction inputs/outputs within ~1 hour.
 *
 * Deploy with `wrangler deploy` (see README.md), then set PORTRAIT_PROXY_URL in
 * game.js to the resulting *.workers.dev URL.
 */

// Open CORS: any origin may call this Worker. That's acceptable here because the
// Worker holds no secrets of its own — every request must carry the *caller's* own
// Replicate token, so an open policy just means "anyone with their own token can use
// it." If abuse/request volume ever matters, swap this back to an allowlist.
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request) {
    const cors = corsHeaders();

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors);
    }

    const { token, model, input } = body || {};
    if (!token || typeof token !== 'string') {
      return json({ error: 'Missing Replicate token' }, 400, cors);
    }
    if (!model || !/^[\w.-]+\/[\w.-]+$/.test(model)) {
      return json({ error: 'Missing or invalid model' }, 400, cors);
    }
    if (!input || typeof input !== 'object') {
      return json({ error: 'Missing input' }, 400, cors);
    }

    // Forward to Replicate's official-model endpoint. `Prefer: wait` keeps the
    // request open until the prediction finishes (up to 60s) so the client gets
    // the result in one round-trip.
    const upstream = await fetch(
      `https://api.replicate.com/v1/models/${model}/predictions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait',
        },
        body: JSON.stringify({ input }),
      },
    );

    let pred;
    try {
      pred = await upstream.json();
    } catch {
      return json({ error: 'Upstream returned non-JSON', status: upstream.status }, 502, cors);
    }

    // If the model didn't finish within the wait window, poll until it does.
    if (pred && (pred.status === 'starting' || pred.status === 'processing')) {
      pred = await poll(pred, token);
    }

    return json(pred, upstream.ok ? 200 : upstream.status, cors);
  },
};

// Poll the prediction's get URL until it reaches a terminal state (cap ~90s).
async function poll(pred, token) {
  const getUrl = pred?.urls?.get;
  if (!getUrl) return pred;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(getUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    const next = await res.json().catch(() => null);
    if (!next) return pred;
    pred = next;
    if (pred.status === 'succeeded' || pred.status === 'failed' || pred.status === 'canceled') {
      return pred;
    }
  }
  return pred;
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
