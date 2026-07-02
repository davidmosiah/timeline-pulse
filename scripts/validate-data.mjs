#!/usr/bin/env node
/**
 * Validates the seed corpus against the data model (docs/DATA_MODEL.md) and
 * the Phase 1 exit criteria (docs/ROADMAP.md):
 *   - datasets parse and cross-reference cleanly (ids unique, refs resolve)
 *   - every official claim/event has a source URL
 *   - every speculative or institutional claim carries safety flags
 * Also checks that server.json / glama.json / package.json metadata agree.
 */
import { readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const load = (p) => JSON.parse(readFileSync(ROOT + p, "utf8"));

const reports = load("data/reports.json");
const mandela = load("data/mandela-items.json");
const motifs = load("data/motifs.json");
const events = load("data/events.json");
const threads = load("data/story-threads.json");
const sources = load("data/sources.json");

const errors = [];
const assert = (cond, msg) => { if (!cond) errors.push(msg); };

const PHENOMENA = ["mandela-effect", "timeline-shift", "synchronicity", "cern-lore", "simulation-glitch", "symbolic-alchemy", "dream-vision", "personal-report", "official-science-anchor"];
const SOURCE_TYPES = ["official-source", "firsthand-report", "social-post", "forum-thread", "article", "video", "transcript-summary", "symbolic-teaching-summary", "project-note"];
const GRADES = ["official", "firsthand", "reported", "interpretive", "symbolic", "speculative"];
const STANCES = ["belief", "neutral", "skeptical", "official", "mixed"];
const CLAIM_TYPES = ["official-fact", "personal-experience", "community-interpretation", "symbolic-reading", "speculative-causation", "fictional-or-mythic"];
const CLAIM_STATUS = ["verified-source", "reported", "needs-source", "disputed", "symbolic-only", "not-evidence"];
const EVENT_LAYERS = ["official-science", "community-wave", "symbolic-anchor", "site-update"];

const motifIds = new Set(motifs.motifs.map((m) => m.id));
const reportIds = new Set(reports.reports.map((r) => r.id));
const eventIds = new Set(events.events.map((e) => e.id));
const sourceFamilyIds = new Set(sources.source_families.map((s) => s.id));

// ---- motifs
assert(motifIds.size === motifs.motifs.length, "motifs: duplicate ids");
for (const m of motifs.motifs) {
  assert(m.id && m.label && m.short_definition, `motif ${m.id}: missing required fields`);
  assert(Array.isArray(m.aliases), `motif ${m.id}: aliases must be an array`);
}
for (const e of motifs.edges) {
  assert(motifIds.has(e[0]) && motifIds.has(e[1]), `motif edge ${e[0]}–${e[1]}: unknown motif`);
  assert(typeof e[2] === "number" && e[2] > 0, `motif edge ${e[0]}–${e[1]}: bad weight`);
}

// ---- reports
assert(reportIds.size === reports.reports.length, "reports: duplicate ids");
for (const r of reports.reports) {
  const ctx = `report ${r.id}`;
  assert(r.title && r.summary, `${ctx}: missing title/summary`);
  assert(PHENOMENA.includes(r.phenomenon_type), `${ctx}: bad phenomenon_type ${r.phenomenon_type}`);
  assert(GRADES.includes(r.evidence_grade), `${ctx}: bad evidence_grade`);
  assert(STANCES.includes(r.stance), `${ctx}: bad stance`);
  assert(SOURCE_TYPES.includes(r.source.source_type), `${ctx}: bad source_type ${r.source.source_type}`);
  assert(["public", "redacted", "omitted", "unknown"].includes(r.source.author_policy), `${ctx}: bad author_policy`);
  assert(r.date_added, `${ctx}: missing date_added`);
  for (const mo of r.motifs) assert(motifIds.has(mo), `${ctx}: unknown motif ${mo}`);
  for (const id of r.related_report_ids ?? []) assert(reportIds.has(id), `${ctx}: unknown related report ${id}`);
  assert(Array.isArray(r.claims) && r.claims.length > 0, `${ctx}: needs at least one claim`);
  for (const c of r.claims) {
    assert(CLAIM_TYPES.includes(c.claim_type), `${ctx}: bad claim_type ${c.claim_type}`);
    assert(CLAIM_STATUS.includes(c.status), `${ctx}: bad claim status ${c.status}`);
    if (c.claim_type === "official-fact") {
      assert(c.status === "verified-source" && c.source_url, `${ctx}: official-fact claims need verified-source status and a source_url`);
    }
    if (c.claim_type === "speculative-causation") {
      assert((r.safety_flags ?? []).includes("do-not-state-as-fact"), `${ctx}: speculative-causation claim requires 'do-not-state-as-fact' safety flag`);
    }
  }
  if (r.evidence_grade === "speculative") {
    assert((r.safety_flags ?? []).length > 0, `${ctx}: speculative reports need safety_flags`);
  }
  if (r.source.source_type === "symbolic-teaching-summary") {
    assert(r.source.author_policy === "omitted", `${ctx}: symbolic-teaching-summary must use author_policy 'omitted'`);
  }
  if (r.source.source_id) assert(sourceFamilyIds.has(r.source.source_id), `${ctx}: unknown source_id ${r.source.source_id}`);
}

// ---- events
assert(eventIds.size === events.events.length, "events: duplicate ids");
for (const e of events.events) {
  const ctx = `event ${e.id}`;
  assert(EVENT_LAYERS.includes(e.layer), `${ctx}: bad layer ${e.layer}`);
  assert(e.date && e.title && e.summary, `${ctx}: missing fields`);
  if (e.layer === "official-science") {
    assert(e.source_url && e.source_url.startsWith("https://"), `${ctx}: official events must cite a source_url`);
    assert(e.claim_status === "official", `${ctx}: official layer must have claim_status 'official'`);
  } else {
    assert(e.claim_status !== "official", `${ctx}: non-official layers cannot claim 'official'`);
  }
  for (const mo of e.motifs ?? []) assert(motifIds.has(mo), `${ctx}: unknown motif ${mo}`);
}

// ---- mandela items
const mandelaIds = new Set(mandela.items.map((i) => i.id));
assert(mandelaIds.size === mandela.items.length, "mandela: duplicate ids");
for (const i of mandela.items) {
  const ctx = `mandela ${i.id}`;
  assert(i.remembered_variant && i.current_variant, `${ctx}: needs both variants`);
  assert(["classic", "new-wave", "unverified", "needs-review"].includes(i.status), `${ctx}: bad status`);
  for (const mo of i.motifs) assert(motifIds.has(mo), `${ctx}: unknown motif ${mo}`);
  for (const id of i.related_report_ids) assert(reportIds.has(id), `${ctx}: unknown report ${id}`);
}

// ---- story threads
for (const t of threads.threads) {
  const ctx = `thread ${t.id}`;
  assert(t.public_summary && t.belief_frame && t.neutral_frame, `${ctx}: missing frames`);
  for (const mo of t.motifs) assert(motifIds.has(mo), `${ctx}: unknown motif ${mo}`);
  for (const id of t.report_ids) assert(reportIds.has(id), `${ctx}: unknown report ${id}`);
  for (const id of t.anchor_ids) assert(eventIds.has(id), `${ctx}: unknown anchor event ${id}`);
}

// ---- metadata coherence
const pkg = load("package.json");
const serverJson = load("server.json");
const glama = load("glama.json");
assert(pkg.name === "timeline-pulse", "package.json: name must be timeline-pulse");
assert(serverJson.name === "io.github.davidmosiah/timeline-pulse", "server.json: bad name");
assert(serverJson.packages?.[0]?.identifier === pkg.name, "server.json: npm identifier must match package name");
assert(serverJson.version === pkg.version, `server.json: version ${serverJson.version} must match package.json ${pkg.version}`);
assert(Array.isArray(glama.maintainers) && glama.maintainers.includes("davidmosiah"), "glama.json: maintainers");
assert((pkg.files ?? []).some((f) => f.startsWith("data")), "package.json: files must ship the data corpus");

if (errors.length) {
  for (const e of errors) console.error("✗ " + e);
  console.error(`\nvalidate-data: ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`validate-data: OK — ${reports.reports.length} reports, ${motifs.motifs.length} motifs (${motifs.edges.length} edges), ${events.events.length} events, ${mandela.items.length} mandela items, ${threads.threads.length} threads.`);
