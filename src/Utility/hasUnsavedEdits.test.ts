import { hasUnsavedEdits, type RecipeEditState } from "./hasUnsavedEdits";

const baseState = (): RecipeEditState => ({
  title: "Country Loaf",
  description: "A simple loaf",
  doughIngredients: [
    { ingredientName: "bread flour", quantity: "500", unit: "g", phase: "Dough" },
    { ingredientName: "water", quantity: "350", unit: "g" },
  ],
  otherIngredients: [],
  instructions: ["Mix", "Bake"],
});

describe("hasUnsavedEdits", () => {
  it("is false when nothing changed", () => {
    expect(hasUnsavedEdits(baseState(), baseState())).toBe(false);
  });

  it("is true when the title changes", () => {
    expect(hasUnsavedEdits(baseState(), { ...baseState(), title: "Country Loaves" })).toBe(true);
  });

  it("is true when an ingredient quantity changes", () => {
    const current = baseState();
    current.doughIngredients[1] = { ...current.doughIngredients[1], quantity: "360" };
    expect(hasUnsavedEdits(baseState(), current)).toBe(true);
  });

  it("is true when an ingredient is removed", () => {
    const current = baseState();
    current.doughIngredients.pop();
    expect(hasUnsavedEdits(baseState(), current)).toBe(true);
  });

  it("is true when a step is added", () => {
    const current = baseState();
    current.instructions.push("Cool");
    expect(hasUnsavedEdits(baseState(), current)).toBe(true);
  });

  it("is true when a section label is renamed", () => {
    const current = baseState();
    current.doughIngredients[0] = { ...current.doughIngredients[0], phase: "Levain" };
    expect(hasUnsavedEdits(baseState(), current)).toBe(true);
  });

  it("treats a missing section label the same as an empty one", () => {
    const current = baseState();
    current.doughIngredients[1] = { ...current.doughIngredients[1], phase: "" };
    expect(hasUnsavedEdits(baseState(), current)).toBe(false);
  });

  it("ignores parser-only fields that the editor never changes", () => {
    const current = baseState();
    current.doughIngredients[0] = { ...current.doughIngredients[0], rawLine: "500 g bread flour", parseOK: true } as typeof current.doughIngredients[0];
    expect(hasUnsavedEdits(baseState(), current)).toBe(false);
  });
});
