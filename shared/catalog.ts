export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"] as const;
export const ONE_SIZE = "One Size" as const;
export const SIZE_OPTIONS = [...STANDARD_SIZES, ONE_SIZE] as const;
export type CatalogSize = (typeof SIZE_OPTIONS)[number];

export function normalizeCatalogSize(value: string) {
  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "one size" || trimmed.toLowerCase() === "onesize") return ONE_SIZE;
  return STANDARD_SIZES.find(size => size.toLowerCase() === trimmed.toLowerCase()) ?? null;
}

export function parseCatalogSizes(value: unknown) {
  const values = String(value ?? "").split(/[,|;]/).map(part => part.trim()).filter(Boolean);
  const sizes = values.map(normalizeCatalogSize);
  if (!sizes.length) return [];
  if (sizes.some(size => !size)) throw new Error(`Unsupported size. Use ${SIZE_OPTIONS.join(", ")}.`);
  return Array.from(new Set(sizes as CatalogSize[]));
}

export const CATEGORY_OPTIONS = ["Tees", "Hoodies", "Accessories", "Bottoms", "Outerwear", "Other"] as const;
export type CatalogCategory = (typeof CATEGORY_OPTIONS)[number];
export const GENDER_OPTIONS = ["men", "women", "unisex"] as const;
export type CatalogGender = (typeof GENDER_OPTIONS)[number];
