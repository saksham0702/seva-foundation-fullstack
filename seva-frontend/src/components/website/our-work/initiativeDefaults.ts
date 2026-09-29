import { InitiativeData } from "./InitiativeCard";

export const DEFAULT_INITIATIVES: InitiativeData[] = [];

/**
 * Robust matcher to find an initiative by slug or key
 */
export function findInitiativeBySlug(
  initiatives: InitiativeData[],
  rawSlug: string
): InitiativeData | null {
  if (!rawSlug) return null;
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // 1. Exact key match
  let found = initiatives.find(
    (i) => (i.key || "").toLowerCase().trim() === slug
  );
  if (found) return found;

  // 2. Exact match against name or title
  found = initiatives.find((i) => {
    const k = (i.key || "").toLowerCase().trim();
    const n = (i.name || "").toLowerCase().trim();
    const t = (i.title || "").toLowerCase().trim();
    return k === slug || n === slug || t === slug;
  });
  if (found) return found;

  // 3. Partial or prefix match (e.g. "vidhya-education" or "vidhya")
  found = initiatives.find((i) => {
    const k = (i.key || "").toLowerCase().trim();
    if (!k) return false;
    return slug.startsWith(k) || k.startsWith(slug) || slug.includes(k);
  });
  if (found) return found;

  // 4. Word in title match
  found = initiatives.find((i) => {
    const t = (i.title || i.name || "").toLowerCase();
    return t.includes(slug) || slug.includes(t);
  });

  return found || null;
}
