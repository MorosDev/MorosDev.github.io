import { desocultar, idValido, paginaOculta } from '../../lib/onix.js';

// https://onixmusic.pages.dev/o/<código> — canción oculta: la página no dice cuál es.
export async function onRequestGet({ params, request, next }) {
  if (!idValido(desocultar(params.id || ''))) return next();
  return paginaOculta(request.url, new URL(request.url).origin);
}
