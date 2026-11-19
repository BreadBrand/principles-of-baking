import { screen, fireEvent } from "@testing-library/react";
import { renderWithIntl as render } from "../../test/renderWithIntl";
import { describe, it, expect, vi } from "vitest";

// RecipePreviewModal pulls in useCreateRecipe -> firebase.ts, which calls getAuth() at module
// load time. That throws in jsdom without real Firebase config env vars. Nothing in these tests
// exercises auth/save, so a minimal mock avoids the real Firebase SDK entirely.
vi.mock("../../firebase", () => ({ auth: { currentUser: null } }));

const { createRecipe } = vi.hoisted(() => ({
  createRecipe: vi.fn().mockResolvedValue({ ok: true, data: {} }),
}));
vi.mock("../../Hooks/UseCreateRecipe", () => ({
  default: () => ({ createRecipe, loading: false, error: null, clearError: () => {} }),
}));

import RecipePreviewModal from "./recipePreviewModal";
import { type RecipeDTO } from "../../types/dto";

const baseRecipe: RecipeDTO = {
  title: "Test Bread",
  description: "A test recipe",
  doughIngredients: [
    { ingredientName: "sourdough starter", quantity: 15, unit: "g", phase: "Tangzhong", rawLine: "15 g sourdough starter", parseOK: true },
    { ingredientName: "bread flour", quantity: 60, unit: "g", phase: "Tangzhong", rawLine: "60 g bread flour", parseOK: true },
  ],
  otherIngredients: [],
  instructions: ["Mix everything."],
  confidence: { title: 1, ingredients: 1, instructions: 1 },
};

describe("RecipePreviewModal — section header rename", () => {
  it("preserves a typed space in the middle of a section name across re-renders", () => {
    render(<RecipePreviewModal recipe={baseRecipe} onClose={() => {}} />);
    const input = screen.getByLabelText("ingredient section label") as HTMLInputElement;
    expect(input.value).toBe("Tangzhong");

    fireEvent.change(input, { target: { value: "Tangzhong " } });
    expect(input.value).toBe("Tangzhong ");

    fireEvent.change(input, { target: { value: "Tangzhong D" } });
    expect(input.value).toBe("Tangzhong D");
  });

  it("keeps the header editable (not deleted) after being cleared to empty", () => {
    render(<RecipePreviewModal recipe={baseRecipe} onClose={() => {}} />);
    const input = screen.getByLabelText("ingredient section label") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "" } });
    // The header input must still exist and be editable, not have vanished.
    expect(screen.getByLabelText("ingredient section label")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("ingredient section label"), { target: { value: "Renamed Section" } });
    expect((screen.getByLabelText("ingredient section label") as HTMLInputElement).value).toBe("Renamed Section");
  });
});

describe("RecipePreviewModal — details", () => {
  const withDetails: RecipeDTO = { ...baseRecipe, servings: "5", prepTime: 120, cookTime: 150 };

  const field = (name: string) => screen.getByLabelText(name) as HTMLInputElement;

  beforeEach(() => {
    createRecipe.mockClear();
  });

  it("prefills servings and times from the parsed recipe", () => {
    render(<RecipePreviewModal recipe={withDetails} onClose={() => {}} />);

    expect(field("Servings").value).toBe("5");
    expect(field("Prep time, hours").value).toBe("2");
    expect(field("Prep time, minutes").value).toBe("");
    expect(field("Cook time, hours").value).toBe("2");
    expect(field("Cook time, minutes").value).toBe("30");
    expect(field("Additional time, hours").value).toBe("");
  });

  it("leaves the details blank when nothing was parsed", () => {
    render(<RecipePreviewModal recipe={baseRecipe} onClose={() => {}} />);

    expect(field("Servings").value).toBe("");
    expect(field("Prep time, hours").value).toBe("");
    expect(field("Cook time, minutes").value).toBe("");
  });

  it("sends the details as meta, with times as total minutes", async () => {
    render(<RecipePreviewModal recipe={withDetails} onClose={() => {}} />);

    fireEvent.change(field("Prep time, hours"), { target: { value: "1" } });
    fireEvent.change(field("Prep time, minutes"), { target: { value: "15" } });
    fireEvent.change(field("Additional time, minutes"), { target: { value: "20" } });
    fireEvent.click(screen.getByText("Save Recipe"));

    await vi.waitFor(() => expect(createRecipe).toHaveBeenCalledTimes(1));
    expect(createRecipe.mock.calls[0][0].meta).toEqual({
      servings: "5",
      prepTime: 75,
      cookTime: 150,
      additionalTime: 20,
    });
  });

  it("omits servings from meta when it is blank", async () => {
    render(<RecipePreviewModal recipe={baseRecipe} onClose={() => {}} />);

    fireEvent.click(screen.getByText("Save Recipe"));

    await vi.waitFor(() => expect(createRecipe).toHaveBeenCalledTimes(1));
    expect(createRecipe.mock.calls[0][0].meta).toEqual({ prepTime: 0, cookTime: 0, additionalTime: 0 });
  });

  it("blocks saving and explains when a time is not a whole number", () => {
    render(<RecipePreviewModal recipe={withDetails} onClose={() => {}} />);

    fireEvent.change(field("Cook time, hours"), { target: { value: "1.5" } });
    fireEvent.click(screen.getByText("Save Recipe"));

    expect(createRecipe).not.toHaveBeenCalled();
    expect(screen.getByText("Times must be whole hours and minutes, up to 7 days.")).toBeInTheDocument();
  });

  it("marks an invalid time field", () => {
    render(<RecipePreviewModal recipe={withDetails} onClose={() => {}} />);

    fireEvent.change(field("Prep time, minutes"), { target: { value: "abc" } });

    expect(field("Prep time, minutes")).toHaveAttribute("aria-invalid", "true");
    expect(field("Cook time, minutes")).toHaveAttribute("aria-invalid", "false");
  });

  it("asks before discarding when only a detail was edited", () => {
    render(<RecipePreviewModal recipe={withDetails} onClose={() => {}} />);

    fireEvent.change(field("Servings"), { target: { value: "6" } });
    fireEvent.click(screen.getByText("Close"));

    expect(screen.getByText("Discard your changes?")).toBeInTheDocument();
  });
});
