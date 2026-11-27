// Dispositivos (celular, laptop, computadora, teléfono) con pantallas dibujadas en canvas.
// Cada dispositivo siempre mira hacia la cámara, aunque el brazo se mueva, para que se vea la pantalla.
(function () {
  const ROJO = '#d6202f', TAU = Math.PI * 2;

  // Textos de las pantallas (editables desde la página, se comparten en todas las escenas)
  const CAMPOS = [
    {id: 'pantTitulo', label: 'Pantalla título', value: 'KROM DIGITAL'},
    {id: 'pantTexto', label: 'Pantalla texto', value: 'Marketing que se nota'}
  ];
  const textos = () => ({titulo: String(KD.fields.get('global', CAMPOS[0])), texto: String(KD.fields.get('global', CAMPOS[1]))});

  // ---------- Dibujo de pantallas ----------
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const fit = (g, txt, maxW, px, peso = '800') => {            // achica la letra si el texto no cabe
    g.font = `${peso} ${px}px Arial, sans-serif`;
    const w = g.measureText(txt).width; if (w > maxW) px = Math.floor(px * maxW / w);
    g.font = `${peso} ${px}px Arial, sans-serif`; return px;
  };
  const logo = (g, cx, cy, r) => {                              // disco negro, aro rojo y KD
    g.fillStyle = '#050507'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
    g.strokeStyle = ROJO; g.lineWidth = r * 0.1; g.beginPath(); g.arc(cx, cy, r * 0.93, 0, TAU); g.stroke();
    g.fillStyle = ROJO; g.font = `italic 900 ${r * 0.85}px "Arial Black", Arial, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('KD', cx, cy + r * 0.04); g.textAlign = 'left';
  };

  const app = (g, W, H, t, x) => {                              // app del celular
    const f = g.createLinearGradient(0, 0, 0, H); f.addColorStop(0, '#171b26'); f.addColorStop(1, '#0a0a0d');
    g.fillStyle = f; g.fillRect(0, 0, W, H);
    g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#9a9aa6'; g.font = '600 20px Arial, sans-serif'; g.fillText('9:41', 26, 30);
    logo(g, W / 2, 185, 88);
    g.textAlign = 'center'; g.fillStyle = '#fff'; fit(g, x.titulo, W - 50, 46, '900'); g.fillText(x.titulo, W / 2, 335);
    g.fillStyle = '#b8bcc6'; fit(g, x.texto, W - 60, 26, '500'); g.fillText(x.texto, W / 2, 385);
    g.fillStyle = ROJO; rr(g, 50, 440, W - 100, 62, 31); g.fill();
    g.fillStyle = '#fff'; g.font = '800 26px Arial, sans-serif'; g.fillText('Ver más', W / 2, 472);
    g.fillStyle = '#1d212b'; [545, 620].forEach(y => { rr(g, 30, y, W - 60, 60, 16); g.fill(); });
    g.fillStyle = ROJO; [545, 620].forEach(y => { g.beginPath(); g.arc(62, y + 30, 14, 0, TAU); g.fill(); });
    g.textAlign = 'left';
  };

  const grafica = (g, W, H, t, x) => {                          // laptop: gráfica de resultados
    const f = g.createLinearGradient(0, 0, W, H); f.addColorStop(0, '#0e2350'); f.addColorStop(1, '#081230');
    g.fillStyle = f; g.fillRect(0, 0, W, H);
    g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillStyle = '#fff'; fit(g, x.titulo, W * 0.55, 40, '900'); g.fillText(x.titulo, 32, 50);
    g.fillStyle = '#9fb3d9'; fit(g, x.texto, W * 0.55, 22, '500'); g.fillText(x.texto, 32, 92);
    g.textAlign = 'right'; g.fillStyle = ROJO; g.font = '900 64px Arial, sans-serif'; g.fillText('+128%', W - 32, 62);
    const crece = Math.min(1, t / 1.2);
    [0.25, 0.4, 0.33, 0.55, 0.7, 0.62, 0.95].forEach((a, i) => {
      const h = Math.max(a * 230 * crece, 2); g.fillStyle = i % 2 ? '#ffffff' : ROJO; rr(g, 40 + i * 83, H - 30 - h, 58, h, 6); g.fill();
    });
    g.fillStyle = '#2a3a63'; g.fillRect(30, H - 28, W - 60, 3); g.textAlign = 'left';
  };

  const web = (g, W, H, t, x) => {                              // computadora: página web
    g.fillStyle = '#0c0d11'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1b1f2a'; g.fillRect(0, 0, W, 38);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(22 + i * 22, 19, 6, 0, TAU); g.fill(); });
    g.fillStyle = '#0c0d11'; rr(g, 120, 8, 300, 22, 11); g.fill();
    g.fillStyle = '#9a9aa6'; g.font = '500 14px Arial, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('kromdigital.com', 140, 19);
    logo(g, 46, 80, 22);
    ['Servicios', 'Casos', 'Contacto'].forEach((n, i) => { g.fillStyle = '#9a9aa6'; g.font = '600 16px Arial, sans-serif'; g.fillText(n, 360 + i * 95, 80); });
    g.fillStyle = '#fff'; fit(g, x.titulo, W * 0.55, 58, '900'); g.fillText(x.titulo, 40, 175);
    g.fillStyle = '#b8bcc6'; fit(g, x.texto, W * 0.55, 24, '500'); g.fillText(x.texto, 40, 222);
    g.fillStyle = ROJO; rr(g, 40, 255, 190, 50, 25); g.fill();
    g.fillStyle = '#fff'; g.font = '800 20px Arial, sans-serif'; g.fillText('Cotiza ahora', 62, 281);
    const f = g.createLinearGradient(380, 120, 600, 320); f.addColorStop(0, ROJO); f.addColorStop(1, '#1a1020');
    g.fillStyle = f; rr(g, 380, 120, 220, 190, 18); g.fill(); logo(g, 490, 215, 60);
    [0, 1, 2].forEach(i => { g.fillStyle = '#1d212b'; rr(g, 40 + i * 195, 330, 180, 52, 12); g.fill(); g.fillStyle = ROJO; g.fillRect(54 + i * 195, 350, 40, 6); });
  };

  const llamada = (g, W, H, t, x) => {                          // teléfono de oficina: llamada entrante
    g.fillStyle = '#0a1a2a'; g.fillRect(0, 0, W, H);
    const on = Math.floor(t * 2) % 2 === 0;
    g.fillStyle = on ? '#2ecc71' : '#1b8f4f'; g.beginPath(); g.arc(W / 2, 88, 52, 0, TAU); g.fill();
    g.save(); g.translate(W / 2, 88); g.rotate(-0.8); g.fillStyle = '#fff'; rr(g, -8, -26, 16, 52, 8); g.fill(); g.restore();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = on ? '#8fe6b4' : '#4e8f6a'; g.font = '700 22px Arial, sans-serif'; g.fillText('LLAMADA ENTRANTE', W / 2, 172);
    g.fillStyle = '#fff'; fit(g, x.titulo, W - 50, 46, '900'); g.fillText(x.titulo, W / 2, 226);
    g.fillStyle = '#9fb3d9'; fit(g, x.texto, W - 60, 24, '500'); g.fillText(x.texto, W / 2, 268);
    g.fillStyle = '#2ecc71'; rr(g, 40, 300, 180, 44, 22); g.fill(); g.fillStyle = ROJO; rr(g, 260, 300, 180, 44, 22); g.fill();
    g.fillStyle = '#fff'; g.font = '800 20px Arial, sans-serif'; g.fillText('Contestar', 130, 322); g.fillText('Rechazar', 350, 322); g.textAlign = 'left';
  };

  // W/H = resolución del dibujo; key(t) = cuándo hay que redibujar (animaciones)
  const PANT = {
    app:     {W: 360, H: 720, draw: app, key: () => 0},
    grafica: {W: 640, H: 400, draw: grafica, key: t => Math.min(12, Math.floor(t * 10))},
    web:     {W: 640, H: 400, draw: web, key: () => 0},
    llamada: {W: 480, H: 360, draw: llamada, key: t => Math.floor(t * 2) % 2}
  };

  function pantalla(tipo, w, h, x, y, z) {
    const S = PANT[tipo], c = document.createElement('canvas'); c.width = S.W; c.height = S.H;
    const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({map: tex}));
    mesh.position.set(x, y, z);
    const sc = {mesh, key: null,
      reset() { sc.key = null; },
      tick(t) { const k = S.key(t); if (k !== sc.key) { sc.key = k; S.draw(g, S.W, S.H, t, textos()); tex.needsUpdate = true; } }};
    return sc;
  }

  // ---------- Modelos 3D ----------
  const mat = (c, m = 0.5, r = 0.4) => new THREE.MeshStandardMaterial({color: c, metalness: m, roughness: r});
  const box = (w, h, d, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; return o; };

  const celular = () => {
    const g = new THREE.Group(), s = pantalla('app', 0.76, 1.52, 0, 0.75, 0.056);
    g.add(box(0.84, 1.64, 0.1, mat(0x0e0f14, 0.6, 0.3), 0, 0.75, 0), s.mesh, box(0.06, 0.06, 0.02, mat(0x2a2f3a), 0, 1.5, 0.056));
    return {g, screens: [s]};
  };
  const laptop = () => {
    const g = new THREE.Group(), gris = mat(0x9aa0a8, 0.7, 0.35), lid = new THREE.Group(), s = pantalla('grafica', 1.62, 1.01, 0, 0.6, 0.034);
    lid.rotation.x = -0.12; lid.add(box(1.74, 1.12, 0.06, gris, 0, 0.6, 0), s.mesh);
    g.add(lid, box(1.74, 0.06, 1.0, gris, 0, -0.03, -0.45), box(1.74, 0.05, 0.1, mat(0xd7dbe0, 0.5, 0.4), 0, -0.02, 0.06));
    return {g, screens: [s]};
  };
  const computadora = () => {
    const g = new THREE.Group(), negro = mat(0x0e0f14, 0.5, 0.35), gris = mat(0x9aa0a8, 0.7, 0.35), s = pantalla('web', 2.52, 1.575, 0, 1.4, 0.076);
    g.add(box(2.7, 1.7, 0.14, negro, 0, 1.4, 0), s.mesh, box(0.22, 0.7, 0.14, gris, 0, 0.5, -0.05), box(1.0, 0.06, 0.6, gris, 0, 0.03, -0.05),
          box(1.6, 0.05, 0.5, negro, 0, 0.04, 0.75), box(0.22, 0.08, 0.34, negro, 1.2, 0.05, 0.75));
    return {g, screens: [s]};
  };
  const telefono = () => {
    const g = new THREE.Group(), cuerpo = mat(0x1d212b, 0.4, 0.5), rojo = mat(0xd6202f, 0.2, 0.4), blanco = mat(0xe9e9ee, 0.1, 0.5), s = pantalla('llamada', 0.72, 0.54, 0.06, 0.72, 0.158);
    g.add(box(1.1, 1.0, 0.3, cuerpo, 0.06, 0.55, 0), s.mesh,
          box(0.2, 1.05, 0.2, rojo, -0.62, 0.55, 0.02), box(0.32, 0.2, 0.22, rojo, -0.56, 1.05, 0.02), box(0.32, 0.2, 0.22, rojo, -0.56, 0.05, 0.02));
    for (let i = 0; i < 6; i++) g.add(box(0.14, 0.07, 0.04, blanco, -0.1 + (i % 3) * 0.22 + 0.06, 0.3 - Math.floor(i / 3) * 0.13, 0.16));
    return {g, screens: [s]};
  };

  // mount: dónde se sostiene ('handR' = mano derecha de la pantalla, 'handL' = izquierda, 'front' = frente al cuerpo)
  const SPEC = {
    celular:     {mount: 'handR', build: celular},
    laptop:      {mount: 'front', pos: [0, 1.85, 1.0], build: laptop},
    computadora: {mount: 'front', pos: [0, 1.0, 1.15], build: computadora},
    telefono:    {mount: 'handL', build: telefono}
  };

  // ---------- Control ----------
  const q = new THREE.Quaternion();
  function get(r, name) {
    r.props = r.props || {};
    if (!r.props[name]) {
      const S = SPEC[name], b = S.build(), root = new THREE.Group();
      root.add(b.g); root.visible = false;
      r.props[name] = {root, g: b.g, screens: b.screens, spec: S, t0: 0};
    }
    return r.props[name];
  }
  KD.props = {
    fields: CAMPOS,
    get,
    show(r, name) {
      const p = get(r, name), S = p.spec;
      const mount = S.mount === 'handR' ? r.armR.hand : S.mount === 'handL' ? r.armL.hand : r.root;
      mount.add(p.root);
      if (S.pos) p.root.position.set(S.pos[0], S.pos[1], S.pos[2]);
      p.root.visible = true; p.root.scale.setScalar(0.001); p.t0 = performance.now(); p.screens.forEach(s => s.reset());
    },
    hide(r, name) { get(r, name).root.visible = false; },
    hideAll(r) { Object.values(r.props || {}).forEach(p => { p.root.visible = false; }); },
    scale(r, name, w) { get(r, name).root.scale.setScalar(Math.max(0.001, w)); },
    update(r) {                                   // cada cuadro: mirar a la cámara y animar pantallas
      Object.values(r.props || {}).forEach(p => {
        if (!p.root.visible) return;
        const par = p.root.parent;
        if (par) { par.getWorldQuaternion(q); q.invert(); p.root.quaternion.copy(q); }
        const t = (performance.now() - p.t0) / 1000;
        p.screens.forEach(s => s.tick(t));
      });
    },
    redraw(r) { Object.values(r.props || {}).forEach(p => p.screens.forEach(s => { s.reset(); s.tick((performance.now() - p.t0) / 1000); })); }
  };
})();