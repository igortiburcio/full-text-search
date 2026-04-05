import csvParser from 'csv-parser';
import fs from 'fs';
import { FullTextSearchEngine } from './fts-engine';
import { tableScanSearch } from './table-scan';

export let names: string[] = [];
export let reverseIndex: Map<string, Set<number>> = new Map();

type CandidateRow = {
  NM_CANDIDATO?: string;
};

async function initializeDb(): Promise<void> {
  const csvFiles = fs.readdirSync('./csv');
  const uniqueNames = new Set(names);

  for (const file of csvFiles) {
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(`./csv/${file}`, { encoding: 'latin1' })
        .pipe(csvParser({ separator: ';' }))
        .on('data', (data: CandidateRow) => {
          const candidateName = data.NM_CANDIDATO;

          if (!candidateName || uniqueNames.has(candidateName)) {
            return;
          }

          uniqueNames.add(candidateName);
          names.push(candidateName);
        })
        .on('end', () => resolve())
        .on('error', (error: Error) => reject(error));
    });
  }
}

function createFullTextReverseIndex(searchEngine: FullTextSearchEngine) {
  for (let idx = 0; idx < names.length; idx++) {
    const name = names[idx];

    if (!name) {
      continue;
    }

    searchEngine.addName(name, idx);
  }
}

const fullTextSearchEngine = new FullTextSearchEngine();

await initializeDb();
createFullTextReverseIndex(fullTextSearchEngine);

console.log(`Database initialized with ${names.length} unique names.`);

const query = 'Igor Wander';
const ilikePattern = `%${query}%`;

const fullTextStartedAt = performance.now();
const fullTextResults = fullTextSearchEngine.search(query.toUpperCase());
const fullTextDurationMs = performance.now() - fullTextStartedAt;

const tableScanStartedAt = performance.now();
const tableScanResults = tableScanSearch(names, ilikePattern.toUpperCase());
const tableScanDurationMs = performance.now() - tableScanStartedAt;

console.log(`Full text results for query "${query}":`, fullTextResults);
console.log(`Full text time: ${fullTextDurationMs.toFixed(2)}ms`);

console.log(
  `Table scan (ILIKE) results for pattern "${ilikePattern}":`,
  tableScanResults,
);
console.log(`Table scan time: ${tableScanDurationMs.toFixed(2)}ms`);
