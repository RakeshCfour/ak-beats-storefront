import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/format";

function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="AK Beats home">
      <span className="grid size-10 place-items-center rounded-full bg-[#d8c49a] text-[#1f2a22] transition-transform duration-200 group-hover:rotate-12">
        <span className="font-display text-xl font-semibold leading-none">AK</span>
      </span>
      <span className="leading-none">
        <span className="block font-display text-2xl font-semibold tracking-[-0.04em] text-[#f5f2ea]">AK BEATS</span>
        <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.28em] text-[#bfc8bc]">Independent uniform</span>
      </span>
    </Link>
  );
}

function CartDrawer() {
  const { cart, isOpen, loading, closeCart, updateQuantity, removeItem, clearCart, proceedToCheckout } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button className="absolute inset-0 bg-[#10150f]/60 backdrop-blur-[2px]" onClick={closeCart} aria-label="Close shopping bag" />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-[#f5f2ea] text-[#1f2a22] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1f2a22]/15 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#657163]">Your selection</p>
            <h2 className="mt-1 font-display text-3xl font-semibold">Shopping bag</h2>
          </div>
          <button onClick={closeCart} className="rounded-full p-2 transition-colors hover:bg-[#1f2a22]/10" aria-label="Close shopping bag">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!cart?.items.length ? (
            <div className="grid min-h-[55vh] place-items-center text-center">
              <div>
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e7e2d6]"><ShoppingBag className="size-6 text-[#657163]" /></div>
                <h3 className="mt-5 font-display text-3xl font-semibold">Your bag is quiet.</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#657163]">Start with one considered piece. We will take it from there.</p>
                <Link href="/shop" onClick={closeCart} className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] underline underline-offset-4">Browse the edit <ArrowUpRight className="size-4" /></Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {cart.items.map(item => (
                <div key={item.lineId} className="flex gap-4 border-b border-[#1f2a22]/10 pb-5">
                  <div className="size-24 shrink-0 overflow-hidden bg-[#e8e3d8]">
                    {item.image ? <img src={item.image.url} alt={item.image.altText ?? item.productTitle} className="size-full object-cover" /> : <div className="size-full bg-gradient-to-br from-[#c8c0ad] to-[#7e8777]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-semibold leading-tight">{item.productTitle}</p>
                        {item.variantTitle !== "Default Title" && <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#657163]">{item.variantTitle}</p>}
                      </div>
                      <button onClick={() => removeItem(item.lineId)} className="rounded-full p-1 text-[#657163] hover:bg-[#1f2a22]/10 hover:text-[#1f2a22]" aria-label={`Remove ${item.productTitle}`}><Trash2 className="size-4" /></button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-full border border-[#1f2a22]/15 px-2 py-1">
                        <button onClick={() => updateQuantity(item.lineId, Math.max(0, item.quantity - 1))} className="grid size-5 place-items-center rounded-full hover:bg-[#1f2a22]/10" aria-label="Decrease quantity"><Minus className="size-3" /></button>
                        <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} className="grid size-5 place-items-center rounded-full hover:bg-[#1f2a22]/10" aria-label="Increase quantity"><Plus className="size-3" /></button>
                      </div>
                      <span className="text-sm font-semibold">{formatMoney(item.lineTotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart?.items.length ? (
          <div className="border-t border-[#1f2a22]/15 px-6 py-5">
            <div className="flex items-center justify-between text-sm"><span className="text-[#657163]">Subtotal</span><span className="font-semibold">{formatMoney(cart.subtotal)}</span></div>
            <p className="mt-2 text-xs leading-5 text-[#657163]">Taxes and delivery are calculated securely at Shopify checkout.</p>
            <button onClick={proceedToCheckout} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 bg-[#1f2a22] px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f5f2ea] transition-colors hover:bg-[#314234] disabled:opacity-50">{loading && <Loader2 className="size-4 animate-spin" />} Checkout securely <ArrowUpRight className="size-4" /></button>
            <button onClick={clearCart} className="mx-auto mt-4 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#657163] underline underline-offset-4">Clear bag</button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { itemCount, openCart } = useCart();
  const shopActive = location.startsWith("/shop") || location.startsWith("/product");

  return (
    <div className="min-h-screen bg-[#f5f2ea] text-[#1f2a22]">
      <div className="bg-[#1f2a22] px-4 py-2 text-center text-[9px] font-bold uppercase tracking-[0.22em] text-[#d8c49a]">Free shipping on orders over ₹4,000 · Designed in India</div>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1f2a22] text-[#f5f2ea]">
        <div className="container flex min-h-[76px] items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <Link href="/shop" className={`text-xs font-bold uppercase tracking-[0.18em] transition-colors hover:text-[#d8c49a] ${shopActive ? "text-[#d8c49a]" : "text-[#dfe4db]"}`}>Shop</Link>
            <a href="/#story" className="text-xs font-bold uppercase tracking-[0.18em] text-[#dfe4db] transition-colors hover:text-[#d8c49a]">Our story</a>
            <a href="/#visit" className="text-xs font-bold uppercase tracking-[0.18em] text-[#dfe4db] transition-colors hover:text-[#d8c49a]">Visit us</a>
          </nav>
          <button onClick={openCart} className="relative inline-flex items-center gap-2 rounded-full border border-[#f5f2ea]/25 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-[#d8c49a] hover:text-[#d8c49a]" aria-label={`Open shopping bag with ${itemCount} items`}>
            <ShoppingBag className="size-4" /> <span className="hidden sm:inline">Bag</span><span className="grid size-5 place-items-center rounded-full bg-[#d8c49a] text-[10px] text-[#1f2a22]">{itemCount}</span>
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-[#1f2a22] py-12 text-[#f5f2ea]">
        <div className="container grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div><Logo /><p className="mt-5 max-w-xs text-sm leading-6 text-[#bfc8bc]">Independent clothing for the hours that make you. Small drops, considered pieces, no noise.</p></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d8c49a]">Explore</p><div className="mt-4 grid gap-3 text-sm text-[#dfe4db]"><Link href="/shop" className="hover:text-[#d8c49a]">All pieces</Link><a href="/#story" className="hover:text-[#d8c49a]">The story</a><a href="/#visit" className="hover:text-[#d8c49a]">The store</a></div></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d8c49a]">Stay close</p><p className="mt-4 text-sm leading-6 text-[#bfc8bc]">Drop notes, studio hours, and the occasional good song.</p><a href="https://instagram.com" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] hover:text-[#d8c49a]">Instagram <ArrowUpRight className="size-4" /></a></div>
        </div>
        <div className="container mt-12 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.16em] text-[#879386]">© 2026 AK Beats · Built for the after hours</div>
      </footer>
      <CartDrawer />
    </div>
  );
}
