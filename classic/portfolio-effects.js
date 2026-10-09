(() => {
  const nav = document.querySelector(".nav");
  const sections = [...nav.querySelectorAll('a[href^="#"]')].map(link => ({ link, section:document.querySelector(link.getAttribute("href")) })).filter(item => item.section && item.section.matches("section"));
  sections.forEach(({link}) => {
    const marker = document.createElement("span");
    marker.className = "nav-section-marker";
    marker.setAttribute("aria-hidden", "true");
    link.append(marker);
  });
  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  const fill = document.createElement("span");
  fill.className = "reading-progress__fill";
  progress.append(fill);
  document.body.append(progress);
  let frame = 0;
  function updateScroll() {
    frame = 0;
    const range = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const fraction = range ? Math.max(0, Math.min(1, scrollY / range)) : 0;
    fill.style.transform = `scaleX(${fraction})`;
    const line = nav.getBoundingClientRect().bottom + Math.min(140, innerHeight * .18);
    let current = null;
    sections.forEach(item => { if (item.section.getBoundingClientRect().top <= line) current = item; });
    if (range > 0 && fraction >= .999) current = sections[sections.length - 1];
    sections.forEach(item => {
      if (item === current) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    });
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(updateScroll); };
  addEventListener("scroll", schedule, { passive:true });
  addEventListener("resize", schedule);
  addEventListener("pageshow", schedule);
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(document.body);
  document.fonts?.ready.then(schedule);
  updateScroll();

  const hover = matchMedia("(hover:hover) and (pointer:fine)");
  const reducedMotion = matchMedia("(prefers-reduced-motion:reduce)");
  // Animate anchor navigation only; wheel, touch and scrollbar input remain native.
  let scrollAnimation = 0;
  let restoreScrollBehavior = "";
  function cancelAnchorScroll() {
    if (!scrollAnimation) return;
    cancelAnimationFrame(scrollAnimation);
    scrollAnimation = 0;
    document.documentElement.style.scrollBehavior = restoreScrollBehavior;
  }
  ["wheel", "touchstart", "pointerdown", "resize", "popstate"].forEach(type => addEventListener(type, cancelAnchorScroll, {passive:true}));
  addEventListener("keydown", event => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Escape", "Tab"].includes(event.key)) cancelAnchorScroll();
  });
  reducedMotion.addEventListener("change", cancelAnchorScroll);
  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute("href");
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    cancelAnchorScroll();
    if (reducedMotion.matches) return; // Native anchor navigation with CSS motion disabled.
    event.preventDefault();
    const start = scrollY;
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 112;
    const destination = () => hash === "#top" ? 0 : Math.max(0, Math.min(
      target.getBoundingClientRect().top + scrollY - offset,
      document.documentElement.scrollHeight - innerHeight
    ));
    const duration = Math.min(1000, Math.max(520, Math.abs(destination() - start) * .25));
    const started = performance.now();
    restoreScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    function step(now) {
      const t = Math.min(1, (now - started) / duration);
      const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      scrollTo({top:start + (destination() - start) * eased, behavior:"instant"});
      if (t < 1) { scrollAnimation = requestAnimationFrame(step); return; }
      cancelAnchorScroll();
      if (location.hash !== hash) history.pushState(null, "", hash);
      const temporaryFocus = !target.hasAttribute("tabindex");
      if (temporaryFocus) target.setAttribute("tabindex", "-1");
      target.focus({preventScroll:true});
      if (temporaryFocus) target.addEventListener("blur", () => target.removeAttribute("tabindex"), {once:true});
    }
    scrollAnimation = requestAnimationFrame(step);
  });
  document.querySelectorAll(".project-preview").forEach(details => {
    const card = details.closest(".project");
    const summary = details.querySelector("summary");
    let hovering = false, pinned = false, dismissed = false;
    let expanded = details.open, animation = null, leaveTimer;
    const reveal = (next, immediate = false) => {
      if (next === expanded && !immediate) return;
      expanded = next;
      const start = details.getBoundingClientRect().height;
      animation?.cancel();
      animation = null;
      details.style.height = "";
      details.style.overflow = "";
      card.classList.toggle("is-preview-open", next);
      if (immediate || reducedMotion.matches) { details.open = next; return; }
      // Keep native details open while measuring and animating in either direction.
      details.open = true;
      const end = next ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
      details.style.overflow = "hidden";
      animation = details.animate([{height:`${start}px`}, {height:`${end}px`}], {
        duration:next ? 420 : 300, easing:"cubic-bezier(.22,1,.36,1)", fill:"both"
      });
      animation.onfinish = () => {
        details.open = next;
        animation.cancel();
        animation = null;
        details.style.overflow = "";
      };
    };
    const sync = () => reveal(pinned || (!dismissed && (hovering || card.contains(document.activeElement))));
    card.addEventListener("pointerenter", event => {
      if (!hover.matches || event.pointerType === "touch") return;
      clearTimeout(leaveTimer);
      hovering = true; dismissed = false; sync();
    });
    card.addEventListener("pointerleave", () => {
      hovering = false;
      leaveTimer = setTimeout(sync, 140);
    });
    summary.addEventListener("click", event => {
      event.preventDefault();
      pinned = !expanded;
      dismissed = !pinned;
      sync();
    });
    // Focusing the external project link also reveals the snapshot.
    card.querySelector(".project-link").addEventListener("focus", sync);
    card.addEventListener("focusout", () => queueMicrotask(() => {
      if (!card.contains(document.activeElement)) { dismissed = false; sync(); }
    }));
    details.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      pinned = false; dismissed = true; reveal(false, true);
      summary.focus();
    });
    hover.addEventListener("change", () => { hovering = false; sync(); });
    // End at natural height when wrapping or motion preferences change mid-reveal.
    addEventListener("resize", () => { if (animation) reveal(expanded, true); });
    reducedMotion.addEventListener("change", () => reveal(expanded, true));
  });

  const groups = [...document.querySelectorAll(".skill-group")];
  groups.forEach(group => [...group.querySelectorAll(":scope > span")].forEach((chip,index) => chip.style.setProperty("--chip-delay", `${index * 85}ms`)));
  if ("IntersectionObserver" in window) {
    const arrivals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("has-entered");
        arrivals.unobserve(entry.target);
      });
    }, { threshold:.35 });
    groups.forEach(group => arrivals.observe(group));
  }
})();
