import { createContext } from "react";
import type { Recipe } from "../types/models";

export const RecipeContext = createContext<Recipe[]>([]);
