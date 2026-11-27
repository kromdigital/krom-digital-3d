// Plano 3D con texto de varios colores, p. ej.:
//   KD.textPlane([{t:'KROM ', c:'#d6202f'}, {t:'DIGITAL', c:'#fff'}], 4.4, 150)
// Si el texto no cabe en el lienzo, la letra se reduce sola (px es el tamaño máximo).
KD.textPlane = function (parts, width = 4.4, px = 150) {
  const W = 1024, MARGEN = 64;
  const c = document.createElement('canvas'); c.width = W; c.height = 256;
  const g = c.getContext('2d');
  const fuente = s => `900 ${s}px "Arial Black", Impact, Arial, sans-serif`;
  const medir = () => { const ws = parts.map(p => g.measureText(p.t).width); return {ws, total: ws.reduce((a, b) => a + b, 0)}; };

  g.textBaseline = 'middle';
  g.font = fuente(px);
  let m = medir();
  if (m.total > W - MARGEN) {                       // no cabe: achica la letra
    px = Math.floor(px * (W - MARGEN) / m.total);
    g.font = fuente(px);
    m = medir();
  }
  let x = (W - m.total) / 2;
  parts.forEach((p, i) => { g.fillStyle = p.c; g.fillText(p.t, x, 128); x += m.ws[i]; });

  return new THREE.Mesh(new THREE.PlaneGeometry(width, width / 4),
    new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(c), transparent: true}));
};