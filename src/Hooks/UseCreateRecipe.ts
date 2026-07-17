import { useState } from 'react';
import { auth } from '../firebase';
import { type RecipeRequest } from '../types/dto';
import { type Recipe } from '../types/models';
import { getAuthToken, buildApiUrl } from '../Utility/apiClient';

type CreateRecipeResult =
  | { ok: true; data: Recipe }
  | { ok: false; error: string }

const useCreateRecipe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRecipe = async (recipeData: RecipeRequest): Promise<CreateRecipeResult> => {
    setLoading(true);
    setError(null);

    try {
      const idToken = await getAuthToken(auth.currentUser, 'User is not authenticated');
      const url = buildApiUrl("api/recipes");

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(recipeData)
      });

      if (!resp.ok) {
        const msg = (await resp.text().catch(() => "")) || `Request failed: ${resp.status}`;
        throw new Error(msg);
      }

      const created: Recipe = await resp.json();

      return { ok: true, data: created };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown Error";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { createRecipe, loading, error, clearError };
};

export default useCreateRecipe;
