import { Check, Copy, ExternalLink, QrCode, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Cart } from "@shared/commerce/types";
import { useCart } from "@/contexts/CartContext";

const UPI_ID = "8099996966@ybl";
const BASE_UPI_URI = `upi://pay?pa=${UPI_ID}&pn=AK&cu=INR`;

export default function CheckoutOptions({ cart }: { cart: Cart }) {
  const { proceedToCheckout } = useCart();
  const [method, setMethod] = useState<"shopify" | "upi" | "cod">("shopify");
  const [codSubmitted, setCodSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const amount = Number(cart.total.amount).toFixed(2);
  const dynamicUpiUri = `${BASE_UPI_URI}&am=${amount}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(dynamicUpiUri)}`;

  const copyUpi = async () => {
    await navigator.clipboard?.writeText(UPI_ID);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <div className="mt-5 border-t border-white/10 pt-5"><div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-[#83909f]"><ShieldCheck className="size-3 text-[#b9b0a4]" /> Choose payment</div><div className="grid grid-cols-3 gap-2"><button onClick={() => setMethod("shopify")} className={`border px-2 py-2 font-mono text-[9px] uppercase tracking-[.1em] ${method === "shopify" ? "border-[#e1dbd2] bg-[#e1dbd2] text-[#050505]" : "border-white/15 text-[#a9a39b] hover:border-[#b9b0a4]"}`}>Card / UPI</button><button onClick={() => setMethod("upi")} className={`border px-2 py-2 font-mono text-[9px] uppercase tracking-[.1em] ${method === "upi" ? "border-[#e1dbd2] bg-[#e1dbd2] text-[#050505]" : "border-white/15 text-[#a9a39b] hover:border-[#b9b0a4]"}`}>Scan UPI</button><button onClick={() => setMethod("cod")} className={`border px-2 py-2 font-mono text-[9px] uppercase tracking-[.1em] ${method === "cod" ? "border-[#e1dbd2] bg-[#e1dbd2] text-[#050505]" : "border-white/15 text-[#a9a39b] hover:border-[#b9b0a4]"}`}>Cash on delivery</button></div>{method === "shopify" && <><p className="mt-3 text-xs leading-5 text-[#83909f]">Secure Shopify checkout for cards, wallets, and supported local methods.</p><button onClick={proceedToCheckout} className="mt-4 flex w-full items-center justify-center gap-2 bg-[#edf3f8] px-5 py-4 text-xs font-bold uppercase tracking-[.18em] text-[#050505] hover:bg-[#d6cec3]">Continue securely <ExternalLink className="size-4" /></button></>}{method === "upi" && <div className="mt-4 grid grid-cols-[112px_1fr] items-center gap-4"><div className="grid aspect-square place-items-center bg-white p-2"><img src={qrSrc} alt={`UPI payment QR for ₹${amount}`} className="size-full" /></div><div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-[#e5dfd7]"><QrCode className="size-3 text-[#b9b0a4]" /> Scan to pay</div><p className="mt-2 text-xs leading-5 text-[#8f8a83]">₹{amount} · Dynamic QR generated for this order.</p><button onClick={copyUpi} className="mt-3 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.12em] text-[#cfc7bd] underline underline-offset-4 hover:text-[#f1eee9]"><Copy className="size-3" /> {copied ? "UPI ID copied" : UPI_ID}</button><a href={dynamicUpiUri} className="mt-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.12em] text-[#b9b0a4] hover:text-[#f1eee9]">Open UPI app <ExternalLink className="size-3" /></a></div></div>}{method === "cod" && <div className="mt-4 border border-white/10 bg-white/[.025] p-4"><p className="text-sm text-[#d8d1c8]">Pay in cash when your order arrives.</p><p className="mt-2 text-xs leading-5 text-[#8f8a83]">We’ll confirm your address and availability before dispatch.</p>{codSubmitted ? <p className="mt-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.14em] text-[#acd2b6]"><Check className="size-3" /> COD request received</p> : <button onClick={() => setCodSubmitted(true)} className="mt-4 w-full border border-[#d6cec3] px-4 py-3 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#d6cec3] hover:bg-[#d6cec3] hover:text-[#050505]">Confirm COD request</button>}</div>}</div>;
}
