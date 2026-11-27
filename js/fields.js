// Textos y colores editables desde la página. Se recuerdan aunque cierres el navegador.
KD.fields = (function () {
  const KEY = 'krom3d.v1';
  let data = {};
  try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  data.style = Object.assign({accent: '#d6202f', text: '#ffffff'}, data.style);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };

  return {
    style: data.style,
    get: (scene, f) => data[scene + '.' + f.id] ?? f.value,
    set: (scene, id, v) => { data[scene + '.' + id] = v; save(); },
    setStyle: (k, v) => { data.style[k] = v; save(); },
    // Devuelve las "partes" de color para KD.textPlane.
    //   tone 'plano' → todo en color de texto; por defecto → primera palabra en color de acento
    parts(scene, f) {
      const s = String(this.get(scene, f)).trim(), st = data.style;
      if (f.tone === 'plano') return [{t: s, c: st.text}];
      const i = s.indexOf(' ');
      return i < 0 ? [{t: s, c: st.accent}] : [{t: s.slice(0, i + 1), c: st.accent}, {t: s.slice(i + 1), c: st.text}];
    }
  };
})();