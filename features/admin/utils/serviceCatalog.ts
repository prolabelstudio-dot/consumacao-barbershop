import { DEFAULT_SERVICES, PRODUCT_TERMS } from "../constants";
import type { Product } from "../types";

function normalizeService(item: unknown): Product | null {
  if (!item || typeof item !== "object") return null;
  const candidate = item as Record<string, unknown>;
  if (!candidate.name) return null;

  const name = String(candidate.name);
  const lowered = name.toLowerCase();
  const isKnownProduct = PRODUCT_TERMS.some((term) => lowered.includes(term));
  const isServiceCategory = String(candidate.category || "")
    .toLowerCase()
    .includes("serv");
  const pointsAward = Number(candidate.pointsAward || 0);

  if (isKnownProduct || (!isServiceCategory && pointsAward <= 0)) {
    return null;
  }

  return {
    id: String(candidate.id || `service-${name.toLowerCase().replace(/\s+/g, "-")}`),
    name,
    price: Number(candidate.price || 0),
    pointsAward,
    category: String(candidate.category || ""),
  };
}

export function buildServiceCatalog(rawProducts: unknown): Product[] {
  const fromApi = Array.isArray(rawProducts)
    ? rawProducts.map(normalizeService).filter((value): value is Product => Boolean(value))
    : [];

  const existingNames = new Set(fromApi.map((service) => service.name.trim().toLowerCase()));
  const merged = [...fromApi];

  for (const service of DEFAULT_SERVICES) {
    const key = service.name.trim().toLowerCase();
    if (!existingNames.has(key)) {
      merged.push(service);
    }
  }

  return merged.length > 0 ? merged : DEFAULT_SERVICES;
}
