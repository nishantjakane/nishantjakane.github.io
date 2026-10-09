(() => {
  const theme = document.documentElement.dataset.theme;
  if (theme !== "retro" && theme !== "dark" && theme !== "night-pixel" && theme !== "mono") return;

  const field = document.createElement("div");
  field.className = "ambient-field";
  field.setAttribute("aria-hidden", "true");
  field.innerHTML = '<span class="ambient-field__bloom"></span><span class="ambient-field__ribbon"></span>';
  document.body.prepend(field);
})();
