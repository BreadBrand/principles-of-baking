import { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl, type IntlShape } from "react-intl";
import useCreateRecipe from "../../Hooks/UseCreateRecipe";
import { parseFraction } from "../../Utility/parseFraction";
import { type RecipeDTO, type IngredientDTO, type Unit } from "../../types/dto";
import { groupByPhase } from "../../Utility/groupByPhase";
import { hasUnsavedEdits } from "../../Utility/hasUnsavedEdits";
import { toDurationFields, toTotalMinutes } from "../../Utility/recipeDuration";
import DurationInput from "../DurationInput/durationInput";
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

const buildInitialState = (recipe: RecipeDTO | null) => ({
  title: recipe?.title ?? "",
  description: recipe?.description ?? "",
  doughIngredients: (recipe?.doughIngredients ?? []).map(ing => ({
    ...ing,
    quantity: ing.quantity.toString(),
    ingredientName: ing.ingredientName || ing.rawLine,
  })) as EditIngredient[],
  otherIngredients: (recipe?.otherIngredients ?? []).map(ing => ({
    ...ing,
    quantity: ing.quantity.toString(),
  })) as EditIngredient[],
  instructions: recipe?.instructions ?? [],
  servings: recipe?.servings ?? "",
  prepTime: toDurationFields(recipe?.prepTime),
  cookTime: toDurationFields(recipe?.cookTime),
  additionalTime: toDurationFields(recipe?.additionalTime),
});

const RecipePreviewModal = ({ recipe, originalText, onClose, onSaved }: RecipePreviewModalProps) => {
  const { createRecipe, loading, error, clearError } = useCreateRecipe();
  const intl = useIntl();
  const [hasQuantityError, setHasQuantityError] = useState(false);
  const [hasTimeError, setHasTimeError] = useState(false);

  const manualEntry = !recipe;
  const lowConfidence = recipe
    ? recipe.confidence.ingredients < 0.4 || recipe.confidence.instructions < 0.4
    : false;

  const [initialState] = useState(() => buildInitialState(recipe));
  const [title, setTitle] = useState(initialState.title);
  const [description, setDescription] = useState(initialState.description);
  const [doughIngredients, setDoughIngredients] = useState<EditIngredient[]>(initialState.doughIngredients);
  const [otherIngredients, setOtherIngredients] = useState<EditIngredient[]>(initialState.otherIngredients);
  const [instructions, setInstructions] = useState<string[]>(initialState.instructions);
  const [servings, setServings] = useState(initialState.servings);
  const [prepTime, setPrepTime] = useState(initialState.prepTime);
  const [cookTime, setCookTime] = useState(initialState.cookTime);
  const [additionalTime, setAdditionalTime] = useState(initialState.additionalTime);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const discardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  const requestClose = () => {
    if (loading) return;
    const edited = hasUnsavedEdits(initialState, { title, description, doughIngredients, otherIngredients, instructions, servings, prepTime, cookTime, additionalTime });
    if (edited) {
      setConfirmingDiscard(true);
    } else {
      onClose();
    }
  };

  const wasConfirmingDiscard = useRef(false);

  useEffect(() => {
    if (confirmingDiscard) {
      discardRef.current?.focus();
    } else if (wasConfirmingDiscard.current) {
      dialogRef.current?.focus();
    }
    wasConfirmingDiscard.current = confirmingDiscard;
  }, [confirmingDiscard]);

  const cancelDiscard = () => setConfirmingDiscard(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    requestClose();
  };

  const handleDiscardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    cancelDiscard();
  };

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
    setHasTimeError(false);
    clearError();
    const allIngs = [...doughIngredients, ...otherIngredients].filter(i => i.ingredientName.trim());
    for (const ing of allIngs) {
      if (parseFraction(ing.quantity) === null) {
        setHasQuantityError(true);
        return;
      }
    }

    const prepMinutes = toTotalMinutes(prepTime);
    const cookMinutes = toTotalMinutes(cookTime);
    const additionalMinutes = toTotalMinutes(additionalTime);
    if (prepMinutes === null || cookMinutes === null || additionalMinutes === null) {
      setHasTimeError(true);
      return;
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
      meta: {
        ...(servings.trim() ? { servings: servings.trim() } : {}),
        prepTime: prepMinutes,
        cookTime: cookMinutes,
        additionalTime: additionalMinutes,
      },
    });
    if (result.ok) { onClose(); onSaved?.(); }
  };

  const confidence = recipe?.confidence;

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
      <div
        className="parseModalContent"
        inert={confirmingDiscard}
        role="dialog"
        aria-modal="true"
        aria-label={intl.formatMessage({ id: "recipePreviewModal.dialogLabel", defaultMessage: "Review and save recipe" })}
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={handleKeyDown}
      >

        {manualEntry && (
          <div className="parseBanner">
            <FormattedMessage id="recipePreviewModal.manualBanner" defaultMessage="We couldn't parse this recipe automatically. Fill in the fields below — your original text is shown for reference." />
          </div>
        )}

        <input
          className={`editInput titleInput${title.trim() ? "" : " fieldMissing"}`}
          aria-required="true"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={intl.formatMessage({ id: "recipePreviewModal.title", defaultMessage: "Recipe title" })}
          aria-label={intl.formatMessage({ id: "recipePreviewModal.title", defaultMessage: "Recipe title" })}
        />
        {!title.trim() && <span className="fieldMissingText"><FormattedMessage id="recipePreviewModal.required" defaultMessage="Required" /></span>}

        <input
          className={`editInput descriptionInput${description.trim() ? "" : " fieldMissing"}`}
          aria-required="true"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={intl.formatMessage({ id: "recipePreviewModal.description", defaultMessage: "Recipe description" })}
          aria-label={intl.formatMessage({ id: "recipePreviewModal.description", defaultMessage: "Recipe description" })}
        />
        {!description.trim() && <span className="fieldMissingText"><FormattedMessage id="recipePreviewModal.required" defaultMessage="Required" /></span>}

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

        <h2><FormattedMessage id="recipePreviewModal.details" defaultMessage="Details" /></h2>
        <div className="detailsGrid">
          <label className="servingsField">
            <span className="durationLabel"><FormattedMessage id="recipePreviewModal.servingsLabel" defaultMessage="Servings" /></span>
            <input
              type="text"
              className="editInput servingsInput"
              value={servings}
              onChange={e => setServings(e.target.value)}
              placeholder={intl.formatMessage({ id: "recipePreviewModal.servingsPlaceholder", defaultMessage: "e.g. 2 loaves" })}
            />
          </label>
          <DurationInput label={intl.formatMessage({ id: "recipePreviewModal.prepTimeLabel", defaultMessage: "Prep time" })} value={prepTime} onChange={setPrepTime} />
          <DurationInput label={intl.formatMessage({ id: "recipePreviewModal.cookTimeLabel", defaultMessage: "Cook time" })} value={cookTime} onChange={setCookTime} />
          <DurationInput label={intl.formatMessage({ id: "recipePreviewModal.additionalTimeLabel", defaultMessage: "Additional time" })} value={additionalTime} onChange={setAdditionalTime} />
        </div>

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
          {(hasQuantityError || hasTimeError || error) && (
            <p className="errorText">
              {hasQuantityError
                ? intl.formatMessage({ id: "recipePreviewModal.quantityError", defaultMessage: "One or more quantities couldn't be read. Check ingredient amounts." })
                : hasTimeError
                  ? intl.formatMessage({ id: "recipePreviewModal.timeError", defaultMessage: "Times must be whole hours and minutes, up to 7 days." })
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
          <Button onClick={requestClose} type="secondary" disabled={loading}>
            <FormattedMessage id="recipePreviewModal.close" defaultMessage="Close" />
          </Button>
        </div>
      </div>
      {confirmingDiscard && (
        <div className="modalOverlay discardOverlay">
          <div
            className="discardDialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="discardPromptText"
            tabIndex={-1}
            ref={discardRef}
            onKeyDown={handleDiscardKeyDown}
          >
            <p id="discardPromptText" className="discardPromptText">
              <FormattedMessage id="recipePreviewModal.discardPrompt" defaultMessage="Discard your changes?" />
            </p>
            <div className="discardActions">
              <Button onClick={cancelDiscard}>
                <FormattedMessage id="recipePreviewModal.keepEditing" defaultMessage="Keep editing" />
              </Button>
              <Button onClick={onClose} type="secondary">
                <FormattedMessage id="recipePreviewModal.discard" defaultMessage="Discard" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipePreviewModal;
