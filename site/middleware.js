// Vercel Edge Middleware — "Markdown for Agents".
// When an agent requests the homepage with `Accept: text/markdown`, serve a
// markdown rendering; browsers (Accept: text/html) fall through to index.html.
export const config = { matcher: "/" };

const MD = `# Timeline Pulse — the machine went quiet; the stories didn't

An open-source atlas of timeline-shift folklore, Mandela Effect reports, and collider-era myth — every claim labeled, every source graded. A cultural archive, not a proof engine: official CERN facts sit on their own cited shelf; community readings are filed as interpretation, never causation.

## Corpus (seed v0.1)
- 20 reports · 17 motifs (24 co-occurrence edges) · 6 Mandela items · 8 story threads · 9 events (5 official CERN anchors)
- Evidence grades: official / firsthand / reported / interpretive / symbolic / speculative

## Query with your AI agent (no auth)
Install: \`npx -y timeline-pulse\`
Tools: timeline_search_reports, timeline_get_report, timeline_mandela_catalog, timeline_motif_map, timeline_story_threads, timeline_events, timeline_compare_sources, timeline_deepen_story, timeline_stats, timeline_agent_manifest.

## Links
- Site: https://timeline-pulse.vercel.app
- Source: https://github.com/davidmosiah/timeline-pulse
- npm: https://www.npmjs.com/package/timeline-pulse
- Data (JSON): https://timeline-pulse.vercel.app/reports.json
- For agents: https://timeline-pulse.vercel.app/llms.txt
`;

export default function middleware(request) {
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/markdown")) {
    return new Response(MD, {
      status: 200,
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": String(Math.round(MD.length / 4)),
        "access-control-allow-origin": "*",
      },
    });
  }
  // else: fall through to the static index.html
}
