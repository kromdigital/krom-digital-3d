// ESCENA: tip corto en 2 líneas.
KD.scenes.tip = {
  title: 'Tip en 10 s',
  duration: 10,
  fields: [
    {id: 'titulo', label: 'Título', value: 'TIP RAPIDO'},
    {id: 'texto', label: 'Texto', value: 'Publica a la misma hora', tone: 'plano'}
  ],
  timeline: [
    {at: 0.8, gesture: 'pensar', dur: 2.6},
    {at: 4.5, gesture: 'asentir', dur: 1.6},
    {at: 8.0, gesture: 'saludar', dur: 1.8}
  ],
  setup(S) {
    S.l1 = KD.textPlane(S.parts('titulo'), 4.4, 150); S.l1.position.set(0, 6.9, -1);
    S.l2 = KD.textPlane(S.parts('texto'), 4.6, 80);   S.l2.position.set(0, 5.8, -1);
    S.props.add(S.l1, S.l2);
  },
  update(t, S) {
    S.l1.scale.setScalar(Math.max(KD.easeOutBack(t - 1), 0.001));
    S.l2.scale.setScalar(Math.max(KD.easeOutBack(t - 3), 0.001));
  }
};