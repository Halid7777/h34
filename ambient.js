/* FitQuest Pro — js/ambient.js
   Сезонная анимация частиц внутри приложения
   (обычный скрипт: глобальные функции и переменные общие для всех файлов, порядок подключения см. в index.html) */

/* =========================================================================
   2. СЕЗОННЫЙ АНИМАЦИОННЫЙ ДВИЖОК ВНУТРИ ПРИЛОЖЕНИЯ
   ========================================================================= */
const AmbientEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  mode: 'autumn',
  animId: null,
  width: 0,
  height: 0,

  init() {
    this.canvas = document.getElementById('ambient-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createParticles();
    this.start();
  },

  resize() {
    const shell = document.getElementById('app-shell');
    this.width = this.canvas.width = shell.clientWidth || 400;
    this.height = this.canvas.height = shell.clientHeight || 750;
  },

  setMode(newMode) {
    this.mode = newMode;
    this.particles = [];
    if (newMode !== 'off') {
      this.createParticles();
    }
  },

  createParticles() {
    const count = this.mode === 'winter' ? 50 : (this.mode === 'summer' ? 38 : 32);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.spawnParticle(true));
    }
  },

  spawnParticle(randomY = false) {
    const p = {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -25,
      size: 4 + Math.random() * 8,
      speedY: 0.8 + Math.random() * 1.5,
      speedX: -0.4 + Math.random() * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.03 + Math.random() * 0.06,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      alpha: 0.4 + Math.random() * 0.5,
      color: '#FFF'
    };

    if (this.mode === 'autumn') {
      const autumnColors = ['#D84315', '#E65100', '#F57C00', '#FFB300', '#BF360C', '#C2185B'];
      p.color = autumnColors[Math.floor(Math.random() * autumnColors.length)];
      p.size = 7 + Math.random() * 11;
      p.speedY = 0.9 + Math.random() * 1.4;
    } else if (this.mode === 'winter') {
      p.color = '#FFFFFF';
      p.size = 2.5 + Math.random() * 4;
      p.speedY = 0.7 + Math.random() * 1.6;
    } else if (this.mode === 'spring') {
      const springColors = ['#FF85A1', '#FFAFCC', '#FFC8DD', '#FFB7B2', '#F72585'];
      p.color = springColors[Math.floor(Math.random() * springColors.length)];
      p.size = 5 + Math.random() * 8;
      p.speedY = 0.8 + Math.random() * 1.3;
    } else if (this.mode === 'summer') {
      const summerColors = ['#FFE600', '#76FF03', '#00E5FF', '#FFB300', '#FFD54F'];
      p.color = summerColors[Math.floor(Math.random() * summerColors.length)];
      p.size = 3 + Math.random() * 5.5;
      p.y = randomY ? Math.random() * this.height : this.height + 20;
      p.speedY = -(0.5 + Math.random() * 1.2);
    }

    return p;
  },

  start() {
    const loop = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  },

  update() {
    if (this.mode === 'off') return;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.wobble += p.wobbleSpeed;
      p.rotation += p.rotationSpeed;

      if (this.mode === 'summer') {
        p.y += p.speedY;
        p.x += Math.sin(p.wobble) * 0.7;
        if (p.y < -25) this.particles[i] = this.spawnParticle(false);
      } else {
        p.y += p.speedY;
        p.x += Math.sin(p.wobble) * 1.1 + p.speedX;
        if (p.y > this.height + 25) this.particles[i] = this.spawnParticle(false);
      }

      if (p.x > this.width + 25) p.x = -15;
      if (p.x < -25) p.x = this.width + 15;
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (this.mode === 'off') return;

    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;

      if (this.mode === 'autumn') {
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (this.mode === 'winter') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.shadowBlur = 6;
        this.ctx.fill();
      } else if (this.mode === 'spring') {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.quadraticCurveTo(p.size, 0, 0, p.size);
        this.ctx.quadraticCurveTo(-p.size, 0, 0, -p.size);
        this.ctx.fill();
      } else if (this.mode === 'summer') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 12;
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }
};

