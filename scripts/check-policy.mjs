#!/usr/bin/env node
/**
 * Policy guard for public files.
 *
 * 1. Omitted-source-family rule (docs/SOURCE_POLICY.md): one symbolic source
 *    family is summarized without naming its teacher. This check fails if a
 *    blocked name token appears anywhere in the repo's public files. The
 *    blocklist is stored as SHA-256 digests of normalized tokens so the name
 *    itself never appears in the repository — including here.
 * 2. Forbidden-language rule: public prose must not state lore as proven
 *    physics ("CERN caused", "proved timeline", "confirmed portal").
 *
 * False positive? A legitimate word may collide with a blocked token (they
 * are common given names in some languages). Open a "safety / policy" issue
 * and a maintainer will review — do not weaken the check in the same PR.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const BLOCKED_TOKEN_DIGESTS = new Set([
  "602a0abb57d67c562bcda242a6733514c7aac60e4b179cc6e7ff6f769371a6da",
  "05b9115df05a2a467841772eccc969822d884c9e71841050fe9e0893cce7d11b",
  "583813ddb951f9b8f7db2bef3c78fbdcfff06c6a4e58f6bbcc7af882c90b04a5",
  "a250ad4cb0c658f15fec5fa30b5bf1aaaf4965031e0af296e22c29b609ae49a9",
]);

const FORBIDDEN_PHRASES = [
  /cern\s+caused/i,
  /proved?\s+timeline\s+(shift|manipulation)/i,
  /confirmed\s+portal/i,
  /scientists\s+are\s+hiding/i,
];

// Files that document the forbidden phrases themselves (policy docs quote them
// as negative examples) are exempt from the phrase check, never the name check.
const PHRASE_EXEMPT = new Set([
  "docs/SOURCE_POLICY.md",
  "scripts/check-policy.mjs",
  "src/index.ts", // timeline_agent_manifest quotes the forbidden phrases as "never say" examples
]);

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".vercel"]);
const TEXT_EXT = /\.(md|json|ts|js|mjs|html|txt|yml|yaml|svg|xml)$/i;

const normalize = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const digest = (s) => createHash("sha256").update(s).digest("hex");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (TEXT_EXT.test(name)) yield p;
  }
}

let failures = 0;

for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, "utf8");

  // Token check: split on non-letter boundaries, also test joined pairs so
  // hyphenated/spaced variants of a blocked compound name are caught.
  const tokens = normalize(text).split(/[^a-z]+/).filter(Boolean);
  const candidates = new Set(tokens);
  for (let i = 0; i < tokens.length - 1; i++) {
    candidates.add(tokens[i] + tokens[i + 1]);
    candidates.add(tokens[i] + "-" + tokens[i + 1]);
  }
  for (const c of candidates) {
    if (BLOCKED_TOKEN_DIGESTS.has(digest(c))) {
      console.error(`✗ ${rel}: contains a blocked source-family name token (see docs/SOURCE_POLICY.md, "Omitted-teacher rule").`);
      failures++;
      break;
    }
  }

  if (!PHRASE_EXEMPT.has(rel)) {
    for (const re of FORBIDDEN_PHRASES) {
      const m = text.match(re);
      if (m) {
        console.error(`✗ ${rel}: forbidden claim language "${m[0]}" (see docs/SOURCE_POLICY.md, "Positioning").`);
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\ncheck-policy: ${failures} violation(s).`);
  process.exit(1);
}
console.log("check-policy: OK — no blocked names, no forbidden claim language.");
