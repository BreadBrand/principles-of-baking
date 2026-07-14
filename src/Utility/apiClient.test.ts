import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApiUrl, getAuthToken } from "./apiClient";

describe("buildApiUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a relative path when VITE_API_BASE is not set", () => {
    vi.stubEnv("VITE_API_BASE", "");
    expect(buildApiUrl("api/recipes")).toBe("/api/recipes");
  });

  it("returns a relative path when VITE_API_BASE is only whitespace", () => {
    vi.stubEnv("VITE_API_BASE", "   ");
    expect(buildApiUrl("api/recipes")).toBe("/api/recipes");
  });

  it("prefixes the base URL, stripping its trailing slash", () => {
    vi.stubEnv("VITE_API_BASE", "https://api.example.com/");
    expect(buildApiUrl("api/recipes")).toBe("https://api.example.com/api/recipes");
  });

  it("strips a leading slash from the path so the join never double-slashes", () => {
    vi.stubEnv("VITE_API_BASE", "https://api.example.com");
    expect(buildApiUrl("/api/recipes/parse")).toBe("https://api.example.com/api/recipes/parse");
  });
});

describe("getAuthToken", () => {
  it("resolves with the id token when the user returns one", async () => {
    const user = { getIdToken: () => Promise.resolve("token-123") };
    await expect(getAuthToken(user, "not used")).resolves.toBe("token-123");
  });

  it("throws the given message when user is null", async () => {
    await expect(getAuthToken(null, "Not authenticated")).rejects.toThrow("Not authenticated");
  });

  it("throws the given message when user is undefined", async () => {
    await expect(getAuthToken(undefined, "Not authenticated")).rejects.toThrow("Not authenticated");
  });

  it("throws the given message when getIdToken resolves empty", async () => {
    const user = { getIdToken: () => Promise.resolve("") };
    await expect(getAuthToken(user, "Not authenticated")).rejects.toThrow("Not authenticated");
  });
});
