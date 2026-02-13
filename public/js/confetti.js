/**
 * confetti.js — Canvas-based confetti celebration
 * Call startConfetti() to launch the celebration.
 */

// eslint-disable-next-line no-unused-vars
function startConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const COLORS = [
    "#ff6b8a", "#e84574", "#f4a0b3", "#ff85a2",
    "#ffd700", "#ff69b4", "#e63946", "#4ade80",
    "#a78bfa", "#f472b6", "#fb923c", "#38bdf8",
  ];

  const particles = [];
  const PARTICLE_COUNT = 150;

  // Create particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height, // start above
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    });
  }

  let animationId;
  let frameCount = 0;
  const MAX_FRAMES = 300; // ~5 seconds at 60fps

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    let activeCount = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.rotation += p.rotationSpeed;

      // Fade out near the end
      if (frameCount > MAX_FRAMES - 60) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      if (p.y < canvas.height + 50 && p.opacity > 0) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    if (activeCount > 0 && frameCount < MAX_FRAMES) {
      animationId = requestAnimationFrame(animate);
    } else {
      // Clean up
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationId);
    }
  }

  // Handle window resize
  function onResize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", onResize);

  // Start!
  animate();
}
