import { useState } from "react";
import { FormattedMessage, useIntl, type IntlShape } from "react-intl";
import useCreateRecipe from "../../Hooks/UseCreateRecipe";
import { parseFraction } from "../../Utility/parseFraction";
import { type RecipeDTO, type IngredientDTO, type Unit } from "../../types/dto";
import { groupByPhase } from "../../Utility/groupByPhase";
import "./recipePreviewModal.css";
import { SYMBOLS } from "../../Constants/untranslated";
import Button from "../Button/button";

type RecipePreviewModalProps = {
  recipe: RecipeDTO | null;
  originalText?: string;
  onClose: () => void;
  onSaved?: () => void;
};

type EditIngredient = Omit<IngredientDTO, 'quantity'> & { quantity: string };

const confidenceLabel = (score: number, intl: IntlShape): { label: string; color: string } => {
  if (score >= 0.8) return { label: intl.formatMessage({ id: "recipePreviewModal.confidenceHigh", defaultMessage: "High" }), color: "#4caf50" };
  if (score >= 0.6) return { label: intl.formatMessage({ id: "recipePreviewModal.confidenceGood", defaultMessage: "Good" }), color: "rgba(202, 150, 92, 1)" };
  return { label: intl.formatMessage({ id: "recipePreviewModal.confidenceLow", defaultMessage: "Low — review carefully" }), color: "#e07040" };
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
  const intl = useIntl();
  const [hasQuantityError, setHasQuantityError] = useState(false);

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
    setHasQuantityError(false);
    clearError();
    const allIngs = [...doughIngredients, ...otherIngredients].filter(i => i.ingredientName.trim());
    for (const ing of allIngs) {
      if (parseFraction(ing.quantity) === null) {
        setHasQuantityError(true);
        return;
      }
    }

    const todraft = ({ ingredientName, quantity, unit, phase }: EditIngredient) => ({
      ingredientName,
      quantity: parseFraction(quantity) as number,
      unit: unit as Unit,
      ...(phase?.trim() ? { phase: phase.trim() } : {}),
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
        {groups.map((group, groupIndex) => {
          const hasPhaseField = group.items.some(i => i.phase !== undefined);
          const rawPhase = group.items[0]?.phase ?? group.phase;
          return (
            <div key={groupIndex} className="ingredientGroup">
              {hasPhaseField && (
                <div className="phaseHeaderRow">
                  <span className="fieldLabel"><FormattedMessage id="recipePreviewModal.section" defaultMessage="Section" /></span>
                  <input
                    type="text"
                    className="editInput phaseLabelInput"
                    value={rawPhase}
                    onChange={e => renamePhase(group.phase, e.target.value)}
                    aria-label={intl.formatMessage({ id: "recipePreviewModal.sectionLabel", defaultMessage: "ingredient section label" })}
                  />
                </div>
              )}
              <ul className="ingredientEditList">
                {group.items.map(ing => {
                  const i = list.indexOf(ing);
                  return (
                    <li key={i} className="ingredientRow">
                      <div>
                        <span className="fieldLabel"><FormattedMessage id="recipePreviewModal.qty" defaultMessage="Qty" /></span>
                        <input
                          type="text"
                          className="editInput ingQtyInput"
                          value={ing.quantity}
                          onChange={e => updateIng(list, set, i, "quantity", e.target.value)}
                          placeholder={intl.formatMessage({ id: "recipePreviewModal.qtyPlaceholder", defaultMessage: "e.g. 1/2" })}
                          aria-label={intl.formatMessage({ id: "recipePreviewModal.qtyLabel", defaultMessage: "quantity" })}
                        />
                      </div>
                      <div>
                        <span className="fieldLabel"><FormattedMessage id="recipePreviewModal.unit" defaultMessage="Unit" /></span>
                        <input
                          type="text"
                          className="editInput ingUnitInput"
                          value={ing.unit}
                          onChange={e => updateIng(list, set, i, "unit", e.target.value)}
                          placeholder={intl.formatMessage({ id: "recipePreviewModal.unitPlaceholder", defaultMessage: "unit" })}
                          aria-label={intl.formatMessage({ id: "recipePreviewModal.unitLabel", defaultMessage: "unit" })}
                        />
                      </div>
                      <div>
                        <span className="fieldLabel"><FormattedMessage id="recipePreviewModal.ingredient" defaultMessage="Ingredient" /></span>
                        <input
                          type="text"
                          className="editInput ingNameInput"
                          value={ing.ingredientName}
                          onChange={e => updateIng(list, set, i, "ingredientName", e.target.value)}
                          placeholder={intl.formatMessage({ id: "recipePreviewModal.ingredientPlaceholder", defaultMessage: "ingredient name" })}
                          aria-label={intl.formatMessage({ id: "recipePreviewModal.ingredientLabel", defaultMessage: "ingredient name" })}
                        />
                      </div>
                      <button className="removeBtn" onClick={() => removeIng(set, i)} type="button" aria-label={intl.formatMessage({ id: "recipePreviewModal.remove", defaultMessage: "remove" })}>{SYMBOLS.multiplySign}</button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        <button className="addRowBtn" onClick={() => set(prev => [...prev, emptyIng()])} type="button">
          <FormattedMessage id="recipePreviewModal.addIngredient" defaultMessage="+ Add ingredient" />
        </button>
      </>
    );
  };

  return (
    <div className="modalOverlay">
      <div className="parseModalContent">

        {manualEntry && (
          <div className="parseBanner">
            <FormattedMessage id="recipePreviewModal.manualBanner" defaultMessage="We couldn't parse this recipe automatically. Fill in the fields below — your original text is shown for reference." />
          </div>
        )}

        <input
          className="editInput titleInput"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={intl.formatMessage({ id: "recipePreviewModal.title", defaultMessage: "Recipe title" })}
          aria-label={intl.formatMessage({ id: "recipePreviewModal.title", defaultMessage: "Recipe title" })}
        />

        <input
          className="editInput descriptionInput"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={intl.formatMessage({ id: "recipePreviewModal.description", defaultMessage: "Recipe description" })}
          aria-label={intl.formatMessage({ id: "recipePreviewModal.description", defaultMessage: "Recipe description" })}
        />

        {confidence && (
          <div className="confidenceSection">
            <div className="confidenceSectionLabel"><FormattedMessage id="recipePreviewModal.confidence" defaultMessage="Parse confidence" /></div>
            {[
              ["title", intl.formatMessage({ id: "recipePreviewModal.confidenceTitle", defaultMessage: "Title" }), confidence.title],
              ["ingredients", intl.formatMessage({ id: "recipePreviewModal.confidenceIngredients", defaultMessage: "Ingredients" }), confidence.ingredients],
              ["instructions", intl.formatMessage({ id: "recipePreviewModal.confidenceInstructions", defaultMessage: "Instructions" }), confidence.instructions],
            ].map(([key, label, score]) => {
              const { label: cl, color } = confidenceLabel(score as number, intl);
              return (
                <div key={key as string} className="confidenceRow">
                  <span>{label}</span>
                  <span className="confidenceBadge" style={{ color }}>{cl}</span>
                </div>
              );
            })}
          </div>
        )}

        {originalText && (manualEntry || lowConfidence) && (
          <div className="originalTextSection">
            <div className="originalTextLabel"><FormattedMessage id="recipePreviewModal.originalText" defaultMessage="Original recipe text" /></div>
            <textarea
              className="originalTextArea"
              readOnly
              value={originalText}
              rows={10}
              aria-label={intl.formatMessage({ id: "recipePreviewModal.originalText", defaultMessage: "Original recipe text" })}
            />
          </div>
        )}

        {hasMeta && (
          <div className="parsedMeta">
            {recipe.servings && <span><FormattedMessage id="recipePreviewModal.servings" defaultMessage="{servings} servings" values={{ servings: recipe.servings }} /></span>}
            {recipe.prepTime && <span><FormattedMessage id="recipePreviewModal.prepTime" defaultMessage="Prep: {time}" values={{ time: recipe.prepTime }} /></span>}
            {recipe.cookTime && <span><FormattedMessage id="recipePreviewModal.cookTime" defaultMessage="Cook: {time}" values={{ time: recipe.cookTime }} /></span>}
            {recipe.additionalTime && <span><FormattedMessage id="recipePreviewModal.additionalTime" defaultMessage="Additional: {time}" values={{ time: recipe.additionalTime }} /></span>}
          </div>
        )}

        <h2><FormattedMessage id="recipePreviewModal.ingredients" defaultMessage="Ingredients" /></h2>
        {renderIngredientList(doughIngredients, setDoughIngredients)}

        {otherIngredients.length > 0 && (
          <>
            <h2><FormattedMessage id="recipePreviewModal.otherIngredients" defaultMessage="Other ingredients" /></h2>
            {renderIngredientList(otherIngredients, setOtherIngredients)}
          </>
        )}

        <h2><FormattedMessage id="recipePreviewModal.instructions" defaultMessage="Instructions" /></h2>
        <ol className="instructionEditList">
          {instructions.map((inst, i) => (
            <li key={i} className="instructionRow">
              <textarea
                className="editInput instInput"
                value={inst}
                onChange={e => setInstructions(prev => prev.map((s, idx) => idx === i ? e.target.value : s))}
                rows={2}
                aria-label={intl.formatMessage({ id: "recipePreviewModal.stepLabel", defaultMessage: "Step {number}" }, { number: i + 1 })}
              />
              <button
                className="removeBtn"
                onClick={() => setInstructions(prev => prev.filter((_, idx) => idx !== i))}
                type="button"
                aria-label={intl.formatMessage({ id: "recipePreviewModal.removeStep", defaultMessage: "remove step" })}
              >{SYMBOLS.multiplySign}</button>
            </li>
          ))}
        </ol>
        <button className="addRowBtn" onClick={() => setInstructions(prev => [...prev, ""])} type="button">
          <FormattedMessage id="recipePreviewModal.addStep" defaultMessage="+ Add step" />
        </button>

        <div className="modalActions">
          {(hasQuantityError || error) && (
            <p className="errorText">
              {hasQuantityError
                ? intl.formatMessage({ id: "recipePreviewModal.quantityError", defaultMessage: "One or more quantities couldn't be read. Check ingredient amounts." })
                : error}
            </p>
          )}
          <Button onClick={handleSave} disabled={
            loading ||
            !title.trim() ||
            !description.trim() ||
            ![...doughIngredients, ...otherIngredients].some(i => i.ingredientName.trim()) ||
            !instructions.some(s => s.trim())
          }>
            {loading
              ? intl.formatMessage({ id: "recipePreviewModal.saving", defaultMessage: "Saving..." })
              : intl.formatMessage({ id: "recipePreviewModal.save", defaultMessage: "Save Recipe" })}
          </Button>
          <Button onClick={onClose} type="secondary" disabled={loading}>
            <FormattedMessage id="recipePreviewModal.close" defaultMessage="Close" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipePreviewModal;
