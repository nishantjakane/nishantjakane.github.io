# Portfolio versions

All three website versions use the Mono palette.

- `/` serves the current ASCII/glass revamp from `index.html`.
- `/classic/` serves the design saved in commit `40297e3`.
- `/terminal/` serves the always-visible glass terminal project cards, animated
  glass headings, compact mobile ASCII art, and terminal-style footer. It shares
  the current version's assets.

Publishing requires explicit user approval before pushing to `codex/revamp`,
because GitHub Pages publishes that branch automatically. Keep experimental
edits local until they are approved.

The classic folder contains independent copies of the snapshot's static assets.
Its only presentation changes are fixing the palette to Mono and replacing the
theme selector with links between website versions.

The `.nojekyll` marker allows GitHub Pages to serve the static files directly.
The repository's Pages publishing source must point to the root of the branch
containing these files. No package installation or build step is required.
