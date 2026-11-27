// Cada gesto escribe ÁNGULOS OBJETIVO; los resortes del personaje los alcanzan con inercia.
// Forma corta:  G.nombre = (r, lt, w, p) => { ... }
// Forma larga:  G.nombre = { start: r => {...}, update: (r, lt, w, p) => {...}, end: r => {...} }
//   start corre una vez al empezar, end una vez al terminar.
//   r = rig   lt = segundos desde el inicio   w = peso 0..1 (entra y sale suave)   p = progreso 0..1
// Herramientas: r.to(parte, 'x'|'y'|'z', radianes, w)   r.kickY(velocidad)   r.crouch(0..0.3)
//               r.body.air (¿está en el aire?)   r.body.ground (segundos desde que aterrizó)
(function () {
  const G = KD.gestures, TAU = Math.PI * 2, smooth = p => p * p * (3 - 2 * p);

  G.saludar    = (r, lt, w) => { r.to(r.armR.sh, 'z', 2.7, w); r.to(r.armR.el, 'z', Math.sin(lt * 10) * 0.6, w); r.to(r.head, 'z', -0.08, w); };
  G.asentir    = (r, lt, w) => r.to(r.head, 'x', Math.sin(lt * 9) * 0.3, w);
  G.negar      = (r, lt, w) => r.to(r.head, 'y', Math.sin(lt * 9) * 0.5, w);
  G.apuntar    = (r, lt, w) => { r.to(r.armR.sh, 'x', -1.45, w); r.to(r.armR.sh, 'z', 0.1, w); r.to(r.armR.el, 'x', Math.sin(lt * 6) * 0.1, w); };
  G.senalar    = (r, lt, w) => { r.to(r.armR.sh, 'z', 1.5, w); r.to(r.head, 'y', 0.4, w); };
  G.pensar     = (r, lt, w) => { r.to(r.armR.sh, 'x', -0.5, w); r.to(r.armR.el, 'x', -2.3, w); r.to(r.head, 'z', 0.15, w); };
  G.encogerse  = (r, lt, w) => { r.to(r.armR.sh, 'z', 0.45, w); r.to(r.armL.sh, 'z', -0.45, w); r.to(r.armR.el, 'x', -0.9, w); r.to(r.armL.el, 'x', -0.9, w); r.to(r.head, 'z', 0.12, w); };
  G.reverencia = (r, lt, w) => { r.to(r.root, 'x', 0.45, w); r.to(r.head, 'x', 0.15, w); };

  // Salto con impulso, gravedad y aterrizaje que aplasta
  G.saltar = {
    start: r => r.kickY(11),
    update: (r, lt, w) => { r.to(r.armR.sh, 'z', 1.2, w); r.to(r.armL.sh, 'z', -1.2, w); }
  };
  // Brinca una y otra vez con los brazos arriba (se agacha antes de cada salto)
  G.celebrar = (r, lt, w, p) => {
    r.to(r.armR.sh, 'z', 2.9, w); r.to(r.armL.sh, 'z', -2.9, w);
    if (lt < 0.2) r.crouch(0.2 * (lt / 0.2));
    else if (!r.body.air && r.body.ground > 0.1 && p < 0.8) r.kickY(10);
  };
  // Susto: pequeño salto, cabeza hacia atrás y brazos abiertos
  G.sorpresa = {
    start: r => r.kickY(6),
    update: (r, lt, w) => { r.to(r.head, 'x', -0.35, w); r.to(r.armR.sh, 'z', 1.6, w); r.to(r.armL.sh, 'z', -1.6, w); r.to(r.armR.el, 'x', -0.5, w); r.to(r.armL.el, 'x', -0.5, w); }
  };
  // Giro completo con un saltito (la cabeza y la corbata se quedan atrás un instante)
  G.girar = {
    start: r => r.kickY(5),
    update: (r, lt, w, p) => r.to(r.root, 'y', TAU * smooth(p), 1)
  };

  // ===== Dispositivos con pantalla (ver js/props.js) =====
  // con(nombre, pose): muestra el dispositivo al empezar, lo hace crecer y encoger suave, y lo quita al terminar
  const con = (nombre, pose) => ({
    start: r => KD.props.show(r, nombre),
    update: (r, lt, w, p) => { KD.props.scale(r, nombre, w); pose(r, lt, w, p); },
    end: r => KD.props.hide(r, nombre)
  });
  // Celular en la mano derecha (de la pantalla), mostrando una app
  G.celular = con('celular', (r, lt, w) => {
    r.to(r.armR.sh, 'x', -1.0, w); r.to(r.armR.sh, 'z', 0.55, w); r.to(r.armR.el, 'x', -1.25, w); r.to(r.head, 'y', 0.3, w);
  });
  // Laptop abierta frente al pecho, sostenida con las dos manos, mostrando una gráfica
  G.laptop = con('laptop', (r, lt, w) => {
    [r.armR, r.armL].forEach(a => { r.to(a.sh, 'x', -1.1, w); r.to(a.el, 'x', -1.0, w); });
    r.to(r.head, 'x', 0.12, w);
  });
  // Computadora de escritorio (monitor, teclado y mouse) frente al personaje, mostrando una página web
  G.computadora = con('computadora', (r, lt, w) => {
    r.to(r.armR.sh, 'z', 2.3, w); r.to(r.armR.el, 'z', -0.2, w); r.to(r.armL.sh, 'z', -0.5, w); r.to(r.head, 'y', 0.2, w);
  });
  // Teléfono de oficina con pantalla, en la mano izquierda, sonando (tiembla y parpadea)
  G.telefono = con('telefono', (r, lt, w) => {
    r.to(r.armL.sh, 'x', -1.0, w); r.to(r.armL.sh, 'z', -0.55, w); r.to(r.armL.el, 'x', -1.25, w); r.to(r.head, 'y', -0.3, w);
    KD.props.get(r, 'telefono').g.rotation.z = Math.sin(lt * 28) * 0.05 * w;
  });
})();