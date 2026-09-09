import { eq } from "drizzle-orm";
import { z } from "zod";
import { productImages, products } from "../../drizzle/schema";
import { clearAdminSession, isAdminCredentials, issueAdminSession } from "../_core/adminAuth";
import { adminPortalProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { addDbVariant, createDbProduct, deleteDbProduct, deleteDbVariant, listDbAdminProducts, listDbOrders, updateDbOrderStatus, updateDbProduct, updateDbVariant } from "../dbCommerce";
import { storagePut } from "../storage";

const variantInput = z.object({ name: z.string().min(1), price: z.string().regex(/^\d+(\.\d{1,2})?$/), salePrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(), discountEnabled: z.boolean().optional(), stock: z.number().int().min(0) });

export const adminRouter = router({
  login: publicProcedure.input(z.object({ username: z.string(), password: z.string().min(1) })).mutation(async ({ input, ctx }) => { if (!isAdminCredentials(input.username, input.password)) throw new Error("Invalid admin credentials"); await issueAdminSession(ctx.res, ctx.req); return { success: true } as const; }),
  logout: publicProcedure.mutation(({ ctx }) => { clearAdminSession(ctx.res, ctx.req); return { success: true } as const; }),
  me: publicProcedure.query(({ ctx }) => ({ authenticated: ctx.adminAuthenticated })),
  products: router({
    list: adminPortalProcedure.query(() => listDbAdminProducts()),
    create: adminPortalProcedure.input(z.object({ title: z.string().min(2), description: z.string().min(1), category: z.string().min(1), slug: z.string().regex(/^[a-z0-9-]+$/), imageUrl: z.string().url().optional(), imageAlt: z.string().optional(), variants: z.array(variantInput).min(1) })).mutation(({ input }) => createDbProduct(input)),
    update: adminPortalProcedure.input(z.object({ id: z.number().int().positive(), title: z.string().min(2).optional(), description: z.string().min(1).optional(), category: z.string().min(1).optional(), slug: z.string().regex(/^[a-z0-9-]+$/).optional(), imageUrl: z.string().url().optional(), imageAlt: z.string().optional(), visible: z.boolean().optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateDbProduct(id, changes); }),
    updateVariant: adminPortalProcedure.input(z.object({ id: z.number().int().positive(), name: z.string().min(1).optional(), price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(), salePrice: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(), discountEnabled: z.boolean().optional(), stock: z.number().int().min(0).optional(), visible: z.boolean().optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateDbVariant(id, changes); }),
    addVariant: adminPortalProcedure.input(z.object({ productId: z.number().int().positive(), name: z.string().min(1), price: z.string().regex(/^\d+(\.\d{1,2})?$/), salePrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(), discountEnabled: z.boolean().optional(), stock: z.number().int().min(0) })).mutation(({ input }) => { const { productId, ...variant } = input; return addDbVariant(productId, variant); }),
    deleteVariant: adminPortalProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteDbVariant(input.id)),
    delete: adminPortalProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteDbProduct(input.id)),
  }),
  images: router({
    upload: adminPortalProcedure.input(z.object({ productId: z.number().int().positive(), fileName: z.string().min(1).max(180), mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]), base64: z.string().min(100).max(12_000_000), altText: z.string().max(255).optional() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const buffer = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64"); const uploaded = await storagePut(`ak-void/products/${input.productId}/${input.fileName}`, buffer, input.mimeType); await db.insert(productImages).values({ productId: input.productId, url: uploaded.url, altText: input.altText ?? input.fileName, sortOrder: 0 }); await db.update(products).set({ imageUrl: uploaded.url, imageAlt: input.altText ?? input.fileName }).where(eq(products.id, input.productId)); return uploaded; }),
  }),
  orders: router({
    list: adminPortalProcedure.query(() => listDbOrders()),
    updateStatus: adminPortalProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "processing", "shipped", "delivered", "cancelled"]) })).mutation(({ input }) => updateDbOrderStatus(input.id, input.status)),
  }),
});
