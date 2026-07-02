# Roadmap

Status summary (2026-07-02): Phases 0–4 are **done** — docs, seed data,
MCP server, static site, and open-source scaffolding all ship in this repo.
Phase 5 (public launch: npm publish, Vercel deploy, GitHub release,
directory submissions) is the next step.

## Phase 0 - Documentation

Status: done.

Deliverables:

- Public README.
- Project brief.
- MCP tool spec.
- Data model.
- Site spec.
- Source policy.
- Seed corpus.

Exit criteria:

- No direct public mention of the omitted teacher.
- Clear distinction between official facts, reports, interpretations, and
  symbolic claims.
- Enough detail for implementation without another strategy pass.

## Phase 1 - Seed data

Status: done (seed batch v0.1 in `data/`, validated by `scripts/validate-data.mjs`).

Goal: create the first static dataset.

Tasks:

- Create `data/motifs.json`.
- Create `data/events.json` with official CERN anchors and source URLs.
- Create `data/mandela-items.json`.
- Create `data/story-threads.json`.
- Create `data/reports.json` with 20 to 40 manually reviewed reports.
- Add a metadata check script that fails if direct omitted-teacher naming appears
  in public files.

Exit criteria:

- Dataset validates against local schemas.
- Every official claim has a source URL.
- Every speculative/institutional claim has safety flags.

## Phase 2 - MCP server

Status: done (`src/index.ts`, smoke-tested over stdio by `tests/smoke.test.mjs`).

Goal: local-first read-only MCP.

Tasks:

- TypeScript package.
- Load static JSON corpus.
- Implement read-only tools:
  - `timeline_search_reports`
  - `timeline_get_report`
  - `timeline_mandela_catalog`
  - `timeline_motif_map`
  - `timeline_story_threads`
  - `timeline_events`
  - `timeline_compare_sources`
  - `timeline_deepen_story`
  - `timeline_stats`
  - `timeline_agent_manifest`
- Add smoke tests.
- Add metadata tests for `server.json`, `glama.json`, and package fields.

Exit criteria:

- `npm test` passes.
- MCP Inspector can call every tool.
- No network required for core tools.

## Phase 3 - Vercel site

Status: built (`site/` — vanilla port of the Claude Design prototype; deploy pending).

Goal: static public archive.

Tasks:

- Build `site/index.html`.
- Copy JSON data into `site/`.
- Add search/filter UI.
- Add timeline view.
- Add motif graph.
- Add Mandela catalog.
- Add story thread pages or panels.
- Add `/llms.txt`, `/robots.txt`, `/sitemap.xml`.
- Deploy to Vercel.

Exit criteria:

- Site loads without backend.
- JSON endpoints are public and CORS-readable.
- Search works on mobile and desktop.
- Visual labels make official vs symbolic layers obvious.

## Phase 4 - Open-source readiness

Status: done (LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, issue
templates, CI with policy guard).

Goal: publishable public repo.

Tasks:

- Add MIT license.
- Add CONTRIBUTING.md.
- Add SECURITY.md.
- Add source submission template.
- Add issue templates:
  - report submission.
  - source correction.
  - motif proposal.
  - safety/copyright concern.
- Add GitHub Actions:
  - typecheck.
  - tests.
  - metadata lint.
  - no-direct-name guard.

Exit criteria:

- Repo can be made public without leaking private notes.
- Contribution policy is clear.
- Safety/copyright process exists.

## Phase 5 - Public launch

Status: next (names `timeline-pulse` confirmed free on npm and GitHub as of 2026-07-02).

Goal: GitHub + npm + Vercel launch.

Tasks:

- Check package name availability.
- Publish npm package.
- Create GitHub release.
- Submit to MCP directories.
- Share `llms.txt` and JSON endpoints.
- Create a launch post that frames the project as a cultural archive, not a
  proof engine.

Exit criteria:

- `npx -y timeline-pulse` works.
- Vercel site works.
- GitHub release and npm latest agree.
- MCP directory metadata is valid.

## Later ideas

- Personal private notebook mode.
- User-submitted reports with local moderation.
- Import from user-owned X archive.
- Multi-language corpus.
- Story graph export for writers.
- Agent prompt packs for creative exploration.
- Public "research quests" for contributors.

