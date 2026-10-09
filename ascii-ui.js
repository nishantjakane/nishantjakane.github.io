(() => {
  const root = document.documentElement;
  const motion = matchMedia("(prefers-reduced-motion:reduce)");
  const name = document.querySelector(".ascii-name");
  // Reveal the full FIGlet glyphs in two passes, with no layout shift or repeated speech.
  document.fonts.ready.then(() => {
    if (!name || motion.matches) return;
    const begin = () => name.classList.add("is-typing");
    if (!("IntersectionObserver" in window)) { begin(); return; }
    const arrival = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      begin();
      arrival.disconnect();
    }, {threshold:.25});
    arrival.observe(name);
  });
  motion.addEventListener("change", () => {
    if (motion.matches) name?.classList.remove("is-typing");
  });

  // Each card and section arrives once; translate composes with glass-button transforms.
  const arrivals = [...document.querySelectorAll(
    ".project, .section-heading, .skills > .kicker, .skills-layout > h2, .skill-group, .about > .kicker, .about > .ascii-command, .statement, .contact > .kicker, .contact > .ascii-command, .contact > h2, .contact > .email"
  )];
  const running = new Set();
  let entranceObserver;
  function reveal(target) {
    target.classList.add("has-arrived");
    if (motion.matches) return;
    const children = target.matches(".project")
      ? [...target.querySelectorAll(":scope > .project-index, :scope > .project-body, :scope > .project-link")]
      : [target];
    children.forEach((child,index) => {
      const animation = child.animate([
        {opacity:.35,translate:"0 22px"}, {opacity:1,translate:"0 0"}
      ], {duration:720,delay:index * 65,easing:"cubic-bezier(.22,1,.36,1)"});
      running.add(animation);
      animation.onfinish = () => { running.delete(animation); animation.cancel(); };
    });
  }
  if ("IntersectionObserver" in window && !motion.matches) {
    entranceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        entranceObserver.unobserve(entry.target);
      });
    }, {rootMargin:"0px 0px -6% 0px",threshold:0});
    arrivals.forEach(target => entranceObserver.observe(target));
  } else arrivals.forEach(target => target.classList.add("has-arrived"));
  motion.addEventListener("change", () => {
    if (!motion.matches) return;
    entranceObserver?.disconnect();
    running.forEach(animation => animation.cancel());
    running.clear();
    arrivals.forEach(target => target.classList.add("has-arrived"));
  });

  const desktop = matchMedia("(min-width:900px) and (pointer:fine) and (forced-colors:none)");
  const rail = document.createElement("div");
  rail.className = "page-scrollbar";
  rail.tabIndex = 0;
  rail.setAttribute("role", "scrollbar");
  rail.setAttribute("aria-label", "Page scroll position");
  rail.setAttribute("aria-controls", "top");
  rail.setAttribute("aria-orientation", "vertical");
  rail.setAttribute("aria-valuemin", "0");
  const thumb = document.createElement("span");
  thumb.className = "page-scrollbar__thumb";
  thumb.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.className = "page-scrollbar__position";
  label.setAttribute("aria-hidden", "true");
  rail.append(thumb,label);
  document.body.append(rail);

  let frame = 0, dragging = false, dragOffset = 0;
  const range = () => Math.max(0, root.scrollHeight - innerHeight);
  function update() {
    frame = 0;
    const max = range();
    const enabled = desktop.matches && max > 0;
    root.classList.toggle("has-page-scrollbar", enabled);
    rail.hidden = !enabled;
    if (!enabled) return;
    const height = rail.clientHeight;
    const size = Math.min(height,Math.max(44,height * innerHeight / root.scrollHeight));
    const ratio = Math.min(1,Math.max(0,scrollY / max));
    thumb.style.height = `${size}px`;
    thumb.style.transform = `translateY(${ratio * (height - size)}px)`;
    const percent = Math.round(ratio * 100);
    label.textContent = `${percent}%`;
    rail.setAttribute("aria-valuemax", String(Math.round(max)));
    rail.setAttribute("aria-valuenow", String(Math.round(Math.min(max,Math.max(0,scrollY)))));
    rail.setAttribute("aria-valuetext", `${percent}% of page`);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function dragTo(clientY) {
    const bounds = rail.getBoundingClientRect();
    const travel = bounds.height - thumb.clientHeight;
    if (travel <= 0) return;
    const fraction = Math.min(1,Math.max(0,(clientY - bounds.top - dragOffset) / travel));
    scrollTo({top:fraction * range(),behavior:"instant"});
    schedule();
  }
  rail.addEventListener("pointerdown", event => {
    if (event.button !== 0 || !desktop.matches) return;
    event.preventDefault();
    rail.focus({preventScroll:true});
    dragging = true;
    rail.classList.add("is-dragging");
    dragOffset = event.target === thumb ? event.clientY - thumb.getBoundingClientRect().top : thumb.clientHeight / 2;
    rail.setPointerCapture(event.pointerId);
    dragTo(event.clientY);
  });
  rail.addEventListener("pointermove", event => { if (dragging) dragTo(event.clientY); });
  function stop() { dragging = false; rail.classList.remove("is-dragging"); }
  ["pointerup","pointercancel","lostpointercapture"].forEach(type => rail.addEventListener(type,stop));
  rail.addEventListener("keydown", event => {
    const targets = {
      ArrowDown:scrollY + 64, ArrowUp:scrollY - 64,
      PageDown:scrollY + innerHeight * .85, PageUp:scrollY - innerHeight * .85,
      Home:0, End:range(), " ":scrollY + innerHeight * .85 * (event.shiftKey ? -1 : 1)
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    scrollTo({top:Math.max(0,Math.min(range(),targets[event.key])),behavior:motion.matches ? "instant" : "smooth"});
  });
  addEventListener("scroll", schedule, {passive:true});
  addEventListener("resize", () => { stop(); schedule(); });
  addEventListener("pageshow", schedule);
  desktop.addEventListener("change", () => { stop(); schedule(); });
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(document.body);
  document.fonts.ready.then(schedule);
  update();
})();
