import { useEffect, useState } from 'react';
import { Recipe, Ingredient } from '../types/models';

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

const useFetchRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/recipes');
        if (!resp.ok) {
          throw new Error('Network response was not ok');
        }
        const data: RawRecipeDoc[] = await resp.json();
        setRecipes(data.map(normalizeRecipe));
      } catch (error) {
        console.error('Error fetching recipes:', error);
        if (error instanceof Error) {
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

  return { recipes, loading, error };
};

export default useFetchRecipes;
