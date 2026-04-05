import csvParser from 'csv-parser';
import fs from 'fs';
import { FullTextSearchEngine } from './fts-engine';

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

const query = 'Bruno Vinicius Dias Da Silva';

const searchResults = fullTextSearchEngine.search(query.toUpperCase());

console.log(`Search results for query "${query}":`, searchResults);
