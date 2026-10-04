import { describe, expect, it } from "vitest";
import { parseCatalogSizes } from "../shared/catalog";
import { isOnSale, LOW_STOCK_THRESHOLD } from "../shared/commerce/inventory";

describe("catalog size parsing", () => {
  it("supports XS through 5XL and One Size without duplicates", () => {
    expect(parseCatalogSizes("XS, S, M, XL, 3XL, 5XL, One Size, S")).toEqual(["XS", "S", "M", "XL", "3XL", "5XL", "One Size"]);
  });

  it("rejects unsupported placeholder sizes", () => {
    expect(() => parseCatalogSizes("New size")).toThrow(/Unsupported size/);
  });

  it("returns no sizes for blank input so the importer can use One Size", () => {
    expect(parseCatalogSizes("")).toEqual([]);
  });

  it("detects only genuine lower sale prices", () => {
    expect(isOnSale("1699", "1999")).toBe(true);
    expect(isOnSale("1999", "1999")).toBe(false);
    expect(isOnSale("2199", "1999")).toBe(false);
    expect(isOnSale("1999", null)).toBe(false);
  });

  it("uses a clear low-stock threshold", () => {
    expect(LOW_STOCK_THRESHOLD).toBe(3);
  });
});
