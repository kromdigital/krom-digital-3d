// Fondos seleccionables. Para crear uno nuevo, agrega una entrada aquí y aparece en el menú "Fondo".
//   title:    nombre en el menú
//   color:    color de fondo (si falta, usa el de la escena)
//   fog:      false = sin neblina
//   hideFloor: true = oculta el suelo oscuro del escenario
//   build(S): devuelve un THREE.Group con los objetos del fondo (opcional)

// Herramientas para armar fondos con formas básicas
function kit() {
  const g = new THREE.Group();
  const mat = (c, m = 0.1, r = 0.8) => new THREE.MeshStandardMaterial({color: c, metalness: m, roughness: r});
  const glow = c => new THREE.MeshBasicMaterial({color: c});                       // material que "brilla" (no recibe sombra)
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  const sala = (piso, pared, zoclo) => {                                            // piso, pared al fondo, zoclo y franja roja
    add(B(24, 0.1, 16), mat(piso, 0.05, 0.55), 0, -0.03, 2);
    add(B(24, 10, 0.2), mat(pared), 0, 5, -5.1);
    add(B(24, 0.25, 0.12), mat(zoclo), 0, 0.125, -4.95);
    add(B(24, 0.08, 0.05), glow(KD.config.TIE), 0, 0.6, -4.97);
  };
  const luz = (c, i, x, y, z) => { const l = new THREE.PointLight(c, i, 20); l.position.set(x, y, z); g.add(l); };
  return {g, mat, glow, B, add, sala, luz};
}

KD.backgrounds = {
  auto:  {title: 'Fondo de la escena'},
  azul:  {title: 'Azul marino', color: 0x0d2a66},
  gris:  {title: 'Gris claro', color: 0x8d949e},

  // ===== OFICINA 1: escritorio con ventana de noche =====
  oficina: {
    title: 'Oficina 1 · Escritorio',
    color: 0x1a2230, fog: false, hideFloor: true,
    build() {
      const {g, mat, glow, B, add, sala, luz} = kit();
      sala(0x3b2d27, 0x3d4658, 0x1f2430);

      // Ventana de noche con ciudad
      add(B(7, 3.8, 0.05), glow(0x1c3f7a), 0, 4.3, -4.97);
      const alturas = [1.0, 1.6, 0.8, 1.9, 1.2, 0.9, 1.7, 1.1, 0.7];
      alturas.forEach((h, i) => {
        const x = -3.2 + i * 0.8;
        add(B(0.7, h, 0.05), glow(0x0f1a30), x, 2.4 + h / 2, -4.93);
        for (let j = 0; j < 3; j++) if ((i * 7 + j * 3) % 4 !== 1) add(B(0.08, 0.08, 0.05), glow(0xffd36b), x - 0.15 + j * 0.15, 2.5 + (j + 1) * h / 4, -4.9);
      });
      const marco = mat(0xd7dbe0, 0.2, 0.5);
      add(B(0.08, 3.8, 0.09), marco, -1.2, 4.3, -4.9); add(B(0.08, 3.8, 0.09), marco, 1.2, 4.3, -4.9);
      add(B(7.2, 0.1, 0.12), marco, 0, 2.35, -4.88); add(B(7.2, 0.1, 0.12), marco, 0, 6.25, -4.9);

      // Escritorio con laptop y taza
      add(B(5.4, 0.14, 1.4), mat(0x6b4a34, 0.1, 0.5), 0, 1.5, -1.7);
      [-1, 1].forEach(s => add(B(0.15, 1.43, 1.2), mat(0x2a2f3a), s * 2.55, 0.715, -1.7));
      add(B(1.2, 0.06, 0.8), mat(0x9aa0a8, 0.6, 0.4), -1.6, 1.6, -1.7);
      const pantalla = add(B(1.2, 0.8, 0.05), mat(0x1a1a20), -1.6, 2.0, -2.07); pantalla.rotation.x = -0.2;
      const brillo = add(new THREE.PlaneGeometry(1.1, 0.7), glow(0x7fb2ff), -1.6, 2.0, -2.04); brillo.rotation.x = -0.2;
      add(new THREE.CylinderGeometry(0.17, 0.15, 0.3, 24), mat(KD.config.TIE, 0.2, 0.4), 1.8, 1.72, -1.6);

      // Planta
      add(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 24), mat(0xb4552f), 2.3, 0.3, -0.6);
      [[2.3, 1.0, -0.6, 0.5], [2.05, 1.35, -0.5, 0.4], [2.55, 1.3, -0.7, 0.42]].forEach(([x, y, z, r]) => add(new THREE.SphereGeometry(r, 16, 12), mat(0x2f7d4a), x, y, z));

      luz(0xffe2b8, 0.9, 0, 7, -1);
      return g;
    }
  },

  // ===== OFICINA 2: sala de juntas con pantalla de resultados =====
  oficina2: {
    title: 'Oficina 2 · Sala de juntas',
    color: 0x161b24, fog: false, hideFloor: true,
    build() {
      const {g, mat, glow, B, add, sala, luz} = kit();
      sala(0x2b2f38, 0x4a5260, 0x1b1f27);

      // Pantalla de presentación con gráfica de barras
      add(B(6.4, 3.6, 0.12), mat(0x0c0d11, 0.3, 0.4), 0, 4.3, -4.95);
      add(B(6.0, 3.2, 0.04), glow(0x0e2a5a), 0, 4.3, -4.87);
      [0.8, 1.2, 1.0, 1.7, 2.2, 2.6].forEach((h, i) => add(B(0.45, h, 0.04), glow(i % 2 ? 0xffffff : KD.config.TIE), -2.1 + i * 0.84, 2.8 + h / 2, -4.84));

      // Mesa de juntas
      add(B(5.6, 0.14, 1.6), mat(0x3a2a22, 0.3, 0.3), 0, 1.5, -1.9);
      [-1.6, 1.6].forEach(x => add(B(0.6, 1.43, 0.9), mat(0x20242d), x, 0.715, -1.9));
      add(B(0.8, 0.03, 0.55), mat(0xf2f2f2), -1.5, 1.585, -1.8).rotation.y = 0.3;           // hojas
      add(new THREE.CylinderGeometry(0.17, 0.15, 0.3, 24), mat(KD.config.TIE, 0.2, 0.4), 1.6, 1.72, -1.7);   // taza
      add(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 16), mat(0x4aa8ff, 0.1, 0.2), 0.9, 1.8, -2.1);          // botella

      // Sillas detrás de la mesa
      [-1.5, 0, 1.5].forEach(x => {
        add(B(0.75, 0.12, 0.75), mat(0x1c2029, 0.2, 0.6), x, 1.05, -3.2);
        add(B(0.75, 0.95, 0.1), mat(0x1c2029, 0.2, 0.6), x, 1.55, -3.6);
        add(B(0.08, 0.55, 0.08), mat(0x777c86, 0.7, 0.3), x, 0.7, -3.2);
      });

      // Lámpara de pie
      add(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 12), mat(0x2a2f3a), -2.4, 1.7, -0.8);
      add(new THREE.CylinderGeometry(0.3, 0.45, 0.5, 20), glow(0xffe2b8), -2.4, 3.6, -0.8);
      luz(0xffd9a0, 0.8, -2.4, 3.3, -0.4);
      luz(0xdfe8ff, 0.8, 0, 7, -1);
      return g;
    }
  },

  // ===== OFICINA 3: recepción con el logo de neón =====
  oficina3: {
    title: 'Oficina 3 · Recepción',
    color: 0x14171f, fog: false, hideFloor: true,
    build() {
      const {g, mat, glow, B, add, sala, luz} = kit();
      sala(0x6b5a4c, 0x242a36, 0x12151b);

      // Letrero del logo en la pared: disco negro, aro rojo y KD
      add(new THREE.CircleGeometry(3.0, 48), new THREE.MeshBasicMaterial({color: KD.config.TIE, transparent: true, opacity: 0.14}), 0, 4.6, -4.99);
      add(new THREE.CylinderGeometry(1.9, 1.9, 0.15, 64), mat(0x050507, 0.6, 0.2), 0, 4.6, -4.95).rotation.x = Math.PI / 2;
      add(new THREE.TorusGeometry(1.83, 0.08, 16, 80), glow(KD.config.TIE), 0, 4.6, -4.85);
      const kd = KD.makeKD(glow(KD.config.LOGO)); KD.italic(kd, 1.1, 0.12);
      kd.matrix.premultiply(new THREE.Matrix4().makeTranslation(0, 4.6, -4.9)); g.add(kd);

      // Repisas con libros a los lados
      [-1, 1].forEach(s => [2.2, 3.4].forEach((y, k) => {
        add(B(1.1, 0.08, 0.4), mat(0x6b4a34), s * 2.75, y, -4.75);
        [0x4aa8ff, KD.config.TIE, 0xf2f2f2].forEach((c, j) => { const h = 0.4 + ((j + k) % 2) * 0.15; add(B(0.18, h, 0.28), mat(c), s * 2.75 - 0.3 + j * 0.3, y + 0.04 + h / 2, -4.75); });
      }));

      // Alfombra circular con borde rojo
      add(new THREE.CylinderGeometry(2.7, 2.7, 0.03, 48), mat(0x1b2230, 0.1, 0.9), 0, 0.05, 0.3);
      add(new THREE.TorusGeometry(2.7, 0.03, 8, 64), glow(KD.config.TIE), 0, 0.07, 0.3).rotation.x = Math.PI / 2;

      // Mostrador de recepción con tableta y campana
      add(B(4.2, 1.2, 1.0), mat(0xe9e9ee, 0.1, 0.5), 0, 0.6, -1.9);
      add(B(4.2, 0.08, 0.02), glow(KD.config.TIE), 0, 0.95, -1.39);
      add(B(4.5, 0.08, 1.2), mat(0x15181f, 0.4, 0.3), 0, 1.24, -1.9);
      add(B(0.1, 0.4, 0.1), mat(0x20242d), -1.3, 1.48, -2.0);
      const tableta = add(B(0.9, 0.55, 0.05), mat(0x1a1a20), -1.3, 1.85, -2.0); tableta.rotation.x = -0.15;
      const pant = add(B(0.8, 0.45, 0.02), glow(0x7fb2ff), -1.3, 1.85, -1.97); pant.rotation.x = -0.15;
      add(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 24), mat(0xd4af37, 0.8, 0.3), 1.4, 1.32, -1.8);
      add(new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd4af37, 0.8, 0.3), 1.4, 1.36, -1.8);

      luz(0xffd9a8, 0.8, 0, 6, -0.5);
      luz(KD.config.TIE, 1.2, 0, 4.6, -3.5);                 // luz roja sobre el letrero
      return g;
    }
  }
};