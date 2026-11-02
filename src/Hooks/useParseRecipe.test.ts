import { act, renderHook } from '@testing-library/react';
import { useParseRecipe } from './useParseRecipe';

describe('useParseRecipe', () => {
  it('reports empty text as an error kind, not display text', async () => {
    const { result } = renderHook(() => useParseRecipe());

    let ok = true;
    await act(async () => {
      ok = await result.current.parseRecipe('   ');
    });

    expect(ok).toBe(false);
    expect(result.current.error).toEqual({ kind: 'empty' });
  });

  it('reports a failed request with the thrown message when there is one', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { result } = renderHook(() => useParseRecipe());

    await act(async () => {
      await result.current.parseRecipe('some recipe');
    });

    expect(result.current.error?.kind).toBe('failed');
  });

  it('clears the error', async () => {
    const { result } = renderHook(() => useParseRecipe());
    await act(async () => {
      await result.current.parseRecipe('');
    });
    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });
});
