(function () {
  const canvas = document.getElementById("lorenz-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let animationFrameId;

  // System parameters mimicking fluid chaotic convection
  const sigma = 10.0;
  const rho = 28.0;
  const beta = 8.0 / 3.0;
  const dt = 0.0025; // Timestep for smooth high-speed animation

  const numParticles = 50;
  const maxHistory = 50; // Length of the short path trace segment
  const particles = [];

  let isDark = false;

  function updateThemeColors() {
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    isDark = theme === "dark";
  }

  // Actively watch the html data-theme attribute for theme switching
  const observer = new MutationObserver(updateThemeColors);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });
  updateThemeColors();

  // Initialize particles with tiny random variations and path histories
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: 20 + (Math.random() - 0.5) * 10,
      history: [], // Stores the recent coordinate path segment
    });
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function animate() {
    // Clear the canvas completely so there is NO history/accumulation on the background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Slow rotation angle for 3D depth effect
    const angle = Date.now() * 0.00005;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const scale = Math.min(canvas.width, canvas.height) * 0.016;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < numParticles; i++) {
      const p = particles[i];

      // Lorenz Attractor equations
      const dx = sigma * (p.y - p.x) * dt;
      const dy = (p.x * (rho - p.z) - p.y) * dt;
      const dz = (p.x * p.y - beta * p.z) * dt;

      p.x += dx;
      p.y += dy;
      p.z += dz;

      // Project 3D coordinates with Y-axis rotation
      const rx = p.x * cosA - (p.z - 25) * sinA;
      const ry = p.y;

      const screenX = centerX + rx * scale;
      const screenY = centerY - ry * scale; // Invert Y for Cartesian mapping

      // Add current position to path history
      p.history.push({ x: screenX, y: screenY });

      // Keep only the most recent steps for a short path segment
      if (p.history.length > maxHistory) {
        p.history.shift();
      }

      // Draw the short fading path (segment-by-segment opacity gradient)
      if (p.history.length > 1) {
        for (let j = 1; j < p.history.length; j++) {
          const p1 = p.history[j - 1];
          const p2 = p.history[j];

          // Skip drawing if lines are artificially stretched (during a reset)
          const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            // Opacity scales up towards the front of the path
            const ratio = j / p.history.length;
            const opacity = ratio * (isDark ? 0.9 : 1.0);

            ctx.strokeStyle = isDark ? `rgba(45, 212, 191, ${opacity})` : `rgba(15, 118, 110, ${opacity})`;
            ctx.lineWidth = 1.6 * ratio; // Taper line slightly towards the tail
            ctx.stroke();
          }
        }
      }

      // Reset if particle wanders off (numerical safety)
      if (isNaN(p.x) || Math.abs(p.x) > 100) {
        p.x = (Math.random() - 0.5) * 10;
        p.y = (Math.random() - 0.5) * 10;
        p.z = 20 + (Math.random() - 0.5) * 10;
        p.history = [];
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Start the loop
  animate();
})();
