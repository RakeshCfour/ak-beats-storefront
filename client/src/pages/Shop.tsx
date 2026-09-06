import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";

const categories = ["All pieces", "Tees", "Hoodies", "Accessories"];

export default function Shop() {
  const [location, setLocation] = useLocation();
  const input = useMemo(() => ({ first: 100 }), []);
  const { data: products = [], isLoading } = trpc.commerce.products.list.useQuery(input);
  const initialQuery = useMemo(() => new URLSearchParams(location.split("?")[1] ?? "").get("search") ?? "", [location]);
  const [search, setSearch] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("All pieces");
  const [sort, setSort] = useState("featured");
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter(product => {
      const searchable = `${product.title} ${product.description} ${product.productType ?? ""} ${product.tags.join(" ")}`.toLowerCase();
      const category = `${product.title} ${product.productType ?? ""} ${product.tags.join(" ")}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesCategory = activeCategory === "All pieces" || category.includes(activeCategory.toLowerCase().replace(/s$/, ""));
      return matchesSearch && matchesCategory;
    });
    return [...result].sort((a, b) => sort === "price-low" ? Number(a.priceRange.min.amount) - Number(b.priceRange.min.amount) : sort === "price-high" ? Number(b.priceRange.min.amount) - Number(a.priceRange.min.amount) : a.title.localeCompare(b.title));
  }, [activeCategory, products, search, sort]);
  const clearSearch = () => { setSearch(""); setLocation("/shop"); };
  return <div className="container py-12 lg:py-20"><div className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1fr_.45fr] lg:items-end"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-[#b7d0ea]">AK VOID / Shop</p><h1 className="mt-3 font-display text-6xl font-semibold tracking-[-.08em] text-[#f2f5f8] sm:text-8xl">The edit<span className="text-[#b7d0ea]">.</span></h1></div><p className="max-w-xs text-sm leading-6 text-[#8a95a2]">Small-run objects with a useful attitude. Start with the first transmission, then make it your own.</p></div><div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap border px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[.16em] transition-colors ${activeCategory === category ? "border-[#d9e9f8] bg-[#d9e9f8] text-[#050505]" : "border-white/15 text-[#aab5c2] hover:border-[#b7d0ea] hover:text-[#e4effa]"}`}>{category}</button>)}</div><div className="flex flex-wrap gap-3"><label className="search-shell flex min-w-52 items-center gap-2 px-3 py-2"><Search className="size-4 text-[#83909f]" /><span className="sr-only">Search pieces</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the edit" className="w-full bg-transparent font-mono text-[10px] uppercase tracking-[.12em] outline-none placeholder:text-[#687481]" />{search && <button type="button" onClick={clearSearch} className="text-[#83909f] hover:text-[#f4f6f8]" aria-label="Clear search"><X className="size-3.5" /></button>}</label><label className="flex items-center gap-2 border border-white/15 px-3 py-2"><SlidersHorizontal className="size-4 text-[#83909f]" /><span className="sr-only">Sort products</span><select value={sort} onChange={event => setSort(event.target.value)} className="bg-transparent font-mono text-[10px] font-bold uppercase tracking-[.12em] text-[#cbd7e3] outline-none"><option value="featured">Featured</option><option value="price-low">Price low</option><option value="price-high">Price high</option></select></label></div></div>{isLoading ? <div className="grid min-h-80 place-items-center text-sm text-[#8c95a1]">Scanning the edit…</div> : filteredProducts.length ? <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="chrome-card mt-16 px-6 py-20 text-center"><h2 className="font-display text-4xl font-semibold tracking-[-.05em] text-[#f2f5f8]">Nothing in that lane yet.</h2><p className="mt-3 text-sm text-[#83909f]">Try a different signal or reset the filter.</p><button onClick={() => { setSearch(""); setActiveCategory("All pieces"); setLocation("/shop"); }} className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#b7d0ea] underline underline-offset-4">Reset the edit</button></div>}</div>;
}
