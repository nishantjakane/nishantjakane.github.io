# Portfolio versions

Both website versions use the Mono palette.

- `/` serves the current ASCII/glass revamp from `index.html`.
- `/classic/` serves the design saved in commit `40297e3`.

The classic folder contains independent copies of the snapshot's static assets.
Its only presentation changes are fixing the palette to Mono and replacing the
theme selector with links between website versions.

The `.nojekyll` marker allows GitHub Pages to serve the static files directly.
The repository's Pages publishing source must point to the root of the branch
containing these files. No package installation or build step is required.
