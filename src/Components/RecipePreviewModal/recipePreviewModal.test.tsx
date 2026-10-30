import { screen, fireEvent } from "@testing-library/react";
import { renderWithIntl as render } from "../../test/renderWithIntl";
import { describe, it, expect, vi } from "vitest";

// RecipePreviewModal pulls in useCreateRecipe -> firebase.ts, which calls getAuth() at module
// load time. That throws in jsdom without real Firebase config env vars. Nothing in these tests
// exercises auth/save, so a minimal mock avoids the real Firebase SDK entirely.
vi.mock("../../firebase", () => ({ auth: { currentUser: null } }));

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
