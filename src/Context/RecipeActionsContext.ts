import { createContext, useContext } from "react";

type RecipeActionsContextType = {
  refreshRecipes: () => Promise<void>;
};

export const RecipeActionsContext = createContext<RecipeActionsContextType | undefined>(undefined);

export const useRecipeActions = () => {
  const ctx = useContext(RecipeActionsContext);
  if (!ctx) throw new Error("useRecipeActions must be used within a RecipeActionsContext provider");
  return ctx;
};
