class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1; // Snow size between 1-4px
    this.speedY = Math.random() * 1 + 0.5; // Falling speed
    this.speedX = Math.random() * 0.5 - 0.25; // Slight horizontal movement
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;

    // Reset particle position when it goes off screen
    if (this.y > this.canvas.height) {
      this.y = 0;
      this.x = Math.random() * this.canvas.width;
    }
    if (this.x > this.canvas.width) {
      this.x = 0;
    }
    if (this.x < 0) {
      this.x = this.canvas.width;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class ParticleSystem {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.numberOfParticles = 100;

    this.init();
    this.animate();
  }

  init() {
    // Setup canvas
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "-1";
    document.body.appendChild(this.canvas);

    // Handle resize
    window.addEventListener("resize", () => this.resize());
    this.resize();

    // Create particles
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this.canvas));
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle) => {
      particle.update();
      particle.draw(this.ctx);
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize the particle system when the window loads
window.addEventListener("load", () => {
  new ParticleSystem();
});
