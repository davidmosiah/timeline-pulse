#!/usr/bin/env node
/**
 * Copies the corpus from data/ into site/ so the Vercel deploy serves the
 * exact JSON the MCP server ships. With --check, fails if they differ
 * (used by CI to catch un-synced edits).
 */
import { copyFileSync, readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const FILES = [
  "reports.json",
  "mandela-items.json",
  "motifs.json",
  "events.json",
  "story-threads.json",
  "sources.json",
];

const checkOnly = process.argv.includes("--check");
let stale = 0;

for (const f of FILES) {
  const src = ROOT + "data/" + f;
  const dst = ROOT + "site/" + f;
  if (checkOnly) {
    let same = false;
    try {
      same = readFileSync(src, "utf8") === readFileSync(dst, "utf8");
    } catch {}
    if (!same) {
      console.error(`✗ site/${f} is out of sync with data/${f} — run: npm run sync-site`);
      stale++;
    }
  } else {
    copyFileSync(src, dst);
    console.log(`data/${f} → site/${f}`);
  }
}

if (stale) process.exit(1);
if (checkOnly) console.log("sync-site-data: OK — site JSON matches data/.");
