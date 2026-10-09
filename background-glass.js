(() => {
  const backdrop = document.createElement("div");
  backdrop.className = "ios-glass-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  document.body.prepend(backdrop);

  const controls = document.querySelectorAll(".liquid-button, .button, .project-link, .github-all, .email, .nav > nav a, footer a");
  controls.forEach(control => {
    control.classList.add("glass-control");
    // Put direct text above the reflective animation without changing the wording.
    Array.from(control.childNodes).forEach(node => {
      if (node.nodeType !== 3 || !node.textContent.trim()) return;
      const label = document.createElement("span");
      label.className = control.matches(".project-link") ? "glass-arrow" : "glass-label";
      label.textContent = node.textContent;
      node.replaceWith(label);
    });
    control.querySelectorAll(".btn-icon, .nav-github__arrow, .github-all__mark, .email > span:not(.glass-label), .quiet > span:not(.glass-label)")
      .forEach(icon => icon.classList.add("glass-arrow"));
  });

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (motion.matches || !mouse.matches) return;
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;

  function paint() {
    frame = 0;
    if (motion.matches || !mouse.matches || document.hidden) return;
    x += (targetX - x) * 0.09;
    y += (targetY - y) * 0.09;
    backdrop.style.setProperty("--pan-x", x.toFixed(2) + "px");
    backdrop.style.setProperty("--pan-y", y.toFixed(2) + "px");
    backdrop.style.setProperty("--light-x", (78 + x * 0.45).toFixed(2) + "%");
    backdrop.style.setProperty("--light-y", (30 + y * 0.7).toFixed(2) + "%");
    if (Math.hypot(targetX - x, targetY - y) > 0.05) frame = requestAnimationFrame(paint);
  }
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    x = y = targetX = targetY = 0;
    for (const name of ["--pan-x", "--pan-y", "--light-x", "--light-y"]) backdrop.style.removeProperty(name);
  }
  window.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse" || motion.matches || !mouse.matches || document.hidden) return;
    targetX = (event.clientX / window.innerWidth - 0.5) * 32;
    targetY = (event.clientY / window.innerHeight - 0.5) * 24;
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive:true });
  document.documentElement.addEventListener("pointerleave", () => {
    targetX = targetY = 0;
    if (!frame) frame = requestAnimationFrame(paint);
  });
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", () => { if (document.hidden) reset(); });
  motion.addEventListener("change", reset);
  mouse.addEventListener("change", reset);
})();
