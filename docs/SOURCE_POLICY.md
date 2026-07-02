# Source and Content Policy

## Positioning

Timeline Pulse is a cultural and symbolic archive. It can document beliefs,
reports, interpretations, and mythic frameworks, but it must not present them as
established science.

Recommended public language:

- "reported by"
- "interpreted as"
- "linked by community members"
- "symbolically framed as"
- "official CERN source states"
- "mainstream explanation"

Avoid:

- "CERN caused"
- "proved timeline shifts"
- "confirmed portal"
- "scientists are hiding"
- "this will happen"

## Source categories

### Official source

Primary institution, official archive, paper, press release, public data page,
or scientific collaboration.

Use for facts such as:

- The LHC entering Long Shutdown 3.
- HiLumi LHC upgrade goals.
- Official operating schedules.

### Firsthand report

Someone describing their own memory, dream, synchronicity, or perceived shift.

Rules:

- Preserve the emotional truth.
- Do not diagnose the person.
- Do not convert the report into proof.
- Redact sensitive personal data.

### Social post

Public post from X, Reddit, YouTube comments, forums, blogs, or similar sources.

Rules:

- Prefer URL + summary.
- Store short excerpts only when useful and allowed.
- Respect deleted or private content.
- Do not mass scrape in violation of terms.
- Do not store private handles unless the author is public and relevant.

### Symbolic teaching summary

Project-authored summary of a metaphysical or alchemical idea.

Rules:

- Do not use the omitted teacher's public name.
- Attribute as "symbolic teaching summary" or "alchemical source family".
- Mark claims as `symbolic-only`, `interpretive`, or `needs-source`.
- Do not copy long transcripts.

### Project note

Internal synthesis written by maintainers.

Rules:

- Keep it transparent.
- Link to underlying sources when available.
- Mark speculative connections clearly.

## Omitted-teacher rule

The project should not publicly bind itself to the specific spiritual teacher
who influenced part of the seed narrative.

Do:

- Discuss motifs.
- Discuss "alchemical timeline cosmology".
- Discuss "symbolic source family".
- Summarize ideas in original wording.

Do not:

- Put the teacher's public name in README, site copy, data titles, metadata, npm
  keywords, or SEO tags.
- Use their quotes as branding.
- Suggest endorsement or affiliation.

## CERN and institution safety

CERN can be included as an official science anchor and as a community-symbolic
reference. Keep the layers separate.

Acceptable:

- "CERN says the LHC entered Long Shutdown 3 on 2026-06-29."
- "Some community narratives interpret that shutdown as a symbolic calibration
  window."

Not acceptable:

- "CERN opened a portal."
- "CERN broke the timeline."
- "CERN is intentionally controlling memory."

If the corpus includes such claims as reports, mark them:

- `claim_type: "speculative-causation"`
- `status: "not-evidence"` or `status: "reported"`
- `safety_flags: ["do-not-state-as-fact", "institutional-claim"]`

## Copyright

Store:

- Titles.
- URLs.
- Metadata.
- Short excerpts when allowed.
- Original summaries.
- Tags and classifications.

Avoid:

- Full copied articles.
- Long social threads.
- Full transcripts.
- Screenshots unless permission/license is clear.

## Contributor submissions

Submission form should ask:

- What did you experience or notice?
- When did it happen?
- Is it firsthand or something you saw online?
- May the project publish a summary?
- Should your name/handle be public, anonymous, or omitted?
- Are there links or screenshots?
- Which motifs does it feel connected to?

Default: publish summary only, with contributor identity omitted.

## Agent language examples

Good:

> The corpus contains several community-linked reports that interpret the 2026
> LHC shutdown as a "machine silence" window. The official CERN source describes
> the shutdown as maintenance and upgrade work for HiLumi LHC.

Bad:

> The LHC shutdown proves that the timelines are being repaired.

