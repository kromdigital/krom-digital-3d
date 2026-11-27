// ESCENA: vacía. No muestra personaje, textos ni suelo; solo se ve el fondo que elijas en el menú "Fondo".
KD.scenes.nada = {
  title: 'Nada (vacío)',
  duration: 8,
  hideCharacter: true,                           // oculta al personaje
  hideFloor: true,                               // oculta el suelo oscuro del escenario
  fields: [],
  timeline: [],
  setup(S) {},
  update(t, S) {}
};