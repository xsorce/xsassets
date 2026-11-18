/*
  <xs-koi-home> — pixel koi pond homepage with Arabic greeting, demo chat and / commands.

  <script type="module" src="https://cdn.jsdelivr.net/gh/xsorce/xsassets@v0.1.0/components/koi-home/koi-home.js"></script>
  <xs-koi-home name="Zain" name-ar="زين" bg="https://i.pinimg.com/....gif">
    <a href="/explore" style="--c:#5b8def">Explore</a>   ← optional nav tabs (a or button, --c = dot color)
  </xs-koi-home>

  Attributes: name, name-ar, bg (image/GIF/video URL), storage-key (localStorage key for tweaks)
  Sizing:     fills its container; defaults to height 100dvh. Theme via xs-koi-home { --bg; --glass; --text; --muted }.
  Events:     koi:ask (detail = text, cancelable). preventDefault() to take over, then call
              el.status('Searching…') any number of times and el.reply('answer').
  Methods:    el.ask(text) el.reply(text) el.status(text) el.command(name) el.newChat() el.set(key, value)
  Props:      el.config, el.commands, el.phrases (get/set the phrase library)
*/

const FONT = 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@500;600&display=swap';

const CSS = `
:host {
  --bg: #0a0a0b; --glass: rgba(20,20,22,.74); --line: rgba(255,255,255,.08); --text: #ececee; --muted: #8d8d94;
  --font: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --arabic: "Noto Naskh Arabic", "Geeza Pro", "Segoe UI", "Arabic Typesetting", serif;
  display: block; position: relative; height: 100dvh; overflow: hidden;
  background: var(--bg); color: var(--text); font-family: var(--font);
}
* { box-sizing: border-box; }
[hidden] { display: none !important; }
button, input { font: inherit; color: inherit; }
.root { position: absolute; inset: 0; container: koi / inline-size; }

#pond { position: absolute; inset: 0; overflow: hidden; touch-action: none; }
#pond canvas { position: absolute; left: 0; top: 0; image-rendering: pixelated; }
#glow { image-rendering: auto !important; }
#grid, #vignette { position: absolute; inset: 0; pointer-events: none; }
#vignette { background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.55) 100%); }
#media-holder { position: absolute; width: 2px; height: 2px; opacity: 0; pointer-events: none; overflow: hidden; }

.glass { background: var(--glass); border: 1px solid var(--line); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
.ui { position: absolute; inset: 0; pointer-events: none; }
.ui > * { pointer-events: auto; }

.tabs { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 2px; padding: 4px;
  border-radius: 999px; max-width: calc(100% - 140px); overflow-x: auto; scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tab { display: flex; align-items: center; gap: 6px; padding: 5px 11px; border: 0; border-radius: 999px; background: none;
  color: var(--muted); font-size: 12px; white-space: nowrap; cursor: pointer; text-decoration: none; transition: background .15s, color .15s; }
.tab:hover { color: var(--text); }
.tab[aria-current="page"] { background: rgba(255,255,255,.09); color: var(--text); }
.tab i { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--muted)); }

.tweaks-btn { position: absolute; top: 12px; right: 12px; padding: 7px 12px; border-radius: 999px; font-size: 12px; cursor: pointer; }
.tweaks-btn[aria-expanded="true"] { background: rgba(255,255,255,.12); }

.hero { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(560px, calc(100% - 32px));
  display: flex; flex-direction: column; align-items: center; pointer-events: none; }
.hero > * { pointer-events: auto; }
.greet { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-bottom: 20px; text-align: center;
  cursor: pointer; transition: opacity .35s; outline: none; text-shadow: 0 2px 24px rgba(0,0,0,.85); }
.greet.fade { opacity: 0; }
.greet:focus-visible h1 { text-decoration: underline 1px rgba(255,255,255,.3); text-underline-offset: 8px; }
h1 { margin: 0; font-family: var(--arabic); font-size: clamp(30px, 5.6vw, 42px); font-weight: 600; line-height: 1.35; }
.sub { margin: 0; color: var(--muted); font-size: 13px; opacity: 0; transform: translateY(-4px); transition: opacity .25s, transform .25s; }
.sub b { color: #c9c9ce; font-weight: 500; }
.greet:hover .sub, .greet:focus-visible .sub, .greet.reveal .sub { opacity: 1; transform: none; }

.ask { position: relative; width: 100%; border-radius: 16px; padding: 12px 12px 10px 14px; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.ask label { display: flex; align-items: center; gap: 10px; }
.ask input { flex: 1; min-width: 0; background: none; border: 0; outline: none; font-size: 14px; padding: 4px 0; }
.ask input::placeholder { color: var(--muted); }
.ask:focus-within { border-color: rgba(255,255,255,.18); }
.ask-row { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; }
.left { display: flex; align-items: center; gap: 10px; }
.chip { display: flex; align-items: center; gap: 6px; border: 0; background: none; color: var(--muted); font-size: 12px; cursor: pointer; padding: 4px 2px; }
.chip:hover { color: var(--text); }
.send { width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--line); background: rgba(255,255,255,.06);
  display: grid; place-items: center; cursor: pointer; }
.send:hover { background: rgba(255,255,255,.14); }
.send:disabled { opacity: .4; cursor: default; }

.thread { display: none; width: 100%; flex: 1; min-height: 0; overflow-y: auto; flex-direction: column; gap: 16px;
  padding: 24px 2px 16px; scrollbar-width: thin; -webkit-mask-image: linear-gradient(transparent, #000 28px); mask-image: linear-gradient(transparent, #000 28px); }
.thread > :first-child { margin-top: auto; }
.hero.chat { top: 60px; bottom: 16px; transform: translateX(-50%); justify-content: flex-end; }
.hero.chat .greet { display: none; }
.hero.chat .thread { display: flex; }
.msg { max-width: 88%; font-size: 14px; line-height: 1.6; animation: rise .25s ease-out; }
.msg p { margin: 0; }
.msg.user { align-self: flex-end; padding: 9px 13px; border-radius: 14px 14px 4px 14px; }
.msg.bot { align-self: flex-start; text-shadow: 0 1px 14px rgba(0,0,0,.95); }
.msg .ar { font-family: var(--arabic); font-size: 1.4em; color: #fff; }
.msg.streaming p::after { content: '▍'; color: #f08a24; animation: blink 1s steps(1) infinite; }
.steps { list-style: none; margin: 0 0 8px; padding: 0; display: grid; gap: 7px; font-size: 12.5px; color: var(--muted); }
.steps li { display: flex; align-items: center; gap: 8px; }
.steps li::before { content: ''; width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid currentColor; flex: none; }
.steps li.run::before { border-color: #f08a24 #f08a24 #f08a24 transparent; animation: spin .8s linear infinite; }
.steps li.done::before { background: #3fb27f; border-color: #3fb27f; }
.steps li.run span { background: linear-gradient(90deg, var(--muted) 35%, #fff 50%, var(--muted) 65%) 0 0 / 200% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent; animation: shimmer 1.4s linear infinite; }
.thought { margin-bottom: 8px; }
.thought summary { cursor: pointer; color: var(--muted); font-size: 12.5px; list-style: none; }
.thought summary::-webkit-details-marker { display: none; }
.thought summary::after { content: ' ›'; }
.thought[open] summary::after { content: ' ⌄'; }
.thought .steps { margin: 8px 0 0 2px; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer { to { background-position: -200% 0; } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes rise { from { opacity: 0; transform: translateY(6px); } }

.cmd { position: absolute; left: 0; right: 0; bottom: calc(100% + 8px); margin: 0; padding: 6px; list-style: none; max-height: 290px; overflow-y: auto;
  border-radius: 14px; background: rgba(18,18,20,.97); border: 1px solid var(--line); box-shadow: 0 16px 50px rgba(0,0,0,.6); }
.cmd li { display: flex; align-items: baseline; gap: 12px; padding: 8px 10px; border-radius: 9px; cursor: pointer; }
.cmd li[aria-selected="true"] { background: rgba(255,255,255,.08); }
.cmd code { min-width: 96px; font: 13px ui-monospace, "Cascadia Code", Menlo, monospace; color: var(--text); }
.cmd span { color: var(--muted); font-size: 12px; }
.cmd .empty { color: var(--muted); cursor: default; font-size: 12px; }

.panel { position: absolute; top: 52px; right: 12px; width: 288px; max-height: calc(100% - 64px); overflow-y: auto;
  border-radius: 16px; padding: 14px; font-size: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.6); }
.row { display: grid; grid-template-columns: 62px 1fr 38px; align-items: center; gap: 8px; margin-bottom: 8px; }
.row span { color: var(--muted); }
.row output { text-align: right; font-variant-numeric: tabular-nums; }
.row input[type=range] { width: 100%; accent-color: #e8e8ea; }
.sep { height: 1px; background: var(--line); margin: 12px 0; }
.bg-input { display: flex; gap: 6px; margin-bottom: 8px; }
.bg-input input { flex: 1; min-width: 0; background: rgba(255,255,255,.05); border: 1px solid var(--line); border-radius: 8px; padding: 7px 9px; font-size: 12px; outline: none; }
.bg-input input:focus { border-color: rgba(255,255,255,.25); }
.btn { border: 1px solid var(--line); background: rgba(255,255,255,.06); border-radius: 8px; padding: 7px 10px; font-size: 12px; cursor: pointer; white-space: nowrap; }
.btn:hover { background: rgba(255,255,255,.12); }
.btns { display: flex; gap: 6px; flex-wrap: wrap; }
.err { color: #ff8a7a; margin: 0 0 8px; }
.err:empty { display: none; }

@container koi (max-width: 640px) {
  .tabs { left: 12px; transform: none; max-width: calc(100% - 100px); }
  .hero { top: auto; bottom: calc(20px + env(safe-area-inset-bottom)); transform: translateX(-50%); }
  .hero.chat { top: 56px; }
  .ask input { font-size: 16px; } /* stops iOS zoom on focus */
  .panel { top: auto; bottom: 0; left: 0; right: 0; width: auto; max-height: 62%; border-radius: 18px 18px 0 0;
    padding-bottom: calc(14px + env(safe-area-inset-bottom)); }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;

const HTML = `
<div class="root">
  <div id="pond" aria-hidden="true"><canvas id="glow"></canvas><canvas id="px"></canvas><div id="grid"></div><div id="vignette"></div></div>
  <div id="media-holder"></div>
  <div class="ui">
    <nav class="tabs glass" id="tabs" aria-label="Sections"></nav>
    <button class="tweaks-btn glass" id="tweaks-btn" aria-expanded="false" aria-controls="panel">Tweaks</button>
    <main class="hero" id="hero">
      <div class="greet" id="greet" role="button" tabindex="0" aria-expanded="false">
        <h1 id="ar" lang="ar" dir="rtl"></h1>
        <p class="sub"><b id="tr"></b> · <span id="en"></span></p>
      </div>
      <div class="thread" id="thread" aria-live="polite"></div>
      <form class="ask glass" id="ask">
        <ul class="cmd" id="cmd" role="listbox" aria-label="Commands" hidden></ul>
        <label>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="color:var(--muted)" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="q" name="q" placeholder="Ask anything…" autocomplete="off" aria-label="Ask anything"
            role="combobox" aria-expanded="false" aria-controls="cmd" aria-autocomplete="list">
        </label>
        <div class="ask-row">
          <div class="left">
            <button type="button" class="chip"><span aria-hidden="true">＋</span>Add tabs or files</button>
            <button type="button" class="chip" id="new-chat" hidden>New chat</button>
          </div>
          <button type="submit" class="send" id="send" aria-label="Send">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
        </div>
      </form>
    </main>
    <aside class="panel glass" id="panel" hidden aria-label="Tweaks">
      <div id="sliders"></div>
      <div class="sep"></div>
      <div class="bg-input">
        <input id="bg-url" placeholder="Image, GIF or video URL" aria-label="Background media URL">
        <button class="btn" id="bg-load">Load</button>
      </div>
      <p class="err" id="bg-err" role="status"></p>
      <div class="btns">
        <label class="btn">Upload<input type="file" id="bg-file" accept="image/*,video/*" hidden></label>
        <button class="btn" id="bg-clear">Clear media</button>
        <button class="btn" id="reset">Reset</button>
        <button class="btn" id="copy">Copy config</button>
      </div>
    </aside>
  </div>
</div>`;

// [key, label, min, max, step, default]
const CTRL = [
  ['count',  'Fish',    0, 40, 1, 14],
  ['size',   'Size',    .5, 2, .05, 1],
  ['speed',  'Speed',   0, 3, .05, 1],
  ['cursor', 'Cursor', -1, 1, .05, .25],  // <0 repel, >0 attract
  ['px',     'Pixel',   2, 14, 1, 6],
  ['glow',   'Glow',    0, 1, .05, .6],
  ['gap',    'Grid',    0, 1, .05, .35],
  ['grain',  'Grain',   0, 1, .05, .25],
  ['hue',    'Hue',     0, 360, 1, 0],
  ['specks', 'Specks',  0, 200, 1, 35],
  ['media',  'Media',   0, 1, .05, .7],   // background media opacity
];
const DEFAULTS = { ...Object.fromEntries(CTRL.map(c => [c[0], c[5]])), bg: '' };

// Beginner Arabic phrase library [arabic, arabizi, english, chat match]. Arabizi: 2=ء 3=ع 5=خ 7=ح
const phraseLib = (n, a) => [
  [`أهلاً يا ${a}`, `ahlan ya ${n}`, `Hi, ${n}`, /\b(hi|hello|hey)\b/],
  ['مرحبا', 'mar7aba', 'Hello', /\bhello\b/],
  ['كيف حالك؟', 'kaif 7alak?', 'How are you?', /how are you/],
  ['أنا بخير، الحمد لله', 'ana b5air, el7amdulillah', "I'm well, thank God", /\b(fine|well|good)\b/],
  ['شو اسمك؟', 'shu ismak?', "What's your name?", /your name/],
  [`اسمي ${a}`, `ismi ${n}`, `My name is ${n}`, /my name/],
  ['تشرفنا', 'tsharrafna', 'Nice to meet you', /meet/],
  ['شكراً جزيلاً', 'shukran jazeelan', 'Thank you very much', /thank/],
  ['عفواً', '3afwan', "You're welcome", /welcome/],
  ['من فضلك', 'min fadlak', 'Please', /please/],
  ['نعم', 'na3am', 'Yes', /\byes\b/],
  ['لا', 'la', 'No', /\bno\b/],
  ['ماشي', 'mashi', 'Okay', /\b(ok|okay)\b/],
  ['مش فاهم', 'mish fahim', "I don't understand", /understand/],
  ['ممكن تعيد؟', 'mumkin t3eed?', 'Can you repeat that?', /repeat/],
  ['شوي شوي', 'shway shway', 'Slowly / little by little', /slow/],
  ['يعطيك العافية', 'ya3teek el3afye', 'Thanks for your effort', /effort|hard work/],
  ['يلّا نبدأ', 'yalla nibda2', "Let's begin", /begin|start|let'?s go/],
  ['تصبح على خير', 'tusba7 3ala 5air', 'Good night', /good ?night/],
  ['مع السلامة', 'ma3 essalama', 'Goodbye', /bye/],
];
const timeGreeting = (n, a, h = new Date().getHours()) =>
    h < 5  ? [`لسه صاحي يا ${a}؟`, `lissa sa7i ya ${n}?`, `Still up, ${n}?`]
  : h < 12 ? [`صباح الخير يا ${a}`, `saba7 el5air ya ${n}`, `Good morning, ${n}`]
  : h < 17 ? [`نهارك سعيد يا ${a}`, `nharak sa3eed ya ${n}`, `Have a nice day, ${n}`]
  :          [`مساء الخير يا ${a}`, `masa2 el5air ya ${n}`, `Good evening, ${n}`];

const KOI = [
  { base: '#f4efe6', fin: 'rgba(240,234,224,.6)', spots: ['#d8392b', '#c42e22'] }, // kohaku
  { base: '#f08a24', fin: 'rgba(246,178,90,.6)',  spots: ['#ffcf7a'] },            // orange
  { base: '#f2c14e', fin: 'rgba(247,220,143,.6)', spots: [] },                     // gold
  { base: '#34343a', fin: 'rgba(90,90,98,.6)',    spots: ['#d8392b', '#f4efe6'] }, // showa
  { base: '#f4efe6', fin: 'rgba(240,234,224,.6)', spots: [], tancho: true },       // tancho
  { base: '#c9322a', fin: 'rgba(224,103,91,.6)',  spots: ['#f4efe6'] },            // aka
];
const N = 14;
const rnd = (a, b) => a + Math.random() * (b - a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const bodyWidth = t => t < .2 ? .75 + .25 * (t / .2) : 1 - .85 * Math.pow((t - .2) / .8, 1.2);

function mount(host, root) {
  const ctl = new AbortController();
  const on = (t, ev, fn) => t.addEventListener(ev, fn, { signal: ctl.signal });
  const NAME = host.getAttribute('name') || 'friend', NAME_AR = host.getAttribute('name-ar') || NAME;
  const STORE = host.getAttribute('storage-key') || 'xs-koi-home';
  root.innerHTML = `<style>${CSS}</style>${HTML}`;
  const $ = id => root.getElementById(id);

  // ---------- settings ----------
  let S = { ...DEFAULTS };
  try { Object.assign(S, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch {}
  if (host.hasAttribute('bg')) S.bg = host.getAttribute('bg');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) S.speed = Math.min(S.speed, .3);
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify({ ...S, bg: S.bg.startsWith('blob:') ? '' : S.bg })); } catch {} };

  // ---------- nav tabs from light-DOM children ----------
  const nav = $('tabs');
  const items = [...host.children].filter(el => el.matches('a, button'));
  nav.hidden = !items.length;
  for (const el of items) {
    const t = el.cloneNode(true);
    t.classList.add('tab'); t.prepend(document.createElement('i')); nav.append(t);
    on(t, 'click', () => {
      nav.querySelector('[aria-current]')?.removeAttribute('aria-current'); t.setAttribute('aria-current', 'page');
      if (el.tagName === 'BUTTON') el.click(); // forward to the original's listeners
    });
  }

  // ---------- greeting ----------
  let PHRASES = host._phrases || phraseLib(NAME, NAME_AR);
  let phrase = timeGreeting(NAME, NAME_AR);
  const greet = $('greet');
  const paint = () => ['ar', 'tr', 'en'].forEach((id, i) => $(id).textContent = phrase[i]);
  const reveal = v => { greet.classList.toggle('reveal', v); greet.setAttribute('aria-expanded', v); };
  function nextPhrase() {
    let p; do p = PHRASES[Math.random() * PHRASES.length | 0]; while (p === phrase && PHRASES.length > 1);
    greet.classList.add('fade'); reveal(false);
    setTimeout(() => { phrase = p; paint(); greet.classList.remove('fade'); }, 350);
  }
  paint();
  on(greet, 'click', () => reveal(!greet.classList.contains('reveal')));
  on(greet, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(!greet.classList.contains('reveal')); } });

  // ---------- canvases ----------
  const pond = $('pond'), px = $('px'), glow = $('glow'), grid = $('grid');
  const pctx = px.getContext('2d'), gctx = glow.getContext('2d');
  const fc = document.createElement('canvas'), fctx = fc.getContext('2d', { willReadFrequently: true });
  let vw = 1, vh = 1, cols = 1, rows = 1;

  function resize() {
    vw = host.clientWidth || 1; vh = host.clientHeight || 1;
    cols = Math.ceil(vw / S.px); rows = Math.ceil(vh / S.px);
    for (const c of [px, glow, fc]) { c.width = cols; c.height = rows; }
    for (const c of [px, glow]) { c.style.width = cols * S.px + 'px'; c.style.height = rows * S.px + 'px'; }
    applyLook();
  }
  function applyLook() {
    const hue = `hue-rotate(${S.hue}deg)`, line = `rgba(10,10,11,${S.gap})`;
    px.style.filter = hue;
    glow.style.filter = `${hue} blur(${S.px * 2.2}px) saturate(1.4)`;
    glow.style.opacity = S.glow;
    grid.style.backgroundImage = `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`;
    grid.style.backgroundSize = `${S.px}px ${S.px}px`;
  }

  // ---------- background media ----------
  const holder = $('media-holder'), bgErr = $('bg-err'), urlIn = $('bg-url');
  let media = null;
  function loadMedia(url, isVideo) {
    holder.innerHTML = ''; media = null; bgErr.textContent = '';
    S.bg = url || ''; save();
    urlIn.value = S.bg.startsWith('blob:') ? '' : S.bg;
    if (!url) return;
    if (/pinterest\.|pin\.it/i.test(url)) {
      bgErr.textContent = 'That is a pin page link. Right-click the image or video → Copy address (i.pinimg.com / v1.pinimg.com), or download it and Upload.';
      return;
    }
    isVideo ??= /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
    const el = document.createElement(isVideo ? 'video' : 'img');
    el.crossOrigin = 'anonymous';
    if (isVideo) Object.assign(el, { muted: true, loop: true, playsInline: true, autoplay: true });
    el.onerror = () => {
      if (el.crossOrigin) { el.removeAttribute('crossorigin'); el.src = url; return; } // retry without CORS
      if (!isVideo) return loadMedia(url, true);                                       // maybe it's a video
      bgErr.textContent = "Couldn't load that media.";
    };
    el.src = url;
    holder.appendChild(el); // stays in the DOM so GIFs keep animating
    if (isVideo) el.play?.().catch(() => {});
    media = el;
  }
  function drawMedia(ctx) {
    if (!media || S.media <= 0) return;
    const w = media.videoWidth || media.naturalWidth, h = media.videoHeight || media.naturalHeight;
    if (!w || !h) return;
    const s = Math.max(cols / w, rows / h); // cover
    ctx.globalAlpha = S.media;
    ctx.drawImage(media, (cols - w * s) / 2, (rows - h * s) / 2, w * s, h * s);
    ctx.globalAlpha = 1;
  }

  // ---------- koi ----------
  const ptr = { x: 0, y: 0, on: false }, fish = [], ripples = [];
  let specks = [];

  class Koi {
    constructor() {
      this.type = KOI[Math.random() * KOI.length | 0];
      this.k = Math.random(); this.sm = rnd(.7, 1.3);
      this.a = rnd(0, Math.PI * 2); this.wa = 0; this.ph = rnd(0, 6); this.boost = 0;
      const x = rnd(60, vw - 60), y = rnd(60, vh - 60);
      this.p = Array.from({ length: N }, (_, i) => ({ x: x - Math.cos(this.a) * i * 5, y: y - Math.sin(this.a) * i * 5 }));
      this.spots = this.type.tancho ? [{ t: .07, s: 0, r: .75, c: '#d8392b' }]
        : Array.from({ length: this.type.spots.length ? 3 + (Math.random() * 4 | 0) : 0 }, () => ({
            t: rnd(.03, .75), s: rnd(-.8, .8), r: rnd(.45, 1.1), c: this.type.spots[Math.random() * this.type.spots.length | 0] }));
    }
    get len() { return (55 + this.k * 45) * S.size * (vw < 640 ? .8 : 1); }
    newGoal() { const m = 80; this.goal = { x: rnd(m, vw - m), y: rnd(m, vh - m) }; this.gt = rnd(7, 15); }
    update(dt) {
      const hd = this.p[0], m = 70;
      // roam between far-apart goals; momentum outweighs the pull so paths stay long and curved
      if (!this.goal || (this.gt -= dt) < 0 || Math.hypot(this.goal.x - hd.x, this.goal.y - hd.y) < 120) this.newGoal();
      this.wa = Math.max(-.5, Math.min(.5, this.wa + (Math.random() - .5) * 1.2 * dt));
      const gx = this.goal.x - hd.x, gy = this.goal.y - hd.y, gd = Math.hypot(gx, gy) || 1;
      let vx = Math.cos(this.a + this.wa) * 1.5 + gx / gd, vy = Math.sin(this.a + this.wa) * 1.5 + gy / gd;
      if (hd.x < m) vx += (m - hd.x) / m * 2;  if (hd.x > vw - m) vx -= (hd.x - vw + m) / m * 2;
      if (hd.y < m) vy += (m - hd.y) / m * 2;  if (hd.y > vh - m) vy -= (hd.y - vh + m) / m * 2;
      if (ptr.on && S.cursor) {
        const dx = ptr.x - hd.x, dy = ptr.y - hd.y, d = Math.hypot(dx, dy);
        // attraction switches off up close so fish pass by instead of orbiting the cursor
        if (d < 260 && d > 1 && !(S.cursor > 0 && d < 110)) { const f = S.cursor * (1 - d / 260) * 1.5; vx += dx / d * f; vy += dy / d * f; }
      }
      for (const o of fish) { // ponytail: O(n²) separation, fine below ~100 fish
        if (o === this) continue;
        const dx = hd.x - o.p[0].x, dy = hd.y - o.p[0].y, d = Math.hypot(dx, dy), r = this.len * .7;
        if (d < r && d > .1) { vx += dx / d * (1 - d / r) * .6; vy += dy / d * (1 - d / r) * .6; }
      }
      const da = ((Math.atan2(vy, vx) - this.a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      const turn = 1.1 * dt * (1 + this.boost * 3);
      this.a += Math.max(-turn, Math.min(turn, da));
      this.boost = Math.max(0, this.boost - dt * 1.2);
      const v = (42 + this.boost * 170) * S.speed * this.sm;
      this.ph += dt * (2.5 + v * .07);
      const head = this.a + Math.sin(this.ph) * .2;
      hd.x += Math.cos(head) * v * dt; hd.y += Math.sin(head) * v * dt;
      const seg = this.len / (N - 1);
      for (let i = 1; i < N; i++) {
        const a = this.p[i - 1], b = this.p[i], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 1;
        b.x = a.x - dx / d * seg; b.y = a.y - dy / d * seg;
      }
    }
    draw(c) {
      const P = this.p, W = this.len * .13, nrm = [];
      for (let i = 0; i < N; i++) {
        const a = P[Math.max(0, i - 1)], b = P[Math.min(N - 1, i + 1)];
        const nx = -(a.y - b.y), ny = a.x - b.x, d = Math.hypot(nx, ny) || 1;
        nrm.push([nx / d, ny / d, W * bodyWidth(i / (N - 1))]);
      }
      const ang = Math.atan2(P[0].y - P[2].y, P[0].x - P[2].x), sw = Math.sin(this.ph) * .25;
      c.fillStyle = this.type.fin;
      for (const s of [1, -1]) { // pectoral fins
        const [nx, ny] = nrm[3];
        c.beginPath();
        c.ellipse(P[3].x + nx * s * W * .9, P[3].y + ny * s * W * .9, W * 1.1, W * .42, ang + s * (2.3 + sw), 0, Math.PI * 2);
        c.fill();
      }
      const T = P[N - 1], bd = Math.atan2(T.y - P[N - 3].y, T.x - P[N - 3].x) + sw * 1.6,
        at = (o, r) => [T.x + Math.cos(bd + o) * r, T.y + Math.sin(bd + o) * r];
      c.beginPath(); c.moveTo(T.x, T.y); // tail
      c.lineTo(...at(.85, W * 2.6)); c.lineTo(...at(0, W * 1.6)); c.lineTo(...at(-.85, W * 2.6));
      c.closePath(); c.fill();
      const body = new Path2D();
      body.moveTo(P[0].x + nrm[0][0] * nrm[0][2], P[0].y + nrm[0][1] * nrm[0][2]);
      for (let i = 1; i < N; i++) body.lineTo(P[i].x + nrm[i][0] * nrm[i][2], P[i].y + nrm[i][1] * nrm[i][2]);
      for (let i = N - 1; i >= 0; i--) body.lineTo(P[i].x - nrm[i][0] * nrm[i][2], P[i].y - nrm[i][1] * nrm[i][2]);
      body.closePath();
      body.moveTo(P[0].x + nrm[0][2], P[0].y); body.arc(P[0].x, P[0].y, nrm[0][2], 0, Math.PI * 2);
      c.fillStyle = this.type.base; c.fill(body);
      if (this.spots.length) {
        c.save(); c.clip(body);
        for (const s of this.spots) {
          const f = s.t * (N - 1), i = Math.min(N - 2, f | 0), u = f - i, q = P[i], r = P[i + 1], n = nrm[i];
          c.fillStyle = s.c; c.beginPath();
          c.arc(q.x + (r.x - q.x) * u + n[0] * s.s * n[2], q.y + (r.y - q.y) * u + n[1] * s.s * n[2], s.r * W, 0, Math.PI * 2);
          c.fill();
        }
        c.restore();
      }
    }
  }

  // crisp mosaic: snap alpha to 3 levels, sprinkle grain
  function quantize() {
    const img = fctx.getImageData(0, 0, cols, rows), d = img.data, g = S.grain * 70;
    for (let i = 3; i < d.length; i += 4) {
      if (!d[i]) continue;
      d[i] = d[i] < 60 ? 0 : d[i] < 170 ? 150 : 255;
      if (g && d[i]) { const n = (Math.random() - .5) * g; d[i - 3] += n; d[i - 2] += n; d[i - 1] += n; }
    }
    fctx.putImageData(img, 0, 0);
  }
  function syncCounts() {
    const target = Math.round(S.count * Math.min(1, Math.max(.45, vw * vh / (1440 * 900))));
    while (fish.length < target) fish.push(new Koi());
    fish.length = target;
    while (specks.length < S.specks) specks.push({ x: rnd(0, vw), y: rnd(0, vh), vx: rnd(-4, 4), vy: rnd(-4, 4), c: `hsl(0 0% ${rnd(18, 34) | 0}%)` });
    specks.length = S.specks;
  }
  function scatter(x, y, R = 220) {
    ripples.push({ x, y, t: 0 });
    for (const f of fish) {
      const dx = f.p[0].x - x, dy = f.p[0].y - y, d = Math.hypot(dx, dy);
      if (d < R) { f.a = Math.atan2(dy, dx); f.boost = Math.max(.3, 1 - d / (R * 2)); f.newGoal(); }
    }
  }
  function feed(x, y) { for (const f of fish) { f.goal = { x: x + rnd(-110, 110), y: y + rnd(-80, 80) }; f.gt = rnd(4, 7); } }

  // ---------- loop ----------
  let last = performance.now(), raf;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    syncCounts();
    for (const f of fish) f.update(dt);

    fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.clearRect(0, 0, cols, rows);
    fctx.setTransform(1 / S.px, 0, 0, 1 / S.px, 0, 0);
    for (const f of fish) f.draw(fctx);
    quantize();

    pctx.clearRect(0, 0, cols, rows);
    drawMedia(pctx);
    for (const s of specks) {
      s.x = (s.x + s.vx * dt * S.speed + vw) % vw; s.y = (s.y + s.vy * dt * S.speed + vh) % vh;
      pctx.fillStyle = s.c; pctx.fillRect(s.x / S.px | 0, s.y / S.px | 0, 1, 1);
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]; r.t += dt;
      if (r.t > 1.2) { ripples.splice(i, 1); continue; }
      pctx.strokeStyle = `rgba(200,200,210,${.35 * (1 - r.t / 1.2)})`; pctx.lineWidth = 1;
      pctx.beginPath(); pctx.arc(r.x / S.px, r.y / S.px, (10 + r.t * 140) / S.px, 0, Math.PI * 2); pctx.stroke();
    }
    pctx.drawImage(fc, 0, 0);
    gctx.clearRect(0, 0, cols, rows);
    gctx.drawImage(px, 0, 0);
    raf = requestAnimationFrame(frame);
  }

  // ---------- pointer ----------
  const local = e => { const r = host.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  on(host, 'pointermove', e => { [ptr.x, ptr.y] = local(e); ptr.on = true; });
  on(host, 'pointerup', e => { if (e.pointerType !== 'mouse') ptr.on = false; });
  on(host, 'pointerleave', () => { ptr.on = false; });
  on(pond, 'pointerdown', e => scatter(...local(e)));
  const ro = new ResizeObserver(resize); ro.observe(host);

  // ---------- chat ----------
  const hero = $('hero'), thread = $('thread'), form = $('ask'), q = $('q'), sendBtn = $('send'), newBtn = $('new-chat');
  let busy = false, pending = null;
  const scrollEnd = () => { thread.scrollTop = thread.scrollHeight; };
  function bubble(cls) { const m = document.createElement('div'); m.className = 'msg ' + cls; thread.append(m); scrollEnd(); return m; }
  function newChat() { thread.innerHTML = ''; hero.classList.remove('chat'); newBtn.hidden = true; busy = sendBtn.disabled = false; pending = null; q.focus(); }

  function stepList(m) { const ul = document.createElement('ul'); ul.className = 'steps'; m.append(ul); return { ul, t0: performance.now() }; }
  function step(st, text) {
    st.ul.querySelectorAll('.run').forEach(li => li.className = 'done');
    const li = document.createElement('li'), sp = document.createElement('span');
    sp.textContent = text; li.className = 'run'; li.append(sp); st.ul.append(li); scrollEnd();
    return li;
  }
  function collapse(m, st) {
    st.ul.querySelectorAll('.run').forEach(li => li.className = 'done');
    const d = document.createElement('details'), sum = document.createElement('summary');
    d.className = 'thought'; sum.textContent = `Thought for ${((performance.now() - st.t0) / 1000).toFixed(1)}s`;
    m.insertBefore(d, st.ul); d.append(sum, st.ul);
  }
  // segs: [{ t: 'text', ar?: true }]
  async function stream(m, segs) {
    const p = document.createElement('p'); m.append(p); m.classList.add('streaming');
    for (const s of segs) {
      const span = document.createElement('span');
      if (s.ar) { span.className = 'ar'; span.lang = 'ar'; span.dir = 'rtl'; }
      p.append(span);
      for (let i = 0; i < s.t.length; i += 2) { span.textContent += s.t.slice(i, i + 2); scrollEnd(); await sleep(16); }
    }
    m.classList.remove('streaming');
  }
  function demoReply(text) {
    const l = text.toLowerCase(), hit = PHRASES.find(p => p[3]?.test(l));
    const [ar, tr, en] = hit || PHRASES[Math.random() * PHRASES.length | 0];
    return hit
      ? [{ t: `“${en}” in Arabic is ` }, { t: ar, ar: true }, { t: ` (${tr}). Say it out loud three times, it sticks faster.` }]
      : [{ t: `Demo mode, so here's one to practise instead: ` }, { t: ar, ar: true }, { t: ` (${tr}) means “${en}”.` }];
  }
  async function ask(text) {
    if (busy || !text) return;
    busy = sendBtn.disabled = true;
    hero.classList.add('chat'); newBtn.hidden = false;
    bubble('user glass').textContent = text;
    const fr = form.getBoundingClientRect(), hr = host.getBoundingClientRect();
    feed(fr.left - hr.left + fr.width / 2, fr.top - hr.top - 120); // koi gather while it "thinks"
    const m = bubble('bot'), st = stepList(m);
    const ev = new CustomEvent('koi:ask', { detail: text, cancelable: true, bubbles: true, composed: true });
    if (!host.dispatchEvent(ev)) { pending = { m, st }; step(st, 'Thinking'); return; } // host app will call reply()
    for (const s of ['Reading your question', 'Looking up phrases', 'Writing reply']) { step(st, s); await sleep(rnd(600, 1100)); }
    collapse(m, st);
    await stream(m, demoReply(text));
    busy = sendBtn.disabled = false;
  }
  function status(text) { if (pending) step(pending.st, text); }
  async function reply(text) {
    let m;
    if (pending) { collapse(pending.m, pending.st); m = pending.m; pending = null; }
    else { hero.classList.add('chat'); newBtn.hidden = false; m = bubble('bot'); }
    await stream(m, [{ t: String(text) }]);
    busy = sendBtn.disabled = false;
  }
  on(form, 'submit', e => { e.preventDefault(); const t = q.value.trim(); q.value = ''; ask(t); });
  on(newBtn, 'click', newChat);

  // ---------- slash commands ----------
  const cmdEl = $('cmd');
  const CMDS = [
    ['new',        'Start a new chat',   newChat],
    ['phrase',     'Next Arabic phrase', () => { newChat(); nextPhrase(); }],
    ['feed',       'Call the koi over',  () => feed(vw / 2, vh / 2)],
    ['scatter',    'Scatter the koi',    () => scatter(vw / 2, vh / 2, 1e4)],
    ['tweaks',     'Open tweaks',        () => togglePanel(true)],
    ['background', 'Change background',  () => { togglePanel(true); urlIn.focus(); }],
    ['reset',      'Reset tweaks',       () => resetTweaks()],
  ];
  let shown = [], sel = 0;
  function updateMenu() {
    const v = q.value, open = v.startsWith('/') && !v.includes(' ');
    cmdEl.hidden = !open; q.setAttribute('aria-expanded', open);
    if (!open) return q.removeAttribute('aria-activedescendant');
    const f = v.slice(1).toLowerCase();
    shown = CMDS.filter(c => c[0].startsWith(f) || c[1].toLowerCase().includes(f));
    sel = Math.max(0, Math.min(sel, shown.length - 1));
    cmdEl.innerHTML = shown.length
      ? shown.map((c, i) => `<li role="option" id="cmd-${i}" data-i="${i}" aria-selected="${i === sel}"><code>/${c[0]}</code><span>${c[1]}</span></li>`).join('')
      : '<li class="empty">No matching commands</li>';
    if (shown.length) { q.setAttribute('aria-activedescendant', `cmd-${sel}`); cmdEl.children[sel].scrollIntoView({ block: 'nearest' }); }
  }
  function runCmd(i) { const c = shown[i]; q.value = ''; sel = 0; updateMenu(); c?.[2](); }
  on(q, 'input', () => { sel = 0; updateMenu(); });
  on(q, 'blur', () => setTimeout(() => { cmdEl.hidden = true; q.setAttribute('aria-expanded', false); }, 120));
  on(q, 'keydown', e => {
    if (cmdEl.hidden) return;
    const n = shown.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (n) { sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; updateMenu(); } }
    else if (e.key === 'Enter') { e.preventDefault(); if (n) runCmd(sel); }
    else if (e.key === 'Tab' && n) { e.preventDefault(); q.value = '/' + shown[sel][0]; updateMenu(); }
    else if (e.key === 'Escape') { e.stopPropagation(); q.value = ''; updateMenu(); }
  });
  on(cmdEl, 'pointerdown', e => {
    const li = e.target.closest('li[data-i]'); if (!li) return;
    e.preventDefault(); runCmd(+li.dataset.i);
  });
  on(window, 'keydown', e => {
    const t = e.composedPath()[0];
    const typing = t instanceof HTMLElement && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable);
    if (e.key === '/' && !typing) { e.preventDefault(); q.focus(); q.value = '/'; sel = 0; updateMenu(); }
    if (e.key === 'Escape') togglePanel(false);
  });

  // rotate phrases while idle on the home view
  const iv = setInterval(() => {
    if (!hero.classList.contains('chat') && !greet.matches(':hover, :focus-within, .reveal') && root.activeElement !== q && !document.hidden) nextPhrase();
  }, 9000);

  // ---------- tweaks panel ----------
  const panel = $('panel'), tbtn = $('tweaks-btn'), sliders = $('sliders');
  function togglePanel(open = panel.hidden) { panel.hidden = !open; tbtn.setAttribute('aria-expanded', open); }
  on(tbtn, 'click', () => togglePanel());
  function renderSliders() {
    sliders.innerHTML = CTRL.map(([k, l, mn, mx, st]) =>
      `<label class="row"><span>${l}</span><input type="range" data-k="${k}" min="${mn}" max="${mx}" step="${st}" value="${S[k]}"><output>${S[k]}</output></label>`).join('');
  }
  on(sliders, 'input', e => {
    const k = e.target.dataset.k; if (!k) return;
    S[k] = +e.target.value; e.target.nextElementSibling.textContent = S[k];
    k === 'px' ? resize() : applyLook(); save();
  });
  function resetTweaks() { S = { ...DEFAULTS, bg: S.bg }; renderSliders(); resize(); save(); }
  on($('bg-load'), 'click', () => loadMedia(urlIn.value.trim()));
  on(urlIn, 'keydown', e => { if (e.key === 'Enter') loadMedia(urlIn.value.trim()); });
  on($('bg-file'), 'change', e => {
    const f = e.target.files[0]; if (!f) return;
    loadMedia(URL.createObjectURL(f), f.type.startsWith('video'));
  });
  on($('bg-clear'), 'click', () => loadMedia(''));
  on($('reset'), 'click', resetTweaks);
  on($('copy'), 'click', async e => {
    try { await navigator.clipboard.writeText(JSON.stringify(S, null, 2)); e.target.textContent = 'Copied'; }
    catch { e.target.textContent = 'Copy failed'; }
    setTimeout(() => e.target.textContent = 'Copy config', 1200);
  });

  resize(); renderSliders();
  if (S.bg) loadMedia(S.bg);
  raf = requestAnimationFrame(frame);

  host.api = {
    get config() { return { ...S }; },
    set(k, v) { S[k] = v; renderSliders(); resize(); save(); },
    bg: loadMedia, ask, reply, status, newChat,
    commands: CMDS.map(c => c[0]),
    command(name) { CMDS.find(c => c[0] === name)?.[2](); },
    get phrases() { return PHRASES; },
    set phrases(list) { PHRASES = list; },
  };
  return () => { ctl.abort(); cancelAnimationFrame(raf); clearInterval(iv); ro.disconnect(); holder.innerHTML = ''; host.api = null; };
}

class KoiHome extends HTMLElement {
  static observedAttributes = ['bg'];
  connectedCallback() {
    if (!document.querySelector(`link[href="${FONT}"]`)) // @font-face must live in the document, not the shadow root
      document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: FONT }));
    this._stop = mount(this, this.shadowRoot || this.attachShadow({ mode: 'open' }));
  }
  disconnectedCallback() { this._stop?.(); }
  attributeChangedCallback(name, old, v) { if (this.api && old !== v) this.api.bg(v || ''); }

  ask(text) { return this.api?.ask(text); }
  reply(text) { return this.api?.reply(text); }
  status(text) { this.api?.status(text); }
  command(name) { this.api?.command(name); }
  newChat() { this.api?.newChat(); }
  set(key, value) { this.api?.set(key, value); }
  get config() { return this.api?.config; }
  get commands() { return this.api?.commands; }
  get phrases() { return this.api?.phrases; }
  set phrases(list) { this._phrases = list; if (this.api) this.api.phrases = list; }
}

if (!customElements.get('xs-koi-home')) customElements.define('xs-koi-home', KoiHome);
export { KoiHome };
