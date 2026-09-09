import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(user: AuthenticatedUser | null = null, adminAuthenticated = false): TrpcContext {
  return { user, adminAuthenticated, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: vi.fn(), cookie: vi.fn() } as unknown as TrpcContext["res"] };
}

describe("database commerce router", () => {
  it("returns a backend-agnostic product array", async () => {
    const products = await appRouter.createCaller(makeCtx()).commerce.products.list();
    expect(Array.isArray(products)).toBe(true);
    for (const product of products) {
      expect(product).toHaveProperty("handle");
      expect(product).toHaveProperty("variants");
      expect(JSON.stringify(product)).not.toContain("edges");
    }
  });

  it("maps a missing handle to NOT_FOUND", async () => {
    await expect(appRouter.createCaller(makeCtx()).commerce.products.byHandle({ handle: "missing-product-for-test" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("rejects non-numeric database variant identifiers at the API boundary", async () => {
    await expect(appRouter.createCaller(makeCtx()).commerce.cart.create({ lines: [{ variantId: "gid://shopify/ProductVariant/999", quantity: 1 }] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("does not allow the admin product list without the signed admin session", async () => {
    await expect(appRouter.createCaller(makeCtx()).admin.products.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
