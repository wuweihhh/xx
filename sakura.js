(function () {
  const canvas = document.getElementById('sakuraCanvas');
  const ctx = canvas.getContext('2d');
  let sakuras = [];
  let maxCount = 0;
  let density = 1;
  let isCreatingParticles = false;
  const DPR = window.devicePixelRatio || 1;

  // 樱花粒子类
  class Sakura {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * canvas.width / DPR;
      this.y = -20;
      this.size = Math.random() * 5 + 2;
      this.speedY = Math.random() * 1.2 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.swingPhase = Math.random() * Math.PI * 2;
      this.rotation = Math.random() * 360;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.color = ['#ffc2d1', '#ff8fab', '#f9e5eb'][Math.floor(Math.random() * 3)];
    }

    update() {
      this.y += this.speedY;
      this.swingPhase += 0.015;
      this.x += this.speedX + Math.sin(this.swingPhase) * 0.3;
      this.rotation += (Math.random() - 0.5) * 1.5;
      
      if (this.y > canvas.height / DPR + 20 || this.x < -20 || this.x > canvas.width / DPR + 20) {
        this.init();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.fillStyle = this.color;

      // 绘制樱花
      const petalSize = this.size;
      ctx.beginPath();
      ctx.arc(0, 0, petalSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2 / 5) + Math.PI / 2;
        const x = Math.cos(angle) * petalSize * 0.8;
        const y = Math.sin(angle) * petalSize * 0.8;
        
        ctx.beginPath();
        ctx.ellipse(x, y, petalSize * 0.4, petalSize * 0.6, angle, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 初始化画布
  function initCanvas() {
    canvas.width = window.innerWidth * DPR;
    canvas.height = window.innerHeight * DPR;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(DPR, DPR);
  }

  // 分批创建粒子
  function createParticlesBatch(batchSize = 15) {
    if (sakuras.length >= maxCount || isCreatingParticles) return;
    isCreatingParticles = true;

    setTimeout(() => {
      const needCreate = Math.min(batchSize, maxCount - sakuras.length);
      for (let i = 0; i < needCreate; i++) {
        sakuras.push(new Sakura());
      }
      isCreatingParticles = false;
      
      if (sakuras.length < maxCount) {
        createParticlesBatch();
      }
    }, 20);
  }

  // 初始化粒子
  function initSakuras(newDensity = 1) {
    density = newDensity;
    sakuras = [];
    maxCount = Math.min(180, Math.floor((window.innerWidth * window.innerHeight / 5000) * density));
    createParticlesBatch();
  }

  // 优化动画循环
  let lastFrameTime = 0;
  const TARGET_FPS = 60;
  const FRAME_INTERVAL = 1000 / TARGET_FPS;

  function animate(timestamp) {
    if (timestamp - lastFrameTime < FRAME_INTERVAL) {
      requestAnimationFrame(animate);
      return;
    }
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
    
    for (let i = 0; i < sakuras.length; i++) {
      sakuras[i].update();
      sakuras[i].draw();
    }

    requestAnimationFrame(animate);
  }

  // 窗口resize处理
  window.addEventListener('resize', () => {
    initCanvas();
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
      initSakuras(density);
    }, 300);
  });

  // 暴露外部方法
  window.updateSakuraDensity = function(newDensity) {
    initSakuras(newDensity || density);
  };
  window.sakuraDensity = 1;

  // 启动
  initCanvas();
  initSakuras(1);
  requestAnimationFrame(animate);

  // 首次快速创建一批
  setTimeout(() => {
    if (sakuras.length === 0) {
      createParticlesBatch(20);
    }
  }, 100);
})();