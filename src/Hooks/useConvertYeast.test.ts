import { describe, it, expect } from "vitest";
import useConvertYeast from "./useConvertYeast";
import { Ingredient } from "../types/models";
import { formatIngredientDisplay } from "../Utility/formatIngredientDisplay";

const makeIngredient = (
  partial: Pick<Ingredient, "ingredientName" | "grams" | "quantity" | "unit"> & Partial<Ingredient>
): Ingredient => ({
  id: "test-id",
  bakerPercentage: 0,
  phase: "dough",
  densityGPerMl: 0,
  ...partial,
});

const dryYeastRecipe: Ingredient[] = [
  makeIngredient({ ingredientName: "bread flour", grams: 500, quantity: 500, unit: "g" }),
  makeIngredient({ ingredientName: "water", grams: 325, quantity: 325, unit: "ml" }),
  makeIngredient({ ingredientName: "salt", grams: 10, quantity: 10, unit: "g" }),
  makeIngredient({ ingredientName: "active dry yeast", grams: 5, quantity: 5, unit: "g" }),
];

const sourdoughRecipe: Ingredient[] = [
  makeIngredient({ ingredientName: "bread flour", grams: 450, quantity: 450, unit: "g" }),
  makeIngredient({ ingredientName: "water", grams: 275, quantity: 275, unit: "ml" }),
  makeIngredient({ ingredientName: "salt", grams: 10, quantity: 10, unit: "g" }),
  makeIngredient({ ingredientName: "sourdough starter", grams: 100, quantity: 100, unit: "g" }),
];

describe("useConvertYeast", () => {
  const { convertYeast } = useConvertYeast();

  describe("dry → sourdough", () => {
    it("removes the yeast ingredient", () => {
      const result = convertYeast(dryYeastRecipe, "dry");
      expect(result.find(i => i.ingredientName.toLowerCase().includes("yeast"))).toBeUndefined();
    });

    it("adds sourdough starter at 20% of flour weight", () => {
      const result = convertYeast(dryYeastRecipe, "dry");
      const starter = result.find(i => i.ingredientName === "sourdough starter");
      expect(starter).toBeDefined();
      expect(starter!.grams).toBe(100);
      expect(starter!.quantity).toBe(100);
    });

    it("gives the starter a nonzero density so it can convert to cups", () => {
      const result = convertYeast(dryYeastRecipe, "dry");
      const starter = result.find(i => i.ingredientName === "sourdough starter");
      expect(starter!.densityGPerMl).toBeGreaterThan(0);
    });

    it("displays the starter in cups, not grams, when cups is selected", () => {
      const result = convertYeast(dryYeastRecipe, "dry");
      const starter = result.find(i => i.ingredientName === "sourdough starter")!;
      expect(formatIngredientDisplay(starter, "cups")).toBe("½ + ⅛ cups: sourdough starter");
    });

    it("reduces flour by half the starter weight", () => {
      const result = convertYeast(dryYeastRecipe, "dry");
      const flour = result.find(i => i.ingredientName === "bread flour");
      expect(flour!.grams).toBe(450);
      expect(flour!.quantity).toBe(450);
    });

    it("reduces water by half the starter weight", () => {
      const result = convertYeast(dryYeastRecipe, "dry");
      const water = result.find(i => i.ingredientName === "water");
      expect(water!.grams).toBe(275);
      expect(water!.quantity).toBe(275);
    });

    it("leaves unrelated ingredients unchanged", () => {
      const result = convertYeast(dryYeastRecipe, "dry");
      const salt = result.find(i => i.ingredientName === "salt");
      expect(salt!.grams).toBe(10);
    });

    it("returns ingredients unchanged when no flour found", () => {
      const noFlour = dryYeastRecipe.filter(i => !i.ingredientName.includes("flour"));
      const result = convertYeast(noFlour, "dry");
      expect(result).toEqual(noFlour);
    });

    it("returns ingredients unchanged when no yeast found", () => {
      const noYeast = dryYeastRecipe.filter(i => !i.ingredientName.includes("yeast"));
      const result = convertYeast(noYeast, "dry");
      expect(result).toEqual(noYeast);
    });

    it("distributes flour reduction proportionally across multiple flour types", () => {
      // 300g bread flour + 200g whole wheat = 500g total; starter = 100g, half = 50g
      // bread flour: ratio 0.6, subtract 30 → 270g
      // whole wheat: ratio 0.4, subtract 20 → 180g
      const multiFlourRecipe = [
        makeIngredient({ ingredientName: "bread flour", grams: 300, quantity: 300, unit: "g" }),
        makeIngredient({ ingredientName: "whole wheat flour", grams: 200, quantity: 200, unit: "g" }),
        makeIngredient({ ingredientName: "water", grams: 325, quantity: 325, unit: "ml" }),
        makeIngredient({ ingredientName: "active dry yeast", grams: 5, quantity: 5, unit: "g" }),
      ];
      const result = convertYeast(multiFlourRecipe, "dry");
      expect(result.find(i => i.ingredientName === "bread flour")!.grams).toBe(270);
      expect(result.find(i => i.ingredientName === "whole wheat flour")!.grams).toBe(180);
    });

    it("distributes water reduction proportionally across multiple water entries", () => {
      // warm water 260g + cold water 65g = 325g total; starter = 100g, half = 50g
      // warm water: ratio 0.8, subtract 40 → 220g
      // cold water: ratio 0.2, subtract 10 → 55g
      const multiWaterRecipe = [
        makeIngredient({ ingredientName: "bread flour", grams: 500, quantity: 500, unit: "g" }),
        makeIngredient({ ingredientName: "warm water", grams: 260, quantity: 260, unit: "ml" }),
        makeIngredient({ ingredientName: "cold water", grams: 65, quantity: 65, unit: "ml" }),
        makeIngredient({ ingredientName: "active dry yeast", grams: 5, quantity: 5, unit: "g" }),
      ];
      const result = convertYeast(multiWaterRecipe, "dry");
      expect(result.find(i => i.ingredientName === "warm water")!.grams).toBe(220);
      expect(result.find(i => i.ingredientName === "cold water")!.grams).toBe(55);
    });
  });

  describe("sourdough → dry", () => {
    it("removes the starter ingredient", () => {
      const result = convertYeast(sourdoughRecipe, "sourdough");
      expect(result.find(i => i.ingredientName === "sourdough starter")).toBeUndefined();
    });

    it("adds dry yeast at 1% of restored flour weight", () => {
      const result = convertYeast(sourdoughRecipe, "sourdough");
      const yeast = result.find(i => i.ingredientName === "active dry yeast");
      expect(yeast).toBeDefined();
      expect(yeast!.grams).toBe(5);
      expect(yeast!.quantity).toBe(5);
    });

    it("gives the yeast a nonzero density so it can convert to cups", () => {
      const result = convertYeast(sourdoughRecipe, "sourdough");
      const yeast = result.find(i => i.ingredientName === "active dry yeast");
      expect(yeast!.densityGPerMl).toBeGreaterThan(0);
    });

    it("displays the yeast in tsp, not grams, when cups is selected", () => {
      const result = convertYeast(sourdoughRecipe, "sourdough");
      const yeast = result.find(i => i.ingredientName === "active dry yeast")!;
      expect(formatIngredientDisplay(yeast, "cups")).toBe("2 ½ tsp: active dry yeast");
    });

    it("restores flour by half the starter weight", () => {
      const result = convertYeast(sourdoughRecipe, "sourdough");
      const flour = result.find(i => i.ingredientName === "bread flour");
      expect(flour!.grams).toBe(500);
      expect(flour!.quantity).toBe(500);
    });

    it("restores water by half the starter weight", () => {
      const result = convertYeast(sourdoughRecipe, "sourdough");
      const water = result.find(i => i.ingredientName === "water");
      expect(water!.grams).toBe(325);
      expect(water!.quantity).toBe(325);
    });

    it("returns ingredients unchanged when no starter found", () => {
      const noStarter = sourdoughRecipe.filter(i => i.ingredientName !== "sourdough starter");
      const result = convertYeast(noStarter, "sourdough");
      expect(result).toEqual(noStarter);
    });

    it("identifies levain as starter", () => {
      const levainRecipe = sourdoughRecipe.map(i =>
        i.ingredientName === "sourdough starter" ? { ...i, ingredientName: "levain" } : i
      );
      const result = convertYeast(levainRecipe, "sourdough");
      expect(result.find(i => i.ingredientName === "levain")).toBeUndefined();
    });

    it("identifies ingredient named 'sourdough' as starter", () => {
      const altNameRecipe = sourdoughRecipe.map(i =>
        i.ingredientName === "sourdough starter" ? { ...i, ingredientName: "sourdough" } : i
      );
      const result = convertYeast(altNameRecipe, "sourdough");
      expect(result.find(i => i.ingredientName === "sourdough")).toBeUndefined();
    });

    it("distributes flour restoration proportionally across multiple flour types", () => {
      // 270g bread flour + 180g whole wheat = 450g total; starter = 100g, half = 50g
      // bread flour: ratio 0.6, add 30 → 300g
      // whole wheat: ratio 0.4, add 20 → 200g
      const multiFlourSourdough = [
        makeIngredient({ ingredientName: "bread flour", grams: 270, quantity: 270, unit: "g" }),
        makeIngredient({ ingredientName: "whole wheat flour", grams: 180, quantity: 180, unit: "g" }),
        makeIngredient({ ingredientName: "water", grams: 275, quantity: 275, unit: "ml" }),
        makeIngredient({ ingredientName: "sourdough starter", grams: 100, quantity: 100, unit: "g" }),
      ];
      const result = convertYeast(multiFlourSourdough, "sourdough");
      expect(result.find(i => i.ingredientName === "bread flour")!.grams).toBe(300);
      expect(result.find(i => i.ingredientName === "whole wheat flour")!.grams).toBe(200);
    });

    it("distributes water restoration proportionally across multiple water entries", () => {
      // warm water 220g + cold water 55g = 275g total; starter = 100g, half = 50g
      // warm water: ratio 0.8, add 40 → 260g
      // cold water: ratio 0.2, add 10 → 65g
      const multiWaterSourdough = [
        makeIngredient({ ingredientName: "bread flour", grams: 450, quantity: 450, unit: "g" }),
        makeIngredient({ ingredientName: "warm water", grams: 220, quantity: 220, unit: "ml" }),
        makeIngredient({ ingredientName: "cold water", grams: 55, quantity: 55, unit: "ml" }),
        makeIngredient({ ingredientName: "sourdough starter", grams: 100, quantity: 100, unit: "g" }),
      ];
      const result = convertYeast(multiWaterSourdough, "sourdough");
      expect(result.find(i => i.ingredientName === "warm water")!.grams).toBe(260);
      expect(result.find(i => i.ingredientName === "cold water")!.grams).toBe(65);
    });
  });
});
