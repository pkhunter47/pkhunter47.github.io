"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Intro sequence
document.body.classList.add("is-loading");
const loader = document.querySelector(".loader");
const loaderBar = document.querySelector(".loader__track span");
const loaderCount = document.querySelector(".loader__count");
let loadValue = 0;

if (reduceMotion) {
  loader.remove();
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
} else {
  requestAnimationFrame(() => { loaderBar.style.width = "100%"; });
  const countTimer = setInterval(() => {
    loadValue = Math.min(100, loadValue + Math.ceil(Math.random() * 13));
    loaderCount.textContent = String(loadValue).padStart(2, "0");
    if (loadValue >= 100) clearInterval(countTimer);
  }, 70);
  window.addEventListener("load", () => {
    setTimeout(() => {
      loaderCount.textContent = "100";
      loader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
      setTimeout(() => loader.remove(), 950);
    }, 900);
  });
}

// Header and mobile menu
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", scrollY > 40), { passive: true });
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileMenu.classList.toggle("is-open", !isOpen);
});
mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
}));

// Scroll reveals
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .13, rootMargin: "0px 0px -40px" });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Counter animation
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target);
    const decimals = Number(el.dataset.decimals || 0);
    const started = performance.now();
    const duration = 1300;
    const tick = now => {
      const p = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: .7 });
document.querySelectorAll(".counter").forEach(el => counterObserver.observe(el));

// Background depth for generated artwork
if (!reduceMotion) {
  const parallaxSections = document.querySelectorAll("[data-parallax]");
  let parallaxTicking = false;
  const updateParallax = () => {
    parallaxSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const offset = Math.max(-70, Math.min(70, (innerHeight / 2 - (rect.top + rect.height / 2)) * .075));
      section.style.setProperty("--parallax-y", `${offset}px`);
    });
    parallaxTicking = false;
  };
  addEventListener("scroll", () => {
    if (!parallaxTicking) {
      requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  }, { passive: true });
  updateParallax();
}

// Project filtering
const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project-card");
filters.forEach(button => button.addEventListener("click", () => {
  filters.forEach(item => item.classList.remove("is-active"));
  button.classList.add("is-active");
  const value = button.dataset.filter;
  projects.forEach(card => card.classList.toggle("is-hidden", value !== "all" && card.dataset.category !== value));
}));

// Image preview
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
document.querySelectorAll(".design-shot").forEach(button => button.addEventListener("click", () => {
  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = button.querySelector("img").alt;
  lightbox.showModal();
}));
lightbox.querySelector("button").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });

// Pointer-following controls, tilt, and cursor
if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("mousemove", event => { mx = event.clientX; my = event.clientY; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; });
  const follow = () => {
    rx += (mx - rx) * .14; ry += (my - ry) * .14;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(follow);
  };
  follow();
  document.querySelectorAll("a, button, .tilt-card").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-hover"));
  });

  document.querySelectorAll(".magnetic").forEach(el => {
    el.addEventListener("mousemove", event => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .16;
      const y = (event.clientY - rect.top - rect.height / 2) * .16;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  document.querySelectorAll(".tilt-card").forEach(card => {
    card.addEventListener("mousemove", event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(900px) rotateX(${py * -3}deg) rotateY(${px * 4}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
}

// Animated aurora and starfield: visible color, gentle motion, and occasional shooting stars.
if (!reduceMotion) {
  const canvas = document.querySelector("#signal-canvas");
  const ctx = canvas.getContext("2d");
  let width, height, dpr, particles = [], shootingStars = [];
  let nextShootingStar = 0, previousFrame = 0;
  const pointer = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    width = innerWidth;
    height = innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(96, Math.max(48, Math.floor(width / 15)));
    particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .3,
      vy: (Math.random() - .5) * .3,
      r: i % 8 === 0 ? Math.random() * 1.8 + 2.2 : Math.random() * 1.5 + 1.1,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > .48 ? 188 : 258
    }));
  };

  addEventListener("resize", resize, { passive: true });
  addEventListener("pointermove", event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });
  addEventListener("pointerleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  const draw = now => {
    const frameScale = previousFrame ? Math.min((now - previousFrame) / 16.67, 2) : 1;
    previousFrame = now;
    const time = now * .00012;
    ctx.clearRect(0, 0, width, height);

    // Broad, slowly drifting light makes the background visible without obscuring content.
    const glow = (x, y, radius, color) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(9,11,16,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };
    const span = Math.max(width, height);
    glow(width * (.20 + Math.sin(time) * .04), height * (.27 + Math.cos(time * .8) * .045), span * .48, "rgba(38,205,224,.32)");
    glow(width * (.80 + Math.cos(time * .72) * .045), height * (.62 + Math.sin(time * .9) * .05), span * .46, "rgba(139,102,255,.29)");
    glow(width * (.50 + Math.sin(time * .5) * .06), height * (.08 + Math.cos(time) * .03), span * .36, "rgba(79,144,255,.21)");

    // Flowing ribbons carry the cyan-to-violet palette across the screen.
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 2; i++) {
      const baseY = height * (.30 + i * .38);
      const drift = Math.sin(time * (1.15 + i * .18) + i * 2.2) * height * .065;
      const gradient = ctx.createLinearGradient(0, baseY, width, baseY);
      gradient.addColorStop(0, "rgba(103,232,249,0)");
      gradient.addColorStop(.25, "rgba(103,232,249,.34)");
      gradient.addColorStop(.60, "rgba(167,139,250,.31)");
      gradient.addColorStop(1, "rgba(103,232,249,0)");
      ctx.beginPath();
      ctx.moveTo(-30, baseY + drift);
      ctx.bezierCurveTo(width * .25, baseY - height * .17 + drift, width * .68, baseY + height * .17 - drift, width + 30, baseY - drift);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 24;
      ctx.shadowColor = i ? "rgba(167,139,250,.48)" : "rgba(103,232,249,.48)";
      ctx.stroke();
    }
    ctx.restore();
    ctx.shadowBlur = 0;

    // Launch a short meteor occasionally; its glow stays soft behind the page content.
    if (now >= nextShootingStar && shootingStars.length < 2) {
      shootingStars.push({
        x: Math.random() * width * .56 + width * .30,
        y: Math.random() * height * .34,
        vx: 10 + Math.random() * 5,
        vy: 4 + Math.random() * 3,
        length: 90 + Math.random() * 100,
        age: 0,
        lifetime: 48 + Math.random() * 16
      });
      nextShootingStar = now + 1900 + Math.random() * 2700;
    }
    shootingStars = shootingStars.filter(star => star.age < star.lifetime);
    shootingStars.forEach(star => {
      star.x += star.vx * frameScale;
      star.y += star.vy * frameScale;
      star.age += frameScale;
      const fadeIn = Math.min(1, star.age / 7);
      const fadeOut = Math.min(1, (star.lifetime - star.age) / 12);
      const alpha = Math.max(0, fadeIn * fadeOut);
      const tailX = star.x - star.length;
      const tailY = star.y - star.length * .34;
      const trail = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
      trail.addColorStop(0, "rgba(103,232,249,0)");
      trail.addColorStop(.72, `rgba(151,230,255,${alpha * .52})`);
      trail.addColorStop(1, `rgba(244,252,255,${alpha})`);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(star.x, star.y);
      ctx.strokeStyle = trail;
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(103,232,249,${alpha * .8})`;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,253,255,${alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Bright, gently twinkling stars with a more legible constellation network.
    particles.forEach((p, i) => {
      p.x += (p.vx + Math.sin(time + p.phase) * .12) * frameScale;
      p.y += (p.vy + Math.cos(time * .9 + p.phase) * .12) * frameScale;
      if (p.x < -4 || p.x > width + 4) p.vx *= -1;
      if (p.y < -4 || p.y > height + 4) p.vy *= -1;

      const dxp = pointer.x - p.x;
      const dyp = pointer.y - p.y;
      const pd = Math.hypot(dxp, dyp);
      if (pd < 175) {
        p.x -= dxp * .0016;
        p.y -= dyp * .0016;
      }

      const pulse = .68 + Math.sin(now * .0016 + p.phase) * .27;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (1 + pulse * .2), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 96%, 79%, ${.72 + pulse * .25})`;
      ctx.shadowBlur = p.r > 2 ? 23 : 15;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 72%, .95)`;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance < 178) {
          const shimmer = .78 + Math.sin(now * .001 + p.phase + q.phase) * .2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(151,203,255,${(1 - distance / 178) * .37 * shimmer})`;
          ctx.lineWidth = .85;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  };

  resize();
  nextShootingStar = performance.now() + 900;
  requestAnimationFrame(draw);
}
document.querySelector("#year").textContent = new Date().getFullYear();
