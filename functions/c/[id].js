import { idValido, datosDe, paginaCancion } from '../../lib/onix.js';

// https://onixmusic.pages.dev/c/<id de YouTube>
export async function onRequestGet({ params, request, next }) {
  const id = params.id;
  if (!idValido(id)) return next();
  return paginaCancion(request.url, id, await datosDe(id));
}
