# Portfolio versions

The Terminal design is the only published website, served from `/` by `index.html`.
It uses the Mono palette, always-visible glass terminal project cards, animated
glass headings, compact mobile ASCII art, and a terminal-style footer.

Older designs are preserved on GitHub branches, not published as alternate URLs:

- `codex/archive-current`: the previous Current homepage and its version snapshots,
  saved at commit `4f2429a`.
- `codex/archive-classic`: the Classic design as the branch's root homepage, based
  on the design saved in commit `40297e3`.

The `/classic/` and `/terminal/` directories and version selector are removed from
the publishing branch. Use a separate checkout of an archive branch to preview
an older design without changing the publishing branch.

Publishing requires explicit user approval before pushing to `codex/revamp`,
because GitHub Pages publishes that branch automatically. Keep experimental
edits local until they are approved.

The `.nojekyll` marker allows GitHub Pages to serve the static files directly.
The repository's Pages publishing source must point to the root of the branch
containing these files. No package installation or build step is required.
