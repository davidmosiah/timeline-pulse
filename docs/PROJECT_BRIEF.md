# Timeline Pulse Project Brief

## One-line concept

An open-source MCP server and interactive website for exploring timeline-shift
folklore, Mandela Effect reports, collider-era myths, and alchemical reality
stories as a structured cultural archive.

## Why this exists

There are many scattered posts and stories about reality glitches, Mandela
Effects, CERN/LHC milestones, timeline jumps, rainbow bridges, broken time,
serpent symbolism, and inner alchemy. They are emotionally rich, but they are
hard to compare because they live across social media, forums, videos, personal
notes, and symbolic teachings.

Timeline Pulse makes those stories navigable:

- Humans get a beautiful archive and visual map.
- Agents get a structured corpus with safe language rules.
- Contributors get a clear way to add reports without turning speculation into
  fake certainty.

## Product principles

1. Respect the worldview without overclaiming it.
2. Separate official facts, personal reports, symbolic interpretation, and
   speculation.
3. Preserve the mystery and narrative richness.
4. Avoid direct public dependence on any single spiritual teacher or creator.
5. Build like `uap-pulse`: small, public, source-aware, agent-friendly, and easy
   to deploy.

## Audience

- People who enjoy Mandela Effect, simulation, synchronicity, and timeline
  lore.
- Spiritual/metaphysical researchers who want pattern discovery.
- Writers, artists, and worldbuilders looking for a reality-shift archive.
- Skeptical readers who want to understand the structure of the belief system
  without being asked to accept it as proof.
- AI agents that need clean structured access to the corpus.

## Scope

In scope:

- Timeline-shift reports.
- Mandela Effect examples and memory variants.
- CERN/LHC official milestones as a factual timeline layer.
- Community interpretations that connect collider events to symbolic shifts.
- Narrative motifs such as rainbow bridge, lost ion, time serpent, machine
  silence, heart collider, mirror worlds, Apophis window, and timeline
  bleed-through.
- Source summaries, short excerpts, links, metadata, and attribution rules.
- A static Vercel site with JSON data endpoints.
- A local-first MCP server with bundled seed data.

Out of scope:

- Claiming scientific proof of timeline manipulation.
- Scraping private or deleted posts.
- Harassing scientists, institutions, creators, or skeptics.
- Publishing long copyrighted transcripts.
- Making predictions that encourage risky behavior.
- Naming the specific spiritual teacher who influenced parts of the seed
  cosmology.

## Differentiation

Most similar projects are either:

- Pure conspiracy boards with weak source hygiene.
- Skeptical debunking lists with no empathy for the lived experience.
- Spiritual content libraries that are not structured for agents.

Timeline Pulse sits in the middle: belief-aware, source-aware, and built for
search, comparison, visual exploration, and agent use.

## MVP shape

Repository:

```text
timeline-pulse/
  README.md
  docs/
  data/
    reports.json
    mandela-items.json
    motifs.json
    events.json
    story-threads.json
  src/
    index.ts
  site/
    index.html
    reports.json
    llms.txt
    sitemap.xml
    robots.txt
    vercel.json
  server.json
  glama.json
  package.json
  LICENSE
```

MVP data:

- 40 to 80 curated reports.
- 25 to 40 Mandela items.
- 20 to 30 motifs.
- Official CERN/LHC timeline anchors from public CERN pages.
- 5 to 8 curated story threads.

MVP site:

- Static Vercel deploy.
- No backend.
- Raw JSON endpoints served as static files.
- Search/filter in browser.
- One visual timeline.
- One motif graph.
- Agent page with MCP install snippet.

MVP MCP:

- TypeScript.
- stdio first.
- Optional streamable HTTP later.
- No external API key.
- Bundled dataset.
- Read-only tools only.

## Naming

Recommended working name: `timeline-pulse`

Reasons:

- Similar shape to `uap-pulse`.
- Easy to understand.
- Does not bind the project to one teacher, brand, or institution.
- Works for both site and npm.

Backup names:

- `reality-pulse`
- `chronicle-pulse`
- `timeline-atlas-mcp`
- `reality-archive-mcp`

Before publishing, check npm and GitHub availability.

