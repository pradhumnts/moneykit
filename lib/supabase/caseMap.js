function snakeToCamelKey(key) {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnakeKey(key) {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function rowToCamel(row) {
  if (!row || typeof row !== "object") return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[snakeToCamelKey(key)] = value;
  }
  return out;
}

export function rowsToCamel(rows) {
  return (rows || []).map(rowToCamel);
}

export function objectToSnake(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[camelToSnakeKey(key)] = value;
  }
  return out;
}
