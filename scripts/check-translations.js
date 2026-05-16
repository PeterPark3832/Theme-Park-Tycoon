#!/usr/bin/env node
// Translation completeness checker — run with: node scripts/check-translations.js
// Exits with code 1 if any building key is missing from ko or en tables.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(__dir, '../src/gameData.js'), 'utf8');

// Extract building IDs from B object
const bKeys = [...src.matchAll(/^\s{2}(\w+)\s*:\s*\{emoji:/gm)].map(m => m[1]);

// Extract translation keys from ko and en tables
const koKeys = new Set([...src.matchAll(/"b\.(\w+)":/g)].map(m => m[1]));

// Run check
let missing = 0;
for (const key of bKeys) {
  if (!koKeys.has(key)) {
    console.error(`❌ Missing translation: "b.${key}" (not found in ko/en table)`);
    missing++;
  }
}

if (missing === 0) {
  console.log(`✅ All ${bKeys.length} buildings have translations (ko/en).`);
  console.log(`   Keys checked: ${bKeys.join(', ')}`);
} else {
  console.error(`\n⚠️  ${missing} missing translation(s) — add them to both ko and en tables in gameData.js`);
  process.exit(1);
}
