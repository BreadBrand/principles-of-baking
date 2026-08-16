import { saveRecipesToCache, loadRecipesFromCache } from './recipeCache';
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

describe('recipeCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing has been cached', () => {
    expect(loadRecipesFromCache()).toBeNull();
  });

  it('round-trips a saved recipe list', () => {
    saveRecipesToCache([sampleRecipe]);
    expect(loadRecipesFromCache()).toEqual([sampleRecipe]);
  });

  it('returns null when the cached value is corrupt JSON', () => {
    localStorage.setItem('bread-machine:recipes-cache', '{not json');
    expect(loadRecipesFromCache()).toBeNull();
  });

  it('does not throw when localStorage.setItem fails (e.g. quota exceeded)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveRecipesToCache([sampleRecipe])).not.toThrow();
    spy.mockRestore();
  });
});
