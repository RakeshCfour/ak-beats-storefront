import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Cart } from "@shared/commerce/types";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { formatMoney } from "@/lib/format";
import { toast } from "sonner";
import PriceDisplay from "@/components/PriceDisplay";

type Customer = { customerName: string; customerEmail: string; customerPhone: string; shippingAddress: string };

async function loadRazorpay() {
  if ((window as any).Razorpay) return;
  await new Promise<void>((resolve, reject) => { const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = () => resolve(); script.onerror = () => reject(new Error("Razorpay checkout could not load")); document.body.appendChild(script); });
}

export default function CheckoutOptions({ cart }: { cart: Cart }) {
  const { clearCart } = useCart();
  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
  const [customer, setCustomer] = useState<Customer>({ customerName: "", customerEmail: "", customerPhone: "", shippingAddress: "" });
  const [complete, setComplete] = useState<string | null>(null);
  const cod = trpc.commerce.orders.createCod.useMutation({ onSuccess: data => { setComplete(data.orderNumber); clearCart(); toast.success("COD order received"); }, onError: error => toast.error(error.message) });
  const razorpay = trpc.commerce.orders.createRazorpayOrder.useMutation({ onError: error => toast.error(error.message) });
  const verify = trpc.commerce.orders.verifyRazorpayPayment.useMutation({ onSuccess: () => { setComplete("PAID"); clearCart(); toast.success("Payment verified"); }, onError: error => toast.error(error.message) });
  const update = (key: keyof Customer) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCustomer(current => ({ ...current, [key]: event.target.value }));
  const valid = customer.customerName && customer.customerEmail && customer.customerPhone && customer.shippingAddress;
  const submit = async () => {
    if (!valid) { toast.error("Please complete your delivery details"); return; }
    if (method === "cod") { cod.mutate({ cartId: cart.id, ...customer }); return; }
    try {
      await loadRazorpay();
      const order = await razorpay.mutateAsync({ cartId: cart.id, ...customer });
      const Razorpay = (window as any).Razorpay;
      const checkout = new Razorpay({ key: order.keyId, amount: order.amount, currency: order.currency, name: "AK VOID", description: "AK VOID order", order_id: order.id, prefill: { name: customer.customerName, email: customer.customerEmail, contact: customer.customerPhone }, theme: { color: "#d9e9f8" }, handler: (response: any) => verify.mutate({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature }) });
      checkout.open();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to start payment"); }
  };
  return <div className="mt-5 border-t border-white/10 pt-5"><div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-[#83909f]"><ShieldCheck className="size-3 text-[#b9b0a4]" /> Secure checkout</div>{complete ? <div className="border border-[#acd2b6]/30 bg-[#acd2b6]/[.06] p-4"><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#acd2b6]"><Check className="size-4" /> {complete === "PAID" ? "Payment verified" : "COD order received"}</p><p className="mt-2 text-xs text-[#aab5c2]">Order reference: {complete}</p></div> : <><div className="grid grid-cols-2 gap-2"><button onClick={() => setMethod("razorpay")} className={`border px-2 py-2 font-mono text-[9px] uppercase tracking-[.1em] ${method === "razorpay" ? "border-[#e1dbd2] bg-[#e1dbd2] text-[#050505]" : "border-white/15 text-[#a9a39b]"}`}>UPI / Card</button><button onClick={() => setMethod("cod")} className={`border px-2 py-2 font-mono text-[9px] uppercase tracking-[.1em] ${method === "cod" ? "border-[#e1dbd2] bg-[#e1dbd2] text-[#050505]" : "border-white/15 text-[#a9a39b]"}`}>Cash on delivery</button></div><div className="mt-4 grid gap-2"><input value={customer.customerName} onChange={update("customerName")} placeholder="Full name" className="border border-white/10 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#b7d0ea]" /><input type="email" value={customer.customerEmail} onChange={update("customerEmail")} placeholder="Email" className="border border-white/10 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#b7d0ea]" /><input value={customer.customerPhone} onChange={update("customerPhone")} placeholder="Phone" className="border border-white/10 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#b7d0ea]" /><textarea value={customer.shippingAddress} onChange={update("shippingAddress")} placeholder="Delivery address" className="min-h-16 border border-white/10 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#b7d0ea]" /></div><div className="mt-4 border-y border-white/10 py-3"><p className="mb-2 font-mono text-[9px] uppercase tracking-[.16em] text-[#83909f]">Order summary</p>{cart.items.map(item => <div key={item.lineId} className="flex items-start justify-between gap-3 py-1.5 text-xs"><span className="min-w-0 text-[#aab5c2]">{item.productTitle} · {item.variantTitle} × {item.quantity}</span><PriceDisplay current={item.unitPrice} original={item.originalUnitPrice} compact className="justify-end text-right" /></div>)}<div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-xs"><span className="text-[#83909f]">Payable total</span><span className="font-mono text-[#f4f6f8]">{formatMoney(cart.total)}</span></div></div><p className="mt-3 text-xs leading-5 text-[#83909f]">{method === "razorpay" ? "Razorpay securely verifies UPI/cards on the server." : "Pay in cash when your order arrives."}</p><button onClick={submit} disabled={cod.isPending || razorpay.isPending || verify.isPending} className="mt-4 flex w-full items-center justify-center gap-2 bg-[#edf3f8] px-5 py-4 text-xs font-bold uppercase tracking-[.18em] text-[#050505] disabled:opacity-50">{(cod.isPending || razorpay.isPending || verify.isPending) && <Loader2 className="size-4 animate-spin" />}{method === "cod" ? "Confirm COD order" : "Pay securely with Razorpay"}</button></>}</div>;
}
