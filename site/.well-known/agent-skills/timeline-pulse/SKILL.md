# Skill: Explore timeline-shift folklore and Mandela Effect reports (timeline-pulse)

Search a source-graded cultural archive of timeline-shift folklore, Mandela Effect reports, collider-era myths, and symbolic reality stories. Every claim is labeled (official / firsthand / reported / interpretive / symbolic / speculative). The archive documents how these stories are told — it never claims they are physically true.

## Install (MCP server, no auth)

```
npx -y timeline-pulse
```

Add to any MCP client:

```json
{ "mcpServers": { "timeline-pulse": { "command": "npx", "args": ["-y", "timeline-pulse"] } } }
```

## Tools

- `timeline_agent_manifest()` — corpus rules and safe language. Call first.
- `timeline_search_reports(query?, motifs?, phenomenon_types?, source_types?, stance?, evidence_grade?, date_start?, date_end?, limit?, cursor?)`
- `timeline_get_report(id)` — full record with claims and safety labels
- `timeline_mandela_catalog(category?, status?, motif?, query?)`
- `timeline_motif_map(family?, motif?)` — constellation as nodes + edges
- `timeline_story_threads(id?, lens?)` — arcs in belief/neutral/skeptical frames
- `timeline_events(layer?, date_start?, date_end?)` — official layer always cited
- `timeline_compare_sources(topic, frames?)` — three framings + shared facts
- `timeline_deepen_story(report_id? | motif? | thread_id?)` — research prompts
- `timeline_stats()`

## Language rules (from the manifest)

- Say "reported", "interpreted", "community-linked", "symbolically framed" — never "proven".
- Keep official CERN information separate from metaphysical interpretation.
- One source family is summarized without naming its teacher; keep it that way.
- Cite source URLs when they exist.

## Data

- Raw JSON (CORS-open): https://timeline-pulse.vercel.app/reports.json (+ motifs, events, mandela-items, story-threads, sources)
- Seed corpus v0.1: 20 reports · 17 motifs · 6 Mandela items · 8 threads · 9 events (5 official CERN anchors)
- Site: https://timeline-pulse.vercel.app · Source: https://github.com/davidmosiah/timeline-pulse
