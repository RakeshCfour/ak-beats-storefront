import type { Money } from "@shared/commerce/types";
import { formatMoney } from "@/lib/format";

type PriceDisplayProps = {
  current: Money;
  original?: Money | null;
  className?: string;
  compact?: boolean;
};

export default function PriceDisplay({ current, original, className = "", compact = false }: PriceDisplayProps) {
  const currentAmount = Number(current.amount);
  const originalAmount = original ? Number(original.amount) : NaN;
  const hasOffer = Number.isFinite(currentAmount) && Number.isFinite(originalAmount) && originalAmount > currentAmount;
  const discount = hasOffer ? Math.round((1 - currentAmount / originalAmount) * 100) : 0;
  return <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
    <span className="font-mono font-semibold text-[#d8e6f3]">{formatMoney(current)}</span>
    {hasOffer && <><span className="font-mono text-[.8em] text-[#7f8994] line-through">{formatMoney(original!)}</span><span className={`font-mono font-bold uppercase tracking-[.12em] text-[#9dd9ba] ${compact ? "text-[8px]" : "text-[9px]"}`}>{discount}% OFF</span></>}
  </span>;
}
