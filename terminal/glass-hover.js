// Local terminal experiment: light follows the pointer, while content stays still.
(() => {
  const finePointer = matchMedia("(hover:hover) and (pointer:fine)");
  const reducedMotion = matchMedia("(prefers-reduced-motion:reduce)");
  document.querySelectorAll(".terminal-project,.about,.contact").forEach(surface => {
    let frame = 0, x = 0, y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      surface.style.removeProperty("--glass-x");
      surface.style.removeProperty("--glass-y");
    };
    surface.addEventListener("pointermove", event => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
      const rect = surface.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        surface.style.setProperty("--glass-x", `${x}px`);
        surface.style.setProperty("--glass-y", `${y}px`);
        frame = 0;
      });
    }, {passive:true});
    surface.addEventListener("pointerleave", reset);
    finePointer.addEventListener("change", reset);
    reducedMotion.addEventListener("change", reset);
  });
})();
