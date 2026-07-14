interface TokenSource {
  getIdToken: () => Promise<string>;
}

export async function getAuthToken(
  user: TokenSource | null | undefined,
  errorMessage: string
): Promise<string> {
  const idToken = await user?.getIdToken();
  if (!idToken) throw new Error(errorMessage);
  return idToken;
}

export function buildApiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE?.trim();
  const cleanPath = path.replace(/^\//, "");
  return base ? `${base.replace(/\/$/, "")}/${cleanPath}` : `/${cleanPath}`;
}
