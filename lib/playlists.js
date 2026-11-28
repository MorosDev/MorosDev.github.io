// Playlists compartidas de Ónix: la app manda la lista (POST /api/playlist), se guarda en Cloudflare KV (variable
// PLAYLISTS) con un código corto, y el link es /p/<código>. La app la lee con GET /api/p/<código>.
import { esc, FUENTES, BASE, SCRIPT_ABRIR, respuesta, idValido } from './onix.js';

const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const MAX_CANCIONES = 300;
const MAX_BYTES = 200 * 1024;

export const codigoValido = (c) => /^[A-Za-z0-9]{6,12}$/.test(c || '');

function codigoNuevo(largo = 7) {
  const azar = crypto.getRandomValues(new Uint8Array(largo));
  return Array.from(azar, (b) => LETRAS[b % LETRAS.length]).join('');
}

function json(cuerpo, estado = 200) {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

const texto = (t, max) => String(t ?? '').slice(0, max);

/** Limpia lo que manda la app: solo lo que sirve y con tamaños sanos. */
export function limpiar(p) {
  if (!p || typeof p !== 'object' || !Array.isArray(p.c)) return null;
  const canciones = p.c.slice(0, MAX_CANCIONES)
    .filter((x) => x && idValido(x.v))
    .map((x) => ({ v: texto(x.v, 600), t: texto(x.t, 200), a: texto(x.a, 200), d: Math.max(0, Math.min(36000, Number(x.d) || 0)) }));
  if (!canciones.length) return null;
  return { n: texto(p.n, 120) || 'Playlist', o: !!p.o, c: canciones, f: Date.now() };
}

export async function guardar(request, env) {
  if (!env.PLAYLISTS) return json({ error: 'Falta conectar el KV PLAYLISTS' }, 503);
  const crudo = await request.text();
  if (crudo.length > MAX_BYTES) return json({ error: 'Demasiado grande' }, 413);
  let datos;
  try { datos = limpiar(JSON.parse(crudo)); } catch (e) { datos = null; }
  if (!datos) return json({ error: 'Playlist vacía o mal formada' }, 400);
  let codigo = codigoNuevo();
  for (let i = 0; i < 3 && (await env.PLAYLISTS.get(codigo)); i++) codigo = codigoNuevo(8);
  await env.PLAYLISTS.put(codigo, JSON.stringify(datos));
  return json({ codigo });
}

export async function leer(env, codigo) {
  if (!env.PLAYLISTS || !codigoValido(codigo)) return null;
  const t = await env.PLAYLISTS.get(codigo);
  return t ? JSON.parse(t) : null;
}

const portadaDe = (v) => (v.startsWith('sc_') ? '' : `https://i.ytimg.com/vi/${v}/hqdefault.jpg`);

/** La página de una playlist (normal: portada de 4, nombre y lista; oculta: misteriosa, sin decir qué trae). */
export function paginaPlaylist(url, origen, p) {
  const n = p.c.length;
  const titulo = p.o ? 'Una playlist oculta' : p.n;
  const descripcion = p.o ? `${n} canciones que solo se revelan al escucharlas` : `${n} canciones · Escúchala en Ónix`;
  const imagen = p.o ? `${origen}/oculta.jpg` : portadaDe(p.c[0].v);
  const cuatro = p.c.slice(0, 4).map((x) => portadaDe(x.v));
  const lista = p.o
    ? p.c.map((_, i) => `<li><span class="num">${i + 1}</span><span class="velo"></span></li>`).join('')
    : p.c.map((x, i) => `<li><span class="num">${i + 1}</span><span class="txt"><b>${esc(x.t)}</b><i>${esc(x.a)}</i></span></li>`).join('');
  return respuesta(`<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(titulo)} · Ónix</title>
<meta property="og:site_name" content="Ónix">
<meta property="og:type" content="music.playlist">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="♫ ${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
${imagen ? `<meta property="og:image" content="${imagen}">` : ''}
${p.o ? '<meta name="twitter:card" content="summary_large_image">' : ''}
<meta name="theme-color" content="#000000">
${FUENTES}
<style>${BASE}
  body { align-items: flex-start; padding-top: 48px; }
  .collage { width: 100%; aspect-ratio: 1; border-radius: 12px; border: 1px solid var(--borde); overflow: hidden;
             display: grid; grid-template-columns: 1fr 1fr; background: var(--superficie); margin-bottom: 24px; }
  .collage div { background: #120A0B center / 133% no-repeat; }
  .oculta { width: 100%; aspect-ratio: 1; border-radius: 12px; border: 1px solid var(--borde); margin-bottom: 24px;
            background: radial-gradient(70% 70% at 50% 50%, #120C0D 0%, #050505 80%); display: flex; align-items: center; justify-content: center; }
  .oculta svg { width: 46%; }
  ul { list-style: none; padding: 0; margin: 24px 0 0; text-align: left; }
  li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #141414; }
  .num { color: #6A4A4E; width: 24px; text-align: right; font-size: 13px; }
  .txt { display: flex; flex-direction: column; min-width: 0; }
  .txt b { font-weight: 500; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .txt i { font-style: normal; color: var(--tenue); font-size: 12px; }
  .velo { height: 10px; width: 60%; border-radius: 5px; background: #1E1416; }
</style></head>
<body><main>
  <div class="marca">ÓNIX</div>
  ${p.o
    ? `<div class="oculta"><svg viewBox="0 0 120 80" aria-hidden="true"><path d="M4 40 C 30 6, 90 6, 116 40 C 90 74, 30 74, 4 40 Z" fill="none" stroke="#8A8A8A" stroke-width="2.5"/><path d="M50 26 L 76 40 L 50 54 Z" fill="#B3202A" stroke="#B3202A" stroke-width="3" stroke-linejoin="round"/></svg></div>`
    : `<div class="collage">${[0, 1, 2, 3].map((i) => `<div style="${cuatro[i] ? `background-image:url('${cuatro[i]}')` : ''}"></div>`).join('')}</div>`}
  <h1>${esc(titulo)}</h1>
  <div class="artista">${n} canciones</div>
  <a class="boton" id="abrir" href="#">Abrir en Ónix</a>
  <ul>${lista}</ul>
</main>
${SCRIPT_ABRIR}
</body></html>`);
}
