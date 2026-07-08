import type { Ingredient } from "../types/models";
import { CONVERSION_THRESHOLD, CUP_VOLUME, TBLS_VOLUME, TSP_VOLUME } from "./constants";
import { tbspToFraction, toFraction } from "./helperFunctions";

function abbreviateUnit(unit: string): string {
  switch (unit.toLowerCase()) {
    case "grams":
      return "g";
    case "count":
      return "";
    default:
      return unit;
  }
}

export function formatIngredientDisplay(ing: Ingredient, unit: string): string {
  if (ing.unit.toLowerCase() === "count") {
    return `${Math.round(ing.quantity)}: ${ing.ingredientName}`;
  }

  const isGrams = ing.unit.toLowerCase() === "grams" || ing.unit.toLowerCase() === "g";
  const isMl = ing.unit.toLowerCase() === "ml";

  if (unit === "g" && !isGrams) {
    if (ing.unit.toLowerCase() === "oz") {
      return `${Math.round(ing.quantity * 28.35)} g: ${ing.ingredientName}`;
    }
    if (ing.grams > 0) {
      return `${ing.grams} g: ${ing.ingredientName}`;
    }
  }

  if (unit === "cups") {
    let ml: number | null = null;
    if (isGrams && ing.densityGPerMl && ing.densityGPerMl > 0) {
      ml = ing.quantity / ing.densityGPerMl;
    } else if (isMl) {
      ml = ing.quantity;
    }

    if (ml !== null) {
      if (ml >= CONVERSION_THRESHOLD) {
        return `${toFraction(ml / CUP_VOLUME)} cups: ${ing.ingredientName}`;
      } else if (ml >= TBLS_VOLUME) {
        return `${tbspToFraction(ml / TBLS_VOLUME)} tbsp: ${ing.ingredientName}`;
      } else {
        return `${tbspToFraction(ml / TSP_VOLUME)} tsp: ${ing.ingredientName}`;
      }
    }
  }

  return `${toFraction(ing.quantity)} ${abbreviateUnit(ing.unit)}: ${ing.ingredientName}`;
}
