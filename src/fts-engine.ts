import { names, reverseIndex } from './main';

export class FullTextSearchEngine {
  addName(name: string, idx: number): void {
    const id = idx;
    const words = name.toUpperCase().split(/\s+/);

    for (const word of words) {
      if (!reverseIndex.has(word)) {
        reverseIndex.set(word, new Set());
      }

      reverseIndex.get(word)!.add(id);
    }
  }

  search(query: string): string[] {
    const results = this.getIndex(query);
    const scoresMap: Map<number, number> = new Map();
    const allLines: Set<number> = new Set();

    results.forEach((ids) => {
      ids.forEach((id) => allLines.add(id));
    });

    results.forEach((partialNames) => {
      allLines.forEach((line) => {
        if (partialNames.includes(line)) {
          scoresMap.set(line, (scoresMap.get(line) || 0) + 1);
        }
      });
    });
    const queryFirstWord = query.toUpperCase().split(' ')[0];

    const scoredResults = Array.from(scoresMap.entries())
      .map(([line, score]) => ({ name: names[line], score }))
      .sort((a, b) => b.score - a.score)
      .filter((result) =>
        result.name?.toUpperCase().startsWith(queryFirstWord!),
      );

    const output = scoredResults.map((result) => result.name || '');

    return output.slice(0, 10);
  }

  private getIndex(query: string): Map<string, number[]> {
    const words = query.split(/\s+/);

    const resultsIds: Map<string, number[]> = new Map();

    for (const word of words) {
      const ids = reverseIndex.get(word);

      if (!ids) {
        continue;
      }

      resultsIds.set(word, Array.from(ids));
    }

    return resultsIds;
  }
}
