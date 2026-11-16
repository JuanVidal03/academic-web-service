type Json = unknown;

/**
 * Convert object keys between the API's snake_case and the client's camelCase.
 *
 * Generic rather than 34 hand-written field mappings per direction. The feature names are
 * perfectly mechanical (`distancia_a_universidad_km` <-> `distanciaAUniversidadKm`), so a
 * tested converter is far less likely to drift than 68 lines that must be kept in step
 * with ml/schema.py by hand.
 *
 * Only keys are touched; values pass through untouched, including nulls and arrays.
 */
const snakeToCamel = (key: string): string =>
  key.replace(/_([a-z0-9])/g, (_match, char: string) => char.toUpperCase());

const camelToSnake = (key: string): string =>
  key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);

// `_key` only to satisfy the base no-unused-vars rule, which misfires on names in
// type signatures.
const mapKeys = (value: Json, convert: (_key: string) => string): Json => {
  if (Array.isArray(value)) {
    return value.map((item) => mapKeys(item, convert));
  }
  // Date and other class instances are not plain objects; leaving them alone avoids
  // silently flattening them into {}.
  if (value === null || typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, Json>).map(([key, item]) => [
      convert(key),
      mapKeys(item, convert)
    ])
  );
};

export const toCamel = <T>(value: Json): T => mapKeys(value, snakeToCamel) as T;

export const toSnake = <T>(value: Json): T => mapKeys(value, camelToSnake) as T;
