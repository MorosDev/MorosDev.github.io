import { guardar } from '../../lib/playlists.js';

// POST https://onixmusic.pages.dev/api/playlist  →  { codigo }
export async function onRequestPost({ request, env }) {
  return guardar(request, env);
}
