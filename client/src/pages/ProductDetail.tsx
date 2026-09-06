import { ArrowLeft, ArrowUpRight, Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:handle");
  const handle = params?.handle ?? "";
  const { data: product, isLoading, isError } = trpc.commerce.products.byHandle.useQuery({ handle }, { enabled: Boolean(handle) });
  const { addItem, loading } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (isLoading) return <div className="container grid min-h-[70vh] place-items-center text-sm text-[#657163]">Loading the piece…</div>;
  if (isError || !product) return <div className="container grid min-h-[70vh] place-items-center text-center"><div><h1 className="font-display text-5xl font-semibold">Piece not found.</h1><Link href="/shop" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] underline underline-offset-4">Back to the edit <ArrowUpRight className="size-4" /></Link></div></div>;

  const variant = product.variants[0];
  const image = product.images[activeImage] ?? product.images[0];

  return (
    <div className="container py-8 lg:py-14">
      <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#657163] hover:text-[#1f2a22]"><ArrowLeft className="size-4" /> Back to shop</Link>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="grid gap-3 sm:grid-cols-[84px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col">{product.images.map((item, index) => <button key={item.url} onClick={() => setActiveImage(index)} className={`size-20 shrink-0 overflow-hidden border-2 ${activeImage === index ? "border-[#1f2a22]" : "border-transparent opacity-65 hover:opacity-100"}`}><img src={item.url} alt={item.altText ?? product.title} className="size-full object-cover" /></button>)}</div>
          <button onClick={() => setLightbox(true)} className="order-1 aspect-[4/5] overflow-hidden bg-[#e7e2d6] text-left sm:order-2" aria-label="Open product image">
            {image ? <img src={image.url} alt={image.altText ?? product.title} className="size-full object-cover transition-transform duration-500 hover:scale-[1.02]" /> : <div className="size-full bg-gradient-to-br from-[#d7c5a1] to-[#7c8879]" />}
          </button>
        </div>
        <div className="flex flex-col justify-center lg:py-8"><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#657163]">{product.productType ?? "AK Beats edition"}</p><h1 className="mt-4 max-w-xl font-display text-6xl font-semibold leading-[0.88] tracking-[-0.05em] sm:text-8xl">{product.title}</h1><div className="mt-7 flex items-center gap-4"><p className="text-lg font-semibold">{formatMoney(variant?.price ?? product.priceRange.min)}</p>{variant?.availableForSale ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#657163]"><Check className="size-3" /> In stock</span> : <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8f5f53]">Currently unavailable</span>}</div><p className="mt-8 max-w-md text-base leading-8 text-[#657163]">{product.description}</p><div className="mt-8 border-y border-[#1f2a22]/15 py-5"><div className="flex items-center justify-between text-xs"><span className="font-bold uppercase tracking-[0.16em]">Edition details</span><span className="text-[#657163]">{product.tags.slice(0, 2).join(" · ")}</span></div><div className="mt-4 flex items-center justify-between text-xs"><span className="font-bold uppercase tracking-[0.16em]">Fit</span><span className="text-[#657163]">Relaxed / everyday</span></div></div><button onClick={() => variant && addItem(variant.id)} disabled={!variant?.availableForSale || loading} className="mt-8 flex w-full items-center justify-center gap-2 bg-[#1f2a22] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f5f2ea] transition-colors hover:bg-[#314234] disabled:cursor-not-allowed disabled:opacity-50">{loading && <Loader2 className="size-4 animate-spin" />} Add to bag <ArrowUpRight className="size-4" /></button><p className="mt-4 text-center text-xs leading-5 text-[#657163]">Secure checkout via Shopify · Taxes and delivery calculated at checkout.</p></div>
      </div>
      <div className="mt-20 grid gap-10 border-t border-[#1f2a22]/15 pt-10 sm:grid-cols-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#657163]">01 / Materials</p><p className="mt-3 text-sm leading-6">Made to be worn often, washed gently, and kept close.</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#657163]">02 / Dispatch</p><p className="mt-3 text-sm leading-6">Packed from Bengaluru, usually within 2–3 working days.</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#657163]">03 / Questions</p><p className="mt-3 text-sm leading-6">Need a fit note? <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" className="underline underline-offset-4">Message the studio.</a></p></div></div>
      {lightbox && image && <div className="fixed inset-0 z-[60] grid place-items-center bg-[#10150f]/90 p-5" role="dialog" aria-modal="true" aria-label="Product image viewer"><button onClick={() => setLightbox(false)} className="absolute right-5 top-5 rounded-full border border-[#f5f2ea]/30 p-3 text-[#f5f2ea] hover:bg-[#f5f2ea]/10" aria-label="Close image viewer"><X className="size-5" /></button><img src={image.url} alt={image.altText ?? product.title} className="max-h-[88vh] max-w-full object-contain" /></div>}
    </div>
  );
}
