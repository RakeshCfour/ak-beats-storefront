import { ArrowDown, ArrowUpRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const input = useMemo(() => ({ first: 12 }), []);
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery(input);
  const heroProduct = products[0];

  return (
    <div>
      <section className="relative overflow-hidden bg-transparent text-[#f4f5f7]">
        <div className="container grid min-h-[640px] items-end gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div className="relative z-10 max-w-xl pb-4 lg:pb-12">
            <p className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#d8c49a]"><span className="h-px w-10 bg-[#d8c49a]" /> Drop 01 · The after hours edit</p>
            <h1 className="font-display text-[clamp(4.5rem,10vw,9rem)] font-semibold leading-[0.8] tracking-[-0.065em]">Dressed for<br /><span className="text-[#d8c49a]">the after</span><br />hours.</h1>
            <p className="mt-9 max-w-sm text-base leading-7 text-[#c8d0c5]">A quiet uniform for loud ideas. AK Beats makes small-run pieces with a point of view, built between the city and the studio.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="/shop" className="inline-flex items-center gap-3 bg-[#d8c49a] px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#1f2a22] transition-colors hover:bg-[#f1e6c8]">Shop the drop <ArrowUpRight className="size-4" /></Link>
              <a href="#story" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#dfe4db] hover:text-[#d8c49a]">Scroll to explore <ArrowDown className="size-4" /></a>
            </div>
          </div>
          <div className="relative min-h-[390px] lg:min-h-[560px]">
            <div className="absolute -right-24 -top-24 size-72 rounded-full border border-[#d8c49a]/25" />
            <div className="absolute right-0 top-0 h-full w-[86%] overflow-hidden bg-[#6e776b]">
              {heroProduct?.images[0] ? <img src={heroProduct.images[0].url} alt={heroProduct.images[0].altText ?? heroProduct.title} className="size-full object-cover object-center opacity-90" /> : <div className="size-full bg-[linear-gradient(135deg,#d0c0a2,#667263)]" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f2a22]/40 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-6 left-0 max-w-[220px] border-l border-[#d8c49a] pl-4 text-xs leading-5 text-[#dfe4db]">Textured layers, low light, and the freedom to take the long way home.</div>
            <div className="absolute right-4 top-6 rotate-90 text-[9px] font-bold uppercase tracking-[0.28em] text-[#d8c49a]">AKB / 01 — 2026</div>
          </div>
        </div>
      </section>

      <section id="story" className="container py-20 text-[#f4f5f7] lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.55fr_1fr] lg:items-start">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8d99aa]">01 / The point of view</p>
          <div><h2 className="max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl">Clothes for the space between <em className="font-normal text-[#8f7953]">where you are</em> and where you’re going.</h2><p className="mt-8 max-w-xl text-base leading-8 text-[#657163]">AK Beats is a local clothing label with a global ear. We make pieces that hold their own: tactile, useful, and just unexpected enough to become yours.</p><Link href="/shop" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] underline underline-offset-8">Meet the first drop <ArrowUpRight className="size-4" /></Link></div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] py-20 text-[#f4f5f7] backdrop-blur-sm lg:py-24">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#657163]">02 / The first drop</p><h2 className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">The essentials, re-cut.</h2></div><Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] hover:text-[#8f7953]">View all pieces <ArrowUpRight className="size-4" /></Link></div>
          {isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="size-6 animate-spin text-[#657163]" /></div> : <div className="mt-10 grid gap-8 sm:grid-cols-2">{products.slice(0, 2).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>}
          {!isLoading && products.length === 0 && <p className="mt-10 text-sm text-[#657163]">The edit is loading. Check back shortly.</p>}
        </div>
      </section>

      <section id="visit" className="container grid gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div className="glass-panel min-h-[360px] p-8 text-[#f4f5f7] sm:p-12"><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c7d0df]">03 / Come through</p><h2 className="mt-16 max-w-sm font-display text-5xl font-semibold leading-[0.9] tracking-[-0.04em] sm:text-6xl">Try it on.<br />Stay awhile.</h2><p className="mt-8 max-w-xs text-sm leading-6 text-[#aeb8c7]">AK Beats studio store · Indiranagar, Bengaluru<br />Tue–Sun · 11:00 — 20:00</p><a href="https://maps.google.com" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c7d0df]">Open in maps <ArrowUpRight className="size-4" /></a></div>
        <div className="flex flex-col justify-between border-t border-[#1f2a22]/20 pt-5"><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#657163]">A note from the studio</p><blockquote className="mt-16 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-5xl">“The best piece in your wardrobe is the one you reach for without thinking.”</blockquote><p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[#657163]">— Ak, founder</p></div>
      </section>
    </div>
  );
}
