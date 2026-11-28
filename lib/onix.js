// Compartido por /c/<id> (canción) y /o/<código> (canción oculta). Lo corre Cloudflare Pages al abrir el link,
// para que WhatsApp y compañía vean una tarjeta (og:*) sin que el título vaya escrito en el link.

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Deshace el código de una canción oculta (lo mismo que `Compartir.desocultar` en la app). */
export function desocultar(codigo) {
  let s = '';
  for (let i = 0; i < codigo.length; i++) {
    const k = ALFABETO.indexOf(codigo[i]);
    if (k < 0) return null;
    s += ALFABETO[(k - 23 - i * 7 + 64 * 64) % 64];
  }
  return s.split('').reverse().join('');
}

export const idValido = (id) => /^[A-Za-z0-9_-]{6,}$/.test(id || '');

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Título y artista desde YouTube (oEmbed). null si no se pudo. */
export async function datosDe(id) {
  if (id.startsWith('sc_')) return null;
  try {
    const r = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://music.youtube.com/watch?v=' + id),
      { cf: { cacheTtl: 86400, cacheEverything: true } });
    if (!r.ok) return null;
    const j = await r.json();
    const artista = String(j.author_name || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
    const titulo = String(j.title || '').replace(/\s*[(\[][^)\]]*(official|oficial|video|audio|lyric|letra|visuali[sz]er)[^)\]]*[)\]]/gi, '').trim();
    return { titulo, artista: artista.split(/,| & | feat\.? | ft\.? | x /i)[0].trim() };
  } catch (e) {
    return null;
  }
}

const FUENTES = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">';

const BASE = `
  :root { --fondo: #000; --superficie: #0E0E0E; --borde: #262626; --texto: #DEDEDE; --tenue: #8A8A8A; --rojo: #B3202A; }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--fondo); color: var(--texto); font-family: Manrope, sans-serif; min-height: 100vh; min-height: 100dvh;
         display: flex; align-items: center; justify-content: center; padding: 16px; }
  main { width: 100%; max-width: 360px; text-align: center; position: relative; }
  .marca { letter-spacing: 0.4em; font-size: 13px; color: var(--tenue); margin-bottom: 32px; padding-left: 0.4em; }
  h1 { font-size: 22px; font-weight: 600; line-height: 1.3; }
  .artista { color: var(--tenue); font-size: 15px; margin-top: 4px; }
  .nota { color: var(--tenue); font-size: 13px; margin-top: 32px; line-height: 1.5; }
  a.boton { display: inline-block; margin-top: 16px; padding: 12px 24px; border: 1px solid #3A3A3A;
            border-radius: 12px; color: var(--texto); text-decoration: none; font-weight: 500; font-size: 14px; }
`;

/** El botón "Abrir en Ónix": le pide a Android abrir la app con este mismo link. */
const SCRIPT_ABRIR = `<script>
  document.getElementById('abrir').href =
    'intent://' + location.host + location.pathname + location.search + '#Intent;scheme=https;package=dev.moros.onix;end';
</script>`;

function respuesta(html) {
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}

/** Página de una canción normal: portada, título, artista. */
export function paginaCancion(url, id, datos) {
  const titulo = datos?.titulo || 'Una canción';
  const artista = datos?.artista || '';
  const portada = id.startsWith('sc_') ? '' : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return respuesta(`<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(titulo)}${artista ? ' · ' + esc(artista) : ''} · Ónix</title>
<meta property="og:site_name" content="Ónix">
<meta property="og:type" content="music.song">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="♫ ${esc(titulo)}">
<meta property="og:description" content="${artista ? esc(artista) + ' · ' : ''}Escúchala en Ónix">
${portada ? `<meta property="og:image" content="${portada}"><meta property="og:image:width" content="480"><meta property="og:image:height" content="360">` : ''}
<meta name="theme-color" content="#000000">
${FUENTES}
<style>${BASE}
  .portada { width: 100%; aspect-ratio: 1; border-radius: 12px; border: 1px solid var(--borde);
             background: var(--superficie) center / cover no-repeat; margin-bottom: 24px; }
  /* Las portadas de YouTube vienen 4:3 con franjas negras: se recorta al cuadro de en medio. */
  .portada { background-size: 133%; }
</style></head>
<body><main>
  <div class="marca">ÓNIX</div>
  <div class="portada" ${portada ? `style="background-image:url('${portada}')"` : ''}></div>
  <h1>${esc(titulo)}</h1>
  ${artista ? `<div class="artista">${esc(artista)}</div>` : ''}
  <p class="nota">Esta canción se abre con Ónix.</p>
  <a class="boton" id="abrir" href="#">Abrir en Ónix</a>
</main>
${SCRIPT_ABRIR}
</body></html>`);
}

/** Página de una canción oculta: no dice cuál es (ni a WhatsApp). */
export function paginaOculta(url, origen) {
  return respuesta(`<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Una canción oculta · Ónix</title>
<meta property="og:site_name" content="Ónix">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="♫ Canción oculta">
<meta property="og:description" content="Alguien te dejó una canción. Solo se revela al escucharla.">
<meta property="og:image" content="${origen}/oculta.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#000000">
${FUENTES}
<style>${BASE}
  body { background: radial-gradient(120% 80% at 50% 45%, #0B0708 0%, #000 70%); overflow: hidden; }
  .niebla { position: fixed; inset: -20%; pointer-events: none; opacity: .5;
            background: radial-gradient(40% 30% at 30% 40%, rgba(120,120,120,.10), transparent 70%),
                        radial-gradient(35% 25% at 70% 60%, rgba(90,40,48,.14), transparent 70%);
            animation: niebla 18s ease-in-out infinite alternate; }
  @keyframes niebla { to { transform: translate(4%, -3%) scale(1.08); } }
  .velo { width: 100%; aspect-ratio: 1; border-radius: 12px; border: 1px solid var(--borde); margin-bottom: 24px;
          display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;
          background: radial-gradient(70% 70% at 50% 50%, #120C0D 0%, #050505 80%); }
  .velo::before { content: ''; position: absolute; inset: 0; opacity: .35;
          background: repeating-radial-gradient(circle at 50% 50%, transparent 0 7px, rgba(255,255,255,.025) 7px 8px); }
  .ojo { width: 46%; position: relative; animation: latido 4.8s ease-in-out infinite; }
  @keyframes latido { 0%, 100% { opacity: .78; } 50% { opacity: 1; } }
  h1 { letter-spacing: .02em; }
  .susurro { color: var(--tenue); font-size: 14px; margin-top: 8px; line-height: 1.5; }
  @media (prefers-reduced-motion: reduce) { .niebla, .ojo { animation: none; } }
</style></head>
<body><div class="niebla"></div><main>
  <div class="marca">ÓNIX</div>
  <div class="velo">
    <svg class="ojo" viewBox="0 0 120 80" aria-hidden="true">
      <path d="M4 40 C 30 6, 90 6, 116 40 C 90 74, 30 74, 4 40 Z" fill="none" stroke="#8A8A8A" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M50 26 L 76 40 L 50 54 Z" fill="#B3202A" stroke="#B3202A" stroke-width="3" stroke-linejoin="round"/>
    </svg>
  </div>
  <h1>Una canción oculta</h1>
  <p class="susurro">Alguien te dejó una canción.<br>Solo se revela al escucharla.</p>
  <a class="boton" id="abrir" href="#">Abrir en Ónix</a>
</main>
${SCRIPT_ABRIR}
</body></html>`);
}
