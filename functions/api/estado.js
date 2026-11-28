import { kvDe } from '../../lib/playlists.js';

// GET https://onixmusic.pages.dev/api/estado — diagnóstico: ¿la página ve el KV de las playlists?
export async function onRequestGet({ env }) {
  const kv = kvDe(env);
  let prueba = 'sin probar';
  if (kv) {
    try {
      await kv.put('_prueba', String(Date.now()));
      prueba = (await kv.get('_prueba')) ? 'guarda y lee bien' : 'guardó pero no leyó';
    } catch (e) {
      prueba = 'error: ' + (e && e.message);
    }
  }
  // Los nombres entre corchetes, para ver espacios de más.
  return new Response(JSON.stringify({ kv: !!kv, prueba, nombres: Object.keys(env || {}).map((k) => '[' + k + ']') }, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
