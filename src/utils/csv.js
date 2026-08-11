/**
 * Escape a single CSV field (RFC 4180-style).
 * Handles commas, quotes, newlines, and Unicode (Hindi, etc.).
 */
export const escapeCsvField = (value) => {
  if (value == null) {
    return '';
  }

  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

/**
 * Build a UTF-8 CSV string with BOM so Excel opens Indian/Hindi names correctly.
 * @param {Array<Record<string, unknown>>} rows
 * @param {string[]} columns
 */
export const buildCsv = (rows, columns) => {
  const header = columns.map(escapeCsvField).join(',');
  const lines = (rows || []).map((row) =>
    columns.map((column) => escapeCsvField(row?.[column])).join(','),
  );

  return `\uFEFF${[header, ...lines].join('\r\n')}`;
};
