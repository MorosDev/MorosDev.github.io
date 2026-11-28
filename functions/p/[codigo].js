import { leer, paginaPlaylist } from '../../lib/playlists.js';

// https://onixmusic.pages.dev/p/<código> — playlist compartida (normal u oculta).
export async function onRequestGet({ params, request, env, next }) {
  const p = await leer(env, params.codigo);
  if (!p) return next();
  return paginaPlaylist(request.url, new URL(request.url).origin, p);
}
