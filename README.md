# Links de Ónix

Página mínima para que los links que comparte Ónix (`https://morosdev.github.io/c/?v=…`) abran la app directo.

- `.well-known/assetlinks.json`: le dice a Android que estos links son de la app `dev.moros.onix`
  (huella SHA-256 del certificado con que se firma la APK; es pública, no es la llave).
- `c/index.html`: lo que ve quien NO tiene Ónix (qué canción es). Con Ónix instalado ni se ve.
- `.nojekyll`: para que GitHub Pages publique la carpeta `.well-known`.

Si algún día cambia la llave de firma, hay que cambiar la huella aquí.
