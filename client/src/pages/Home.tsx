import { ArrowDown, ArrowUpRight, Box, Disc3, Loader2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

const fallbackHero = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88";

export default function Home() {
  const input = useMemo(() => ({ first: 12 }), []);
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery(input);
  const featured = products.slice(0, 4);
  const heroImage = products[0]?.images[0]?.url ?? fallbackHero;

  return (
    <div className="site-shell">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="container relative grid min-h-[720px] items-center gap-12 py-14 lg:grid-cols-[.78fr_1.22fr] lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-[#b8cce1]"><span className="h-px w-10 bg-[#b8cce1]" /> Drop 01 · 2026 / HYD</div>
            <h1 className="font-display text-[clamp(4.7rem,10vw,9.8rem)] font-semibold leading-[.78] tracking-[-.08em] text-[#f4f6f8]">Enter the<br /><span className="text-[#b7d0ea]">void.</span></h1>
            <p className="mt-9 max-w-md text-base leading-7 text-[#9ca7b5]">High-frequency uniform for low-light hours. Limited pieces engineered in Hyderabad, cut for the street, tuned for wherever you disappear next.</p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/shop" className="inline-flex items-center gap-3 bg-[#edf3f8] px-6 py-4 text-xs font-bold uppercase tracking-[.18em] text-[#050505] transition-colors hover:bg-[#b7d0ea]">Explore the drop <ArrowUpRight className="size-4" /></Link>
              <a href="#signal" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#cbd5e1] hover:text-[#edf3f8]">Scroll to tune in <ArrowDown className="size-4" /></a>
            </div>
            <div className="mt-14 flex flex-wrap gap-7 text-[10px] font-bold uppercase tracking-[.18em] text-[#6f7c8b]"><span className="flex items-center gap-2"><Sparkles className="size-3 text-[#b7d0ea]" /> Small run / big signal</span><span className="flex items-center gap-2"><Box className="size-3 text-[#b7d0ea]" /> Ships worldwide</span></div>
          </div>

          <div className="relative min-h-[460px] lg:min-h-[600px]">
            <div className="absolute -right-16 -top-10 size-72 rounded-full border border-[#c3dcf4]/20 orbit-spin" />
            <div className="absolute -right-4 top-12 size-52 rounded-full border border-dashed border-[#a8bfe0]/20 orbit-spin-reverse" />
            <div className="chrome-card noise relative ml-auto h-[460px] w-[86%] overflow-hidden sm:h-[560px] lg:h-[610px]">
              <img src={heroImage} alt="AK VOID after-hours look" className="size-full object-cover object-center opacity-80 mix-blend-screen grayscale" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,3,5,.82),transparent_45%,rgba(163,199,236,.22))]" />
              <div className="chrome-sheen" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div><p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#b7d0ea]">AKV / 001</p><p className="mt-2 max-w-[180px] text-xs leading-5 text-[#e4ebf3]">Chrome skin / zero gravity / everyday armor</p></div>
                <span className="grid size-11 place-items-center rounded-full border border-white/25 bg-black/25 backdrop-blur-md"><Disc3 className="size-5 text-[#d8e8f8]" /></span>
              </div>
            </div>
            <div className="absolute -bottom-3 -left-2 max-w-[230px] border-l border-[#b7d0ea] pl-4 text-xs leading-5 text-[#8e9aa8]">A new frequency for the city after dark.<br /><span className="font-mono text-[9px] uppercase tracking-[.18em] text-[#b7d0ea]">01° 22′ 37″ N / 103° 51′ 15″ E</span></div>
          </div>
        </div>
      </section>

      <section id="signal" className="container py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[.4fr_1fr] lg:items-start">
          <div><p className="font-mono text-[10px] uppercase tracking-[.24em] text-[#718092]">01 / The signal</p><p className="mt-5 max-w-[180px] text-xs leading-6 text-[#697584]">Every object is a transmission. Make yours worth receiving.</p></div>
          <div><h2 className="max-w-4xl font-display text-5xl font-semibold leading-[.88] tracking-[-.06em] text-[#f4f6f8] sm:text-7xl">The uniform for <em className="font-normal text-[#b7d0ea]">where the map goes quiet.</em></h2><p className="mt-9 max-w-xl text-base leading-8 text-[#8d99a7]">AK VOID is founded by AK in Hyderabad. We make considered, small-run streetwear with the tension of a studio monitor: controlled, tactile, and a little louder than it looks.</p><Link href="/shop" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#dce8f5] underline underline-offset-8 hover:text-[#b7d0ea]">Shop the first transmission <ArrowUpRight className="size-4" /></Link></div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.02] py-20 backdrop-blur-sm lg:py-24">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="font-mono text-[10px] uppercase tracking-[.24em] text-[#718092]">02 / The first drop</p><h2 className="mt-3 font-display text-5xl font-semibold tracking-[-.06em] text-[#f4f6f8] sm:text-6xl">Objects with signal.</h2></div><Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#cbd9e8] hover:text-[#b7d0ea]">View all pieces <ArrowUpRight className="size-4" /></Link></div>
          {isLoading ? <div className="grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin text-[#b7d0ea]" /></div> : featured.length ? <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="mt-10 chrome-card p-12 text-center text-sm text-[#8c95a1]">The first drop is syncing. Check back shortly.</div>}
        </div>
      </section>

      <section className="container grid gap-8 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
        <div className="glass-panel min-h-[390px] overflow-hidden p-8 sm:p-12"><div className="absolute right-8 top-8 size-24 rounded-full border border-[#bfd8f0]/20 orbit-spin" /><p className="relative z-10 font-mono text-[10px] uppercase tracking-[.24em] text-[#b7d0ea]">03 / Come through</p><h2 className="relative z-10 mt-16 max-w-sm font-display text-5xl font-semibold leading-[.86] tracking-[-.06em] text-[#f2f5f8] sm:text-6xl">Try the signal.<br /><span className="text-[#a9c3dd]">Meet the source.</span></h2><p className="relative z-10 mt-8 max-w-xs text-sm leading-6 text-[#8f9aa8]">AK VOID studio / 9/79/1, Road No. 5, SV Nagar, Sri Chakri Puram Colony, Kapra, Hyderabad, Telangana 500083, India.</p><a href="tel:+918099996966" className="relative z-10 mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#dbe8f5] hover:text-[#b7d0ea]">Call the studio <ArrowUpRight className="size-4" /></a></div>
        <div className="flex flex-col justify-between border-t border-white/15 pt-5"><p className="font-mono text-[10px] uppercase tracking-[.24em] text-[#718092]">A note from the source</p><blockquote className="mt-16 font-display text-4xl font-semibold leading-[.94] tracking-[-.05em] text-[#f2f5f8] sm:text-5xl">“Keep the fit precise. Keep the energy strange.”</blockquote><div className="mt-10 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[.18em] text-[#718092]"><span>— AK, founder</span><a href="https://instagram.com/ak_beats_27" target="_blank" rel="noreferrer" className="text-[#b7d0ea] hover:text-[#f2f5f8]">@ak_beats_27</a></div></div>
      </section>
    </div>
  );
}
