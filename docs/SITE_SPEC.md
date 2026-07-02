# Vercel Site Specification

## Goal

Build a public interactive archive like `uap-pulse`, but for timeline folklore
and symbolic reality-shift stories.

The first screen should be the usable archive, not a landing page.

## Information architecture

Top-level nav:

- Archive
- Timeline
- Motifs
- Mandela Catalog
- Story Threads
- Sources
- Agents

## Page: Archive

Purpose: searchable report archive.

Features:

- Search box.
- Filters for phenomenon, motif, source type, evidence grade, stance, date.
- Report cards with title, summary, motifs, source badge, and evidence badge.
- Drawer/detail view with full report, claims, anchors, and related reports.
- Toggle: `belief view`, `neutral view`, `skeptic view`.

Important labels:

- "Official fact"
- "Firsthand report"
- "Community interpretation"
- "Symbolic reading"
- "Needs source"

## Page: Timeline

Purpose: show official events and narrative waves without merging them.

Visual:

- Horizontal or vertical chronology.
- Layer toggles:
  - Official science
  - Community waves
  - Symbolic anchors
  - Site updates
- Clear visual difference between verified events and interpretations.

Initial official anchors:

- 2012-07-04: Higgs boson announcement by ATLAS and CMS.
- 2024-10-08: CERN schedule update saying Run 3 was extended and HiLumi startup
  planned for June 2030.
- 2026-06-29: LHC switched off to begin Long Shutdown 3.
- 2030: planned HiLumi LHC operation window.

Initial symbolic anchors:

- 2012 shift wave.
- 2014-2015 Mandela Effect community expansion.
- 2026 machine silence window.
- 2029 Apophis window, marked `needs official source` until sourced.

## Page: Motifs

Purpose: explore symbolic recurrence.

Features:

- Force graph or constellation graph.
- Node size by frequency.
- Edge weight by co-occurrence.
- Clicking a motif filters reports and story threads.

Initial motif families:

- Machine: collider, shutdown, calibration, signal.
- Time: timeline shift, time wound, loop, branch.
- Light: rainbow bridge, spectrum, missing angle.
- Serpent: serpent time, Apophis, poison/remedy.
- Memory: Mandela residue, childhood anchor, collective recall.
- Body: heart collider, inner calibration.
- Simulation: glitch, render, patch, overwrite.

## Page: Mandela Catalog

Purpose: organize examples without claiming proof.

Features:

- Category filters.
- Remembered/current variant columns.
- "Why people link it to timeline lore" summary.
- "Mainstream explanation" field.
- Related report links.

Initial examples from the seed note:

- Berenstain/Berenstein Bears.
- Fruit of the Loom cornucopia.
- Monopoly Man monocle.
- Pikachu tail.
- "No, I am your father" memory variant.
- "We Are the Champions" ending memory.

Each item should be marked `classic` or `needs-review`.

## Page: Story Threads

Purpose: deep narrative arcs.

Thread layout:

- Title.
- Short public summary.
- Motif chips.
- Timeline anchors.
- Reports included.
- Three frames:
  - Belief frame.
  - Neutral archive frame.
  - Skeptical/scientific frame.
- Research prompts.

Initial threads:

- Collider as threshold.
- Machine silence calibration.
- Rainbow bridge restoration.
- Serpent time wound.
- Heart collider.
- Mandela waves.
- Apophis window.
- Silicon mirror.

## Page: Sources

Purpose: build trust.

Content:

- How sources are classified.
- What the project does not claim.
- How to submit a report.
- Copyright and excerpt policy.
- How the omitted-teacher rule works.
- CERN official source links.
- Social source handling.

## Page: Agents

Purpose: make the site useful to LLMs and MCP users.

Content:

- MCP install snippet.
- Tool list.
- Raw JSON endpoints.
- Link to `/llms.txt`.
- Safe wording examples.

## Raw static endpoints

Serve these from Vercel:

- `/reports.json`
- `/mandela-items.json`
- `/motifs.json`
- `/events.json`
- `/story-threads.json`
- `/llms.txt`

## Visual direction

The site should feel like a research instrument for strange stories:

- Dark neutral base with warm amber, electric cyan, white, and spectral accent
  colors.
- Avoid a one-note purple/blue mystical gradient.
- Use precise badges and data-table clarity.
- Use a constellation graph or timeline field as the primary visual asset.
- Make the first viewport useful: search, filters, and a live corpus snapshot.

## MVP technical plan

- Static HTML/CSS/JS is enough for v1, matching `uap-pulse`.
- No build step required.
- JSON files copied from `data/` into `site/`.
- Vercel static deploy.
- Later: migrate to Next.js only if search, routing, or SEO requires it.

