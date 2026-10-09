document.getElementById("year").textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.16 });

document.querySelectorAll(".project, .skills, .statement, .contact").forEach((element) => observer.observe(element));

const glassNav = document.querySelector(".nav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const glassPreview = document.getElementById("nav-glass-preview");
if (glassPreview && new URLSearchParams(window.location.search).get("glass") === "classic") {
  glassPreview.disabled = true;
}

// A rounded lens normal map bends the backdrop at the rim, leaving its centre clear.
// Separate RGB sampling distances produce chromatic dispersion on real content.
let lensWidth = 0;
let lensHeight = 0;
function updateGlassLens() {
  const width = Math.round(glassNav.clientWidth);
  const height = Math.round(glassNav.clientHeight);
  if (!width || !height) return;
  if (width === lensWidth && height === lensHeight) return;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  const map = context.createImageData(width, height);
  const radius = height / 2;
  const bevel = Math.min(33, radius * 0.86);
  const refractionScale = Number(document.querySelector("#nav-glass-filter feDisplacementMap").getAttribute("scale"));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x + 0.5 - width / 2;
      const dy = y + 0.5 - height / 2;
      const nearestX = Math.max(-(width / 2 - radius), Math.min(width / 2 - radius, dx));
      const normalX = dx - nearestX;
      const length = Math.hypot(normalX, dy);
      const distance = radius - length;
      const t = Math.max(0, Math.min(1, distance / bevel));
      // Approximate a curved glass-air interface (refractive index 1.46).
      // Taper the optical thickness to zero at both ends of the bevel so
      // stronger bending never reproduces a second silhouette at the edge.
      const slope = (1 - t) * 1.5;
      const incident = slope / Math.sqrt(1 + slope * slope);
      const refracted = incident / 1.46;
      const opticalShift = (incident - refracted) / Math.sqrt(1 - refracted * refracted);
      const rim = distance > 0 && distance < bevel ? opticalShift * Math.sin(Math.PI * t) ** 2 * 2.8 : 0;
      const body = distance > 0 ? 0.06 * Math.sin(Math.PI * Math.min(1, length / radius)) : 0;
      // Keep every displaced sample inside the rounded lens. This allows a
      // deeper bevel without sampling its silhouette into a duplicate outline.
      const travel = Math.max(0, distance - 1) * 0.85;
      const bend = travel > 0 ? 2 * travel / refractionScale * Math.tanh((rim + body) * refractionScale / (2 * travel)) : 0;
      const offset = (y * width + x) * 4;
      map.data[offset] = Math.round(128 + (length ? normalX / length : 0) * bend * 127);
      map.data[offset + 1] = Math.round(128 + (length ? dy / length : 0) * bend * 127);
      map.data[offset + 2] = 128;
      map.data[offset + 3] = 255;
    }
  }

  context.putImageData(map, 0, 0);
  const filter = document.getElementById("nav-glass-filter");
  const lens = document.getElementById("nav-refraction-map");
  for (const element of [filter, lens]) {
    element.setAttribute("x", "0");
    element.setAttribute("y", "0");
    element.setAttribute("width", width);
    element.setAttribute("height", height);
  }
  lens.setAttribute("href", canvas.toDataURL());
  lensWidth = width;
  lensHeight = height;
  glassNav.classList.add("lens-ready");
}

if ("ResizeObserver" in window) {
  new ResizeObserver(updateGlassLens).observe(glassNav);
} else {
  window.addEventListener("resize", updateGlassLens);
}
updateGlassLens();

// One moving lens keeps the link hit areas still, even during fast pointer sweeps.
const hoverLens = document.createElement("span");
hoverLens.className = "nav-hover-lens";
hoverLens.setAttribute("aria-hidden", "true");
glassNav.append(hoverLens);
glassNav.classList.add("hover-lens-ready");
const navLinks = [...glassNav.querySelectorAll("nav a")];
let hoveredLink = null;
let focusedLink = null;

function positionHoverLens() {
  const link = hoveredLink || focusedLink;
  glassNav.classList.toggle("has-hover-lens", Boolean(link));
  if (!link) {
    glassNav.style.setProperty("--glass-light", "0");
    return;
  }
  const bounds = glassNav.getBoundingClientRect();
  const target = link.getBoundingClientRect();
  hoverLens.style.width = `${target.width}px`;
  hoverLens.style.height = `${target.height}px`;
  hoverLens.style.transform = `translate3d(${target.left - bounds.left}px, ${target.top - bounds.top}px, 0)`;
  hoverLens.classList.toggle("is-github", link.classList.contains("nav-github"));
  glassNav.style.setProperty("--glass-light", "1");
  glassNav.style.setProperty("--glass-x", `${target.left - bounds.left + target.width / 2}px`);
  glassNav.style.setProperty("--glass-y", `${target.top - bounds.top + target.height / 2}px`);
}

navLinks.forEach((link) => {
  link.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    hoveredLink = link;
    positionHoverLens();
  });
  link.addEventListener("focus", () => {
    focusedLink = link.matches(":focus-visible") ? link : null;
    positionHoverLens();
  });
  link.addEventListener("blur", () => {
    focusedLink = null;
    positionHoverLens();
  });
});
glassNav.querySelector("nav").addEventListener("pointerleave", () => {
  hoveredLink = null;
  positionHoverLens();
});
if ("ResizeObserver" in window) {
  const hoverResize = new ResizeObserver(positionHoverLens);
  hoverResize.observe(glassNav);
  navLinks.forEach((link) => hoverResize.observe(link));
}

glassNav.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches || event.pointerType === "touch") return;
  const bounds = glassNav.getBoundingClientRect();
  glassNav.style.setProperty("--glass-light", "1");
  glassNav.style.setProperty("--glass-x", `${event.clientX - bounds.left}px`);
  glassNav.style.setProperty("--glass-y", `${event.clientY - bounds.top}px`);
});

glassNav.addEventListener("pointerleave", () => {
  hoveredLink = null;
  positionHoverLens();
});
