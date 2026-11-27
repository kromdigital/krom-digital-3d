// Ajustes globales. Todo el proyecto cuelga del objeto global KD.
window.KD = {
  config: {
    W: 1080, H: 1920,          // formato vertical 9:16 (Reels, TikTok, Shorts)
    LOGO: 0xe0141f,            // rojo de las letras KD
    TIE: 0xd6202f,             // corbata, aros y luces rojas
    BG: 0x0a0a0d,              // fondo por defecto
    BRAND: ['KROM ', 'DIGITAL'],
    GRAVITY: 28                // unidades/s² (el personaje mide ≈ 5 unidades)
  },
  scenes: {},                  // cada archivo de js/scenes/ se registra aquí
  gestures: {}                 // cada gesto de js/gestures.js se registra aquí
};

// Entrada con rebote (0 → 1)
KD.easeOutBack = t => { t = Math.max(0, Math.min(1, t)); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
// Envolvente de un gesto: sube suave, se mantiene y baja suave (p va de 0 a 1)
KD.env = p => { const k = Math.max(0, Math.min(p / 0.15, (1 - p) / 0.15, 1)); return k * k * (3 - 2 * k); };
