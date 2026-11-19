import type { DurationFields } from "./recipeDuration";

type IngredientEditState = {
  ingredientName: string;
  quantity: string;
  unit: string;
  phase?: string;
};

export type RecipeEditState = {
  title: string;
  description: string;
  doughIngredients: IngredientEditState[];
  otherIngredients: IngredientEditState[];
  instructions: string[];
  servings: string;
  prepTime: DurationFields;
  cookTime: DurationFields;
  additionalTime: DurationFields;
};

const comparableIngredient = ({ ingredientName, quantity, unit, phase }: IngredientEditState) => ({
  ingredientName,
  quantity,
  unit,
  phase: phase ?? "",
});

const comparable = (state: RecipeEditState) => ({
  title: state.title,
  description: state.description,
  doughIngredients: state.doughIngredients.map(comparableIngredient),
  otherIngredients: state.otherIngredients.map(comparableIngredient),
  instructions: state.instructions,
  servings: state.servings,
  prepTime: state.prepTime,
  cookTime: state.cookTime,
  additionalTime: state.additionalTime,
});

export const hasUnsavedEdits = (initial: RecipeEditState, current: RecipeEditState): boolean =>
  JSON.stringify(comparable(initial)) !== JSON.stringify(comparable(current));
