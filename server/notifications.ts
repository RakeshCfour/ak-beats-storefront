import { ENV } from "./_core/env";

export type OrderNotification = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  total: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date | string;
  items: Array<{ productTitle: string; variantName: string; quantity: number; unitPrice: string }>;
};

function orderText(order: OrderNotification) {
  const date = new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const items = order.items.map(item => `• ${item.productTitle} | ${item.variantName} × ${item.quantity} | ₹${item.unitPrice}`).join("\n");
  return `AK VOID order ${order.orderNumber}\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\nPhone: ${order.customerPhone}\nAddress: ${order.shippingAddress}\nProducts:\n${items}\nTotal: ₹${order.total}\nPayment: ${order.paymentMethod} / ${order.paymentStatus}\nDate: ${date}`;
}

async function sendEmail(order: OrderNotification) {
  if (!ENV.emailApiKey || !ENV.emailFrom || !ENV.orderNotificationEmail) return { channel: "email", sent: false, reason: "Email credentials are not configured" };
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${ENV.emailApiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: ENV.emailFrom, to: [ENV.orderNotificationEmail], subject: `AK VOID order ${order.orderNumber}`, text: orderText(order) }) });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return { channel: "email", sent: true };
}

async function sendWhatsApp(order: OrderNotification) {
  if (!ENV.whatsappAccessToken || !ENV.whatsappPhoneNumberId || !ENV.orderNotificationWhatsappTo || !ENV.whatsappTemplateName) return { channel: "whatsapp", sent: false, reason: "WhatsApp Business credentials are not configured" };
  const date = new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const params = [order.orderNumber, order.customerName, order.customerPhone, order.shippingAddress, order.items.map(item => `${item.productTitle} / ${item.variantName} x${item.quantity}`).join(", "), `₹${order.total}`, `${order.paymentMethod} / ${order.paymentStatus}`, date].map(text => ({ type: "text", text: String(text) }));
  const response = await fetch(`https://graph.facebook.com/${ENV.whatsappApiVersion}/${ENV.whatsappPhoneNumberId}/messages`, { method: "POST", headers: { Authorization: `Bearer ${ENV.whatsappAccessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to: ENV.orderNotificationWhatsappTo, type: "template", template: { name: ENV.whatsappTemplateName, language: { code: ENV.whatsappTemplateLanguage }, components: [{ type: "body", parameters: params }] } }) });
  if (!response.ok) throw new Error(`WhatsApp provider returned ${response.status}`);
  return { channel: "whatsapp", sent: true };
}

export async function notifyOrderCreated(order: OrderNotification) {
  const results = await Promise.allSettled([sendEmail(order), sendWhatsApp(order)]);
  results.forEach(result => { if (result.status === "rejected") console.error("[Order notification]", result.reason); });
  return results;
}

export { orderText };
