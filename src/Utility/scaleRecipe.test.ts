import { describe, it, expect } from "vitest";
import { scaleRecipe, buildScaledRecipe, getGrams } from "./scaleRecipe";
import type { Recipe, Ingredient } from "../types/models";

const makeIngredient = (
  partial: Pick<Ingredient, "ingredientName" | "grams" | "quantity" | "unit"> & Partial<Ingredient>
): Ingredient => ({
  id: "test-id",
  bakerPercentage: 100,
  phase: "dough",
  densityGPerMl: 0,
  ...partial,
});

const baseRecipe: Recipe = {
  id: "r1",
  title: "Simple White Loaf",
  description: "A classic white bread.",
  instructions: ["Mix", "Proof", "Bake"],
  meta: { yieldGrams: 800, createdAt: "", updatedAt: "" },
  userId: "u1",
  yeastType: "dry",
  doughIngredients: [
    makeIngredient({ ingredientName: "bread flour", grams: 500, quantity: 500, unit: "grams", bakerPercentage: 100, densityGPerMl: 0.53 }),
    makeIngredient({ ingredientName: "water", grams: 350, quantity: 350, unit: "ml", bakerPercentage: 70 }),
    makeIngredient({ ingredientName: "salt", grams: 10, quantity: 10, unit: "grams", bakerPercentage: 2 }),
  ],
  otherIngredients: [],
};

const scaledIngredients = [
  { ingredientName: "bread flour", grams: 250 },
  { ingredientName: "water", grams: 175 },
  { ingredientName: "salt", grams: 5 },
];

// bread flour 100bp, water 60bp, scalded flour 20bp (scald), powdered sugar 0bp
// originalDoughWeight (bp > 0) = 100 + 60 + 20 = 180
// totalBasePct = 100 + 60 + 20 = 180
const mixedIngredients: Ingredient[] = [
  makeIngredient({ ingredientName: "bread flour", grams: 100, quantity: 100, unit: "grams", bakerPercentage: 100 }),
  makeIngredient({ ingredientName: "water", grams: 60, quantity: 60, unit: "ml", bakerPercentage: 60 }),
  makeIngredient({ ingredientName: "scalded flour", grams: 20, quantity: 20, unit: "grams", bakerPercentage: 20, phase: "scald" }),
  makeIngredient({ ingredientName: "powdered sugar", grams: 0, quantity: 50, unit: "g", bakerPercentage: 0 }),
];

describe("getGrams", () => {
  it("returns stored grams when grams > 0, regardless of unit", () => {
    const i = makeIngredient({ ingredientName: "egg", grams: 120, quantity: 2.4, unit: "count", densityGPerMl: 1.03 });
    expect(getGrams(i)).toBe(120);
  });

  it("returns quantity when unit is g and grams is 0", () => {
    const i = makeIngredient({ ingredientName: "bread flour", grams: 0, quantity: 500, unit: "g" });
    expect(getGrams(i)).toBe(500);
  });

  it("derives grams from quantity × densityGPerMl for non-gram units when grams is 0", () => {
    const i = makeIngredient({ ingredientName: "oil", grams: 0, quantity: 60, unit: "ml", densityGPerMl: 0.91 });
    expect(getGrams(i)).toBeCloseTo(54.6);
  });
});

describe("scaleRecipe", () => {
  it("scales all dough-phase ingredients by baker's percentage", () => {
    const result = scaleRecipe(mixedIngredients, 180);
    expect(result.find(i => i.ingredientName === "bread flour")?.grams).toBe(100);
    expect(result.find(i => i.ingredientName === "water")?.grams).toBe(60);
  });

  it("scales scald-phase ingredients by baker's percentage without filtering them out", () => {
    const result = scaleRecipe(mixedIngredients, 360);
    expect(result.find(i => i.ingredientName === "scalded flour")?.grams).toBe(40);
  });

  it("preserves original ingredient names and does not invent Scalded Flour or Scald Liquid", () => {
    const result = scaleRecipe(mixedIngredients, 180);
    const names = result.map(i => i.ingredientName);
    expect(names).toContain("scalded flour");
    expect(names).not.toContain("Scalded Flour");
    expect(names).not.toContain("Scald Liquid");
  });

  it("scales zero-bakerPercentage ingredients by yield ratio relative to original dough weight", () => {
    // originalDoughWeight = 180, targetDough = 360 → yieldRatio = 2
    const result = scaleRecipe(mixedIngredients, 360);
    expect(result.find(i => i.ingredientName === "powdered sugar")?.grams).toBe(100);
  });

  it("uses stored grams (not quantity) for non-gram unit zero-bp ingredients", () => {
    // simulates icing with unit="count" — quantity (2) is useless; grams (80) is what scales
    const withCountUnit = [
      ...mixedIngredients.slice(0, 3),
      makeIngredient({ ingredientName: "egg icing", grams: 80, quantity: 2, unit: "count", bakerPercentage: 0 }),
    ];
    // originalDoughWeight = 100+60+20 = 180, targetDough = 360, yieldRatio = 2
    const result = scaleRecipe(withCountUnit, 360);
    expect(result.find(i => i.ingredientName === "egg icing")?.grams).toBe(160);
  });

  it("preserves zero-bakerPercentage ingredient grams when target equals original dough weight", () => {
    // yieldRatio = 180/180 = 1, so icing stays the same
    const result = scaleRecipe(mixedIngredients, 180);
    expect(result.find(i => i.ingredientName === "powdered sugar")?.grams).toBe(50);
  });
});

describe("buildScaledRecipe", () => {
  it("preserves recipe title, description, instructions, and meta", () => {
    const result = buildScaledRecipe(baseRecipe, scaledIngredients);
    expect(result.title).toBe(baseRecipe.title);
    expect(result.description).toBe(baseRecipe.description);
    expect(result.instructions).toBe(baseRecipe.instructions);
    expect(result.meta).toBe(baseRecipe.meta);
  });

  it("overrides grams and quantity with scaled values", () => {
    const result = buildScaledRecipe(baseRecipe, scaledIngredients);
    const flour = result.doughIngredients.find(i => i.ingredientName === "bread flour")!;
    expect(flour.grams).toBe(250);
    expect(flour.quantity).toBe(250);
  });

  it("preserves original densityGPerMl so unit toggle works", () => {
    const result = buildScaledRecipe(baseRecipe, scaledIngredients);
    const flour = result.doughIngredients.find(i => i.ingredientName === "bread flour")!;
    expect(flour.densityGPerMl).toBe(0.53);
  });

  it("preserves original unit", () => {
    const result = buildScaledRecipe(baseRecipe, scaledIngredients);
    const water = result.doughIngredients.find(i => i.ingredientName === "water")!;
    expect(water.unit).toBe("ml");
  });

  it("does not mutate the original recipe", () => {
    buildScaledRecipe(baseRecipe, scaledIngredients);
    expect(baseRecipe.doughIngredients[0].grams).toBe(500);
  });

  it("scales quantity in the original unit for non-gram ingredients", () => {
    const recipeWithTsp: Recipe = {
      ...baseRecipe,
      doughIngredients: [
        ...baseRecipe.doughIngredients,
        makeIngredient({ ingredientName: "baking powder", grams: 24, quantity: 4.8, unit: "tsp", bakerPercentage: 5.88, densityGPerMl: 0.8 }),
      ],
    };
    // scaled to half: 24g → 12g, so quantity should halve from 4.8 to 2.4 tsp
    const result = buildScaledRecipe(recipeWithTsp, [
      ...scaledIngredients,
      { ingredientName: "baking powder", grams: 12 },
    ]);
    const bp = result.doughIngredients.find(i => i.ingredientName === "baking powder")!;
    expect(bp.grams).toBe(12);
    expect(bp.unit).toBe("tsp");
    expect(bp.quantity).toBeCloseTo(2.4);
  });

  it("maps scald-phase ingredients back to originals by name", () => {
    const recipeWithScald: Recipe = {
      ...baseRecipe,
      doughIngredients: [
        ...baseRecipe.doughIngredients,
        makeIngredient({ ingredientName: "scalded flour", grams: 25, quantity: 25, unit: "grams", bakerPercentage: 5, phase: "scald", densityGPerMl: 0.53 }),
      ],
    };
    const result = buildScaledRecipe(recipeWithScald, [
      ...scaledIngredients,
      { ingredientName: "scalded flour", grams: 50 },
    ]);
    const scaldFlour = result.doughIngredients.find(i => i.ingredientName === "scalded flour")!;
    expect(scaldFlour.grams).toBe(50);
    expect(scaldFlour.bakerPercentage).toBe(5);
    expect(scaldFlour.densityGPerMl).toBe(0.53);
  });

  it("scales count-unit ingredients by yield ratio even when stored bakerPercentage is wrong", () => {
    // Regression: server sometimes stores bakerPercentage for count ingredients based on
    // the COUNT value rather than the gram weight, producing a near-zero si.grams and
    // a near-zero scaleFactor that collapses the egg count to 0.
    const recipeWithEgg: Recipe = {
      ...baseRecipe,
      doughIngredients: [
        ...baseRecipe.doughIngredients,
        makeIngredient({ ingredientName: "egg", grams: 131, quantity: 2.625, unit: "count", bakerPercentage: 0.64, densityGPerMl: 0 }),
      ],
    };
    // originalDoughWeight for bp>0 ingredients = 500+350+10+131(egg) = 991; target = 430
    // yieldRatio = 430/991 ≈ 0.434; expected egg count = 2.625 * 0.434 ≈ 1.139
    const originalDoughWeight = 500 + 350 + 10 + 131;
    const result = buildScaledRecipe(
      recipeWithEgg,
      [...scaledIngredients, { ingredientName: "egg", grams: 1 }],
      430,
    );
    const egg = result.doughIngredients.find(i => i.ingredientName === "egg")!;
    expect(egg.quantity).toBeCloseTo(2.625 * (430 / originalDoughWeight));
  });

  it("preserves otherIngredients unchanged", () => {
    const recipeWithOther: Recipe = {
      ...baseRecipe,
      otherIngredients: [
        makeIngredient({ ingredientName: "sesame seeds", grams: 20, quantity: 20, unit: "grams" }),
      ],
    };
    const result = buildScaledRecipe(recipeWithOther, scaledIngredients);
    expect(result.otherIngredients).toBe(recipeWithOther.otherIngredients);
  });
});
