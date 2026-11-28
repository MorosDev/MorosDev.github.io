import { leer } from '../../../lib/playlists.js';

// GET https://onixmusic.pages.dev/api/p/<código>  →  la playlist en JSON (la usa la app)
export async function onRequestGet({ params, env }) {
  const p = await leer(env, params.codigo);
  if (!p) return new Response(JSON.stringify({ error: 'No existe' }), { status: 404, headers: { 'content-type': 'application/json' } });
  return new Response(JSON.stringify(p), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
