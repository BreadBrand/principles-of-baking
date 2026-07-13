import { Ingredient, YeastType } from "../types/models";
import { isFlour, isWater, isYeast, isStarter } from "../Utility/ingredientMatchers";

export type { YeastType };

// Parsed recipes may not have grams computed yet; fall back to quantity
const g = (ing: Ingredient): number => ing.grams || ing.quantity;

const useConvertYeast = () => {
  const convertYeast = (ingredients: Ingredient[], from: YeastType): Ingredient[] => {
    if (from === "dry") {
      const hasYeast = ingredients.some(i => isYeast(i.ingredientName));
      if (!hasYeast) return ingredients;

      const totalFlourGrams = ingredients
        .filter(i => isFlour(i.ingredientName))
        .reduce((sum, i) => sum + g(i), 0);

      if (totalFlourGrams === 0) return ingredients;

      const starterGrams = Math.round(totalFlourGrams * 0.2);
      const half = starterGrams / 2;

      const totalWaterGrams = ingredients
        .filter(i => isWater(i.ingredientName))
        .reduce((sum, i) => sum + g(i), 0);

      return [
        ...ingredients
          .filter(i => !isYeast(i.ingredientName))
          .map(i => {
            if (isFlour(i.ingredientName)) {
              const ratio = g(i) / totalFlourGrams;
              const subtract = half * ratio;
              return { ...i, grams: Math.round(g(i) - subtract), quantity: Math.round(i.quantity - subtract) };
            }
            if (isWater(i.ingredientName)) {
              // water density ≈ 1 g/ml in bread recipes; Grams and quantity track the same value
              const ratio = g(i) / totalWaterGrams;
              const subtract = half * ratio;
              return { ...i, grams: Math.max(0, Math.round(g(i) - subtract)), quantity: Math.max(0, Math.round(i.quantity - subtract)) };
            }
            return i;
          }),
        {
          id: crypto.randomUUID(),
          ingredientName: "sourdough starter",
          quantity: starterGrams,
          unit: "g",
          grams: starterGrams,
          phase: "dough" as const,
          bakerPercentage: 0,
          densityGPerMl: 1.0,
        },
      ];
    } else {
      const starterIngredient = ingredients.find(i => isStarter(i.ingredientName));
      if (!starterIngredient) return ingredients;

      const starterGrams = g(starterIngredient);
      const half = starterGrams / 2;

      const nonStarter = ingredients.filter(i => !isStarter(i.ingredientName));

      const totalFlourGrams = nonStarter
        .filter(i => isFlour(i.ingredientName))
        .reduce((sum, i) => sum + g(i), 0);

      const totalWaterGrams = nonStarter
        .filter(i => isWater(i.ingredientName))
        .reduce((sum, i) => sum + g(i), 0);

      const restoredIngredients = nonStarter.map(i => {
          if (isFlour(i.ingredientName)) {
            const ratio = totalFlourGrams > 0 ? g(i) / totalFlourGrams : 1;
            const add = half * ratio;
            return { ...i, grams: Math.round(g(i) + add), quantity: Math.round(i.quantity + add) };
          }
          if (isWater(i.ingredientName)) {
            // water density ≈ 1 g/ml in bread recipes; Grams and quantity track the same value
            const ratio = totalWaterGrams > 0 ? g(i) / totalWaterGrams : 1;
            const add = half * ratio;
            return { ...i, grams: Math.round(g(i) + add), quantity: Math.round(i.quantity + add) };
          }
          return i;
        });

      const restoredFlourGrams = restoredIngredients
        .filter(i => isFlour(i.ingredientName))
        .reduce((sum, i) => sum + g(i), 0);

      const yeastGrams = Math.round(restoredFlourGrams * 0.01);

      return [
        ...restoredIngredients,
        {
          id: crypto.randomUUID(),
          ingredientName: "active dry yeast",
          quantity: yeastGrams,
          unit: "g",
          grams: yeastGrams,
          phase: "dough" as const,
          bakerPercentage: 0,
          densityGPerMl: 0.43,
        },
      ];
    }
  };

  return { convertYeast };
};

export default useConvertYeast;
