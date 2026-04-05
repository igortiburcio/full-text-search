export function ilikeToRegex(pattern: string): RegExp {
  const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = `^${escapedPattern.replace(/%/g, '.*').replace(/_/g, '.')}$`;

  return new RegExp(regexPattern, 'iu');
}

export function tableScanSearch(
  rows: string[],
  pattern: string,
  maxResults = 10,
): string[] {
  if (!pattern.trim()) {
    throw new Error('Pattern must not be empty.');
  }

  const ilikeRegex = ilikeToRegex(pattern);

  const filteredRows: string[] = [];

  for (const row of rows) {
    if (ilikeRegex.test(row)) {
      filteredRows.push(row);
    }
  }

  return filteredRows.slice(0, maxResults);
}
