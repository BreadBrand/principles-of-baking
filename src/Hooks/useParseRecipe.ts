import { useState, useCallback } from "react";
import { RecipeDTO } from "../types/dto";
import { auth } from "../firebase";
import { getAuthToken, buildApiUrl } from "../Utility/apiClient";

interface ParseResult {
  recipe: RecipeDTO | null;
  loading: boolean;
  error: string | null;
  parseFailed: boolean;
  parseRecipe: (text: string) => Promise<boolean>;
  clearError: () => void;
}

export function useParseRecipe(): ParseResult {
  const [recipe, setRecipe] = useState<RecipeDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseFailed, setParseFailed] = useState(false);

  const parseRecipe = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim()) {
      setError("Recipe text cannot be empty.");
      return false;
    }

    setLoading(true);
    setError(null);
    setParseFailed(false);

    try {
      const idToken = await getAuthToken(auth.currentUser, "Not authenticated");
      const url = buildApiUrl("api/recipes/parse");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const body = await response.text();
        let message = body || `Server returned ${response.status}`;
        let errorCode = "";
        try {
          const parsed = JSON.parse(body);
          message = parsed.message || message;
          errorCode = parsed.error || "";
        } catch {
          // body wasn't valid JSON — fall back to the raw text message set above
        }
        if (errorCode === "PARSE_FAILED") setParseFailed(true);
        throw new Error(message);
      }

      const data: RecipeDTO = await response.json();
      setRecipe(data);
      return true;
    } catch (err: any) {
      console.log("Parse failed:", err);
      setError(err.message || "Failed to parse recipe.");
      setRecipe(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setParseFailed(false);
  }, []);

  return { recipe, loading, error, parseFailed, parseRecipe, clearError };
}
