import type { IntlShape } from "react-intl";
import type { Ingredient } from "../types/models";
import { CONVERSION_THRESHOLD, CUP_VOLUME, TBLS_VOLUME, TSP_VOLUME } from "./constants";
import { tbspToFraction, toFraction } from "./helperFunctions";

const unitMessages = {
  g: { id: "ingredientDisplay.unitGrams", defaultMessage: "g" },
  cups: { id: "ingredientDisplay.unitCups", defaultMessage: "cups" },
  tbsp: { id: "ingredientDisplay.unitTbsp", defaultMessage: "tbsp" },
  tsp: { id: "ingredientDisplay.unitTsp", defaultMessage: "tsp" },
} as const;

export function formatIngredientDisplay(ing: Ingredient, unit: string, intl: IntlShape): string {
  const measured = (amount: string | number, unitLabel: string) =>
    intl.formatMessage(
      { id: "ingredientDisplay.measured", defaultMessage: "{amount} {unit}: {name}" },
      { amount, unit: unitLabel, name: ing.ingredientName },
    );
  const grams = (amount: string | number) => measured(amount, intl.formatMessage(unitMessages.g));

  if (ing.unit.toLowerCase() === "count") {
    return intl.formatMessage(
      { id: "ingredientDisplay.count", defaultMessage: "{amount}: {name}" },
      { amount: Math.round(ing.quantity), name: ing.ingredientName },
    );
  }

  const hasNoAmount = !(ing.grams > 0) && !(Number.isFinite(ing.quantity) && ing.quantity > 0);
  if (hasNoAmount) {
    return unit === "cups"
      ? intl.formatMessage(
          { id: "ingredientDisplay.dash", defaultMessage: "a dash: {name}" },
          { name: ing.ingredientName },
        )
      : grams("⅛");
  }

  const isGrams = ing.unit.toLowerCase() === "grams" || ing.unit.toLowerCase() === "g";
  const isMl = ing.unit.toLowerCase() === "ml";

  if (unit === "g" && !isGrams) {
    if (ing.unit.toLowerCase() === "oz") {
      return grams(Math.round(ing.quantity * 28.35));
    }
    if (ing.grams > 0) {
      return grams(ing.grams);
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
        return measured(toFraction(ml / CUP_VOLUME), intl.formatMessage(unitMessages.cups));
      } else if (ml >= TBLS_VOLUME) {
        return measured(tbspToFraction(ml / TBLS_VOLUME), intl.formatMessage(unitMessages.tbsp));
      } else {
        return measured(tbspToFraction(ml / TSP_VOLUME), intl.formatMessage(unitMessages.tsp));
      }
    }
  }

  const storedUnit = ["grams", "g"].includes(ing.unit.toLowerCase()) ? intl.formatMessage(unitMessages.g) : ing.unit;
  return measured(toFraction(ing.quantity), storedUnit);
}
