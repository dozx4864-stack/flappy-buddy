(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.querySelector('#score');
  const screen = document.querySelector('#screen');
  const title = document.querySelector('#screen-title');
  const copy = document.querySelector('#screen-copy');
  const action = document.querySelector('#action');
  const themePicker = document.querySelector('#theme-picker');
  const themeOptions = [...document.querySelectorAll('.theme-option')];
  const W = canvas.width, H = canvas.height, groundY = H - 72;
  const state = { running: false, over: false, score: 0, last: 0, spawn: 0, theme: 'day', bird: null, pipes: [] };

  function reset() {
    state.running = false; state.over = false; state.score = 0; state.spawn = 0; state.pipes = [];
    state.bird = { x: 112, y: H * .44, vy: 0, r: 17, tilt: 0 };
    scoreEl.textContent = '0';
    title.textContent = 'Ready to fly?'; copy.textContent = 'Guide Buddy through the garden gates.'; action.textContent = 'Start game';
    themePicker.hidden = false;
    screen.classList.remove('hidden'); draw();
  }
  function start() { if (state.over) reset(); state.running = true; screen.classList.add('hidden'); flap(); }
  function flap() { if (!state.running) { start(); return; } state.bird.vy = -360; }
  function addPipe() {
    const gap = 154, min = 95, max = groundY - gap - 95;
    state.pipes.push({ x: W + 46, top: min + Math.random() * (max - min), gap, scored: false });
  }
  function end() {
    if (state.over) return; state.running = false; state.over = true;
    title.textContent = 'Nice try, Buddy!'; copy.textContent = `You flew through ${state.score} ${state.score === 1 ? 'gate' : 'gates'}.`;
    action.textContent = 'Fly again'; themePicker.hidden = false; screen.classList.remove('hidden');
  }
  function hit(pipe, b) {
    const left = pipe.x - 31, right = pipe.x + 31;
    return b.x + b.r > left && b.x - b.r < right && (b.y - b.r < pipe.top || b.y + b.r > pipe.top + pipe.gap);
  }
  function update(dt) {
    const b = state.bird;
    b.vy += 980 * dt; b.y += b.vy * dt; b.tilt = Math.max(-.45, Math.min(1.05, b.vy / 580));
    state.spawn += dt; if (state.spawn > 1.55) { addPipe(); state.spawn = 0; }
    state.pipes.forEach(p => { p.x -= 160 * dt; if (!p.scored && p.x < b.x) { p.scored = true; state.score++; scoreEl.textContent = state.score; } });
    state.pipes = state.pipes.filter(p => p.x > -55);
    if (b.y - b.r < 0 || b.y + b.r > groundY || state.pipes.some(p => hit(p, b))) end();
  }
  function roundedRect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function drawPipe(x, y, h, upsideDown) {
    const capY = upsideDown ? y + h - 19 : y;
    ctx.fillStyle = '#5ba54e'; roundedRect(x - 29, y, 58, h, 8); ctx.fill();
    ctx.fillStyle = '#79c55b'; roundedRect(x - 22, y + 5, 15, h - 10, 4); ctx.fill();
    ctx.fillStyle = '#438a41'; roundedRect(x - 35, capY, 70, 20, 6); ctx.fill();
    ctx.fillStyle = '#9ad66b'; ctx.fillRect(x - 29, capY + 4, 18, 5);
  }
  function drawBird(b) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.tilt);
    ctx.fillStyle = '#efb83e'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f6d469'; ctx.beginPath(); ctx.ellipse(-5, 4, 10, 7, .45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(8, -6, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#213e48'; ctx.beginPath(); ctx.arc(10, -6, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e97932'; ctx.beginPath(); ctx.moveTo(17, 1); ctx.lineTo(28, 5); ctx.lineTo(17, 9); ctx.fill(); ctx.restore();
  }
  function draw() {
    const night = state.theme === 'night';
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, night ? '#111b42' : '#70c5ce'); sky.addColorStop(1, night ? '#59619a' : '#c7eef0'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    if (night) {
      ctx.fillStyle = 'rgba(255,244,190,.9)'; [[56,92],[145,56],[250,117],[349,70],[385,184],[210,170]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#fff0ae'; ctx.beginPath(); ctx.arc(350, 106, 29, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#202a59'; ctx.beginPath(); ctx.arc(362, 95, 29, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,.55)'; [[75,100,32],[310,145,47],[235,63,25]].forEach(([x,y,r]) => { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.arc(x+r,y+5,r*.72,0,Math.PI*2); ctx.arc(x-r,y+7,r*.65,0,Math.PI*2); ctx.fill(); });
    }
    state.pipes.forEach(p => { drawPipe(p.x, 0, p.top, true); drawPipe(p.x, p.top + p.gap, groundY - p.top - p.gap, false); });
    ctx.fillStyle = '#91bc55'; ctx.fillRect(0, groundY, W, H-groundY); ctx.fillStyle = '#6b9d45'; ctx.fillRect(0, groundY, W, 8);
    for (let x = -20; x < W + 20; x += 24) { ctx.fillStyle = x % 48 ? '#acd06a' : '#c3df7a'; ctx.fillRect(x, groundY + 8, 13, H - groundY - 8); }
    drawBird(state.bird);
  }
  function loop(time) { const dt = Math.min((time - state.last) / 1000 || 0, .034); state.last = time; if (state.running) update(dt); draw(); requestAnimationFrame(loop); }
  action.addEventListener('click', e => { e.stopPropagation(); start(); });
  themeOptions.forEach(option => option.addEventListener('click', e => {
    e.stopPropagation(); state.theme = option.dataset.theme;
    themeOptions.forEach(item => { const selected = item === option; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', selected); });
    draw();
  }));
  canvas.addEventListener('pointerdown', flap);
  window.addEventListener('keydown', e => { if (['Space', 'ArrowUp'].includes(e.code)) { e.preventDefault(); flap(); } });
  reset(); requestAnimationFrame(loop);
})();
