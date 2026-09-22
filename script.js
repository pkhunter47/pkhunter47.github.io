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

// Generative signal field: responds gently to pointer and scroll.
if (!reduceMotion) {
  const canvas = document.querySelector("#signal-canvas");
  const ctx = canvas.getContext("2d");
  let width, height, dpr, particles = [], pointer = { x: -9999, y: -9999 };
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.6);
    width = innerWidth; height = innerHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(72, Math.floor(width / 20));
    particles = Array.from({ length: count }, () => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, r: Math.random() * 1.2 + .3 }));
  };
  addEventListener("resize", resize);
  addEventListener("pointermove", event => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
  addEventListener("pointerleave", () => { pointer.x = -9999; pointer.y = -9999; });
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      const dxp = pointer.x - p.x, dyp = pointer.y - p.y, pd = Math.hypot(dxp, dyp);
      if (pd < 140) { p.x -= dxp * .0012; p.y -= dyp * .0012; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = "rgba(103,232,249,.42)"; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 125) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(167,139,250,${(1 - d / 125) * .12})`; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  };
  resize(); draw();
}

document.querySelector("#year").textContent = new Date().getFullYear();
