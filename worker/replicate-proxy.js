/* Secret Traitor — Replicate CORS proxy (Cloudflare Worker)
 *
 * Why this exists: the browser can't call api.replicate.com directly because
 * Replicate sends no CORS headers, so a static site (GitHub Pages) gets blocked.
 *
 * What it is: a thin, STATELESS, transparent reverse proxy to api.replicate.com.
 * Whatever path, method, query and body the client sends, it forwards verbatim —
 * it injects the caller's token as the Authorization header and adds CORS headers
 * on the way back. It knows nothing about predictions, polling, versions or models;
 * the CLIENT owns the entire Replicate contract. That makes this a generic proxy to
 * ANY Replicate endpoint (create a prediction, poll it, list models, etc.).
 *
 *   Client request                          ->  Forwarded to
 *   POST  {proxy}/v1/predictions                POST  https://api.replicate.com/v1/predictions
 *   GET   {proxy}/v1/predictions/{id}           GET   https://api.replicate.com/v1/predictions/{id}
 *   POST  {proxy}/v1/models/{owner}/{name}/predictions  -> same path on api.replicate.com
 *
 * The caller's token arrives per-request in the `X-Replicate-Token` header (preferred)
 * or a standard `Authorization: Bearer …` header, and is used only for that one
 * forwarded call. If the caller sends NO token, the Worker falls back to the optional
 * REPLICATE_API_TOKEN secret binding (set via `wrangler secret put` / the deploy
 * workflow). Replicate itself auto-deletes prediction inputs/outputs within ~1 hour.
 *
 * Security note: because this forwards anything, anyone can drive any Replicate API
 * call through it. With a caller-supplied token that's just "bring your own key." But
 * if REPLICATE_API_TOKEN is configured, an anonymous caller spends YOUR Replicate
 * credits — so if you set the fallback secret, also add an Origin allowlist or rate
 * limiting below before exposing the Worker publicly.
 *
 * Deploy with `wrangler deploy` (see README.md), then set PORTRAIT_PROXY_URL in
 * game.js to the resulting *.workers.dev URL.
 */

const REPLICATE_ORIGIN = 'https://api.replicate.com';

// Open CORS: any origin may call this Worker (it holds no secrets of its own).
// We echo the requested headers so a browser preflight for X-Replicate-Token passes.
function corsHeaders(request) {
  const reqHeaders = request.headers.get('Access-Control-Request-Headers');
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': reqHeaders || 'Content-Type, Authorization, X-Replicate-Token, Prefer',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // The caller's token: X-Replicate-Token, or a passed-through Authorization header.
    // If the caller brings none, fall back to the Worker's REPLICATE_API_TOKEN secret.
    const auth = request.headers.get('X-Replicate-Token')
      || request.headers.get('Authorization')
      || (env && env.REPLICATE_API_TOKEN);
    if (!auth) {
      return json({ error: 'Missing Replicate token (send X-Replicate-Token or Authorization)' }, 401, cors);
    }
    // Accept a raw token or an already-formed "Bearer …" value.
    const authorization = /^Bearer\s/i.test(auth) ? auth : `Bearer ${auth}`;

    // Map the incoming path (+query) onto api.replicate.com, untouched. We only guard
    // that it stays under the Replicate API surface — no open redirect to other hosts.
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/')) {
      return json({ error: 'Path must begin with /v1/ (the Replicate API path to forward)' }, 400, cors);
    }
    const target = REPLICATE_ORIGIN + url.pathname + url.search;

    // Forward method, body and the Prefer header verbatim; the client decides whether
    // to send `Prefer: wait`, what body shape to use, and how/whether to poll.
    const forwardHeaders = { 'Authorization': authorization };
    const contentType = request.headers.get('Content-Type');
    if (contentType) forwardHeaders['Content-Type'] = contentType;
    const prefer = request.headers.get('Prefer');
    if (prefer) forwardHeaders['Prefer'] = prefer;

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    let upstream;
    try {
      upstream = await fetch(target, {
        method: request.method,
        headers: forwardHeaders,
        body: hasBody ? request.body : undefined,
        // Streaming a request body through fetch requires duplex: 'half'.
        ...(hasBody ? { duplex: 'half' } : {}),
      });
    } catch (err) {
      return json({ error: 'Upstream fetch failed', detail: String(err) }, 502, cors);
    }

    // Return Replicate's response verbatim (status + body), just with CORS added.
    const respHeaders = new Headers(cors);
    const upstreamType = upstream.headers.get('Content-Type');
    if (upstreamType) respHeaders.set('Content-Type', upstreamType);
    return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
