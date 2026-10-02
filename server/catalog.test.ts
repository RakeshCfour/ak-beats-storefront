import { describe, expect, it } from "vitest";
import { parseCatalogSizes } from "../shared/catalog";

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
});
