import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const input = useMemo(() => ({ first: 100 }), []);
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery(input);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All pieces");
  const [sort, setSort] = useState("featured");
  const tags = useMemo(() => ["All pieces", ...Array.from(new Set(products.flatMap(product => product.tags))).slice(0, 5)], [products]);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter(product => {
      const matchesSearch = !query || `${product.title} ${product.description} ${product.tags.join(" ")}`.toLowerCase().includes(query);
      const matchesTag = activeTag === "All pieces" || product.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
    return [...result].sort((a, b) => sort === "price-low" ? Number(a.priceRange.min.amount) - Number(b.priceRange.min.amount) : sort === "price-high" ? Number(b.priceRange.min.amount) - Number(a.priceRange.min.amount) : a.title.localeCompare(b.title));
  }, [activeTag, products, search, sort]);

  return (
    <div className="container py-12 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[#1f2a22]/15 pb-10"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#657163]">AK Beats / Shop</p><h1 className="mt-3 font-display text-6xl font-semibold tracking-[-0.05em] sm:text-8xl">The edit<span className="text-[#8f7953]">.</span></h1></div><p className="max-w-xs text-sm leading-6 text-[#657163]">Small-run pieces with a useful attitude. Start with the first drop, then make it your own.</p></div>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{tags.map(tag => <button key={tag} onClick={() => setActiveTag(tag)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${activeTag === tag ? "border-[#1f2a22] bg-[#1f2a22] text-[#f5f2ea]" : "border-[#1f2a22]/20 hover:border-[#1f2a22]"}`}>{tag}</button>)}</div><div className="flex gap-3"><label className="flex min-w-52 items-center gap-2 border-b border-[#1f2a22]/25 px-1 py-2"><Search className="size-4 text-[#657163]" /><span className="sr-only">Search pieces</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the edit" className="w-full bg-transparent text-sm outline-none placeholder:text-[#657163]" /></label><label className="flex items-center gap-2 border-b border-[#1f2a22]/25 px-1 py-2"><SlidersHorizontal className="size-4 text-[#657163]" /><span className="sr-only">Sort products</span><select value={sort} onChange={event => setSort(event.target.value)} className="bg-transparent text-xs font-bold uppercase tracking-[0.12em] outline-none"><option value="featured">Featured</option><option value="price-low">Price low</option><option value="price-high">Price high</option></select></label></div></div>
      {isLoading ? <div className="grid min-h-80 place-items-center text-[#657163]">Loading the edit…</div> : filteredProducts.length ? <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="mt-16 border border-dashed border-[#1f2a22]/25 px-6 py-20 text-center"><h2 className="font-display text-4xl font-semibold">Nothing in that lane yet.</h2><p className="mt-3 text-sm text-[#657163]">Try a different search or reset the filter.</p><button onClick={() => { setSearch(""); setActiveTag("All pieces"); }} className="mt-6 text-xs font-bold uppercase tracking-[0.18em] underline underline-offset-4">Reset the edit</button></div>}
    </div>
  );
}
