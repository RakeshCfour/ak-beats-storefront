import { createHmac } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { createPendingRazorpayOrder, getDbCart, markRazorpayPaid } from "./dbCommerce";

function requireRazorpay() { if (!ENV.razorpayKeyId || !ENV.razorpayKeySecret) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Razorpay is not configured on the server yet" }); }
export async function createRazorpayOrder(input: { cartId: string; customerName: string; customerEmail: string; customerPhone: string; shippingAddress: string }) {
  requireRazorpay();
  const cart = await getDbCart(input.cartId);
  const amount = Number(cart?.total.amount ?? 0);
  if (!amount) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
  const auth = Buffer.from(`${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: Math.round(amount * 100), currency: "INR", receipt: `ak_${Date.now()}`, notes: { store: "AK VOID" } }) });
  if (!response.ok) throw new TRPCError({ code: "BAD_GATEWAY", message: "Razorpay order creation failed" });
  const order = await response.json() as { id: string; amount: number; currency: string };
  const record = await createPendingRazorpayOrder({ ...input, razorpayOrderId: order.id });
  return { ...order, keyId: ENV.razorpayKeyId, orderNumber: record.orderNumber };
}
export async function verifyRazorpayPayment(input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
  requireRazorpay();
  const expected = createHmac("sha256", ENV.razorpayKeySecret).update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`).digest("hex");
  if (expected !== input.razorpaySignature) throw new TRPCError({ code: "BAD_REQUEST", message: "Payment signature verification failed" });
  return markRazorpayPaid(input.razorpayOrderId, input.razorpayPaymentId);
}

export async function handleRazorpayWebhook(rawBody: Buffer, signature: string | undefined) {
  if (!ENV.razorpayWebhookSecret) throw new Error("Razorpay webhook secret is not configured");
  if (!signature) throw new Error("Missing Razorpay webhook signature");
  const expected = createHmac("sha256", ENV.razorpayWebhookSecret).update(rawBody).digest("hex");
  if (expected !== signature) throw new Error("Invalid Razorpay webhook signature");
  const event = JSON.parse(rawBody.toString("utf8")) as { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string } } } };
  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment.id) await markRazorpayPaid(payment.order_id, payment.id);
  }
  return { received: true as const };
}
