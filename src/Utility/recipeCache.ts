import { type Recipe } from '../types/models';

const CACHE_KEY = 'bread-machine:recipes-cache';

export function saveRecipesToCache(recipes: Recipe[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.error('Failed to cache recipes:', error);
  }
}

export function loadRecipesFromCache(): Recipe[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Recipe[];
  } catch (error) {
    console.error('Failed to read cached recipes:', error);
    return null;
  }
}
