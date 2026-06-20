/* Secret Traitor — Replicate CORS proxy (Cloudflare Worker). See README.md.
 *
 * Exists because the browser can't call api.replicate.com directly (no CORS headers).
 * A stateless, transparent reverse proxy: it forwards any /v1/* path/method/body
 * verbatim, injecting the caller's token and adding CORS — the client owns the whole
 * Replicate contract (predictions, polling, models, …).
 *
 * The token arrives per-request via `X-Replicate-Token` (preferred) or `Authorization:
 * Bearer …`; with none, it falls back to the optional REPLICATE_API_TOKEN secret.
 *
 * Security: it forwards anything. Caller-supplied tokens are "bring your own key", but
 * a configured REPLICATE_API_TOKEN lets anonymous callers spend YOUR credits — add an
 * Origin allowlist or rate limiting before exposing it with that fallback set.
 */

const REPLICATE_ORIGIN = 'https://api.replicate.com';

// Open CORS; echo the requested headers so the X-Replicate-Token preflight passes.
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

    // X-Replicate-Token, a passed-through Authorization header, or the secret fallback.
    const auth = request.headers.get('X-Replicate-Token')
      || request.headers.get('Authorization')
      || (env && env.REPLICATE_API_TOKEN);
    if (!auth) {
      return json({ error: 'Missing Replicate token (send X-Replicate-Token or Authorization)' }, 401, cors);
    }
    // Accept a raw token or an already-formed "Bearer …" value.
    const authorization = /^Bearer\s/i.test(auth) ? auth : `Bearer ${auth}`;

    // Forward the path + query onto api.replicate.com; guard /v1/ so it can't be
    // turned into an open redirect to another host.
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/v1/')) {
      return json({ error: 'Path must begin with /v1/ (the Replicate API path to forward)' }, 400, cors);
    }
    const target = REPLICATE_ORIGIN + url.pathname + url.search;

    // Forward method, body and the Prefer header verbatim; the client owns Prefer: wait,
    // the body shape, and polling.
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

    // Return Replicate's response verbatim, with CORS added.
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
