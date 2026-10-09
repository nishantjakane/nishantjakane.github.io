(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll(".skill-group").forEach(group => {
    let releaseTimer = 0;
    const clear = () => group.classList.remove("is-active");
    group.addEventListener("pointermove", event => {
      if (reduced.matches || event.pointerType === "touch") return;
      const bounds = group.getBoundingClientRect();
      group.style.setProperty("--skill-x", `${event.clientX - bounds.left}px`);
      group.style.setProperty("--skill-y", `${event.clientY - bounds.top}px`);
      group.classList.add("is-active");
    });
    group.addEventListener("pointerleave", clear);
    group.addEventListener("click", () => {
      group.classList.add("is-selected");
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => group.classList.remove("is-selected"), 950);
    });
  });
})();
