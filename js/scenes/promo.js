// ESCENA: promoción u oferta.
KD.scenes.promo = {
  title: 'Promo / Oferta',
  duration: 8,
  background: 0x0b1a3a,                          // azul marino como en tus fotos
  fields: [
    {id: 'l1', label: 'Título', value: 'OFERTA HOY'},
    {id: 'l2', label: 'Texto grande', value: '-30%', tone: 'plano'}
  ],
  timeline: [
    {at: 1.0, gesture: 'apuntar', dur: 2.2},
    {at: 3.6, gesture: 'celebrar', dur: 2.6},
    {at: 6.4, gesture: 'saludar', dur: 1.4}
  ],
  setup(S) {
    S.l1 = KD.textPlane(S.parts('l1'), 4.4, 130); S.l1.position.set(0, 6.9, -1);
    S.l2 = KD.textPlane(S.parts('l2'), 4.4, 200); S.l2.position.set(0, 5.8, -1);
    S.props.add(S.l1, S.l2);
  },
  update(t, S) {
    S.l1.scale.setScalar(Math.max(KD.easeOutBack(t - 0.6), 0.001));
    S.l2.scale.setScalar(Math.max(KD.easeOutBack(t - 1.2), 0.001));
  }
};