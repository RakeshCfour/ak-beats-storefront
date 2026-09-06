import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import type { Product } from "@shared/commerce/types";
import { formatMoney } from "@/lib/format";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const image = product.images[0];
  const badge = product.tags.find(tag => tag.toLowerCase().includes("arrival") || tag.toLowerCase().includes("seller"));

  return (
    <Link href={`/product/${product.handle}`} className="group block">
      <motion.article className="animate-rise" style={{ animationDelay: `${index * 70}ms`, transformPerspective: 900 }} whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}>
        <div className="product-card relative aspect-[4/5] overflow-hidden rounded-[2px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,.35)]">
          {image ? <img src={image.url} alt={image.altText ?? product.title} className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" /> : <div className="size-full bg-[radial-gradient(circle_at_35%_20%,#d7c5a1,#7c8879)]" />}
          {badge && <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#f4f5f7] backdrop-blur-md">{badge}</span>}
          <span className="absolute bottom-4 right-4 grid size-10 translate-y-2 place-items-center rounded-full bg-[#f4f5f7] text-[#050505] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="size-4" /></span>
        </div>
        <div className="flex items-start justify-between gap-4 pt-4">
          <div><h3 className="font-display text-2xl font-semibold leading-none tracking-[-0.02em]">{product.title}</h3><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8d99aa]">{product.productType ?? "Edition"}</p></div>
          <p className="pt-1 text-sm font-semibold">{formatMoney(product.priceRange.min)}</p>
        </div>
      </motion.article>
    </Link>
  );
}
