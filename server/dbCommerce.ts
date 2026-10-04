import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { cartLines, carts, orderItems, orders, productImages, productVariants, products } from "../drizzle/schema";
import { getDb } from "./db";
import type { Cart, Image, Product } from "@shared/commerce/types";
import { notifyOrderCreated } from "./notifications";

function money(amount: string | number) { return { amount: String(amount), currencyCode: "INR" }; }
function image(url: string | null, altText: string | null): Image | null { return url ? { url, altText } : null; }
function activePrice(variant: typeof productVariants.$inferSelect) { return variant.discountEnabled && variant.salePrice ? variant.salePrice : variant.price; }

async function productRows(includeHidden = false) {
  const db = await getDb();
  if (!db) return [];
  const productRows = includeHidden ? await db.select().from(products).orderBy(desc(products.updatedAt)) : await db.select().from(products).where(eq(products.visible, true)).orderBy(desc(products.updatedAt));
  const variants = await db.select().from(productVariants);
  const images = await db.select().from(productImages);
  return productRows.map(product => ({ product, variants: variants.filter(v => v.productId === product.id && (includeHidden || (v.visible && Number(v.price) > 0))), images: images.filter(i => i.productId === product.id).sort((a, b) => a.sortOrder - b.sortOrder) })).filter(row => includeHidden || row.variants.length > 0);
}

function normalizeProduct(row: Awaited<ReturnType<typeof productRows>>[number]): Product {
  const variants = row.variants;
  const primaryImage = row.images[0]?.url ?? row.product.imageUrl;
  const options = [{ name: "Size", values: Array.from(new Set(variants.map(v => v.name))) }].filter(option => option.values.length > 0);
  const prices = variants.map(activePrice);
  const min = prices.length ? Math.min(...prices.map(Number)) : 0;
  const max = prices.length ? Math.max(...prices.map(Number)) : 0;
  return {
    id: String(row.product.id), handle: row.product.slug, title: row.product.title, description: row.product.description, descriptionHtml: row.product.description,
    productType: row.product.category, gender: row.product.gender, vendor: "AK VOID", tags: [row.product.category, row.product.gender],
    images: row.images.length ? row.images.map(i => ({ url: i.url, altText: i.altText })) : (primaryImage ? [{ url: primaryImage, altText: row.product.imageAlt }] : []),
    priceRange: { min: money(min.toFixed(2)), max: money(max.toFixed(2)) }, options,
    variants: variants.map(v => ({ id: String(v.id), title: v.name, price: money(activePrice(v)), compareAtPrice: v.discountEnabled && v.salePrice && Number(v.salePrice) < Number(v.price) ? money(v.price) : null, availableForSale: v.stock > 0, selectedOptions: [{ name: "Size", value: v.name }] })),
  };
}

export async function listDbProducts(includeHidden = false) { return (await productRows(includeHidden)).map(normalizeProduct); }
export async function getDbProductByHandle(handle: string, includeHidden = false) { const product = (await productRows(includeHidden)).find(row => row.product.slug === handle); return product ? normalizeProduct(product) : null; }

async function getCartRows(cartId: string) {
  const db = await getDb();
  if (!db) return null;
  const cart = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
  if (!cart[0]) return null;
  const lines = await db.select().from(cartLines).where(eq(cartLines.cartId, cartId));
  const variants = await db.select().from(productVariants);
  const productRowsData = await db.select().from(products);
  const imgs = await db.select().from(productImages);
  return { lines, variants, productRows: productRowsData, imgs };
}

export async function getDbCart(cartId: string): Promise<Cart | null> {
  const data = await getCartRows(cartId); if (!data) return null;
  const items = data.lines.flatMap(line => { const variant = data.variants.find(v => v.id === line.variantId); const product = variant && data.productRows.find(p => p.id === variant.productId); if (!variant || !product) return []; const price = activePrice(variant); const originalUnitPrice = variant.discountEnabled && variant.salePrice && Number(variant.salePrice) < Number(variant.price) ? money(variant.price) : null; const itemImage = data.imgs.find(i => i.productId === product.id); return [{ lineId: String(line.id), variantId: String(variant.id), productHandle: product.slug, productTitle: product.title, variantTitle: variant.name, image: image(itemImage?.url ?? product.imageUrl, itemImage?.altText ?? product.imageAlt), unitPrice: money(price), originalUnitPrice, quantity: line.quantity, lineTotal: money((Number(price) * line.quantity).toFixed(2)) }]; });
  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal.amount), 0);
  return { id: cartId, checkoutUrl: "", items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: money(subtotal.toFixed(2)), total: money(subtotal.toFixed(2)) };
}

async function assertInventory(variantId: number, quantity: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const variant = await db.select().from(productVariants).where(eq(productVariants.id, variantId)).limit(1); if (!variant[0] || !variant[0].visible || variant[0].stock < quantity) throw new Error("This size is out of stock or the requested quantity is unavailable"); }
export async function createDbCart(variantId: number, quantity: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await assertInventory(variantId, quantity); const id = nanoid(18); await db.insert(carts).values({ id }); await db.insert(cartLines).values({ cartId: id, variantId, quantity }); const cart = await getDbCart(id); if (!cart) throw new Error("Cart creation failed"); return cart; }

export async function addDbCartLine(cartId: string, variantId: number, quantity: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const existing = await db.select().from(cartLines).where(and(eq(cartLines.cartId, cartId), eq(cartLines.variantId, variantId))).limit(1); await assertInventory(variantId, (existing[0]?.quantity ?? 0) + quantity); if (existing[0]) await db.update(cartLines).set({ quantity: existing[0].quantity + quantity }).where(eq(cartLines.id, existing[0].id)); else await db.insert(cartLines).values({ cartId, variantId, quantity }); return getDbCart(cartId); }
export async function updateDbCartLine(lineId: number, quantity: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const line = await db.select().from(cartLines).where(eq(cartLines.id, lineId)).limit(1); if (!line[0]) return null; if (quantity <= 0) await db.delete(cartLines).where(eq(cartLines.id, lineId)); else { await assertInventory(line[0].variantId, quantity); await db.update(cartLines).set({ quantity }).where(eq(cartLines.id, lineId)); } return getDbCart(line[0].cartId); }
export async function removeDbCartLine(lineId: number) { return updateDbCartLine(lineId, 0); }

export async function createDbProduct(input: { title: string; description: string; category: string; gender: "men" | "women" | "unisex"; slug: string; imageUrl?: string; imageAlt?: string; variants: Array<{ name: string; price: string; salePrice?: string; discountEnabled?: boolean; stock: number }> }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1); if (existing[0]) throw new Error("DUPLICATE_SLUG"); const inserted = await db.insert(products).values({ slug: input.slug, title: input.title, description: input.description, category: input.category, gender: input.gender, imageUrl: input.imageUrl ?? null, imageAlt: input.imageAlt ?? null, visible: true }); const rawInsertId = (inserted as unknown as { insertId?: number | string }).insertId; const productId = rawInsertId !== undefined ? Number(rawInsertId) : Number((await db.select({ id: products.id }).from(products).where(eq(products.slug, input.slug)).limit(1))[0]?.id); if (!Number.isInteger(productId) || productId <= 0) throw new Error("PRODUCT_ID_UNAVAILABLE"); if (input.imageUrl) await db.insert(productImages).values({ productId, url: input.imageUrl, altText: input.imageAlt ?? input.title, sortOrder: 0 }); if (input.variants.length) await db.insert(productVariants).values(input.variants.map(v => ({ productId, name: v.name, price: v.price, salePrice: v.salePrice ?? null, discountEnabled: Boolean(v.discountEnabled), stock: v.stock, visible: true }))); return getDbProductByHandle(input.slug); }
export async function updateDbProduct(id: number, input: Partial<{ title: string; description: string; category: string; gender: "men" | "women" | "unisex"; slug: string; imageUrl: string; imageAlt: string; visible: boolean }>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(products).set(input).where(eq(products.id, id)); return (await db.select().from(products).where(eq(products.id, id)).limit(1))[0]; }
export async function updateDbVariant(id: number, input: Partial<{ name: string; price: string; salePrice: string | null; discountEnabled: boolean; stock: number; visible: boolean }>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(productVariants).set(input).where(eq(productVariants.id, id)); return (await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1))[0]; }
export async function addDbVariant(productId: number, input: { name: string; price: string; salePrice?: string; discountEnabled?: boolean; stock: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(productVariants).values({ productId, name: input.name, price: input.price, salePrice: input.salePrice ?? null, discountEnabled: Boolean(input.discountEnabled), stock: input.stock, visible: true }); return { success: true as const }; }
export async function deleteDbVariant(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(productVariants).where(eq(productVariants.id, id)); return { success: true as const }; }
export async function addDbProductImage(productId: number, url: string, altText: string, sortOrder = 0) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.insert(productImages).values({ productId, url, altText, sortOrder }); await db.update(products).set({ imageUrl: url, imageAlt: altText }).where(eq(products.id, productId)); return { success: true as const }; }
export async function deleteDbProduct(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.delete(productVariants).where(eq(productVariants.productId, id)); await db.delete(productImages).where(eq(productImages.productId, id)); await db.delete(products).where(eq(products.id, id)); return { success: true }; }
export async function listDbAdminProducts() { return productRows(true); }
export async function listDbOrders() { const db = await getDb(); if (!db) return []; const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt)); const itemRows = await db.select().from(orderItems); return orderRows.map(order => ({ ...order, items: itemRows.filter(item => item.orderId === order.id) })); }
export async function updateDbOrderStatus(id: number, orderStatus: "new" | "processing" | "shipped" | "delivered" | "cancelled") { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(orders).set({ orderStatus }).where(eq(orders.id, id)); return { success: true }; }

export async function createCodOrder(input: { cartId: string; customerName: string; customerEmail: string; customerPhone: string; shippingAddress: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const cart = await getDbCart(input.cartId); if (!cart || !cart.items.length) throw new Error("Cart is empty"); const orderNumber = `AK-${Date.now().toString(36).toUpperCase()}`; const inserted = await db.insert(orders).values({ orderNumber, customerName: input.customerName, customerEmail: input.customerEmail, customerPhone: input.customerPhone, shippingAddress: input.shippingAddress, total: cart.total.amount, paymentMethod: "cod", paymentStatus: "pending", orderStatus: "new" }); const orderId = Number((inserted as unknown as { insertId: number }).insertId); await db.insert(orderItems).values(cart.items.map(item => ({ orderId, productTitle: item.productTitle, variantName: item.variantTitle, quantity: item.quantity, unitPrice: item.unitPrice.amount }))); void notifyOrderCreated({ orderNumber, customerName: input.customerName, customerEmail: input.customerEmail, customerPhone: input.customerPhone, shippingAddress: input.shippingAddress, total: cart.total.amount, paymentMethod: "cod", paymentStatus: "pending", createdAt: new Date(), items: cart.items.map(item => ({ productTitle: item.productTitle, variantName: item.variantTitle, quantity: item.quantity, unitPrice: item.unitPrice.amount })) }); return { orderNumber, paymentStatus: "pending" as const }; }

export async function createPendingRazorpayOrder(input: { cartId: string; customerName: string; customerEmail: string; customerPhone: string; shippingAddress: string; razorpayOrderId: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const cart = await getDbCart(input.cartId); if (!cart || !cart.items.length) throw new Error("Cart is empty"); const orderNumber = `AK-${Date.now().toString(36).toUpperCase()}`; const inserted = await db.insert(orders).values({ orderNumber, customerName: input.customerName, customerEmail: input.customerEmail, customerPhone: input.customerPhone, shippingAddress: input.shippingAddress, total: cart.total.amount, paymentMethod: "razorpay", paymentStatus: "pending", orderStatus: "new", razorpayOrderId: input.razorpayOrderId }); const orderId = Number((inserted as unknown as { insertId: number }).insertId); await db.insert(orderItems).values(cart.items.map(item => ({ orderId, productTitle: item.productTitle, variantName: item.variantTitle, quantity: item.quantity, unitPrice: item.unitPrice.amount }))); return { orderNumber, paymentStatus: "pending" as const }; }
export async function markRazorpayPaid(razorpayOrderId: string, razorpayPaymentId: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(orders).set({ paymentStatus: "paid", razorpayPaymentId }).where(eq(orders.razorpayOrderId, razorpayOrderId)); const order = (await db.select().from(orders).where(eq(orders.razorpayOrderId, razorpayOrderId)).limit(1))[0]; if (order) { const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)); void notifyOrderCreated({ orderNumber: order.orderNumber, customerName: order.customerName, customerEmail: order.customerEmail, customerPhone: order.customerPhone, shippingAddress: order.shippingAddress, total: String(order.total), paymentMethod: order.paymentMethod, paymentStatus: "paid", createdAt: order.createdAt, items: items.map(item => ({ productTitle: item.productTitle, variantName: item.variantName, quantity: item.quantity, unitPrice: String(item.unitPrice) })) }); } return { success: true as const }; }
