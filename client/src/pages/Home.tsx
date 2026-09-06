import { ArrowDown, ArrowUpRight, Box, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

const fallbackHero = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88";
const goddessStatue = "/manus-storage/greek-goddess_0f4330b7.jpg";
const zeusStatue = "/manus-storage/greek-zeus_4be8fbe8.jpg";

export default function Home() {
  const input = useMemo(() => ({ first: 12 }), []);
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery(input);
  const featured = products.slice(0, 4);
  const heroImage = products[0]?.images[0]?.url ?? fallbackHero;
  const heroName = products[0]?.title ?? "The first drop";

  return (
    <div className="site-shell">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="container relative grid min-h-[680px] items-center gap-10 py-16 lg:grid-cols-[.9fr_1.1fr] lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-8 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.24em] text-[#a9a29a]"><span className="h-px w-10 bg-[#a9a29a]" /> AK VOID · Drop 01</div>
            <h1 className="font-display text-[clamp(4.6rem,9.5vw,9.4rem)] font-semibold leading-[.78] tracking-[-.09em] text-[#f2f0ec]">Nothing<br />extra<span className="text-[#b9b0a4]">.</span></h1>
            <p className="mt-9 max-w-md text-base leading-7 text-[#9c9a96]">High-end essentials with a quiet point of view. Limited pieces made in Hyderabad, designed to live in your everyday rotation.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5"><Link href="/shop" className="inline-flex items-center gap-3 bg-[#f1eee9] px-6 py-4 text-xs font-bold uppercase tracking-[.18em] text-[#11100f] transition-colors hover:bg-[#d6cec3]">Shop the drop <ArrowUpRight className="size-4" /></Link><a href="#the-uniform" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#cbc6be] hover:text-[#f1eee9]">Read the story <ArrowDown className="size-4" /></a></div>
            <div className="mt-14 flex flex-wrap gap-7 font-mono text-[9px] uppercase tracking-[.18em] text-[#73716d]"><span className="flex items-center gap-2"><Box className="size-3 text-[#b9b0a4]" /> Small run / considered fit</span><span>Worldwide delivery</span></div>
          </div>

          <div className="hero-stage relative min-h-[490px] lg:min-h-[600px]">
            <img src={goddessStatue} alt="Classical marble goddess sculpture" className="marble-hero-accent" style={{opacity: '0.8'}} />
            <div className="suspension-wire" aria-hidden="true" />
            <div className="suspended-product">
              <div className="product-image-shell" style={{opacity: '0.8'}}><img src={heroImage} alt={`${heroName} by AK VOID`} className="size-full object-cover object-center grayscale" style={{opacity: '0.8'}} /></div>
              <div className="liquid-shadow" aria-hidden="true" />
            </div>
            <div className="hero-object-label"><span className="font-mono text-[9px] uppercase tracking-[.18em] text-[#b8b0a7]">AK VOID / 001</span><span className="mt-2 block max-w-[170px] text-xs leading-5 text-[#a09d98]">{heroName}<br />made to be worn often</span></div>
            <div className="hero-stage-note"><span className="block font-mono text-[9px] uppercase tracking-[.16em] text-[#78746e]">A quiet uniform</span><span className="mt-1 block">soft structure / low profile / everyday</span></div>
          </div>
        </div>
      </section>

      <section id="the-uniform" className="container py-20 lg:py-28"><div className="grid gap-12 lg:grid-cols-[.38fr_1fr] lg:items-start"><div className="relative min-h-[180px]"><img src={zeusStatue} alt="Classical marble Zeus sculpture" className="marble-story-cutout" /><div className="relative z-10 pt-28"><p className="font-mono text-[10px] uppercase tracking-[.24em] text-[#7e7a74]">01 / The uniform</p><p className="mt-5 max-w-[190px] text-xs leading-6 text-[#77736e]">Less noise. Better materials. A fit that stays in rotation.</p></div></div><div><h2 className="max-w-4xl font-display text-5xl font-semibold leading-[.9] tracking-[-.06em] text-[#f2f0ec] sm:text-7xl">Clothes for the space between <em className="font-normal text-[#b9b0a4]">where you are</em> and where you are going.</h2><p className="mt-9 max-w-xl text-base leading-8 text-[#94918c]">AK VOID is founded by AK in Hyderabad. Every piece is cut in small runs, finished with restraint, and made to earn its place in your wardrobe.</p><Link href="/shop" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#ded9d1] underline underline-offset-8 hover:text-[#b9b0a4]">See the first drop <ArrowUpRight className="size-4" /></Link></div></div></section>

      <section className="border-y border-white/10 bg-white/[.018] py-20 lg:py-24"><div className="container"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="font-mono text-[10px] uppercase tracking-[.24em] text-[#7e7a74]">02 / The first drop</p><h2 className="mt-3 font-display text-5xl font-semibold tracking-[-.06em] text-[#f2f0ec] sm:text-6xl">The essentials, re-cut.</h2></div><Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#cbc5bc] hover:text-[#f1eee9]">View all pieces <ArrowUpRight className="size-4" /></Link></div>{isLoading ? <div className="grid min-h-72 place-items-center"><Loader2 className="size-6 animate-spin text-[#b9b0a4]" /></div> : featured.length ? <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">{featured.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="mt-10 chrome-card p-12 text-center text-sm text-[#8c8882]">The first drop is syncing. Check back shortly.</div>}</div></section>

      <section className="container grid gap-8 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28"><div className="glass-panel min-h-[360px] overflow-hidden p-8 sm:p-12"><p className="relative z-10 font-mono text-[10px] uppercase tracking-[.24em] text-[#b9b0a4]">03 / Come through</p><h2 className="relative z-10 mt-16 max-w-sm font-display text-5xl font-semibold leading-[.86] tracking-[-.06em] text-[#f2f0ec] sm:text-6xl">Try it on.<br /><span className="text-[#b9b0a4]">Stay awhile.</span></h2><p className="relative z-10 mt-8 max-w-xs text-sm leading-6 text-[#94918c]">AK VOID studio / 9/79/1, Road No. 5, SV Nagar, Sri Chakri Puram Colony, Kapra, Hyderabad, Telangana 500083, India.</p><a href="tel:+918099996966" className="relative z-10 mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#ded9d1] hover:text-[#b9b0a4]">Call the studio <ArrowUpRight className="size-4" /></a></div><div className="flex flex-col justify-between border-t border-white/15 pt-5"><p className="font-mono text-[10px] uppercase tracking-[.24em] text-[#7e7a74]">A note from the source</p><blockquote className="mt-16 font-display text-4xl font-semibold leading-[.94] tracking-[-.05em] text-[#f2f0ec] sm:text-5xl">“Keep the fit precise. Keep the energy strange.”</blockquote><div className="mt-10 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[.18em] text-[#7e7a74]"><span>— AK, founder</span><a href="https://instagram.com/ak_beats_27" target="_blank" rel="noreferrer" className="text-[#b9b0a4] hover:text-[#f2f0ec]">@ak_beats_27</a></div></div></section>
    </div>
  );
}
