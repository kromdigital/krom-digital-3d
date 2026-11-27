// Audio sintetizado (no necesita archivos): efectos, música generada o tu propio archivo.
// Todo pasa por un "destino" que se mezcla en el video al grabar.
KD.audio = (function () {
  let ctx, master, sfxBus, musicBus, dest, noiseBuf, timer = null, src = null, buffer = null, playing = false;
  const st = {music: 'none', sfx: true, vol: 0.7};

  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = st.vol;
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9;
      musicBus = ctx.createGain(); musicBus.gain.value = 0.35;
      dest = ctx.createMediaStreamDestination();
      sfxBus.connect(master); musicBus.connect(master); master.connect(ctx.destination); master.connect(dest);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  // Nota con envolvente: tipo de onda, frecuencia inicial y final, duración, volumen, retraso, canal
  function tone(type, f0, f1, dur, vol, t0 = 0, bus = sfxBus) {
    const t = ctx.currentTime + t0, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(f0, f1, dur, vol, t0 = 0, bus = sfxBus, type = 'bandpass') {
    const t = ctx.currentTime + t0, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + dur + 0.05);
  }

   // Efectos de sonido
  const FX = {
    pop:    () => tone('sine', 700, 220, 0.14, 0.5),
    ding:   () => { tone('sine', 880, 880, 0.7, 0.35); tone('sine', 1320, 1320, 0.5, 0.2, 0.06); },
    chime:  () => [660, 880, 1100].forEach((f, k) => tone('triangle', f, f, 0.35, 0.25, k * 0.09)),
    boing:  () => tone('sine', 180, 520, 0.35, 0.5),
    whoosh: () => noise(300, 2400, 0.6, 0.5),
    thump:  (impacto = 8) => tone('sine', 140, 45, 0.22, Math.min(0.7, 0.15 + impacto * 0.04)),
    click:  () => noise(2500, 4000, 0.05, 0.3),
    ring:   () => [0, 0.18, 0.5, 0.68, 1.0, 1.18].forEach(t => tone('square', 1400, 1400, 0.1, 0.1, t))
  };
  // Qué efecto suena cuando empieza cada gesto (cámbialo a tu gusto; null = silencio)
  const MAP = {saludar: 'pop', apuntar: 'pop', senalar: 'pop', saltar: 'boing', sorpresa: 'boing',
               celebrar: 'chime', girar: 'whoosh', reverencia: 'ding',
               celular: 'ding', laptop: 'click', computadora: 'click', telefono: 'ring'};

  function sfx(name, arg) { if (ctx && st.sfx && FX[name]) FX[name](arg); }

  // Música generada: bombo, hi-hat, bajo y arpegio a 100 BPM
  const STEP = 60 / 100 / 4, BAJO = [55, 55, 65.41, 82.41], ARPA = [220, 261.63, 329.63, 392];
  let step = 0, next = 0;
  function sched() {
    while (next < ctx.currentTime + 0.25) {
      const i = step % 16, bar = (step >> 4) % 4, t = next - ctx.currentTime;
      if (i % 4 === 0) tone('sine', 120, 45, 0.18, 0.55, t, musicBus);
      if (i % 4 === 2) noise(7000, 9000, 0.04, 0.12, t, musicBus, 'highpass');
      if ([0, 6, 8, 14].includes(i)) tone('triangle', BAJO[bar], BAJO[bar], STEP * 1.8, 0.4, t, musicBus);
      if (i % 2 === 0) { const f = ARPA[(i / 2 + bar) % 4]; tone('triangle', f, f, STEP * 1.5, 0.09, t, musicBus); }
      step++; next += STEP;
    }
  }

  function startMusic() {
    if (!ctx) return; stopMusic();
    musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setValueAtTime(0.35, ctx.currentTime);
    if (st.music === 'beat') { step = 0; next = ctx.currentTime + 0.05; timer = setInterval(sched, 30); }
    else if (st.music === 'file' && buffer) { src = ctx.createBufferSource(); src.buffer = buffer; src.loop = true; src.connect(musicBus); src.start(); }
  }
  function stopMusic() { clearInterval(timer); timer = null; if (src) { try { src.stop(); } catch (e) {} src = null; } }
  function fadeOut(seg) { if (!ctx) return; const t = ctx.currentTime; musicBus.gain.setValueAtTime(0.35, t); musicBus.gain.linearRampToValueAtTime(0, t + seg); }

  return {
    init, sfx, map: MAP, startMusic, stopMusic, fadeOut,
    tracks: () => init() ? dest.stream.getAudioTracks() : [],
    set(k, v) { st[k] = v; if (k === 'vol' && master) master.gain.value = v; },
    async loadFile(file) { init(); buffer = await ctx.decodeAudioData(await file.arrayBuffer()); },
    preview() { init(); playing = !playing; if (playing) startMusic(); else stopMusic(); return playing; }
  };
})();