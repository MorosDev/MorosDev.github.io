// GET https://onixmusic.pages.dev/api/estado — diagnóstico: ¿la página ve el KV PLAYLISTS?
export async function onRequestGet({ env }) {
  const kv = !!env.PLAYLISTS;
  let prueba = 'sin probar';
  if (kv) {
    try {
      await env.PLAYLISTS.put('_prueba', String(Date.now()));
      prueba = (await env.PLAYLISTS.get('_prueba')) ? 'guarda y lee bien' : 'guardó pero no leyó';
    } catch (e) {
      prueba = 'error: ' + (e && e.message);
    }
  }
  return new Response(JSON.stringify({ kv, prueba, variables: Object.keys(env || {}) }, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
