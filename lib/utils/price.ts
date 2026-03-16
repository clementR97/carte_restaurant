/**
 * Parse "5,50 €" ou "6 €" en nombre. Retourne 0 si invalide.
 */
export function parsePrice(str: string): number {
  const cleaned = str.replace(/\s*€\s*$/, '').trim().replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Formate un nombre en "5,50 €"
 */
export function formatPrice(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}
