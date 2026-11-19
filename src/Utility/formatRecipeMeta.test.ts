import { describe, it, expect } from "vitest";
import { formatRecipeMeta } from "./formatRecipeMeta";
import type { Meta } from "../types/models";
import { intl } from "../test/intl";

const baseMeta: Meta = {
  yieldGrams: 900,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("formatRecipeMeta", () => {
  it("lists author, servings, prep, cook and additional time in that order", () => {
    const meta: Meta = { ...baseMeta, author: "Jane Doe", servings: "5", prepTime: 120, cookTime: 150, additionalTime: 30 };
    expect(formatRecipeMeta(meta, intl)).toEqual([
      "By Jane Doe",
      "Servings: 5",
      "Prep: 2 h",
      "Cook: 2 h 30 min",
      "Additional: 30 min",
    ]);
  });

  it("skips fields that are missing or zero", () => {
    const meta: Meta = { ...baseMeta, author: "  ", servings: "", prepTime: 0, cookTime: 45 };
    expect(formatRecipeMeta(meta, intl)).toEqual(["Cook: 45 min"]);
  });

  it("returns an empty list when there is no meta", () => {
    expect(formatRecipeMeta(undefined, intl)).toEqual([]);
    expect(formatRecipeMeta(baseMeta, intl)).toEqual([]);
  });

  it("shows free-text servings as entered", () => {
    expect(formatRecipeMeta({ ...baseMeta, servings: "2 loaves" }, intl)).toEqual(["Servings: 2 loaves"]);
  });
});
