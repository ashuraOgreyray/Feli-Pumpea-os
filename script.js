const title = document.getElementById('title');
title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());

let letterIndex = 0;

title.querySelectorAll('.line').forEach(line => {
  const text = line.textContent.trim();
  line.textContent = '';

  [...text].forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.setProperty('--i', letterIndex++);
    line.appendChild(span);
  });
});


const music = document.getElementById('music');
const musicBtn = document.getElementById('musicBtn');

document.getElementById('tap').addEventListener('click', () => {
  document.getElementById('hero').classList.add('go');

  music.volume = 0;
  music.play().then(() => {
    musicBtn.hidden = false;
    const fade = setInterval(() => {
      music.volume = Math.min(music.volume + 0.05, 0.8);
      if (music.volume >= 0.8) clearInterval(fade);
    }, 150);
  }).catch(() => {});
});

musicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicBtn.classList.remove('off');
  } else {
    music.pause();
    musicBtn.classList.add('off');
  }
});


const LANTERN_COUNT = 14;

for (let n = 0; n < LANTERN_COUNT; n++) {
  const lantern = document.createElement('div');
  lantern.className = 'lantern';

  lantern.style.left = `${5 + Math.random() * 90}%`;
  lantern.style.setProperty('--t', `${9 + Math.random() * 7}s`);
  lantern.style.setProperty('--w', `${1 + Math.random() * 9}s`);
  lantern.style.transform = `scale(${0.6 + Math.random() * 0.8})`;

  document.body.appendChild(lantern);
}


const pics = document.querySelectorAll('.pic');

pics.forEach((pic, index) => {
  const side = index % 2 === 0 ? '-' : '';
  pic.style.setProperty('--x', `${side}80px`);
  pic.style.setProperty('--r', `${side}14deg`);
  pic.style.setProperty('--r2', `${side}3deg`);
});

const revealOnScroll = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealOnScroll.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

pics.forEach(pic => revealOnScroll.observe(pic));


const sky = document.getElementById('sky');
const skyCtx = sky.getContext('2d');

let skyW, skyH;
let stars = [];
let shootingStars = [];
let pointerX = 0;
let pointerY = 0;

function resizeSky() {
  skyW = sky.width = window.innerWidth;
  skyH = sky.height = window.innerHeight;

  const count = Math.min(220, skyW / 5);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * skyW,
    y: Math.random() * skyH,
    radius: Math.random() * 1.6 + 0.3,
    phase: Math.random() * 6,
    depth: Math.random() * 0.9 + 0.1
  }));
}

window.addEventListener('pointermove', e => {
  pointerX = e.clientX / skyW - 0.5;
  pointerY = e.clientY / skyH - 0.5;
});

function drawSky(time) {
  skyCtx.clearRect(0, 0, skyW, skyH);

  stars.forEach(star => {
    const alpha = 0.4 + 0.6 * Math.abs(Math.sin(time / 900 + star.phase));
    skyCtx.fillStyle = `rgba(255, 240, 220, ${alpha})`;
    skyCtx.beginPath();
    skyCtx.arc(
      star.x - pointerX * 30 * star.depth,
      star.y - pointerY * 30 * star.depth,
      star.radius, 0, Math.PI * 2
    );
    skyCtx.fill();
  });

  if (Math.random() < 0.008) {
    shootingStars.push({ x: Math.random() * skyW, y: Math.random() * skyH * 0.4, life: 0 });
  }

  shootingStars = shootingStars.filter(s => s.life < 1);

  shootingStars.forEach(s => {
    s.life += 0.02;
    const x = s.x + s.life * 260;
    const y = s.y + s.life * 130;

    const trail = skyCtx.createLinearGradient(x, y, x - 90, y - 45);
    trail.addColorStop(0, `rgba(255, 220, 160, ${1 - s.life})`);
    trail.addColorStop(1, 'rgba(255, 220, 160, 0)');

    skyCtx.strokeStyle = trail;
    skyCtx.lineWidth = 2;
    skyCtx.beginPath();
    skyCtx.moveTo(x, y);
    skyCtx.lineTo(x - 90, y - 45);
    skyCtx.stroke();
  });

  requestAnimationFrame(drawSky);
}

resizeSky();
requestAnimationFrame(drawSky);


const heartCanvas = document.getElementById('hc');
const heartCtx = heartCanvas.getContext('2d');
const endSection = document.getElementById('end');

let heartW, heartH;
let particles = [];

function resizeHeart() {
  const box = endSection.getBoundingClientRect();
  heartW = heartCanvas.width = box.width;
  heartH = heartCanvas.height = box.height;

  const scale = Math.min(heartW, heartH) / 38;
  const count = Math.min(380, heartW / 2);

  particles = Array.from({ length: count }, (_, k) => {
    const t = (k / count) * Math.PI * 2;

    return {
      targetX: heartW / 2 + 16 * Math.pow(Math.sin(t), 3) * scale,
      targetY: heartH / 2 - (
        13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
      ) * scale,

      x: Math.random() * heartW,
      y: Math.random() * heartH,
      vx: 0,
      vy: 0,
      hue: 330 + Math.random() * 50
    };
  });
}

function explodeHeart() {
  particles.forEach(p => {
    const angle = Math.random() * Math.PI * 2;
    const force = 4 + Math.random() * 10;
    p.vx = Math.cos(angle) * force;
    p.vy = Math.sin(angle) * force;
  });
}

function drawHeart(time) {
  heartCtx.clearRect(0, 0, heartW, heartH);

  const beat = 1 + 0.04 * Math.sin(time / 260);

  particles.forEach(p => {
    const dx = heartW / 2 + (p.targetX - heartW / 2) * beat + Math.sin(time / 700 + p.hue) * 4 - p.x;
    const dy = heartH / 2 + (p.targetY - heartH / 2) * beat + Math.cos(time / 700 + p.hue) * 4 - p.y;

    p.vx = (p.vx + dx * 0.012) * 0.92;
    p.vy = (p.vy + dy * 0.012) * 0.92;
    p.x += p.vx;
    p.y += p.vy;

    heartCtx.fillStyle = `hsl(${p.hue}, 100%, 75%)`;
    heartCtx.shadowColor = heartCtx.fillStyle;
    heartCtx.shadowBlur = 12;
    heartCtx.beginPath();
    heartCtx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
    heartCtx.fill();
  });

  requestAnimationFrame(drawHeart);
}

endSection.addEventListener('pointerdown', explodeHeart);

resizeHeart();
requestAnimationFrame(drawHeart);


let lastWidth = window.innerWidth;

window.addEventListener('resize', () => {
  if (window.innerWidth !== lastWidth) {
    lastWidth = window.innerWidth;
    resizeSky();
    resizeHeart();
  }
});