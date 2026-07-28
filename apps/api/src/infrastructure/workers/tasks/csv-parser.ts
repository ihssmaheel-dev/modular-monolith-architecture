export interface CsvRow {
  [key: string]: string;
}

export interface ParsedRow {
  data: Record<string, string>;
  rowIndex: number;
}

export async function parseCsvRow(row: CsvRow, rowIndex: number): Promise<ParsedRow> {
  const cleaned: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    cleaned[key.trim().toLowerCase()] = value?.trim() ?? "";
  }

  return { data: cleaned, rowIndex };
}

export async function parseCsvChunk(rows: CsvRow[]): Promise<ParsedRow[]> {
  const results: ParsedRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    results.push(await parseCsvRow(rows[i], i));
  }
  return results;
}
