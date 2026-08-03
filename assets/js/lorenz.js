(function () {
  const canvas = document.getElementById("lorenz-canvas");
  if (!canvas) return;
  canvas.setAttribute("aria-hidden", "true");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  const ctx = canvas.getContext("2d");
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  const dt = 0.0025;
  const particleCount = window.innerWidth < 768 ? 18 : 30;
  const trailLength = window.innerWidth < 768 ? 40 : 64;
  const stateKey = "lorenz-continuity-v1";
  const particles = [];
  const referenceOrbit = [];

  let width = 0;
  let height = 0;
  let isDark = false;
  let isRunning = true;
  let animationFrameId;
  let rotation = 0;
  let previousTimestamp;

  function updateTheme() {
    isDark = document.documentElement.getAttribute("data-theme") === "dark";
  }

  const themeObserver = new MutationObserver(updateTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });
  updateTheme();

  function resetParticle(particle) {
    particle.x = (Math.random() - 0.5) * 20;
    particle.y = (Math.random() - 0.5) * 20;
    particle.z = 20 + (Math.random() - 0.5) * 10;
    particle.history = [];
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function stepParticle(particle) {
    const dx = sigma * (particle.y - particle.x) * dt;
    const dy = (particle.x * (rho - particle.z) - particle.y) * dt;
    const dz = (particle.x * particle.y - beta * particle.z) * dt;
    particle.x += dx;
    particle.y += dy;
    particle.z += dz;
  }

  function createParticle(index) {
    const particle = {};
    resetParticle(particle);
    // Stagger the trajectories so the attractor is composed on a first visit.
    for (let warmup = 0; warmup < 420 + index * 9; warmup += 1) {
      stepParticle(particle);
    }
    return particle;
  }

  function restoreState() {
    try {
      let serialized;
      if (typeof window.sessionStorage !== "undefined") {
        serialized = window.sessionStorage.getItem(stateKey);
      }
      if (!serialized && window.name.startsWith(`${stateKey}:`)) {
        serialized = window.name.slice(stateKey.length + 1);
      }

      const saved = JSON.parse(serialized);
      if (!saved || !Array.isArray(saved.particles)) return false;

      rotation = Number.isFinite(saved.rotation) ? saved.rotation : 0;
      saved.particles.slice(0, particleCount).forEach((savedParticle) => {
        if (
          !Number.isFinite(savedParticle.x) ||
          !Number.isFinite(savedParticle.y) ||
          !Number.isFinite(savedParticle.z)
        ) {
          return;
        }

        particles.push({
          x: savedParticle.x,
          y: savedParticle.y,
          z: savedParticle.z,
          history: Array.isArray(savedParticle.history)
            ? savedParticle.history.slice(-trailLength)
            : [],
        });
      });
      return particles.length > 0;
    } catch (_) {
      return false;
    }
  }

  function persistState() {
    try {
      const serialized = JSON.stringify({
        rotation,
        particles: particles.map(({ x, y, z, history }) => ({
          x,
          y,
          z,
          history: history.slice(-trailLength),
        })),
      });

      if (typeof window.sessionStorage !== "undefined") {
        window.sessionStorage.setItem(stateKey, serialized);
      } else if (!window.name || window.name.startsWith(`${stateKey}:`)) {
        // window.name persists for the life of a tab and covers privacy modes
        // that disable Web Storage without changing site behavior.
        window.name = `${stateKey}:${serialized}`;
      }
    } catch (_) {
      // The animation remains usable if storage is unavailable or full.
    }
  }

  function buildReferenceOrbit() {
    const state = { x: 0.1, y: 0, z: 0 };
    for (let warmup = 0; warmup < 2200; warmup += 1) stepParticle(state);
    for (let index = 0; index < 2600; index += 1) {
      stepParticle(state);
      referenceOrbit.push({ x: state.x, y: state.y, z: state.z });
    }
  }

  function drawReferenceOrbit(rotation, scale, centerX, centerY) {
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    let previous;

    ctx.beginPath();
    referenceOrbit.forEach((point) => {
      const rotatedX = point.x * cosine - (point.z - 25) * sine;
      const projected = {
        x: centerX + rotatedX * scale,
        y: centerY - point.y * scale,
      };
      const distance = previous
        ? Math.hypot(projected.x - previous.x, projected.y - previous.y)
        : Infinity;

      if (!previous || distance > 90) ctx.moveTo(projected.x, projected.y);
      else ctx.lineTo(projected.x, projected.y);
      previous = projected;
    });
    ctx.strokeStyle = isDark
      ? "rgba(45, 212, 191, 0.16)"
      : "rgba(15, 118, 110, 0.12)";
    ctx.lineWidth = 1.05;
    ctx.stroke();
  }

  function projectPoint(point, cosine, sine, scale, centerX, centerY) {
    const rotatedX = point.x * cosine - (point.z - 25) * sine;
    return {
      x: centerX + rotatedX * scale,
      y: centerY - point.y * scale,
      depth: (point.z - 5) / 45,
    };
  }

  function drawTrail(particle, cosine, sine, scale, centerX, centerY) {
    if (particle.history.length < 2) return;

    for (let index = 1; index < particle.history.length; index += 1) {
      const start = projectPoint(
        particle.history[index - 1],
        cosine,
        sine,
        scale,
        centerX,
        centerY,
      );
      const end = projectPoint(
        particle.history[index],
        cosine,
        sine,
        scale,
        centerX,
        centerY,
      );
      const distance = Math.hypot(end.x - start.x, end.y - start.y);
      if (distance > 90) continue;

      const progress = index / particle.history.length;
      const depth = Math.max(0, Math.min(1, end.depth));
      const hue = 173 + depth * 18;
      const saturation = isDark ? 72 : 68;
      const lightness = isDark ? 58 + depth * 8 : 31 + depth * 7;
      const alpha = progress * (0.48 + depth * 0.4);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      ctx.lineWidth = 0.675 + 1.725 * progress;
      ctx.stroke();
    }
  }

  function softenBehindContent() {
    if (width < 900) return;

    const corridorWidth = Math.min(980, width * 0.64);
    const left = (width - corridorWidth) / 2;
    const fade = ctx.createLinearGradient(left, 0, left + corridorWidth, 0);
    fade.addColorStop(0, "rgba(0, 0, 0, 0)");
    fade.addColorStop(0.16, "rgba(0, 0, 0, 0.18)");
    fade.addColorStop(0.5, "rgba(0, 0, 0, 0.34)");
    fade.addColorStop(0.84, "rgba(0, 0, 0, 0.18)");
    fade.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = fade;
    ctx.fillRect(left, 0, corridorWidth, height);
    ctx.restore();
  }

  function animate(timestamp) {
    if (!isRunning) {
      animationFrameId = undefined;
      return;
    }

    ctx.clearRect(0, 0, width, height);
    const elapsed = previousTimestamp
      ? Math.min(timestamp - previousTimestamp, 50)
      : 16;
    previousTimestamp = timestamp;
    rotation += elapsed * 0.00005;
    const cosine = Math.cos(rotation);
    const sine = Math.sin(rotation);
    const scale = Math.min(width, height) * 0.016;
    const centerX = width / 2;
    const centerY = height / 2;

    drawReferenceOrbit(rotation, scale, centerX, centerY);

    particles.forEach((particle) => {
      stepParticle(particle);

      if (
        !Number.isFinite(particle.x) ||
        !Number.isFinite(particle.y) ||
        !Number.isFinite(particle.z) ||
        Math.abs(particle.x) > 100
      ) {
        resetParticle(particle);
        return;
      }

      particle.history.push({ x: particle.x, y: particle.y, z: particle.z });
      if (particle.history.length > trailLength) particle.history.shift();
      drawTrail(particle, cosine, sine, scale, centerX, centerY);
    });

    softenBehindContent();
    animationFrameId = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pagehide", persistState);
  window.addEventListener("lorenz-toggle", (event) => {
    const enabled = event.detail?.enabled !== false;

    if (!enabled) {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = undefined;
      ctx.clearRect(0, 0, width, height);
      return;
    }

    if (!isRunning || !animationFrameId) {
      isRunning = true;
      previousTimestamp = undefined;
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  resizeCanvas();
  canvas.dataset.continuity = restoreState() ? "restored" : "new";
  while (particles.length < particleCount) {
    particles.push(createParticle(particles.length));
  }
  buildReferenceOrbit();
  animationFrameId = requestAnimationFrame(animate);
})();
