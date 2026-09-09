import { ArrowUpRight, Check, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { toast } from "sonner";
import type { Product } from "@shared/commerce/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/contexts/CartContext";
import WishlistButton from "@/components/WishlistButton";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem, loading } = useCart();
  const image = product.images[0];
  const alternateImage = product.images[1];
  const badge = product.tags.find(tag => /arrival|seller|limited|drop/i.test(tag));
  const variant = product.variants.find(item => item.availableForSale) ?? product.variants[0];

  const quickAdd = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!variant?.availableForSale) return;
    try {
      await addItem(variant.id);
      toast.success("Added to bag", { description: product.title });
    } catch {
      toast.error("Could not add this item", { description: "Please try again." });
    }
  };

  return <motion.article className="animate-rise" style={{ animationDelay: `${index * 70}ms`, transformPerspective: 900 }} whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}><div className="group"><div className="chrome-card product-card-image relative aspect-[4/5] overflow-hidden"><div className="absolute inset-0 micro-grid opacity-20" /><Link href={`/product/${product.handle}`} className="absolute inset-0 z-10" aria-label={`View ${product.title}`}><span className="sr-only">View product</span></Link>{image ? <><img src={image.url} alt={image.altText ?? product.title} className="relative z-[1] size-full object-cover opacity-90 mix-blend-screen grayscale transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:opacity-0" />{alternateImage && <img src={alternateImage.url} alt={alternateImage.altText ?? `${product.title} alternate view`} className="absolute inset-0 z-[1] size-full object-cover opacity-0 mix-blend-screen grayscale transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:opacity-90" />}</> : <div className="relative z-[1] size-full bg-[radial-gradient(circle_at_45%_25%,#d8e7f5,#2f3a46_38%,#08090b_74%)]" />}<div className="absolute inset-0 z-20 bg-gradient-to-t from-black/75 via-transparent to-white/[.08]" /><div className="chrome-sheen z-20" />{badge && <span className="absolute left-4 top-4 z-30 border border-white/20 bg-black/35 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#dfeaf5] backdrop-blur-md">{badge}</span>}{!variant?.availableForSale && <span className="absolute left-4 top-4 z-30 border border-[#ff9aaa]/40 bg-black/55 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#ffb2bf] backdrop-blur-md">Out of stock</span>}<div className="absolute right-4 top-4 z-30"><WishlistButton productHandle={product.handle} compact /></div><div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between gap-3"><button type="button" onClick={quickAdd} disabled={loading || !variant?.availableForSale} className="inline-flex items-center gap-2 rounded-full bg-[#edf3f8] px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#050505] opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-[#b7d0ea] disabled:cursor-not-allowed disabled:opacity-50"><ShoppingBag className="size-3.5" /> {loading ? "Adding" : variant?.availableForSale ? "Quick add" : "Unavailable"}</button><Link href={`/product/${product.handle}`} className="grid size-10 translate-y-2 place-items-center rounded-full bg-[#edf3f8] text-[#050505] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100" aria-label={`Open ${product.title}`}><ArrowUpRight className="size-4" /></Link></div></div><Link href={`/product/${product.handle}`} className="flex items-start justify-between gap-4 pt-4"><div><h3 className="font-display text-2xl font-semibold leading-none tracking-[-.04em] text-[#f2f5f8]">{product.title}</h3><p className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#83909f]">{product.productType ?? "Edition"}</p></div><p className="pt-1 font-mono text-sm text-[#d5e3f1]">{formatMoney(product.priceRange.min)}</p></Link>{variant?.availableForSale ? <p className="mt-3 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[.14em] text-[#9dd9ba]"><Check className="size-3" /> Ready to ship</p> : <p className="mt-3 font-mono text-[9px] uppercase tracking-[.14em] text-[#ff9aaa]">Out of stock</p>}</div></motion.article>;
}
