export type Unit = string;

export type IngredientDraft = {
  ingredientName: string;
  quantity: number;
  unit: Unit;
  phase?: string;
};
export type RecipeMetaRequest = {
  author?: string;
  servings?: string;
  prepTime: number;
  cookTime: number;
  additionalTime: number;
};
export type RecipeRequest = {
  title: string;
  description: string;
  doughIngredients: IngredientDraft[];
  otherIngredients?: IngredientDraft[];
  instructions: string[];
  yeastType: "dry" | "sourdough";
  meta?: RecipeMetaRequest;
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
  author?: string;
  servings?: string;
  prepTime?: number;
  cookTime?: number;
  additionalTime?: number;
  confidence: ConfidenceMeta;
}
