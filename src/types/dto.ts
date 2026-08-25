export const UNITS = ["g", "oz", "ml", "cups", "Tbls", "tsp"];
export type Unit = typeof UNITS[number];

export type IngredientDraft = {
  ingredientName: string;
  quantity: number;
  unit: Unit;
  phase?: string;
};
export type RecipeRequest = {
  title: string;
  description: string;
  doughIngredients: IngredientDraft[];
  otherIngredients?: IngredientDraft[];
  instructions: string[];
  yeastType: "dry" | "sourdough";
};

export interface IngredientDTO {
  ingredientName: string;
  quantity: number;
  unit: string;
  phase?: string;
  rawLine: string;
  parseOK: boolean;
}

export interface ConfidenceMeta {
  title: number;
  ingredients: number;
  instructions: number;
}

export interface RecipeDTO {
  title: string;
  description: string;
  doughIngredients: IngredientDTO[];
  otherIngredients: IngredientDTO[] | null;
  instructions: string[];
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  additionalTime?: string;
  confidence: ConfidenceMeta;
}
