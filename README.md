# Links de Ónix

Página de los links que comparte Ónix. Se publica en **https://onixmusic.pages.dev** (Cloudflare Pages, se despliega
solo al subir a `main`) y también en `morosdev.github.io` (GitHub Pages: ahí siguen funcionando los links viejos
`/c/?v=…&t=…&a=…`).

- `/c/<id de YouTube>`: canción. `functions/c/[id].js` pide título y artista a YouTube (oEmbed) y arma la página con
  su tarjeta (og:*) para WhatsApp.
- `/o/<código>`: canción OCULTA. El código es el id revuelto (`desocultar` en `lib/onix.js`, igual que en la app).
  La página y la tarjeta (`oculta.jpg`) no dicen cuál es.
- `lib/onix.js`: lo compartido (páginas, oEmbed, código de las ocultas).
- `404.html`: en GitHub Pages manda `/c/<id>` y `/o/<código>` a onixmusic.pages.dev.

- `.well-known/assetlinks.json`: le dice a Android que estos links son de la app `dev.moros.onix`
  (huella SHA-256 del certificado con que se firma la APK; es pública, no es la llave).
- `c/index.html`: lo que ve quien NO tiene Ónix (qué canción es). Con Ónix instalado ni se ve.
- `.nojekyll`: para que GitHub Pages publique la carpeta `.well-known`.

Si algún día cambia la llave de firma, hay que cambiar la huella aquí.
