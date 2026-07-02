# Data Model

Timeline Pulse should be a static corpus first. The MCP server loads JSON files
from the package, and the Vercel site serves the same JSON files publicly.

## Files

```text
data/
  reports.json
  mandela-items.json
  motifs.json
  events.json
  story-threads.json
  sources.json
```

## `reports.json`

Reports are the core unit.

```ts
type TimelineReport = {
  id: string;
  title: string;
  summary: string;
  long_summary?: string;
  phenomenon_type:
    | "mandela-effect"
    | "timeline-shift"
    | "synchronicity"
    | "cern-lore"
    | "simulation-glitch"
    | "symbolic-alchemy"
    | "dream-vision"
    | "personal-report"
    | "official-science-anchor";
  date_observed?: string;
  date_posted?: string;
  date_added: string;
  location?: {
    label: string;
    latitude?: number;
    longitude?: number;
    symbolic?: boolean;
  };
  source: {
    source_id?: string;
    source_type:
      | "official-source"
      | "firsthand-report"
      | "social-post"
      | "forum-thread"
      | "article"
      | "video"
      | "transcript-summary"
      | "symbolic-teaching-summary"
      | "project-note";
    source_url?: string;
    author_display?: string;
    author_policy: "public" | "redacted" | "omitted" | "unknown";
    language?: string;
    archived?: boolean;
  };
  evidence_grade:
    | "official"
    | "firsthand"
    | "reported"
    | "interpretive"
    | "symbolic"
    | "speculative";
  stance: "belief" | "neutral" | "skeptical" | "official" | "mixed";
  motifs: string[];
  claims: TimelineClaim[];
  anchors?: TimelineAnchor[];
  related_report_ids?: string[];
  safety_flags?: SafetyFlag[];
  recommended_agent_language?: string[];
};
```

## Claims

Claims must carry a status. The model should never force an agent to guess
whether something is fact or interpretation.

```ts
type TimelineClaim = {
  text: string;
  claim_type:
    | "official-fact"
    | "personal-experience"
    | "community-interpretation"
    | "symbolic-reading"
    | "speculative-causation"
    | "fictional-or-mythic";
  status:
    | "verified-source"
    | "reported"
    | "needs-source"
    | "disputed"
    | "symbolic-only"
    | "not-evidence";
  source_url?: string;
};
```

## Anchors

Anchors connect reports to official events or known cultural markers.

```ts
type TimelineAnchor = {
  anchor_id: string;
  label: string;
  date?: string;
  layer: "official-science" | "community-wave" | "symbolic-anchor" | "cultural-marker";
  source_url?: string;
  relation:
    | "same-date"
    | "same-period"
    | "mentioned-by-source"
    | "community-linked"
    | "symbolic-parallel";
};
```

## Safety flags

```ts
type SafetyFlag =
  | "avoid-direct-teacher-name"
  | "do-not-state-as-fact"
  | "no-harassment"
  | "source-needs-verification"
  | "copyright-risk"
  | "sensitive-personal-story"
  | "institutional-claim";
```

## `mandela-items.json`

```ts
type MandelaItem = {
  id: string;
  title: string;
  category: "brand" | "film" | "music" | "geography" | "scripture" | "pop-culture" | "personal-memory";
  remembered_variant: string;
  current_variant: string;
  community_notes: string;
  mainstream_notes?: string;
  motifs: string[];
  first_known_wave?: string;
  source_links: string[];
  related_report_ids: string[];
  status: "classic" | "new-wave" | "unverified" | "needs-review";
};
```

## `motifs.json`

```ts
type Motif = {
  id: string;
  label: string;
  short_definition: string;
  long_definition?: string;
  family:
    | "machine"
    | "time"
    | "light"
    | "serpent"
    | "memory"
    | "simulation"
    | "alchemy"
    | "astronomy"
    | "body";
  aliases: string[];
  recommended_visuals: string[];
  caution?: string;
};
```

## `events.json`

Official science events and community-linked events live together, but every
event has a layer.

```ts
type TimelineEvent = {
  id: string;
  title: string;
  date: string;
  layer: "official-science" | "community-wave" | "symbolic-anchor" | "site-update";
  summary: string;
  source_url?: string;
  motifs: string[];
  claim_status: "official" | "reported" | "interpretive" | "symbolic" | "needs-source";
};
```

## `story-threads.json`

```ts
type StoryThread = {
  id: string;
  title: string;
  public_summary: string;
  belief_frame: string;
  neutral_frame: string;
  skeptical_frame?: string;
  motifs: string[];
  anchor_ids: string[];
  report_ids: string[];
  suggested_questions: string[];
};
```

## Evidence grades

Use these definitions everywhere:

- `official`: official institution, scientific collaboration, public archive,
  or primary source.
- `firsthand`: a person describing their own experience.
- `reported`: someone relaying a post, comment, rumor, or community wave.
- `interpretive`: a claim connecting events through meaning, symbolism, or
  pattern recognition.
- `symbolic`: mythic, ritual, spiritual, poetic, or archetypal framing.
- `speculative`: causal or predictive claim without verification.

## Attribution policy in data

Do not store the public name of the omitted teacher. Use:

```json
{
  "source_type": "symbolic-teaching-summary",
  "author_policy": "omitted"
}
```

If a contributor submits a public social post, store a URL and short summary.
Avoid copying long text into the repo.
