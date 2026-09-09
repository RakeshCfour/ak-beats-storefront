import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { addDbCartLine, createCodOrder, createDbCart, deleteDbProduct, getDbCart, getDbProductByHandle, listDbProducts, removeDbCartLine, updateDbCartLine } from "../dbCommerce";
import { createRazorpayOrder, verifyRazorpayPayment } from "../payments";

const cartLineInputSchema = z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(99) });
const cartLineUpdateSchema = z.object({ lineId: z.string().min(1), quantity: z.number().int().min(0).max(99) });

export const commerceRouter = router({
  products: router({
    list: publicProcedure.input(z.object({ first: z.number().int().min(1).max(100).optional() }).optional()).query(async () => listDbProducts()),
    byHandle: publicProcedure.input(z.object({ handle: z.string().min(1) })).query(async ({ input }) => {
      const product = await getDbProductByHandle(input.handle);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      return product;
    }),
  }),
  collections: router({
    list: publicProcedure.query(async () => []),
    byHandle: publicProcedure.input(z.object({ handle: z.string().min(1) })).query(async ({ input }) => ({ id: input.handle, handle: input.handle, title: input.handle, description: "", image: null })),
  }),
  cart: router({
    create: publicProcedure.input(z.object({ lines: z.array(cartLineInputSchema).min(1).max(50) })).mutation(async ({ input }) => { const variantId = Number(input.lines[0].variantId); if (!Number.isInteger(variantId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Variant id is invalid" }); return createDbCart(variantId, input.lines[0].quantity); }),
    get: publicProcedure.input(z.object({ cartId: z.string().min(1) })).query(async ({ input }) => getDbCart(input.cartId)),
    addLines: publicProcedure.input(z.object({ cartId: z.string().min(1), lines: z.array(cartLineInputSchema).min(1).max(50) })).mutation(async ({ input }) => { let cart = await getDbCart(input.cartId); for (const line of input.lines) cart = await addDbCartLine(input.cartId, Number(line.variantId), line.quantity); return cart; }),
    updateLines: publicProcedure.input(z.object({ cartId: z.string().min(1), lines: z.array(cartLineUpdateSchema).min(1).max(50) })).mutation(async ({ input }) => { let cart = await getDbCart(input.cartId); for (const line of input.lines) cart = await updateDbCartLine(Number(line.lineId), line.quantity); return cart; }),
    removeLines: publicProcedure.input(z.object({ cartId: z.string().min(1), lineIds: z.array(z.string().min(1)).min(1).max(50) })).mutation(async ({ input }) => { let cart = await getDbCart(input.cartId); for (const lineId of input.lineIds) cart = await removeDbCartLine(Number(lineId)); return cart; }),
  }),
  orders: router({
    createCod: publicProcedure.input(z.object({ cartId: z.string().min(1), customerName: z.string().min(2), customerEmail: z.string().email(), customerPhone: z.string().min(6), shippingAddress: z.string().min(10) })).mutation(({ input }) => createCodOrder(input)),
    createRazorpayOrder: publicProcedure.input(z.object({ cartId: z.string().min(1), customerName: z.string().min(2), customerEmail: z.string().email(), customerPhone: z.string().min(6), shippingAddress: z.string().min(10) })).mutation(({ input }) => createRazorpayOrder(input)),
    verifyRazorpayPayment: publicProcedure.input(z.object({ razorpayOrderId: z.string().min(1), razorpayPaymentId: z.string().min(1), razorpaySignature: z.string().min(1) })).mutation(({ input }) => verifyRazorpayPayment(input)),
  }),
});
