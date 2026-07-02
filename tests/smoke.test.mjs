#!/usr/bin/env node
/**
 * MCP smoke test: boots the built server over stdio with the official SDK
 * client, lists tools, exercises every tool once (happy path) plus the
 * spec'd error shape (unknown motif → error + hint). Exits non-zero on any
 * mismatch. No network required.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const EXPECTED_TOOLS = [
  "timeline_search_reports",
  "timeline_get_report",
  "timeline_mandela_catalog",
  "timeline_motif_map",
  "timeline_story_threads",
  "timeline_events",
  "timeline_compare_sources",
  "timeline_deepen_story",
  "timeline_stats",
  "timeline_agent_manifest",
];

let failures = 0;
const ok = (cond, label) => {
  if (cond) console.log(`  ✓ ${label}`);
  else { console.error(`  ✗ ${label}`); failures++; }
};

const client = new Client({ name: "timeline-pulse-smoke", version: "0.0.0" });
await client.connect(new StdioClientTransport({ command: "node", args: [new URL("../dist/index.js", import.meta.url).pathname] }));

const call = async (name, args = {}) => {
  const res = await client.callTool({ name, arguments: args });
  const parsed = JSON.parse(res.content[0].text);
  return { res, parsed };
};

// tools/list
const { tools } = await client.listTools();
const names = tools.map((t) => t.name).sort();
ok(EXPECTED_TOOLS.slice().sort().every((n, i) => names[i] === n) && names.length === EXPECTED_TOOLS.length, `tools/list exposes exactly the 10 spec'd tools`);
ok(tools.every((t) => t.annotations?.readOnlyHint === true && t.annotations?.openWorldHint === false), "every tool is annotated read-only / closed-world");

// search
{
  const { parsed } = await call("timeline_search_reports", { query: "machine silence" });
  ok(parsed.total_matches >= 3 && parsed.reports.every((r) => r.id && r.evidence_grade), `search 'machine silence' → ${parsed.total_matches} matches with grades`);
}
{
  const { parsed } = await call("timeline_search_reports", { motifs: ["mandela-residue"], evidence_grade: "reported", limit: 3 });
  ok(parsed.returned <= 3 && parsed.reports.every((r) => r.motifs.includes("mandela-residue")), "motif+grade filter respects filters and limit");
  ok(parsed.next_cursor !== undefined, "pagination cursor present");
}
{
  const { res, parsed } = await call("timeline_search_reports", { motifs: ["rainbow"] });
  ok(res.isError === true && parsed.error === "unknown_motif" && /rainbow-bridge/.test(parsed.hint), "unknown motif → error with fix-it hint (spec shape)");
}

// get_report
{
  const { parsed } = await call("timeline_get_report", { id: "tp-001" });
  ok(parsed.claims?.length >= 2 && parsed.related_reports?.length > 0 && parsed.recommended_phrasing?.say, "tp-001 full record: claims, related, phrasing");
  ok(parsed.safety_flags?.includes("avoid-direct-teacher-name"), "tp-001 carries the omitted-teacher safety flag");
}

// mandela
{
  const { parsed } = await call("timeline_mandela_catalog", { category: "brand" });
  ok(parsed.total === 2 && parsed.items.every((i) => i.remembered_variant && i.current_variant && i.mainstream_notes), "mandela catalog: brand items with both variants + mainstream notes");
}

// motif map
{
  const { parsed } = await call("timeline_motif_map", {});
  ok(parsed.nodes.length === 17 && parsed.edges.length === 24, `motif map: ${parsed.nodes.length} nodes / ${parsed.edges.length} edges`);
}
{
  const { parsed } = await call("timeline_motif_map", { motif: "machine-silence" });
  ok(parsed.nodes.some((n) => n.id === "machine-silence") && parsed.edges.every((e) => e.a === "machine-silence" || e.b === "machine-silence"), "motif focus returns neighborhood only");
}

// threads
{
  const { parsed } = await call("timeline_story_threads", { id: "machine-silence-calibration", lens: "skeptical" });
  const t = parsed.threads[0];
  ok(t.frames.belief && t.frames.neutral && t.frames.skeptical && t.active_frame === t.frames.skeptical, "thread returns all three frames + active lens");
  ok(t.anchors.some((a) => a.source_url?.startsWith("https://home.cern")), "thread anchors resolve to cited official events");
}

// events
{
  const { parsed } = await call("timeline_events", { layer: "official-science" });
  ok(parsed.total === 5 && parsed.events.every((e) => e.source_url?.startsWith("https://")), "official layer: 5 events, all cited");
}

// compare_sources
{
  const { parsed } = await call("timeline_compare_sources", { topic: "CERN shutdown and timeline shifts" });
  ok(parsed.belief && parsed.neutral && parsed.skeptical && Array.isArray(parsed.shared_facts) && parsed.shared_facts.length > 0, "compare_sources: three frames + officially-sourced shared facts");
}
{
  const { res, parsed } = await call("timeline_compare_sources", { topic: "zzz nothing zzz" });
  ok(res.isError === true && parsed.error === "no_matching_topic", "compare_sources: unmatched topic → helpful error");
}

// deepen
{
  const { parsed } = await call("timeline_deepen_story", { motif: "machine-silence" });
  ok(parsed.source_search_queries.length > 0 && parsed.related_motifs.length > 0 && parsed.verification_checklist.length >= 4, "deepen_story: queries, related motifs, checklist");
}

// stats
{
  const { parsed } = await call("timeline_stats", {});
  ok(parsed.totals.reports === 20 && parsed.totals.motifs === 17 && parsed.totals.official_anchors === 5, "stats totals match seed corpus");
  ok(parsed.needs_source.events.includes("apophis"), "stats surfaces needs-source items");
}

// manifest
{
  const { parsed } = await call("timeline_agent_manifest", {});
  ok(parsed.language_rules.length >= 4 && parsed.install.command === "npx -y timeline-pulse", "agent manifest: rules + install");
}

await client.close();

if (failures) {
  console.error(`\nsmoke: ${failures} failure(s).`);
  process.exit(1);
}
console.log("\nsmoke: all tools OK over stdio.");
