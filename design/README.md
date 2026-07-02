# Design reference

This folder preserves the original visual design of the site, produced with
**Claude Design** (claude.ai) before any code existed:

- `timeline-pulse-site.dc.html` — the design file in Claude Design's `.dc`
  format (an HTML template with `{{ }}` bindings plus an embedded logic
  script). It contains the original seed content that later became
  `data/*.json`.
- `support.js` — the Claude Design runtime needed to open the `.dc.html`
  file standalone (it expects `window.React`/`ReactDOM`; the file is kept for
  provenance, not for serving).
- `thumbnail.webp` — the design preview image.

The production site at [`site/index.html`](../site/index.html) is a faithful
vanilla HTML/CSS/JS port of this design — no React, no build step — reading
the corpus from the same JSON endpoints the MCP server ships.

Treat this folder as read-only history: design changes should happen in
`site/`, not here.
