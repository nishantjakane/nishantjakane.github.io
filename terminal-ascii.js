// Keep the original desktop art; join word blocks into compact mobile rows.
document.querySelectorAll(".terminal-project .terminal-art").forEach(art => {
  const original = art.querySelector("pre");
  if (!original) return;
  const blocks = original.textContent.trimEnd().split(/\n\s*\n/).map(block => block.split("\n"));
  if (blocks.length < 2) return;
  const rows = [];
  for (let start = 0; start < blocks.length; start += 2) {
    const pair = blocks.slice(start, start + 2);
    const widths = pair.map(lines => Math.max(...lines.map(line => line.length)));
    const height = Math.max(...pair.map(lines => lines.length));
    const joined = Array.from({length:height}, (_, line) => pair.map((lines, index) =>
      (lines[line] || "").padEnd(widths[index], " ")
    ).join("   ").trimEnd());
    rows.push(joined.join("\n"));
  }
  const compact = document.createElement("pre");
  compact.className = "terminal-ascii--mobile";
  compact.setAttribute("aria-hidden", "true");
  compact.textContent = rows.join("\n\n");
  compact.style.setProperty("--ascii-columns", Math.max(...compact.textContent.split("\n").map(line => line.length)));
  original.classList.add("terminal-ascii--desktop");
  art.append(compact);
});
