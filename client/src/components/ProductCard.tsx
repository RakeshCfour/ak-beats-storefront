import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/commerce/types";
import { formatMoney } from "@/lib/format";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const image = product.images[0];
  const badge = product.tags.find(tag => tag.toLowerCase().includes("arrival") || tag.toLowerCase().includes("seller"));

  return (
    <Link href={`/product/${product.handle}`} className="group block">
      <article className="animate-rise" style={{ animationDelay: `${index * 70}ms` }}>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#e7e2d6]">
          {image ? <img src={image.url} alt={image.altText ?? product.title} className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" /> : <div className="size-full bg-[radial-gradient(circle_at_35%_20%,#d7c5a1,#7c8879)]" />}
          {badge && <span className="absolute left-4 top-4 bg-[#f5f2ea] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#1f2a22]">{badge}</span>}
          <span className="absolute bottom-4 right-4 grid size-10 translate-y-2 place-items-center rounded-full bg-[#f5f2ea] text-[#1f2a22] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="size-4" /></span>
        </div>
        <div className="flex items-start justify-between gap-4 pt-4">
          <div><h3 className="font-display text-2xl font-semibold leading-none tracking-[-0.02em]">{product.title}</h3><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#657163]">{product.productType ?? "Edition"}</p></div>
          <p className="pt-1 text-sm font-semibold">{formatMoney(product.priceRange.min)}</p>
        </div>
      </article>
    </Link>
  );
}
