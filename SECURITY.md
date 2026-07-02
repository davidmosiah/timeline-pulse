# Security Policy

## Supported versions

Only the latest published npm version of `timeline-pulse` is supported.

## What counts as a security issue here

The MCP server is read-only, local-first, requires no keys, and makes no
network calls at runtime — its attack surface is small, but not zero:

- Anything that lets corpus data execute code in an MCP client or on the site.
- Prototype pollution / injection through crafted tool arguments.
- Supply-chain issues in the published npm package.
- The site leaking visitor data (it must not collect any).

## What is *not* a security issue

- Disagreement with how a report is framed or graded — use the
  [source correction template](../../issues/new?template=source-correction.yml).
- Content policy violations (naming the omitted teacher, unlabeled claims) —
  use the [safety / policy template](../../issues/new?template=safety-copyright.yml).

## Reporting

Use GitHub's **private vulnerability reporting** on this repository
(Security → Report a vulnerability). If that is unavailable, email
`mosiahdavid@gmail.com` with subject `[timeline-pulse security]`.

You'll get an acknowledgment within 72 hours. Please don't open public issues
for exploitable problems before a fix ships.
