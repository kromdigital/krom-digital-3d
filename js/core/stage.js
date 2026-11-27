// Escenario: renderer, cámara, luces, suelo, personaje y reproductor de escenas.
KD.createStage = function (host) {
  const C = KD.config;
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(1); renderer.setSize(C.W, C.H, false); renderer.shadowMap.enabled = true;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, C.W / C.H, 0.1, 60);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(4, 8, 6); key.castShadow = true; scene.add(key);
  const back = new THREE.PointLight(C.TIE, 2.2, 22); back.position.set(-4, 4, -4); scene.add(back);
  const rimLight = new THREE.PointLight(0x6f8cff, 1.1, 22); rimLight.position.set(5, 3, -3); scene.add(rimLight);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshStandardMaterial({color: 0x101016, metalness: 0.6, roughness: 0.35}));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const rig = KD.buildCharacter(); scene.add(rig.root);
  const props = new THREE.Group(); scene.add(props);   // aquí cada escena pone sus objetos
  const S = {renderer, scene, camera, rig, props, current: null, sceneName: '', t0: performance.now(), last: performance.now(), extra: [], fired: new Set(), ended: new Set()};

  // Ganchos opcionales (main.js los usa para el audio): S.onCue(cue), S.onReset()
  S.reset = () => { S.t0 = performance.now(); S.extra = []; S.fired = new Set(); S.ended = new Set(); rig.reset(); if (KD.props) KD.props.hideAll(rig); if (S.onReset) S.onReset(); };

  let bgGroup = null; S.bgName = 'auto';
  S.setBackground = name => {                     // cambia el fondo (ver js/backgrounds.js)
    S.bgName = name; const b = KD.backgrounds[name] || KD.backgrounds.auto;
    if (bgGroup) { scene.remove(bgGroup); bgGroup = null; }
    scene.background = new THREE.Color(b.color ?? S.current.background ?? C.BG);
    scene.fog = b.fog === false ? null : new THREE.Fog(scene.background.clone(), 9, 22);
    floor.visible = !(b.hideFloor || S.current.hideFloor);
    if (b.build) { bgGroup = b.build(S); scene.add(bgGroup); }
  };

  S.load = name => {
    const sc = S.current = KD.scenes[name]; S.sceneName = name;
    props.clear();
    rig.root.visible = !sc.hideCharacter;          // escena "vacía": sin personaje
    S.setBackground(S.bgName);                    // el fondo elegido se conserva al cambiar de escena
    if (sc.setup) sc.setup(S);
    S.reset();
  };
  S.refresh = () => { props.clear(); if (S.current.setup) S.current.setup(S); };   // reconstruye la escena (textos nuevos) sin reiniciar
  S.parts = id => { const f = (S.current.fields || []).find(x => x.id === id); return KD.fields.parts(S.sceneName, f); };
  S.on = id => { const t = (S.current.toggles || []).find(x => x.id === id); return t ? !!KD.fields.get(S.sceneName, t) : false; };   // ¿casilla marcada?

  S.play = (gesture, dur = 2) => S.extra.push({gesture, at: (performance.now() - S.t0) / 1000, dur});

  S.update = now => {
    const dt = Math.min(Math.max((now - S.last) / 1000, 1 / 240), 1 / 20); S.last = now;
    const t = (now - S.t0) / 1000, sc = S.current, r = rig;
    r.rest();
    // movimiento base (siempre activo): respiración y balanceo suave
    r.bob = Math.sin(t * 2) * 0.06;
    r.to(r.root, 'y', Math.sin(t * 0.8) * 0.12, 1);
    r.to(r.head, 'y', Math.sin(t * 1.3) * 0.2, 1); r.to(r.head, 'z', Math.sin(t * 1.7) * 0.05, 1);
    // gestos de la escena + los que pruebes con el botón
    [...(sc.timeline || []), ...S.extra].forEach(c => {
      const lt = t - c.at; if (lt < 0) return;
      const g = KD.gestures[c.gesture];
      if (lt > c.dur) {                           // el gesto ya terminó: avisa una sola vez (g.end)
        if (S.fired.has(c) && !S.ended.has(c)) { S.ended.add(c); if (typeof g !== 'function' && g.end) g.end(r); }
        return;
      }
      const p = lt / c.dur, w = KD.env(p);
      if (!S.fired.has(c)) { S.fired.add(c); if (S.onCue) S.onCue(c); if (typeof g !== 'function' && g.start) g.start(r); }
      if (typeof g === 'function') g(r, lt, w, p); else if (g.update) g.update(r, lt, w, p);
    });
    r.pop = sc.pop !== false ? Math.max(KD.easeOutBack(t), 0.001) : 1;
    r.step(dt);                                   // aquí actúa la física
    if (KD.props) KD.props.update(r);             // los dispositivos miran a la cámara
    if (sc.update) sc.update(t, S);
    if (sc.camera) sc.camera(t, camera);
    else { const a = Math.sin(t * 0.45) * 0.55, d = 12 - Math.min(t, 2) * 0.6;
           camera.position.set(Math.sin(a) * d, 3.8 + Math.sin(t * 0.5) * 0.4, Math.cos(a) * d); camera.lookAt(0, 3.3, 0); }
    renderer.render(scene, camera);
  };
  return S;
};