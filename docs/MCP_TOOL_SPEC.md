# MCP Tool Specification

## Design goals

The MCP server should help agents explore the corpus safely and usefully:

- Return structured JSON, not only prose.
- Make source categories and uncertainty visible.
- Keep all tools read-only in the MVP.
- Provide pagination and filtering.
- Give agents language rules so they do not overstate claims.
- Avoid direct public naming of the spiritual teacher behind one source family.

## Tool prefix

Use the prefix `timeline_`.

This avoids generic tool names and keeps discovery clear in clients.

## Common parameters

Most list tools should support:

```ts
{
  query?: string;
  motifs?: string[];
  phenomenon_types?: string[];
  source_types?: string[];
  stance?: "belief" | "neutral" | "skeptical" | "official" | "mixed";
  evidence_grade?: "official" | "firsthand" | "reported" | "interpretive" | "symbolic" | "speculative";
  date_start?: string;
  date_end?: string;
  limit?: number;
  cursor?: string;
}
```

## Tools

### `timeline_search_reports`

Search the report archive.

Use cases:

- "Find reports about CERN and Mandela Effects after 2012."
- "Show stories tagged rainbow bridge and machine silence."
- "Find firsthand reports with strong emotional language."

Returns:

```json
{
  "query": "rainbow bridge",
  "total_matches": 12,
  "returned": 10,
  "next_cursor": null,
  "reports": [
    {
      "id": "report-0001",
      "title": "Machine silence and the calibration window",
      "phenomenon_type": "timeline-lore",
      "source_type": "symbolic-teaching-summary",
      "evidence_grade": "symbolic",
      "date_observed": "2026-06-29",
      "motifs": ["machine-silence", "rainbow-bridge", "lost-ion"],
      "summary": "Community interpretation linking the LHC shutdown period to an inner calibration window.",
      "source_url": null
    }
  ]
}
```

### `timeline_get_report`

Return one full report.

Returns:

- Full summary.
- Claims.
- Motifs.
- Source metadata.
- Related reports.
- Safety flags.
- Recommended phrasing for agents.

### `timeline_mandela_catalog`

Browse Mandela Effect examples.

Filters:

- category: `brand`, `film`, `music`, `geography`, `scripture`, `pop-culture`,
  `personal-memory`
- status: `classic`, `new-wave`, `unverified`, `needs-review`
- motif: `memory-residue`, `logo-shift`, `childhood-anchor`, `collective-memory`

Returns each item with:

- remembered variant.
- current/official variant.
- common community explanation.
- mainstream explanation.
- source links.
- related reports.

### `timeline_motif_map`

Return recurring symbols and co-occurrence links.

Example motifs:

- `machine-silence`
- `rainbow-bridge`
- `lost-ion`
- `serpent-time`
- `heart-collider`
- `timeline-bleed`
- `mirror-world`
- `apophis-window`
- `simulation-glitch`
- `mandela-residue`

Returns nodes and weighted edges for a graph UI.

### `timeline_story_threads`

Return curated narrative arcs.

Initial threads:

- `collider-as-threshold`
- `machine-silence-calibration`
- `rainbow-bridge-restoration`
- `serpent-time-wound`
- `heart-collider`
- `mandela-waves`
- `apophis-window`
- `silicon-mirror`

Each thread includes:

- summary.
- motifs.
- timeline anchors.
- reports.
- official anchors when relevant.
- belief-aware framing.
- skeptical framing.
- writing prompts.

### `timeline_events`

Return timeline events.

Event layers:

- `official-science`
- `community-wave`
- `symbolic-anchor`
- `site-update`
- `submission-batch`

Official science events must cite official sources. For example:

- CERN's LHC entered Long Shutdown 3 on 2026-06-29.
- CERN describes LS3 as maintenance, consolidation, upgrade work for HiLumi LHC.
- CERN has stated HiLumi LHC operation is planned for 2030.

Community-linked events must be labeled as interpretation, not causation.

### `timeline_compare_sources`

Compare different framings for a topic.

Input:

```json
{
  "topic": "CERN shutdown and timeline shifts",
  "frames": ["belief", "neutral", "skeptical"]
}
```

Output:

- belief-framed summary.
- neutral archive summary.
- skeptical/scientific summary.
- shared facts.
- disputed claims.
- recommended agent wording.

### `timeline_deepen_story`

Generate research directions from a report or motif.

This tool must not invent sources. It can produce:

- source-search queries.
- related motifs.
- comparison questions.
- story expansion prompts.
- visualization ideas.
- "needs verification" checklist.

### `timeline_stats`

Return corpus statistics:

- total reports.
- reports by source type.
- reports by year/month.
- motif frequency.
- phenomenon frequency.
- language coverage.
- source verification status.

### `timeline_agent_manifest`

Return install instructions and agent rules.

Rules should include:

- Do not present symbolic claims as proven science.
- Use "reported", "interpreted", "community-linked", or "symbolically framed".
- Keep official CERN information separate from metaphysical interpretation.
- Do not name the omitted teacher.
- Do not encourage harassment, fear, or risky behavior.
- Cite source URLs when available.

## Error handling

Errors should include a fix:

```json
{
  "error": "unknown_motif",
  "message": "No motif named 'rainbow'.",
  "hint": "Try 'rainbow-bridge' or call timeline_motif_map first."
}
```

## Tool annotations

All MVP tools:

- `readOnlyHint: true`
- `destructiveHint: false`
- `idempotentHint: true`
- `openWorldHint: false`

Future source-import tools may be `openWorldHint: true` and should require
explicit user-provided URLs or files.

