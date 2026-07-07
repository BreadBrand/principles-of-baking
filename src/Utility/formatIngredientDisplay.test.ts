import { describe, it, expect } from "vitest";
import { formatIngredientDisplay } from "./formatIngredientDisplay";
import type { Ingredient } from "../types/models";

const makeIngredient = (
  partial: Pick<Ingredient, "ingredientName" | "quantity" | "unit"> & Partial<Ingredient>
): Ingredient => ({
  id: "test-id",
  bakerPercentage: 0,
  phase: "dough",
  grams: 0,
  densityGPerMl: 0,
  ...partial,
});

describe("formatIngredientDisplay", () => {
  it("formats count-unit ingredients without a unit label", () => {
    const ing = makeIngredient({ ingredientName: "egg", quantity: 2, unit: "count" });
    expect(formatIngredientDisplay(ing, "g")).toBe("2: egg");
  });

  it("rounds count quantities", () => {
    const ing = makeIngredient({ ingredientName: "egg", quantity: 2.6, unit: "count" });
    expect(formatIngredientDisplay(ing, "g")).toBe("3: egg");
  });

  it("shows grams as-is when the target unit is g", () => {
    const ing = makeIngredient({ ingredientName: "bread flour", quantity: 500, unit: "grams", grams: 500 });
    expect(formatIngredientDisplay(ing, "g")).toBe("500 g: bread flour");
  });

  it("converts oz to grams when the target unit is g", () => {
    const ing = makeIngredient({ ingredientName: "butter", quantity: 2, unit: "oz" });
    expect(formatIngredientDisplay(ing, "g")).toBe("57 g: butter");
  });

  it("falls back to stored grams when target unit is g and source unit isn't oz/grams", () => {
    const ing = makeIngredient({ ingredientName: "water", quantity: 350, unit: "ml", grams: 350 });
    expect(formatIngredientDisplay(ing, "g")).toBe("350 g: water");
  });

  it("converts grams to cups above the conversion threshold", () => {
    const ing = makeIngredient({ ingredientName: "bread flour", quantity: 500, unit: "grams", densityGPerMl: 0.53 });
    expect(formatIngredientDisplay(ing, "cups")).toBe("4 cups: bread flour");
  });

  it("converts ml to tbsp within the tbsp threshold range", () => {
    const ing = makeIngredient({ ingredientName: "vanilla extract", quantity: 20, unit: "ml" });
    expect(formatIngredientDisplay(ing, "cups")).toBe("1 ½ tbsp: vanilla extract");
  });

  it("converts ml to tsp below the tbsp threshold", () => {
    const ing = makeIngredient({ ingredientName: "salt", quantity: 5, unit: "ml" });
    expect(formatIngredientDisplay(ing, "cups")).toBe("1 tsp: salt");
  });

  it("falls back to raw quantity and abbreviated unit when no conversion applies", () => {
    const ing = makeIngredient({ ingredientName: "starter", quantity: 3, unit: "Tbls" });
    expect(formatIngredientDisplay(ing, "g")).toBe("3 Tbls: starter");
  });
});
