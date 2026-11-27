// Letras K y D del logo, armadas con formas básicas.
KD.makeKD = function (mat) {
  const g = new THREE.Group(), d = 0.4;
  const box = (w, h, x, y, rz = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, 0); m.rotation.z = rz; m.castShadow = true; return m; };
  // K
  const K = new THREE.Group(), a = Math.atan2(0.7, 0.65), L = Math.hypot(0.65, 0.7);
  K.add(box(0.3, 1.4, 0.15, 0.7), box(L, 0.3, 0.625, 1.05, a), box(L, 0.3, 0.625, 0.35, -a));
  // D (forma extruida con hueco)
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(0.4, 0); s.absarc(0.4, 0.7, 0.7, -Math.PI / 2, Math.PI / 2, false); s.lineTo(0, 1.4); s.lineTo(0, 0);
  const h = new THREE.Path();
  h.moveTo(0.3, 0.3); h.lineTo(0.4, 0.3); h.absarc(0.4, 0.7, 0.4, -Math.PI / 2, Math.PI / 2, false); h.lineTo(0.3, 1.1); h.lineTo(0.3, 0.3);
  s.holes.push(h);
  const geo = new THREE.ExtrudeGeometry(s, {depth: d, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 24});
  geo.translate(0, 0, -d / 2);
  const D = new THREE.Mesh(geo, mat); D.castShadow = true;
  K.position.set(-1.15, -0.7, 0); D.position.set(0.15, -0.7, 0);
  g.add(K, D); return g;
};

// Escala + inclinación (cursiva) + posición en z para un grupo de letras
KD.italic = function (g, s, tz) {
  g.matrixAutoUpdate = false;
  g.matrix.set(s, 0.22 * s, 0, -0.05 * s,
               0, s, 0, 0,
               0, 0, s * 0.6, tz,
               0, 0, 0, 1);
};
