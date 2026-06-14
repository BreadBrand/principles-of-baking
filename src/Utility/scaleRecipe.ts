import type { Ingredient, Recipe } from "../types/models";

export interface ScaledIngredient {
  ingredientName: string;
  grams: number;
}

export function getGrams(i: Ingredient): number {
  if (i.grams > 0) return i.grams;
  if (i.unit === "g") return i.quantity;
  return i.quantity * i.densityGPerMl;
}

export function scaleRecipe(ingredients: Ingredient[], totalDough: number): ScaledIngredient[] {
  const totalBasePct = ingredients
    .filter(i => i.bakerPercentage > 0)
    .reduce((sum, i) => sum + i.bakerPercentage, 0);

  if (totalBasePct === 0) return [];

  const onePctMass = totalDough / totalBasePct;

  const originalDoughWeight = ingredients
    .filter(i => i.bakerPercentage > 0)
    .reduce((sum, i) => sum + getGrams(i), 0);
  const yieldRatio = originalDoughWeight > 0 ? totalDough / originalDoughWeight : 1;

  return ingredients.map(i => ({
    ingredientName: i.ingredientName,
    grams: Math.round(
      i.bakerPercentage > 0
        ? i.bakerPercentage * onePctMass
        : getGrams(i) * yieldRatio
    ),
  }));
}

export function buildScaledRecipe(recipe: Recipe, scaled: ScaledIngredient[], totalDough?: number): Recipe {
  const originalDoughWeight = recipe.doughIngredients
    .filter(i => i.bakerPercentage > 0)
    .reduce((sum, i) => sum + getGrams(i), 0);
  const yieldRatio = totalDough !== undefined && originalDoughWeight > 0
    ? totalDough / originalDoughWeight
    : 1;

  const scaledDoughIngredients = scaled
    .map(si => {
      const original = recipe.doughIngredients.find(i => i.ingredientName === si.ingredientName);
      if (!original) return null;
      let quantity: number;
      if (original.unit.toLowerCase() === "count") {
        quantity = original.quantity * yieldRatio;
      } else if (original.unit === "g") {
        quantity = si.grams;
      } else {
        const originalGrams = getGrams(original);
        const scaleFactor = originalGrams > 0 ? si.grams / originalGrams : 1;
        quantity = original.quantity * scaleFactor;
      }
      return { ...original, grams: si.grams, quantity };
    })
    .filter((i): i is Ingredient => i !== null);

  return { ...recipe, doughIngredients: scaledDoughIngredients };
}
