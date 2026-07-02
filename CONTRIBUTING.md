# Contributing to Timeline Pulse

Thanks for wanting to add to the archive. This project accepts three kinds of
contributions: **reports** (new corpus entries), **corrections** (better
sources, fixed metadata), and **code** (server, site, tooling).

Before anything else, read [docs/SOURCE_POLICY.md](docs/SOURCE_POLICY.md).
It is short and it is the contract: Timeline Pulse is a cultural archive,
not a proof engine.

## Ground rules (non-negotiable)

1. **Label, don't assert.** Every claim carries a `claim_type` and `status`.
   Nothing symbolic, interpretive, or speculative may be phrased as
   established fact — in data, docs, site copy, or commit messages.
2. **Official facts need official URLs.** Events on the `official-science`
   layer must cite a primary source (CERN, NASA, etc.). CI enforces this.
3. **The omitted-teacher rule.** One symbolic source family is summarized
   without naming its teacher — anywhere, ever. CI enforces this with a
   hash-based check (`scripts/check-policy.mjs`); the name never appears in
   this repository, including in the check itself.
4. **Respect people.** No harassment of researchers, believers, skeptics, or
   posters. Redact personal data. Prefer summaries + URLs over copied text.
5. **Short excerpts only.** No full transcripts, long threads, or screenshots
   without clear permission.

## Contributing a report

Open a [report submission issue](../../issues/new?template=report-submission.yml)
— you don't need to write JSON. A curator will grade it, tag motifs, and file
it. If you'd rather submit the JSON yourself, follow the shapes in
[docs/DATA_MODEL.md](docs/DATA_MODEL.md) and run:

```bash
npm run validate
```

Grading guide (`evidence_grade`):

| Grade | Meaning |
| --- | --- |
| `official` | Primary institutional source, always linked |
| `firsthand` | A person reporting their own experience |
| `reported` | Relayed accounts: forums, polls, threads |
| `interpretive` | Community meaning-making on top of events |
| `symbolic` | Allegory and teaching language, filed as such |
| `speculative` | Unverified conjecture, clearly flagged |

## Contributing code

```bash
npm install
npm run build      # compile the MCP server
npm test           # build + data validation + policy guard + MCP smoke test
```

- TypeScript for the server (`src/`), dependency-light vanilla JS for the
  site (`site/` — no build step, by design).
- The site reads the same JSON the MCP server ships. Change data in `data/`
  and run `npm run sync-site` to copy it into `site/`.
- Keep tools read-only. Write access to the corpus happens through PRs,
  reviewed by humans.

## Good first issues

- Add an official NASA/JPL source for the 2029 Apophis close approach and
  unflag the `apophis-window` thread (`data/events.json`, `data/story-threads.json`).
- Add source URLs for classic Mandela catalog items (`data/mandela-items.json`).
- Translate `site/llms.txt` guidance into Portuguese and Spanish.
- Propose new motifs with the [motif proposal template](../../issues/new?template=motif-proposal.yml).

## Releases

Maintainers cut releases. Version bumps touch `package.json` and
`server.json` together (CI checks they agree).
