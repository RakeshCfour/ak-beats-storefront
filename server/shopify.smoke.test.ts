import { describe, expect, it } from "vitest";
import { listDbAdminProducts } from "./dbCommerce";

describe("database catalog smoke", () => {
  it("returns product records with title, image, price, and variants", async () => {
    const rows = await listDbAdminProducts();
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const usable = rows.find(row => row.product.title.trim() && row.product.imageUrl && row.variants.some(variant => Number(variant.price) > 0));
    expect(usable, "No database product had a title, image, positive price, and variant").toBeTruthy();
  });
});
