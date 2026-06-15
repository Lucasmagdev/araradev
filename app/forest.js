(function () {
  // ── BACKGROUND CANVAS (sky + binary rain) ─────────────────────────────
  const bgCanvas = document.createElement('canvas');
  bgCanvas.id = 'bg-canvas';
  Object.assign(bgCanvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    zIndex: '-3', pointerEvents: 'none',
  });
  document.body.prepend(bgCanvas);
  const bgCtx = bgCanvas.getContext('2d');

  // ── TREE CANVAS (jungle foreground) ───────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.id = 'forest-canvas';
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    zIndex: '-2', pointerEvents: 'none',
  });
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  function rand(seed) {
    let s = seed | 0;
    return () => {
      s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) | 0;
      s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) | 0;
      return ((s ^ (s >>> 16)) >>> 0) / 0xffffffff;
    };
  }

  const LAYERS = [
    { yFrac: 0.60, hFrac: 0.40, rgb: [3, 11, 3],  count: 6,  seed: 11 },
    { yFrac: 0.68, hFrac: 0.32, rgb: [4, 16, 5],  count: 10, seed: 22 },
    { yFrac: 0.76, hFrac: 0.24, rgb: [6, 22, 7],  count: 14, seed: 33 },
    { yFrac: 0.84, hFrac: 0.17, rgb: [8, 28, 10], count: 20, seed: 44 },
  ];

  const layerData = LAYERS.map(l => {
    const r = rand(l.seed);
    return {
      ...l,
      trees: Array.from({ length: l.count }, (_, i) => ({
        xFrac: (i + 0.5 + (r() - 0.5) * 0.6) / l.count,
        hMult: 0.55 + r() * 0.9,
        wMult: 0.65 + r() * 0.7,
        segs:  Math.floor(r() * 2) + 3,
      })),
    };
  });

  function drawJungleTree(x, by, w, h, segs) {
    const tw = Math.max(w * 0.055, 3);
    ctx.fillRect(x - tw / 2, by - h * 0.35, tw, h * 0.35);
    for (let s = 0; s < segs; s++) {
      const lh = h * (0.48 - s * 0.06);
      const lw = w * (0.92 - s * 0.1);
      const ly = by - h * (0.28 + s * 0.21);
      ctx.beginPath();
      ctx.moveTo(x, ly - lh);
      ctx.bezierCurveTo(x + lw * 0.2, ly - lh * 0.3, x + lw * 0.52, ly - lh * 0.04, x + lw / 2, ly);
      ctx.lineTo(x - lw / 2, ly);
      ctx.bezierCurveTo(x - lw * 0.52, ly - lh * 0.04, x - lw * 0.2, ly - lh * 0.3, x, ly - lh);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ── Binary digit rain ──────────────────────────────────────────────────
  let rainCols = [];
  let skyH = 0;

  function buildRain(W, H) {
    skyH = H * 0.62;
    const spacing = 28;
    const cols = Math.ceil(W / spacing);
    const rr = rand(555);
    rainCols = [];
    for (let i = 0; i < cols; i++) {
      if (rr() < 0.35) continue;
      const n = rr() > 0.7 ? 2 : 1;
      const items = [];
      for (let j = 0; j < n; j++) {
        items.push({
          y: rr() * skyH,
          speed: 4 + rr() * 8,
          opacity: 0.05 + rr() * 0.14,
          char: rr() > 0.5 ? '1' : '0',
        });
      }
      rainCols.push({ x: i * spacing + spacing / 2, items });
    }
  }

  function drawSky() {
    const W = bgCanvas.width, H = bgCanvas.height;
    bgCtx.clearRect(0, 0, W, H);

    const sky = bgCtx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,    '#04090f');
    sky.addColorStop(0.38, '#08121e');
    sky.addColorStop(0.62, '#061508');
    sky.addColorStop(1,    '#030a03');
    bgCtx.fillStyle = sky;
    bgCtx.fillRect(0, 0, W, H);

    // Moon glow
    const moonX = W * 0.80, moonY = H * 0.09;
    const mg = bgCtx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 55);
    mg.addColorStop(0, 'rgba(200,215,255,0.18)');
    mg.addColorStop(0.4, 'rgba(150,180,255,0.08)');
    mg.addColorStop(1, 'transparent');
    bgCtx.fillStyle = mg;
    bgCtx.fillRect(moonX - 55, moonY - 55, 110, 110);
    bgCtx.fillStyle = 'rgba(220,230,255,0.14)';
    bgCtx.beginPath();
    bgCtx.arc(moonX, moonY, 22, 0, Math.PI * 2);
    bgCtx.fill();
  }

  function drawRain() {
    bgCtx.font = '13px "SFMono-Regular", Consolas, monospace';
    bgCtx.textBaseline = 'top';
    rainCols.forEach(col => {
      col.items.forEach(it => {
        bgCtx.fillStyle = `rgba(120,255,160,${it.opacity.toFixed(2)})`;
        bgCtx.fillText(it.char, col.x, it.y);
      });
    });
  }

  let lastT = null;
  function animate(t) {
    if (lastT === null) lastT = t;
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;

    drawSky();
    rainCols.forEach(col => {
      col.items.forEach(it => {
        it.y += it.speed * dt;
        if (it.y > skyH) {
          it.y = -16;
          it.char = Math.random() > 0.5 ? '1' : '0';
        }
      });
    });
    drawRain();

    requestAnimationFrame(animate);
  }

  function render() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Tree layers (far → near)
    layerData.forEach(layer => {
      const [r, g, b] = layer.rgb;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      const baseY = H * layer.yFrac;
      const treeH = H * layer.hFrac;
      const slotW = W / layer.count;
      layer.trees.forEach(t => {
        drawJungleTree(
          t.xFrac * W,
          baseY,
          slotW * t.wMult * 1.15,
          treeH * t.hMult,
          t.segs
        );
      });
      ctx.fillRect(0, baseY + 1, W, H);
    });

    // Ground mist
    const mist = ctx.createLinearGradient(0, H * 0.56, 0, H);
    mist.addColorStop(0,   'rgba(18,70,22,0)');
    mist.addColorStop(0.5, 'rgba(12,55,16,0.14)');
    mist.addColorStop(1,   'rgba(6,35,9,0.28)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, H * 0.56, W, H * 0.44);
  }

  function resize() {
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    bgCanvas.width = W;
    bgCanvas.height = H;
    buildRain(W, H);
    render();
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(animate);

  // ── FIREFLIES ──────────────────────────────────────────────────────────
  const ffStyle = document.createElement('style');
  ffStyle.textContent = `
    .firefly {
      position: fixed;
      width: 3px; height: 3px;
      border-radius: 50%;
      background: #b0ff70;
      box-shadow: 0 0 5px 2px rgba(150,255,90,.75), 0 0 12px 5px rgba(150,255,90,.25);
      pointer-events: none;
      z-index: -1;
      animation:
        ff-move var(--d) ease-in-out var(--dl) infinite,
        ff-blink calc(var(--d) * .55) ease-in-out var(--dl) infinite;
    }
    @keyframes ff-move {
      0%,100% { transform:translate(0,0) }
      30%     { transform:translate(var(--x1),var(--y1)) }
      65%     { transform:translate(var(--x2),var(--y2)) }
    }
    @keyframes ff-blink {
      0%,100% { opacity:.1 }
      50%     { opacity:.9 }
    }
  `;
  document.head.appendChild(ffStyle);

  const ffWrap = document.createElement('div');
  Object.assign(ffWrap.style, {
    position:'fixed', inset:'0',
    zIndex:'-1', pointerEvents:'none', overflow:'hidden',
  });
  document.body.prepend(ffWrap);

  const ffr = rand(42);
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'firefly';
    const d = (5 + ffr() * 9).toFixed(1);
    el.style.cssText = `
      left:${(15 + ffr() * 70).toFixed(1)}%;
      top:${(42 + ffr() * 50).toFixed(1)}%;
      --d:${d}s;
      --dl:-${(ffr() * +d).toFixed(1)}s;
      --x1:${((ffr() - .5) * 150).toFixed(0)}px;
      --y1:${((ffr() - .5) * 100).toFixed(0)}px;
      --x2:${((ffr() - .5) * 150).toFixed(0)}px;
      --y2:${((ffr() - .5) * 100).toFixed(0)}px;
    `;
    ffWrap.appendChild(el);
  }
})();
