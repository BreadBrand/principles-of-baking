import { useState } from "react";
import useCreateRecipe from "../../Hooks/UseCreateRecipe";
import { parseFraction } from "../../Utility/parseFraction";
import { type RecipeDTO, type IngredientDTO, type Unit } from "../../types/dto";
import { groupByPhase } from "../../Utility/groupByPhase";
import "./recipePreviewModal.css";
import Button from "../Button/button";

type RecipePreviewModalProps = {
  recipe: RecipeDTO | null;
  originalText?: string;
  onClose: () => void;
  onSaved?: () => void;
};

type EditIngredient = Omit<IngredientDTO, 'quantity'> & { quantity: string };

const confidenceLabel = (score: number): { label: string; color: string } => {
  if (score >= 0.8) return { label: "High", color: "#4caf50" };
  if (score >= 0.6) return { label: "Good", color: "rgba(202, 150, 92, 1)" };
  return { label: "Low — review carefully", color: "#e07040" };
};

const detectYeastType = (ings: { ingredientName: string }[]): "dry" | "sourdough" =>
  ings.some(i => /sourdough|starter|levain|discard|biga|poolish/i.test(i.ingredientName))
    ? "sourdough"
    : "dry";

const emptyIng = (): EditIngredient => ({
  ingredientName: "", quantity: "", unit: "g", rawLine: "", parseOK: true,
});

const RecipePreviewModal = ({ recipe, originalText, onClose, onSaved }: RecipePreviewModalProps) => {
  const { createRecipe, loading, error, clearError } = useCreateRecipe();
  const [formError, setFormError] = useState<string | null>(null);

  const manualEntry = !recipe;
  const lowConfidence = recipe
    ? recipe.confidence.ingredients < 0.4 || recipe.confidence.instructions < 0.4
    : false;

  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [doughIngredients, setDoughIngredients] = useState<EditIngredient[]>(() =>
    (recipe?.doughIngredients ?? []).map(ing => ({
      ...ing,
      quantity: ing.quantity.toString(),
      ingredientName: ing.ingredientName || ing.rawLine,
    }))
  );
  const [otherIngredients, setOtherIngredients] = useState<EditIngredient[]>(
    (recipe?.otherIngredients ?? []).map(ing => ({
      ...ing,
      quantity: ing.quantity.toString(),
    }))
  );
  const [instructions, setInstructions] = useState<string[]>(recipe?.instructions ?? []);

  const updateIng = (
    list: EditIngredient[],
    set: React.Dispatch<React.SetStateAction<EditIngredient[]>>,
    i: number,
    field: keyof EditIngredient,
    value: string
  ) => set(list.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing));

  const removeIng = (
    set: React.Dispatch<React.SetStateAction<EditIngredient[]>>,
    i: number
  ) => set(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setFormError(null);
    clearError();
    const allIngs = [...doughIngredients, ...otherIngredients].filter(i => i.ingredientName.trim());
    for (const ing of allIngs) {
      if (parseFraction(ing.quantity) === null) {
        setFormError("One or more quantities couldn't be read. Check ingredient amounts.");
        return;
      }
    }

    const todraft = ({ ingredientName, quantity, unit }: EditIngredient) => ({
      ingredientName,
      quantity: parseFraction(quantity) as number,
      unit: unit as Unit,
    });

    const result = await createRecipe({
      title,
      description,
      doughIngredients: doughIngredients.filter(i => i.ingredientName.trim()).map(todraft),
      otherIngredients: otherIngredients.filter(i => i.ingredientName.trim()).map(todraft),
      instructions: instructions.filter(s => s.trim()),
      yeastType: detectYeastType(doughIngredients),
    });
    if (result.ok) { onClose(); onSaved?.(); }
  };

  const confidence = recipe?.confidence;
  const hasMeta = recipe && (recipe.servings || recipe.prepTime || recipe.cookTime || recipe.additionalTime);

  const renderIngredientList = (
    list: EditIngredient[],
    set: React.Dispatch<React.SetStateAction<EditIngredient[]>>
  ) => {
    const groups = groupByPhase(list);

    const renamePhase = (oldPhase: string, newPhase: string) =>
      set(prev => prev.map(ing => (ing.phase?.trim() ?? "") === oldPhase ? { ...ing, phase: newPhase } : ing));

    return (
      <>
        {groups.map(group => (
          <div key={group.phase || "__main__"}>
            {group.phase && (
              <div className="phaseHeaderRow">
                <span className="fieldLabel">Section</span>
                <input
                  type="text"
                  className="editInput phaseLabelInput"
                  value={group.phase}
                  onChange={e => renamePhase(group.phase, e.target.value)}
                  aria-label="ingredient section label"
                />
              </div>
            )}
            <ul className="ingredientEditList">
              {group.items.map(ing => {
                const i = list.indexOf(ing);
                return (
                  <li key={i} className="ingredientRow">
                    <div>
                      <span className="fieldLabel">Qty</span>
                      <input
                        type="text"
                        className="editInput ingQtyInput"
                        value={ing.quantity}
                        onChange={e => updateIng(list, set, i, "quantity", e.target.value)}
                        placeholder="e.g. 1/2"
                        aria-label="quantity"
                      />
                    </div>
                    <div>
                      <span className="fieldLabel">Unit</span>
                      <input
                        type="text"
                        className="editInput ingUnitInput"
                        value={ing.unit}
                        onChange={e => updateIng(list, set, i, "unit", e.target.value)}
                        placeholder="unit"
                        aria-label="unit"
                      />
                    </div>
                    <div>
                      <span className="fieldLabel">Ingredient</span>
                      <input
                        type="text"
                        className="editInput ingNameInput"
                        value={ing.ingredientName}
                        onChange={e => updateIng(list, set, i, "ingredientName", e.target.value)}
                        placeholder="ingredient name"
                        aria-label="ingredient name"
                      />
                    </div>
                    <button className="removeBtn" onClick={() => removeIng(set, i)} type="button" aria-label="remove">×</button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <button className="addRowBtn" onClick={() => set(prev => [...prev, emptyIng()])} type="button">
          + Add ingredient
        </button>
      </>
    );
  };

  return (
    <div className="modalOverlay">
      <div className="parseModalContent">

        {manualEntry && (
          <div className="parseBanner">
            We couldn't parse this recipe automatically. Fill in the fields below — your original text is shown for reference.
          </div>
        )}

        <input
          className="editInput titleInput"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Recipe title"
          aria-label="Recipe title"
        />

        <input
          className="editInput descriptionInput"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Recipe description"
          aria-label="Recipe description"
        />

        {confidence && (
          <div className="confidenceSection">
            <div className="confidenceSectionLabel">Parse confidence</div>
            {[
              ["Title", confidence.title],
              ["Ingredients", confidence.ingredients],
              ["Instructions", confidence.instructions],
            ].map(([label, score]) => {
              const { label: cl, color } = confidenceLabel(score as number);
              return (
                <div key={label as string} className="confidenceRow">
                  <span>{label}</span>
                  <span className="confidenceBadge" style={{ color }}>{cl}</span>
                </div>
              );
            })}
          </div>
        )}

        {originalText && (manualEntry || lowConfidence) && (
          <div className="originalTextSection">
            <div className="originalTextLabel">Original recipe text</div>
            <textarea
              className="originalTextArea"
              readOnly
              value={originalText}
              rows={10}
              aria-label="Original recipe text"
            />
          </div>
        )}

        {hasMeta && (
          <div className="parsedMeta">
            {recipe.servings && <span>{recipe.servings} servings</span>}
            {recipe.prepTime && <span>Prep: {recipe.prepTime}</span>}
            {recipe.cookTime && <span>Cook: {recipe.cookTime}</span>}
            {recipe.additionalTime && <span>Additional: {recipe.additionalTime}</span>}
          </div>
        )}

        <h2>Ingredients</h2>
        {renderIngredientList(doughIngredients, setDoughIngredients)}

        {otherIngredients.length > 0 && (
          <>
            <h2>Other ingredients</h2>
            {renderIngredientList(otherIngredients, setOtherIngredients)}
          </>
        )}

        <h2>Instructions</h2>
        <ol className="instructionEditList">
          {instructions.map((inst, i) => (
            <li key={i} className="instructionRow">
              <textarea
                className="editInput instInput"
                value={inst}
                onChange={e => setInstructions(prev => prev.map((s, idx) => idx === i ? e.target.value : s))}
                rows={2}
                aria-label={`Step ${i + 1}`}
              />
              <button
                className="removeBtn"
                onClick={() => setInstructions(prev => prev.filter((_, idx) => idx !== i))}
                type="button"
                aria-label="remove step"
              >×</button>
            </li>
          ))}
        </ol>
        <button className="addRowBtn" onClick={() => setInstructions(prev => [...prev, ""])} type="button">
          + Add step
        </button>

        <div className="modalActions">
          {(formError || error) && <p className="errorText">{formError ?? error}</p>}
          <Button onClick={handleSave} disabled={
            loading ||
            !title.trim() ||
            !description.trim() ||
            ![...doughIngredients, ...otherIngredients].some(i => i.ingredientName.trim()) ||
            !instructions.some(s => s.trim())
          }>
            {loading ? "Saving..." : "Save Recipe"}
          </Button>
          <Button onClick={onClose} type="secondary" disabled={loading}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipePreviewModal;
