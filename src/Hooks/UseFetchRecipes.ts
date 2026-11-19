import { useCallback, useEffect, useState } from 'react';
import { Recipe, Ingredient } from '../types/models';
import { saveRecipesToCache, loadRecipesFromCache } from '../Utility/recipeCache';

// Handles documents written before the doughIngredients migration
type RawRecipeDoc = Omit<Recipe, 'doughIngredients' | 'otherIngredients'> & {
  doughIngredients?: Ingredient[];
  otherIngredients?: Ingredient[];
  ingredients?: Ingredient[];
};

function normalizeRecipe(raw: RawRecipeDoc): Recipe {
  return {
    ...raw,
    doughIngredients: raw.doughIngredients ?? raw.ingredients ?? [],
    otherIngredients: raw.otherIngredients ?? [],
  };
}

const fetchRecipeList = async (): Promise<Recipe[]> => {
  const resp = await fetch('/api/recipes');
  if (!resp.ok) {
    throw new Error('Network response was not ok');
  }
  const data: RawRecipeDoc[] = await resp.json();
  return data.map(normalizeRecipe);
};

const useFetchRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const normalized = await fetchRecipeList();
        setRecipes(normalized);
        saveRecipesToCache(normalized);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        const cached = loadRecipesFromCache();
        if (cached) {
          setRecipes(cached);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const normalized = await fetchRecipeList();
      setRecipes(normalized);
      saveRecipesToCache(normalized);
    } catch (error) {
      console.error('Error refreshing recipes:', error);
    }
  }, []);

  return { recipes, loading, error, refresh };
};

export default useFetchRecipes;
