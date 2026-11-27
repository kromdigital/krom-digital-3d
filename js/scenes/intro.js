// ESCENA: intro de marca. Úsala como modelo para crear escenas nuevas.
KD.scenes.intro = {
  title: 'Intro de marca',
  duration: 8,                                  // segundos que dura la grabación
  // background: 0x0a0a0d,                      // color de fondo (opcional)
  // pop: false,                                // quita la entrada con rebote (opcional)
  fields: [                                     // textos editables desde la página
    {id: 'marca', label: 'Marca', value: 'KROM DIGITAL'}
  ],
  toggles: [                                    // casillas para encender y apagar cosas (value = cómo empieza)
    {id: 'aro', label: 'Aro rojo', value: true}
  ],
  timeline: [                                   // qué gesto, cuándo (at) y cuánto dura (dur)
    {at: 1.0, gesture: 'saludar', dur: 2.6},
    {at: 4.0, gesture: 'asentir', dur: 1.4},
    {at: 6.0, gesture: 'reverencia', dur: 1.6}
  ],
  setup(S) {                                    // se ejecuta al cargar la escena: agrega objetos a S.props
    S.ring = null;
    if (S.on('aro')) {                          // S.on('id') = ¿está marcada la casilla?
      S.ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.06, 16, 100), new THREE.MeshBasicMaterial({color: KD.config.TIE}));
      S.ring.position.set(0, 3.2, -3);
      S.props.add(S.ring);
    }
    S.label = KD.textPlane(S.parts('marca'));   // S.parts('id') = texto del campo con sus colores
    S.label.position.set(0, 6.4, -1.5);
    S.props.add(S.label);
  },
  update(t, S) {                                // se ejecuta en cada cuadro
    if (S.ring) S.ring.rotation.z = t * 0.4;
    S.label.position.y = 6.4 + Math.sin(t * 1.5) * 0.05;
  }
};