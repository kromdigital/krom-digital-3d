// ESCENA: presenta celular, laptop, computadora y teléfono, uno tras otro.
KD.scenes.dispositivos = {
  title: 'Dispositivos',
  duration: 15,
  fields: [
    {id: 'marca', label: 'Título', value: 'KROM DIGITAL'}
  ],
  timeline: [
    {at: 0.8,  gesture: 'celular',     dur: 3.2},
    {at: 4.5,  gesture: 'laptop',      dur: 3.2},
    {at: 8.2,  gesture: 'computadora', dur: 3.2},
    {at: 11.9, gesture: 'telefono',    dur: 3.0}
  ],
  setup(S) {
    S.label = KD.textPlane(S.parts('marca'));
    S.label.position.set(0, 6.4, -1.5);
    S.props.add(S.label);
  },
  update(t, S) {
    S.label.position.y = 6.4 + Math.sin(t * 1.5) * 0.05;
  }
};