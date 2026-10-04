export const LOW_STOCK_THRESHOLD = 3;

export function isOnSale(current: string, original?: string | null) {
  const currentAmount = Number(current);
  const originalAmount = original == null ? NaN : Number(original);
  return Number.isFinite(currentAmount) && Number.isFinite(originalAmount) && originalAmount > currentAmount;
}
