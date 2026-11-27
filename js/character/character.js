// Personaje de Krom Digital con física ligera: resortes en cada articulación,
// gravedad y rebote en los saltos, squash & stretch y una corbata que se balancea.
//   rig.root → cuerpo     rig.head → cabeza     rig.tie → corbata
//   rig.armL / rig.armR → { sh: hombro, el: codo }   (L y R son lados de la PANTALLA)
// Convención: en armR, sh z positivo levanta el brazo hacia afuera (en armL es negativo);
// sh x negativo lo lleva al frente; el x negativo dobla el codo hacia el frente.
// Los gestos NO mueven las partes directamente: fijan un ÁNGULO OBJETIVO con rig.to()
// y el resorte de cada articulación lo alcanza con inercia y rebote.
KD.buildCharacter = function () {
  const C = KD.config, G = C.GRAVITY || 28, AX = ['x', 'y', 'z'];
  const M = (c, m = 0.2, r = 0.6) => new THREE.MeshStandardMaterial({color: c, metalness: m, roughness: r});
  const black = M(0x14141a, 0.35, 0.45), white = M(0xf2f2f2, 0, 0.7), red = M(C.TIE, 0.2, 0.4), shoe = M(0x050507, 0.5, 0.3);
  const logoMat = new THREE.MeshStandardMaterial({color: C.LOGO, metalness: 0.5, roughness: 0.25, emissive: C.LOGO, emissiveIntensity: 0.35});
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; return m; };

  const root = new THREE.Group();
  root.add(box(1.6, 1.8, 0.75, black, 0, 1.9, 0),            // torso
           box(0.55, 1.3, 0.05, white, 0, 2.15, 0.39),       // camisa
           box(0.26, 0.22, 0.07, red, 0, 2.62, 0.43),        // nudo
           box(0.55, 1.5, 0.55, black, -0.4, 0.75, 0), box(0.55, 1.5, 0.55, black, 0.4, 0.75, 0),
           box(0.6, 0.2, 0.9, shoe, -0.4, 0.1, 0.15), box(0.6, 0.2, 0.9, shoe, 0.4, 0.1, 0.15),
           box(0.3, 0.25, 0.3, white, 0, 2.95, 0));          // cuello
  [-1, 1].forEach(s => { const lp = box(0.22, 1.2, 0.06, black, s * 0.38, 2.2, 0.4); lp.rotation.z = s * 0.2; root.add(lp); });

  // Corbata colgante: pivota desde el nudo
  const tie = new THREE.Group(); tie.position.set(0, 2.5, 0.43);
  tie.add(box(0.2, 1.0, 0.05, red, 0, -0.55, 0)); root.add(tie);

  function arm(side) {
    const sh = new THREE.Group(); sh.position.set(side * 1.05, 2.65, 0);
    sh.add(box(0.42, 0.75, 0.42, black, 0, -0.375, 0));
    const el = new THREE.Group(); el.position.y = -0.75; sh.add(el);
    el.add(box(0.38, 0.75, 0.38, black, 0, -0.375, 0), box(0.36, 0.36, 0.36, white, 0, -0.92, 0));
    const hand = new THREE.Group(); hand.position.y = -0.92; el.add(hand);     // punto donde se sostienen los dispositivos
    root.add(sh); return {sh, el, hand};
  }
  const armL = arm(-1), armR = arm(1);

  // Cabeza: disco negro con aro rojo y KD rojo en cursiva
  const head = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.36, 64), new THREE.MeshStandardMaterial({color: 0x050507, metalness: 0.6, roughness: 0.18}));
  disc.rotation.x = Math.PI / 2; disc.castShadow = true;
  const rimF = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.07, 20, 96), red); rimF.position.z = 0.17;
  const rimB = rimF.clone(); rimB.position.z = -0.17;
  const headKD = KD.makeKD(logoMat); KD.italic(headKD, 0.6, 0.2);
  head.add(disc, rimF, rimB, headKD); head.position.set(0, 3.95, 0); root.add(head);

  // Logo KD del pecho
  const pocket = KD.makeKD(logoMat); KD.italic(pocket, 0.1, 0.46);
  pocket.matrix.premultiply(new THREE.Matrix4().makeTranslation(0.6, 2.2, 0)); root.add(pocket);

  // ===== FÍSICA =====
  // sp(parte, rigidez k, amortiguación c, límites): k alto = más firme; c bajo = más rebote.
  const sprung = [];
  const sp = (o, k, c, lim = {}) => { o.userData = {t: {x: 0, y: 0, z: 0}, p: {x: 0, y: 0, z: 0}, v: {x: 0, y: 0, z: 0}, k, c, lim}; sprung.push(o); return o; };
  sp(root, 55, 8);
  sp(head, 90, 9, {x: [-0.5, 0.5], z: [-0.4, 0.4]});
  sp(tie, 45, 3.5, {x: [-0.9, 0.03], z: [-0.6, 0.6]});                 // muy suelta: se balancea
  sp(armL.sh, 60, 8, {z: [-3.1, 0.3]}); sp(armR.sh, 60, 8, {z: [-0.3, 3.1]});
  sp(armL.el, 70, 6, {x: [-2.7, 0.1]}); sp(armR.el, 70, 6, {x: [-2.7, 0.1]});   // codo: no se dobla al revés

  const body = {y: 0, vy: 0, pvy: 0, air: false, ground: 0};            // salto y suelo
  const sq = {p: 0, v: 0};                                              // squash (+) y stretch (−)
  const rig = {root, head, armL, armR, tie, body, bob: 0, crouchT: 0, pop: 1};

  rig.rest = () => {                       // cada cuadro: objetivos en pose neutra
    sprung.forEach(o => { o.userData.t.x = o.userData.t.y = o.userData.t.z = 0; });
    armL.sh.userData.t.z = -0.08; armR.sh.userData.t.z = 0.08;
    rig.bob = 0; rig.crouchT = 0;
  };
  rig.to = (o, axis, target, w) => { const t = o.userData.t; t[axis] += (target - t[axis]) * w; };  // acerca el objetivo con peso w
  rig.kickY = v => { body.vy = v; body.air = true; body.ground = 0; };  // impulso de salto
  rig.crouch = a => { rig.crouchT = Math.max(rig.crouchT, a); };         // agacharse (0..0.3)
  rig.reset = () => {
    sprung.forEach(o => { AX.forEach(a => { o.userData.p[a] = 0; o.userData.v[a] = 0; }); o.rotation.set(0, 0, 0); });
    body.y = body.vy = body.pvy = 0; body.air = false; body.ground = 0; sq.p = sq.v = 0;
  };

  rig.step = dt => {
    // 1) Cuerpo: vuelo con gravedad y rebote, o balanceo suave en el suelo
    const prevY = body.y;
    if (body.air) {
      body.vy -= G * dt; body.y += body.vy * dt;
      if (body.y <= 0) {
        const impact = -body.vy; body.y = 0; body.ground = 0; sq.v += impact * 0.1;   // el golpe aplasta al personaje
        if (rig.onLand) rig.onLand(impact);                                          // aviso para el sonido
        if (impact > 7) body.vy = impact * 0.22; else { body.vy = 0; body.air = false; }
      }
    } else { body.y += (rig.bob - body.y) * Math.min(1, 20 * dt); body.ground += dt; }
    const vy = (body.y - prevY) / dt;
    const ay = Math.max(-60, Math.min(60, (vy - body.pvy) / dt)); body.pvy = vy;

    // 2) Movimiento secundario (la inercia arrastra brazos, cabeza y corbata)
    const rv = root.userData.v, lag = Math.max(-0.5, Math.min(0.5, vy * 0.02));
    armR.sh.userData.t.z -= lag; armL.sh.userData.t.z += lag;        // al subir los brazos quedan atrás
    head.userData.t.y -= rv.y * 0.08;                                // la cabeza llega después al girar
    tie.userData.t.x -= Math.min(0.9, Math.max(0, -ay) * 0.012 + Math.abs(rv.y) * 0.1);
    tie.userData.t.z -= rv.y * 0.12;

    // 3) Integrar resortes (en pasos pequeños para que sea estable)
    const sqT = body.air ? -Math.min(Math.abs(body.vy) * 0.012, 0.12) : rig.crouchT;
    const n = Math.max(1, Math.ceil(dt * 120)), h = dt / n;
    for (let i = 0; i < n; i++) {
      for (const o of sprung) {
        const u = o.userData;
        for (const a of AX) {
          let d = u.t[a] - u.p[a];
          if (a === 'y') d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));   // giros completos sin devolverse
          u.v[a] += (u.k * d - u.c * u.v[a]) * h; u.p[a] += u.v[a] * h;
          const L = u.lim[a];
          if (L) { if (u.p[a] < L[0]) { u.p[a] = L[0]; u.v[a] = 0; } else if (u.p[a] > L[1]) { u.p[a] = L[1]; u.v[a] = 0; } }
        }
      }
      sq.v += (150 * (sqT - sq.p) - 10 * sq.v) * h; sq.p += sq.v * h;
    }
    sq.p = Math.max(-0.3, Math.min(0.4, sq.p));
    sprung.forEach(o => o.rotation.set(o.userData.p.x, o.userData.p.y, o.userData.p.z));
    const s = rig.pop;
    root.position.y = body.y; root.scale.set(s * (1 + sq.p * 0.5), s * (1 - sq.p), s * (1 + sq.p * 0.5));
  };
  return rig;
};