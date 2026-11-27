// Conecta el escenario con los botones, los textos editables y el audio, y graba el video.
const S = KD.createStage(document.getElementById('stage'));
const $ = id => document.getElementById(id);
const sceneSel = $('sceneSel'), bgSel = $('bgSel'), gestSel = $('gestSel'), rec = $('rec'), dl = $('dl'), msg = $('msg');
const musicSel = $('musicSel'), fileIn = $('fileIn'), fieldsBox = $('fields');
let grabando = false;

// Menús
Object.entries(KD.scenes).forEach(([k, v]) => sceneSel.add(new Option(v.title, k)));
Object.entries(KD.backgrounds).forEach(([k, v]) => bgSel.add(new Option(v.title, k)));
Object.keys(KD.gestures).forEach(k => gestSel.add(new Option(k, k)));

// Panel de textos y colores de la escena actual
function buildFields() {
  fieldsBox.innerHTML = '';
  const mk = (tag, props) => Object.assign(document.createElement(tag), props);
  (S.current.fields || []).forEach(f => {
    const lab = mk('label', {textContent: f.label + ' '});
    const inp = mk('input', {type: 'text', value: KD.fields.get(S.sceneName, f), maxLength: 30});
    inp.oninput = () => { KD.fields.set(S.sceneName, f.id, inp.value); S.refresh(); };
    lab.appendChild(inp); fieldsBox.appendChild(lab);
  });
    (S.current.toggles || []).forEach(t => {
    const lab = mk('label', {textContent: t.label + ' '});
    const inp = mk('input', {type: 'checkbox', checked: !!KD.fields.get(S.sceneName, t)});
    inp.onchange = () => { KD.fields.set(S.sceneName, t.id, inp.checked); S.refresh(); };
    lab.appendChild(inp); fieldsBox.appendChild(lab);
  });
    KD.props.fields.forEach(f => {                // textos de las pantallas de los dispositivos
    const lab = mk('label', {textContent: f.label + ' '});
    const inp = mk('input', {type: 'text', value: KD.fields.get('global', f), maxLength: 30});
    inp.oninput = () => { KD.fields.set('global', f.id, inp.value); KD.props.redraw(S.rig); };
    lab.appendChild(inp); fieldsBox.appendChild(lab);
  });
  [['accent', 'Acento'], ['text', 'Texto']].forEach(([k, nombre]) => {
    const lab = mk('label', {textContent: nombre + ' '});
    const inp = mk('input', {type: 'color', value: KD.fields.style[k]});
    inp.oninput = () => { KD.fields.setStyle(k, inp.value); S.refresh(); };
    lab.appendChild(inp); fieldsBox.appendChild(lab);
  });
}

// Audio: efectos al empezar cada gesto y golpe al aterrizar
S.onCue = c => KD.audio.sfx(KD.audio.map[c.gesture]);
S.onReset = () => { if (!S.current.hideCharacter) KD.audio.sfx('pop'); };
S.rig.onLand = impacto => KD.audio.sfx('thump', impacto);

sceneSel.onchange = () => { S.load(sceneSel.value); buildFields(); };
bgSel.onchange = () => S.setBackground(bgSel.value);
S.load(sceneSel.value); buildFields();
$('rst').onclick = () => S.reset();
$('gestBtn').onclick = () => S.play(gestSel.value, 2);

// Controles de audio
musicSel.onchange = () => {
  KD.audio.set('music', musicSel.value); fileIn.style.display = musicSel.value === 'file' ? '' : 'none';
  if (musicSel.value === 'file' && !fileIn.files.length) fileIn.click();
};
fileIn.onchange = async () => {
  if (!fileIn.files.length) return;
  try { await KD.audio.loadFile(fileIn.files[0]); msg.textContent = 'Música cargada: ' + fileIn.files[0].name; }
  catch (e) { msg.textContent = 'No pude leer ese archivo de audio.'; }
};
$('sfxChk').onchange = e => KD.audio.set('sfx', e.target.checked);
$('volRng').oninput = e => KD.audio.set('vol', +e.target.value);
$('prevBtn').onclick = () => { if (!grabando) $('prevBtn').textContent = KD.audio.preview() ? 'Detener sonido' : 'Probar sonido'; };

// Pantalla completa de la vista 3D (toca la vista para salir)
const marco = $('marco'), fsBtn = $('fsBtn');
if (!marco.requestFullscreen) fsBtn.style.display = 'none';
fsBtn.onclick = () => marco.requestFullscreen();
marco.onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); };

(function loop(now) { S.update(now); requestAnimationFrame(loop); })(performance.now());

// Grabación (video + audio)
rec.onclick = () => {
  if (!window.MediaRecorder) { msg.textContent = 'Usa Chrome o Edge para grabar, o graba con OBS.'; return; }
  KD.audio.init(); KD.audio.stopMusic(); $('prevBtn').textContent = 'Probar sonido';
  const stream = new MediaStream([...S.renderer.domElement.captureStream(30).getVideoTracks(), ...KD.audio.tracks()]);
  const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m));
  const mr = new MediaRecorder(stream, {mimeType: mime, videoBitsPerSecond: 10e6, audioBitsPerSecond: 160000});
  const chunks = [], ms = S.current.duration * 1000;
  mr.ondataavailable = e => e.data.size && chunks.push(e.data);
  mr.onstop = () => {
    KD.audio.stopMusic(); grabando = false;
    dl.href = URL.createObjectURL(new Blob(chunks, {type: 'video/webm'}));
    dl.download = `krom-${sceneSel.value}.webm`; dl.style.display = '';
    rec.disabled = false; msg.textContent = 'Listo. Descarga tu video.';
  };
  dl.style.display = 'none'; rec.disabled = true; grabando = true;
  mr.start(); S.reset(); KD.audio.startMusic(); msg.textContent = 'Grabando…';
  setTimeout(() => KD.audio.fadeOut(0.6), Math.max(0, ms - 600));
  setTimeout(() => mr.stop(), ms);
};