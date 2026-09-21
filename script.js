document.getElementById("year").textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.16 });

document.querySelectorAll(".project, .skills, .statement, .contact").forEach((element) => observer.observe(element));

const glassNav = document.querySelector(".nav");

glassNav.addEventListener("pointermove", (event) => {
  const bounds = glassNav.getBoundingClientRect();
  glassNav.style.setProperty("--glass-x", `${event.clientX - bounds.left}px`);
  glassNav.style.setProperty("--glass-y", `${event.clientY - bounds.top}px`);
});

glassNav.addEventListener("pointerleave", () => {
  glassNav.style.setProperty("--glass-x", "50%");
  glassNav.style.setProperty("--glass-y", "0%");
});
