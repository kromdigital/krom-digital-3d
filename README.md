# Krom Digital 3D

Escenas 3D del personaje de Krom Digital hechas con HTML, CSS y JavaScript (Three.js). Sin instalar nada y sin pagar.

## Cómo abrirlo
1. Abre esta carpeta en VS Code (`File > Open Folder`).
2. Abre `index.html` con el navegador (doble clic) o, mejor, con la extensión **Live Server** (clic derecho > *Open with Live Server*), que recarga al guardar.
3. Necesita internet, porque Three.js se carga desde un CDN. Usa Chrome o Edge.
4. Elige una escena, pulsa **Grabar** y descarga el `.webm`. Para otras redes, conviértelo gratis con CapCut o FFmpeg.

## Estructura
```
index.html              página y lista de scripts
css/style.css           estilos de los botones
js/config.js            tamaño, colores y textos de marca
js/character/           logo KD y personaje (cuerpo, cabeza, brazos)
js/gestures.js          gestos: saludar, asentir, negar, apuntar, celebrar...
js/core/                escenario (cámara, luces) y texto 3D
js/scenes/              una escena por archivo (intro, promo, tip)
js/main.js              botones y grabación
```

## Crear una escena nueva
1. Copia `js/scenes/intro.js` como `js/scenes/mi-escena.js` y cambia `KD.scenes.intro` por `KD.scenes.miEscena`.
2. Agrega `<script src="js/scenes/mi-escena.js"></script>` en `index.html`, antes de `main.js`.
3. Edita `timeline` (qué gesto y cuándo), `setup` (objetos y textos) y `update` (animación por cuadro).
4. Recarga: la escena aparece en el menú.

## Crear un gesto nuevo
En `js/gestures.js` agrega una línea. Ejemplo:
```js
G.dudar = (r, lt, w) => { r.to(r.head, 'z', Math.sin(lt * 5) * 0.2, w); r.to(r.armR.el, 'x', -1.2, w); };
```
Aparece solo en el menú **Probar gesto**, y lo usas en cualquier `timeline` con `gesture: 'dudar'`.

Partes que puedes mover: `r.root`, `r.head`, `r.armL.sh`, `r.armL.el`, `r.armR.sh`, `r.armR.el` (L y R son lados de la pantalla). Los ángulos van en radianes. Arriba de `character.js` está la convención de signos.

## Ideas siguientes
Más props (escritorio, teléfono, taza) con cajas y cilindros en `setup`; fondos por temporada; caminar y bailar con piernas articuladas.
