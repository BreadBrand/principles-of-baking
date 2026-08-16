import { renderHook, waitFor } from '@testing-library/react';
import useFetchRecipes from './UseFetchRecipes';
import { saveRecipesToCache } from '../Utility/recipeCache';
import { type Recipe } from '../types/models';

const sampleRecipe: Recipe = {
  id: 'r1',
  title: 'Sample Sourdough',
  description: 'A basic sourdough loaf.',
  doughIngredients: [],
  otherIngredients: [],
  instructions: ['Mix', 'Bulk ferment', 'Bake'],
  meta: {
    yieldGrams: 900,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  userId: 'u1',
};

describe('useFetchRecipes', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('caches the fetched recipe list on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [sampleRecipe],
    } as Response);

    const { result } = renderHook(() => useFetchRecipes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.recipes).toEqual([sampleRecipe]);
    expect(localStorage.getItem('bread-machine:recipes-cache')).toContain('Sample Sourdough');
  });

  it('falls back to the cache when the network request fails', async () => {
    saveRecipesToCache([sampleRecipe]);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useFetchRecipes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.recipes).toEqual([sampleRecipe]);
  });

  it('keeps recipes empty and sets error when the network fails with no cache available', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useFetchRecipes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.recipes).toEqual([]);
    expect(result.current.error).toBe('offline');
  });
});
