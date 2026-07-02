# Timeline Pulse ◉

**The machine went quiet. The stories didn't.**

Timeline Pulse is an open-source MCP server and interactive atlas of
timeline-shift folklore, Mandela Effect reports, collider-era myths, and
symbolic reality stories — every claim labeled, every source graded.

On 2026-06-29 the LHC was switched off for Long Shutdown 3, and won't collide
again until ~2030 ([CERN](https://home.cern/cern-bids-farewell-to-the-lhc-and-enters-long-shutdown-3/)).
Communities tell stories around machines like this. This project files those
stories properly: official facts on one shelf (always cited), beliefs and
symbols on another (always labeled), and tools so humans *and* AI agents can
explore both without confusing them.

> Timeline Pulse treats its material as cultural, symbolic, experiential, and
> speculative storytelling. It does not claim that CERN, the LHC, particle
> physics, timelines, or Mandela Effects prove supernatural or physical
> timeline manipulation.

- **Site:** https://timeline-pulse.vercel.app
- **Package:** `timeline-pulse` on npm — no keys, no backend, read-only
- **Built end-to-end with Claude** (Claude Code + Claude in the browser
  designed, documented, and implemented this repo), reviewed by a human

## Use it as an MCP server

```json
{
  "mcpServers": {
    "timeline-pulse": {
      "command": "npx",
      "args": ["-y", "timeline-pulse"]
    }
  }
}
```

The seed corpus ships inside the package: 20 reports, 17 motifs (24
co-occurrence edges), 6 Mandela catalog items, 8 story threads, 9 timeline
events with 5 officially-sourced CERN anchors.

## MCP tools

| Tool | Purpose |
| --- | --- |
| `timeline_agent_manifest` | The rules of the corpus: safe language, citation policy, first calls. Call this first. |
| `timeline_search_reports` | Search reports by text, motif, phenomenon, source type, date, stance, or evidence grade. Paginated. |
| `timeline_get_report` | One full report with labeled claims, anchors, related reports, safety flags, and recommended phrasing. |
| `timeline_mandela_catalog` | Mandela Effect items: remembered vs on-record variants, community and mainstream notes side by side. |
| `timeline_motif_map` | Recurring symbols and their co-occurrence graph — the constellation, as JSON. |
| `timeline_story_threads` | Curated arcs written three ways: belief, neutral archive, skeptical. |
| `timeline_events` | Official science milestones and community waves on one axis, never blended. |
| `timeline_compare_sources` | Belief / neutral / skeptical framings for one topic, plus officially-sourced shared facts. |
| `timeline_deepen_story` | Research prompts and follow-up angles — never fabricated sources. |
| `timeline_stats` | Corpus totals by phenomenon, motif, source type, year, grade — and what still needs sources. |

Every tool is read-only (`readOnlyHint: true`), local-first, and returns
structured JSON with uncertainty made visible.

## The site

https://timeline-pulse.vercel.app is the same corpus as a public instrument:

- **Archive** — searchable reports with evidence-grade filters and a full-record drawer.
- **Timeline** — official CERN anchors above the line, community waves and symbolic anchors below. One axis, never one claim.
- **Motifs** — an interactive constellation of 17 recurring symbols (machine silence, rainbow bridge, serpent time, heart collider…).
- **Mandela Catalog** — classic memory variants with the mainstream explanation always attached.
- **Story Threads** — eight arcs, each readable through a belief / neutral / skeptic lens switch.
- **For agents** — MCP install, raw JSON endpoints, `llms.txt`, and the language rules.

Plus one honest easter egg: press `M` and the site quietly Mandela-affects
itself. See if you notice everything that changed.

## Raw data endpoints (CORS-open)

`/reports.json` · `/mandela-items.json` · `/motifs.json` · `/events.json` ·
`/story-threads.json` · `/sources.json` · `/llms.txt` · `/openapi.json`

The site serves the exact JSON files the npm package ships — one corpus, three
doors (site, MCP, raw JSON).

## Evidence grades

| Grade | Meaning |
| --- | --- |
| `official` | Published by the institution itself — always linked |
| `firsthand` | A person reporting their own experience |
| `reported` | Shared accounts: forums, polls, threads |
| `interpretive` | Community meaning-making on top of events |
| `symbolic` | Allegory and teaching language, filed as such |
| `speculative` | Unverified conjecture, clearly flagged |

## Development

```bash
npm install
npm test        # policy guard + build + corpus validation + site-sync check + MCP smoke test
npm run build   # compile the server to dist/
npm run sync-site  # copy data/ JSON into site/ after editing the corpus
npx serve site  # run the site locally
```

The repo enforces its own content policy in CI: official claims must carry
official URLs, speculative claims must carry safety flags, and one symbolic
source family is never named — checked by hash, so the name appears nowhere,
including in the check itself (`scripts/check-policy.mjs`).

## Contributing

Reports, corrections, and motifs are welcome — see
[CONTRIBUTING.md](CONTRIBUTING.md) and the issue templates. The fastest way to
help: find official sources for anything flagged `⚑ needs source`.

## Documentation map

- [Project brief](docs/PROJECT_BRIEF.md)
- [MCP tool spec](docs/MCP_TOOL_SPEC.md)
- [Data model](docs/DATA_MODEL.md)
- [Site spec](docs/SITE_SPEC.md)
- [Source and content policy](docs/SOURCE_POLICY.md) ← the contract
- [Seed corpus notes](docs/SEED_CORPUS.md)
- [Roadmap](docs/ROADMAP.md)
- [Design reference](design/README.md)

## License

Code is [MIT](LICENSE). Data: original summaries and metadata authored by the
project; official facts link to their institutional sources; excerpts stay
short and attributed. Details in [docs/SOURCE_POLICY.md](docs/SOURCE_POLICY.md).

---

*EST. 2026 · SEED CORPUS v0.1 · NO PHYSICS WERE HARMED ◉*
