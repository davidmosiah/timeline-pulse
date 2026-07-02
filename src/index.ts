#!/usr/bin/env node
/**
 * timeline-pulse — MCP server over a source-aware archive of timeline-shift
 * folklore, Mandela Effect reports, collider-era myths, and symbolic reality
 * stories.
 *
 * The corpus is cultural, symbolic, experiential, and speculative unless a
 * claim is marked `official`. Nothing here presents CERN, the LHC, or particle
 * physics as evidence of timeline manipulation. All tools are read-only and
 * local-first: the dataset ships inside the package, no network, no keys.
 */
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ---------------------------------------------------------------- data types

type Claim = {
  text: string;
  claim_type: string;
  status: string;
  source_url?: string;
};

type Anchor = {
  anchor_id: string;
  label: string;
  date?: string;
  layer: string;
  relation: string;
};

type Report = {
  id: string;
  title: string;
  summary: string;
  long_summary?: string;
  phenomenon_type: string;
  date_observed?: string;
  date_added: string;
  location?: { label: string; latitude?: number; longitude?: number; symbolic?: boolean };
  source: {
    source_id?: string;
    source_type: string;
    source_url?: string;
    author_display?: string;
    author_policy: string;
    language?: string;
  };
  evidence_grade: string;
  stance: string;
  motifs: string[];
  claims: Claim[];
  anchors?: Anchor[];
  related_report_ids?: string[];
  safety_flags?: string[];
  display_flag?: string;
  recommended_agent_language?: string[];
};

type Motif = {
  id: string;
  label: string;
  short_definition: string;
  family: string;
  aliases: string[];
  caution?: string;
  freq: number;
};

type TimelineEvent = {
  id: string;
  title: string;
  date: string;
  date_label?: string;
  layer: string;
  summary: string;
  source_url?: string;
  motifs: string[];
  claim_status: string;
  flag?: boolean;
};

type Thread = {
  id: string;
  title: string;
  anchor_label?: string;
  flag?: boolean;
  public_summary: string;
  belief_frame: string;
  neutral_frame: string;
  skeptical_frame?: string;
  motifs: string[];
  anchor_ids: string[];
  report_ids: string[];
  suggested_questions: string[];
};

type MandelaItem = {
  id: string;
  title: string;
  category: string;
  remembered_variant: string;
  current_variant: string;
  community_notes: string;
  mainstream_notes?: string;
  motifs: string[];
  source_links: string[];
  related_report_ids: string[];
  status: string;
};

// ------------------------------------------------------------------ load data

const load = <T>(rel: string): T =>
  JSON.parse(readFileSync(new URL(rel, import.meta.url), "utf8")) as T;

const PKG = load<{ version: string }>("../package.json");
const REPORTS = load<{ reports: Report[] }>("../data/reports.json").reports;
const MOTIFS_DB = load<{ motifs: Motif[]; edges: [string, string, number][] }>("../data/motifs.json");
const EVENTS = load<{ events: TimelineEvent[] }>("../data/events.json").events;
const THREADS = load<{ threads: Thread[] }>("../data/story-threads.json").threads;
const MANDELA = load<{ items: MandelaItem[] }>("../data/mandela-items.json").items;
const SOURCES = load<{ source_families: unknown[] }>("../data/sources.json").source_families;

const MOTIFS = MOTIFS_DB.motifs;
const EDGES = MOTIFS_DB.edges;
const MOTIF_IDS = new Set(MOTIFS.map((m) => m.id));

const GRADES = ["official", "firsthand", "reported", "interpretive", "symbolic", "speculative"] as const;
const STANCES = ["belief", "neutral", "skeptical", "official", "mixed"] as const;
const FRAMES = ["belief", "neutral", "skeptical"] as const;

// ------------------------------------------------------------------- helpers

const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

const err = (error: string, message: string, hint: string) => ({
  content: [{ type: "text" as const, text: JSON.stringify({ error, message, hint }, null, 2) }],
  isError: true,
});

function closestMotifs(input: string, n = 3): string[] {
  const q = input.toLowerCase();
  const scored = MOTIFS.map((m) => {
    let s = 0;
    if (m.id.includes(q) || q.includes(m.id)) s += 3;
    if (m.aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))) s += 2;
    for (const part of q.split(/[^a-z]+/)) if (part && m.id.includes(part)) s += 1;
    return { id: m.id, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  return (scored.length ? scored : MOTIFS.map((m) => ({ id: m.id, s: 0 }))).slice(0, n).map((x) => x.id);
}

const briefReport = (r: Report) => ({
  id: r.id,
  title: r.title,
  phenomenon_type: r.phenomenon_type,
  source_type: r.source.source_type,
  evidence_grade: r.evidence_grade,
  stance: r.stance,
  date_observed: r.date_observed ?? null,
  motifs: r.motifs,
  summary: r.summary,
  source_url: r.source.source_url ?? null,
  flags: r.safety_flags ?? [],
});

const reportText = (r: Report) =>
  `${r.title} ${r.summary} ${r.long_summary ?? ""} ${r.motifs.join(" ")} ${r.phenomenon_type} ${r.source.source_type}`
    .toLowerCase()
    .replace(/-/g, " ");

// Free-text match: every query token must appear (hyphens count as spaces, so
// "machine silence" finds the machine-silence motif).
const textMatches = (haystack: string, query: string) =>
  query.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean).every((tok) => haystack.includes(tok));

const SAFE_LANGUAGE = {
  say: ["reported", "interpreted", "community-linked", "symbolically framed", "official source states", "mainstream explanation"],
  avoid: ["proven", "confirmed portal", "CERN caused", "scientists are hiding", "this will happen"],
  rule: "Treat every item as cultural/symbolic/experiential storytelling unless a claim is marked `official` with a source URL. Keep official science facts on a separate shelf from interpretation.",
};

const server = new McpServer({ name: "timeline-pulse", version: PKG.version });

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

// ------------------------------------------------------- timeline_search_reports

server.registerTool(
  "timeline_search_reports",
  {
    description:
      "Search the report archive by free text, motifs, phenomenon type, source type, stance, evidence grade, or date range. Returns brief records with grades and safety flags; use timeline_get_report for the full record.",
    inputSchema: {
      query: z.string().optional().describe("free text matched against title, summary, motifs, phenomenon"),
      motifs: z.array(z.string()).optional().describe("motif ids — a report must carry ALL listed motifs; call timeline_motif_map for valid ids"),
      phenomenon_types: z.array(z.string()).optional().describe("e.g. 'mandela-effect', 'cern-lore', 'timeline-shift', 'synchronicity', 'simulation-glitch', 'symbolic-alchemy', 'dream-vision'"),
      source_types: z.array(z.string()).optional().describe("e.g. 'firsthand-report', 'forum-thread', 'social-post', 'symbolic-teaching-summary', 'project-note', 'article'"),
      stance: z.enum(STANCES).optional(),
      evidence_grade: z.enum(GRADES).optional(),
      date_start: z.string().optional().describe("ISO date — reports observed on/after"),
      date_end: z.string().optional().describe("ISO date — reports observed on/before"),
      limit: z.number().int().min(1).max(50).optional().default(10),
      cursor: z.string().optional().describe("opaque cursor from a previous call"),
    },
    annotations: READ_ONLY,
  },
  async ({ query, motifs, phenomenon_types, source_types, stance, evidence_grade, date_start, date_end, limit, cursor }) => {
    if (motifs) {
      for (const m of motifs) {
        if (!MOTIF_IDS.has(m)) {
          return err("unknown_motif", `No motif named '${m}'.`, `Try ${closestMotifs(m).map((x) => `'${x}'`).join(" or ")} — or call timeline_motif_map first.`);
        }
      }
    }
    const q = (query ?? "").trim().toLowerCase();
    let results = REPORTS.filter((r) => {
      if (motifs && !motifs.every((m) => r.motifs.includes(m))) return false;
      if (phenomenon_types && !phenomenon_types.includes(r.phenomenon_type)) return false;
      if (source_types && !source_types.includes(r.source.source_type)) return false;
      if (stance && r.stance !== stance) return false;
      if (evidence_grade && r.evidence_grade !== evidence_grade) return false;
      const d = r.date_observed ?? "";
      if (date_start && d && d < date_start) return false;
      if (date_end && d && d > date_end) return false;
      if (q && !textMatches(reportText(r), q)) return false;
      return true;
    }).sort((a, b) => (b.date_observed ?? "").localeCompare(a.date_observed ?? ""));

    const offset = cursor ? parseInt(cursor, 10) || 0 : 0;
    const page = results.slice(offset, offset + limit);
    return json({
      query: query ?? null,
      total_matches: results.length,
      returned: page.length,
      next_cursor: offset + limit < results.length ? String(offset + limit) : null,
      language_note: "Items are filed, graded stories — say 'reported'/'interpreted', never 'proven'.",
      reports: page.map(briefReport),
    });
  }
);

// ----------------------------------------------------------- timeline_get_report

server.registerTool(
  "timeline_get_report",
  {
    description: "Return one full report: long summary, labeled claims, source metadata, anchors, motifs, related reports, safety flags, and recommended phrasing for agents.",
    inputSchema: { id: z.string().describe("report id, e.g. 'tp-001'") },
    annotations: READ_ONLY,
  },
  async ({ id }) => {
    const r = REPORTS.find((x) => x.id === id);
    if (!r) {
      const ids = REPORTS.map((x) => x.id);
      return err("unknown_report", `No report with id '${id}'.`, `Valid ids run ${ids[0]}…${ids[ids.length - 1]}. Use timeline_search_reports to find one.`);
    }
    const related = (r.related_report_ids ?? [])
      .map((rid) => REPORTS.find((x) => x.id === rid))
      .filter((x): x is Report => !!x)
      .map(briefReport);
    return json({
      ...r,
      related_reports: related,
      recommended_phrasing: {
        say: r.recommended_agent_language?.[0] ?? "community members report…",
        avoid: (r.recommended_agent_language?.[1] ?? "avoid: it is known that…").replace(/^avoid:\s*/, ""),
      },
    });
  }
);

// ------------------------------------------------------ timeline_mandela_catalog

server.registerTool(
  "timeline_mandela_catalog",
  {
    description: "Browse Mandela Effect catalog items: remembered vs on-record variants, why communities link them to timeline lore, and the mainstream memory-science explanation for each.",
    inputSchema: {
      category: z.enum(["brand", "film", "music", "geography", "scripture", "pop-culture", "personal-memory"]).optional(),
      status: z.enum(["classic", "new-wave", "unverified", "needs-review"]).optional(),
      motif: z.string().optional().describe("motif id filter"),
      query: z.string().optional().describe("free text over titles and variants"),
    },
    annotations: READ_ONLY,
  },
  async ({ category, status, motif, query }) => {
    if (motif && !MOTIF_IDS.has(motif)) {
      return err("unknown_motif", `No motif named '${motif}'.`, `Try ${closestMotifs(motif).map((x) => `'${x}'`).join(" or ")} — or call timeline_motif_map first.`);
    }
    const q = (query ?? "").trim().toLowerCase();
    const items = MANDELA.filter((i) => {
      if (category && i.category !== category) return false;
      if (status && i.status !== status) return false;
      if (motif && !i.motifs.includes(motif)) return false;
      if (q && !`${i.title} ${i.remembered_variant} ${i.current_variant}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return json({
      total: items.length,
      framing: "Each item pairs the community reading with the mainstream explanation. The catalog documents the gap; it does not adjudicate it.",
      items,
    });
  }
);

// ---------------------------------------------------------- timeline_motif_map

server.registerTool(
  "timeline_motif_map",
  {
    description: "The motif constellation: recurring symbols with definitions, families, frequencies, and weighted co-occurrence edges — ready for graph rendering or motif-based filtering.",
    inputSchema: {
      family: z.enum(["machine", "memory", "light", "time", "body", "simulation"]).optional(),
      motif: z.string().optional().describe("focus on one motif: returns it plus its direct neighbors"),
    },
    annotations: READ_ONLY,
  },
  async ({ family, motif }) => {
    if (motif && !MOTIF_IDS.has(motif)) {
      return err("unknown_motif", `No motif named '${motif}'.`, `Try ${closestMotifs(motif).map((x) => `'${x}'`).join(" or ")}.`);
    }
    let nodes = MOTIFS;
    let edges = EDGES;
    if (motif) {
      const keep = new Set([motif, ...EDGES.filter((e) => e[0] === motif || e[1] === motif).flatMap((e) => [e[0], e[1]])]);
      nodes = MOTIFS.filter((m) => keep.has(m.id));
      edges = EDGES.filter((e) => e[0] === motif || e[1] === motif);
    } else if (family) {
      nodes = MOTIFS.filter((m) => m.family === family);
      const keep = new Set(nodes.map((n) => n.id));
      edges = EDGES.filter((e) => keep.has(e[0]) && keep.has(e[1]));
    }
    return json({
      nodes: nodes.map((m) => ({ id: m.id, label: m.label, family: m.family, freq: m.freq, definition: m.short_definition, aliases: m.aliases, caution: m.caution ?? null })),
      edges: edges.map(([a, b, weight]) => ({ a, b, weight })),
      note: "Motifs describe symbols in stories — never mechanisms in physics.",
    });
  }
);

// -------------------------------------------------------- timeline_story_threads

server.registerTool(
  "timeline_story_threads",
  {
    description: "Curated narrative arcs, each written three ways (belief / neutral / skeptical) with motif chips, timeline anchors, member reports, and research prompts.",
    inputSchema: {
      id: z.string().optional().describe("one thread id, e.g. 'machine-silence-calibration'"),
      lens: z.enum(FRAMES).optional().describe("optionally mark one frame as active"),
    },
    annotations: READ_ONLY,
  },
  async ({ id, lens }) => {
    let threads = THREADS;
    if (id) {
      threads = THREADS.filter((t) => t.id === id);
      if (!threads.length) {
        return err("unknown_thread", `No thread named '${id}'.`, `Valid ids: ${THREADS.map((t) => t.id).join(", ")}.`);
      }
    }
    return json({
      total: threads.length,
      active_lens: lens ?? null,
      threads: threads.map((t) => ({
        id: t.id,
        title: t.title,
        anchor_label: t.anchor_label ?? null,
        needs_source: !!t.flag,
        public_summary: t.public_summary,
        frames: {
          belief: t.belief_frame,
          neutral: t.neutral_frame,
          skeptical: t.skeptical_frame ?? null,
        },
        active_frame: lens ? (lens === "skeptical" ? t.skeptical_frame ?? t.neutral_frame : lens === "belief" ? t.belief_frame : t.neutral_frame) : null,
        motifs: t.motifs,
        anchors: t.anchor_ids.map((aid) => {
          const e = EVENTS.find((ev) => ev.id === aid);
          return e ? { id: e.id, title: e.title, date: e.date, layer: e.layer, source_url: e.source_url ?? null } : { id: aid };
        }),
        reports: t.report_ids.map((rid) => {
          const r = REPORTS.find((x) => x.id === rid);
          return r ? { id: r.id, title: r.title, evidence_grade: r.evidence_grade } : { id: rid };
        }),
        research_prompts: t.suggested_questions,
      })),
    });
  }
);

// ------------------------------------------------------------- timeline_events

server.registerTool(
  "timeline_events",
  {
    description: "Timeline events on one axis, three labeled layers: official-science (always cited), community-wave (interpretation), symbolic-anchor (reading). Layers never blend.",
    inputSchema: {
      layer: z.enum(["official-science", "community-wave", "symbolic-anchor", "site-update"]).optional(),
      date_start: z.string().optional(),
      date_end: z.string().optional(),
    },
    annotations: READ_ONLY,
  },
  async ({ layer, date_start, date_end }) => {
    const events = EVENTS.filter((e) => {
      if (layer && e.layer !== layer) return false;
      if (date_start && e.date < date_start) return false;
      if (date_end && e.date > date_end) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
    return json({
      total: events.length,
      layer_rules: {
        "official-science": "Institutional fact with a source URL.",
        "community-wave": "Community interpretation clustered in time — never causation.",
        "symbolic-anchor": "A symbolic reading overlaid on the calendar — never an event claim.",
      },
      events,
    });
  }
);

// ----------------------------------------------------- timeline_compare_sources

server.registerTool(
  "timeline_compare_sources",
  {
    description: "Compare belief-framed, neutral-archive, and skeptical framings for one topic, with the shared facts (officially sourced) and disputed points separated out.",
    inputSchema: {
      topic: z.string().describe("e.g. 'CERN shutdown and timeline shifts', 'mandela waves', 'apophis window'"),
      frames: z.array(z.enum(FRAMES)).optional().describe("subset of frames; default all three"),
    },
    annotations: READ_ONLY,
  },
  async ({ topic, frames }) => {
    const want = frames?.length ? frames : [...FRAMES];
    // "timeline"/"story"-family words discriminate nothing in this corpus.
    const STOP = new Set(["and", "the", "with", "for", "about", "timeline", "timelines", "story", "stories", "report", "reports", "shift", "shifts"]);
    const tokens = topic.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t));
    const score = (t: Thread) => {
      let s = 0;
      const hayTokens = new Set(`${t.id} ${t.title} ${t.public_summary}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
      for (const tok of tokens) {
        if (hayTokens.has(tok)) s += 2;
        if (t.motifs.some((m) => m.includes(tok))) s += 3;
      }
      if (/cern|lhc|shutdown|collider|silence/.test(topic.toLowerCase()) && (t.id === "machine-silence-calibration" || t.id === "collider-as-threshold")) s += 2;
      return s;
    };
    const best = THREADS.map((t) => ({ t, s: score(t) })).sort((a, b) => b.s - a.s)[0];
    if (!best || best.s === 0) {
      return err(
        "no_matching_topic",
        `No thread matches '${topic}'.`,
        `Try one of: ${THREADS.map((t) => t.id).join(", ")} — or a motif id from timeline_motif_map.`
      );
    }
    const t = best.t;
    const officialAnchors = t.anchor_ids
      .map((aid) => EVENTS.find((e) => e.id === aid))
      .filter((e): e is TimelineEvent => !!e && e.layer === "official-science");
    const out: Record<string, unknown> = { topic, matched_thread: t.id };
    if (want.includes("belief")) out.belief = t.belief_frame;
    if (want.includes("neutral")) out.neutral = t.neutral_frame;
    if (want.includes("skeptical")) out.skeptical = t.skeptical_frame ?? "No skeptical frame recorded for this thread yet.";
    out.shared_facts = officialAnchors.map((e) => ({ fact: `${e.title} (${e.date_label ?? e.date})`, source_url: e.source_url }));
    out.disputed_or_unsourced = t.flag ? ["This thread carries a NEEDS-SOURCE flag — its anchor details await an official citation."] : [];
    out.recommended_wording = "Present the belief frame as 'communities interpret…', the shared facts as 'official sources state…', and never merge the two in one clause.";
    return json(out);
  }
);

// ------------------------------------------------------- timeline_deepen_story

server.registerTool(
  "timeline_deepen_story",
  {
    description: "Generate research directions for a report, motif, or thread: source-search queries, related motifs, comparison questions, story-expansion prompts, and a verification checklist. Never invents sources.",
    inputSchema: {
      report_id: z.string().optional(),
      motif: z.string().optional(),
      thread_id: z.string().optional(),
    },
    annotations: READ_ONLY,
  },
  async ({ report_id, motif, thread_id }) => {
    const given = [report_id, motif, thread_id].filter(Boolean).length;
    if (given !== 1) {
      return err("bad_input", "Provide exactly one of report_id, motif, or thread_id.", "Example: { \"motif\": \"machine-silence\" }.");
    }

    let motifs: string[] = [];
    let label = "";
    let flagged = false;
    if (report_id) {
      const r = REPORTS.find((x) => x.id === report_id);
      if (!r) return err("unknown_report", `No report '${report_id}'.`, "Use timeline_search_reports first.");
      motifs = r.motifs; label = r.title; flagged = (r.safety_flags ?? []).includes("source-needs-verification");
    } else if (thread_id) {
      const t = THREADS.find((x) => x.id === thread_id);
      if (!t) return err("unknown_thread", `No thread '${thread_id}'.`, `Valid: ${THREADS.map((x) => x.id).join(", ")}.`);
      motifs = t.motifs; label = t.title; flagged = !!t.flag;
    } else if (motif) {
      if (!MOTIF_IDS.has(motif)) {
        return err("unknown_motif", `No motif named '${motif}'.`, `Try ${closestMotifs(motif).map((x) => `'${x}'`).join(" or ")}.`);
      }
      motifs = [motif]; label = MOTIFS.find((m) => m.id === motif)!.label;
    }

    const neighborhood = [...new Set(EDGES.filter((e) => motifs.includes(e[0]) || motifs.includes(e[1])).flatMap((e) => [e[0], e[1]]))]
      .filter((m) => !motifs.includes(m));
    const defs = motifs.map((m) => MOTIFS.find((x) => x.id === m)).filter((m): m is Motif => !!m);

    return json({
      subject: label,
      source_search_queries: [
        ...motifs.map((m) => `"${m.replace(/-/g, " ")}" timeline story forum`),
        `"${label}" original post`,
        ...(motifs.some((m) => ["machine-silence", "calibration", "threshold", "machine-mirror", "heart-collider"].includes(m))
          ? ['"CERN" "Long Shutdown 3" community reaction', '"LHC" "timeline" interpretation']
          : []),
        ...(motifs.includes("mandela-residue") || motifs.includes("collective-memory")
          ? ['"Mandela Effect" first appearance thread', '"collective false memory" study']
          : []),
      ],
      related_motifs: neighborhood,
      comparison_questions: [
        `Which reports share motifs with "${label}" but carry a different evidence grade?`,
        "How does the belief framing differ from the skeptical framing on the same dated facts?",
        "Does this pattern appear before its usually-cited wave year?",
      ],
      expansion_prompts: [
        ...defs.map((m) => `Write the ${m.label.toLowerCase()} image (${m.short_definition.toLowerCase()}) as a 500-word field note that never states it as fact.`),
        "Draft the neutral-archive caption a museum would put under this story.",
      ],
      verification_checklist: [
        "Locate the primary URL (post, thread, video) and archive it.",
        "Confirm dates against an official or contemporaneous source.",
        "Record the mainstream explanation next to the community reading.",
        flagged ? "⚑ This subject carries a needs-source flag — resolve it before quoting details." : "Check whether any claim quietly upgraded itself from 'reported' to 'fact' in later retellings.",
      ],
      rule: "These are directions for research, not sources. Do not cite anything you have not actually located.",
    });
  }
);

// -------------------------------------------------------------- timeline_stats

server.registerTool(
  "timeline_stats",
  {
    description: "Corpus statistics: totals by phenomenon, motif, source type, evidence grade, stance, year, and language, plus catalog/thread/event counts and flagged items.",
    inputSchema: {},
    annotations: READ_ONLY,
  },
  async () => {
    const count = <K extends string>(items: K[]) =>
      items.reduce<Record<string, number>>((acc, k) => ((acc[k] = (acc[k] ?? 0) + 1), acc), {});
    return json({
      corpus_version: PKG.version,
      totals: {
        reports: REPORTS.length,
        motifs: MOTIFS.length,
        motif_edges: EDGES.length,
        mandela_items: MANDELA.length,
        story_threads: THREADS.length,
        events: EVENTS.length,
        official_anchors: EVENTS.filter((e) => e.layer === "official-science").length,
        source_families: SOURCES.length,
      },
      reports_by_phenomenon: count(REPORTS.map((r) => r.phenomenon_type)),
      reports_by_source_type: count(REPORTS.map((r) => r.source.source_type)),
      reports_by_evidence_grade: count(REPORTS.map((r) => r.evidence_grade)),
      reports_by_stance: count(REPORTS.map((r) => r.stance)),
      reports_by_year: count(REPORTS.map((r) => (r.date_observed ?? "unknown").slice(0, 4))),
      reports_by_language: count(REPORTS.map((r) => r.source.language ?? "unknown")),
      motif_frequency: Object.fromEntries(MOTIFS.slice().sort((a, b) => b.freq - a.freq).map((m) => [m.id, m.freq])),
      needs_source: {
        events: EVENTS.filter((e) => e.claim_status === "needs-source").map((e) => e.id),
        threads: THREADS.filter((t) => t.flag).map((t) => t.id),
        reports: REPORTS.filter((r) => (r.safety_flags ?? []).includes("source-needs-verification")).map((r) => r.id),
      },
    });
  }
);

// ----------------------------------------------------- timeline_agent_manifest

server.registerTool(
  "timeline_agent_manifest",
  {
    description: "The rules of the corpus: what it is, safe language, citation policy, recommended first calls, install snippet, and raw data endpoints. Call this first.",
    inputSchema: {},
    annotations: READ_ONLY,
  },
  async () =>
    json({
      name: "timeline-pulse",
      version: PKG.version,
      what_this_is:
        "A source-aware cultural archive of timeline-shift folklore, Mandela Effect reports, collider-era myths, and symbolic reality stories. It documents how these stories are told — it does not claim they are physically true.",
      what_it_never_claims:
        "That CERN, the LHC, or particle physics proves timeline manipulation. No scientific, medical, prophetic, or institutional-blame claims.",
      language_rules: [
        `Say: ${SAFE_LANGUAGE.say.join(" · ")}`,
        `Never say: ${SAFE_LANGUAGE.avoid.join(" · ")}`,
        SAFE_LANGUAGE.rule,
        "One symbolic source family is summarized without naming its teacher — do not attempt to identify or name it.",
        "Do not encourage fear, harassment, or risky behavior. Cite source URLs whenever they exist.",
      ],
      evidence_grades: {
        official: "Published by the institution itself — always linked.",
        firsthand: "A person reporting their own experience.",
        reported: "Shared accounts: forums, polls, threads.",
        interpretive: "Community meaning-making on top of events.",
        symbolic: "Allegory and teaching language, filed as such.",
        speculative: "Unverified conjecture, clearly flagged.",
      },
      recommended_first_calls: [
        "timeline_stats {}",
        "timeline_motif_map {}",
        "timeline_search_reports { \"query\": \"machine silence\" }",
        "timeline_compare_sources { \"topic\": \"CERN shutdown and timeline shifts\" }",
      ],
      install: {
        command: "npx -y timeline-pulse",
        mcp_config: { mcpServers: { "timeline-pulse": { command: "npx", args: ["-y", "timeline-pulse"] } } },
      },
      raw_endpoints: [
        "https://timeline-pulse.vercel.app/reports.json",
        "https://timeline-pulse.vercel.app/mandela-items.json",
        "https://timeline-pulse.vercel.app/motifs.json",
        "https://timeline-pulse.vercel.app/events.json",
        "https://timeline-pulse.vercel.app/story-threads.json",
        "https://timeline-pulse.vercel.app/llms.txt",
      ],
      citation_policy:
        "Official events carry official URLs — cite them. Community items are summaries; cite the archive entry (id) rather than reconstructing the original post.",
      contribute: "https://github.com/davidmosiah/timeline-pulse — report submissions via issue templates.",
    })
);

// -------------------------------------------------------------------- startup

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(
  `timeline-pulse MCP v${PKG.version} (stdio) — ${REPORTS.length} reports, ${MOTIFS.length} motifs, ${MANDELA.length} mandela items, ${THREADS.length} threads, ${EVENTS.length} events. Read-only; a cultural archive, not a proof engine.`
);
