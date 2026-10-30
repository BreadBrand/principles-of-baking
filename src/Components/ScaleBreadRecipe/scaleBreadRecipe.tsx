import { useContext, useState, useMemo, ChangeEvent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import InputWithLabel from "../InputWithLabel/inputWithLabel";
import DropDown from "../DropDown/DropDown";
import { RecipeContext } from "../../Context/RecipeContext";
import Button from "../Button/button";
import { scaleRecipe, buildScaledRecipe, getGrams } from "../../Utility/scaleRecipe";
import RecipeDetailView from "../RecipeDetailView/recipeDetailView";
import "./scaleBreadRecipe.css";
import { SYMBOLS } from "../../Constants/untranslated";

const QUICK_SCALES = [
  { factor: 0.5, label: "½" },
  { factor: 2, label: `${SYMBOLS.multiplySign}2` },
  { factor: 3, label: `${SYMBOLS.multiplySign}3` },
];

const ScaleBreadRecipe = () => {
  const recipes = useContext(RecipeContext);
  const intl = useIntl();
  const [selectedIdOverride, setSelectedIdOverride] = useState<string | null>(null);
  const [totalDough, setTotalDough] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  const selectedId = selectedIdOverride ?? recipes[0]?.id ?? "";

  const recipe = useMemo(
    () => recipes.find((r) => r.id === selectedId),
    [recipes, selectedId]
  );

  const scaledRecipe = useMemo(() => {
    if (!recipe || !showResult) return null;
    const scaled = scaleRecipe(recipe.doughIngredients, totalDough);
    return buildScaledRecipe(recipe, scaled, totalDough);
  }, [recipe, totalDough, showResult]);

  const handleRecipeChange = (value: string) => {
    setSelectedIdOverride(value);
    setShowResult(false);
  };

  const handleDoughChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalDough(Number(e.target.value));
    setShowResult(false);
  };

  const handlePrepare = () => {
    if (!recipe || totalDough <= 0) return;
    setShowResult(true);
  };

  const handleQuickScale = (factor: number) => {
    if (!recipe) return;
    const originalWeight = recipe.doughIngredients
      .filter(i => i.bakerPercentage > 0)
      .reduce((sum, i) => sum + getGrams(i), 0);
    setTotalDough(Math.round(originalWeight * factor));
    setShowResult(true);
  };

  if (recipes.length === 0) {
    return <p className="scaleEmpty">
        <FormattedMessage id="scaleBreadRecipe.empty" defaultMessage="No recipes available. Check your connection and try again." />
      </p>;
  }

  if (showResult && scaledRecipe) {
    return (
      <div className="scaleResultContainer">
        <div className="scaleResultHeader">
          <Button onClick={() => { setShowResult(false); setTotalDough(0); }} className="scaleBackBtn" aria-label={intl.formatMessage({ id: "scaleBreadRecipe.backLabel", defaultMessage: "Back to scaler" })}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Button>
          <div className="scalePrintGroup">
            <button className="scalePrintButton" onClick={() => window.print()}>
              <FormattedMessage id="scaleBreadRecipe.savePdf" defaultMessage="Save as PDF" />
            </button>
            <span className="scalePrintHint">
              <FormattedMessage id="scaleBreadRecipe.printHint" defaultMessage='Select "Save as PDF" in the print dialog' />
            </span>
          </div>
        </div>
        <RecipeDetailView key={scaledRecipe.id} recipe={scaledRecipe} />
      </div>
    );
  }

  return (
    <div className="scaleContainer">
      <div className="scaleIntro">
        <h2 className="scaleTitle"><FormattedMessage id="scaleBreadRecipe.title" defaultMessage="Scale a Recipe" /></h2>
        <p className="scaleSubtitle">
          <FormattedMessage id="scaleBreadRecipe.subtitle" defaultMessage="Enter your target dough weight and we'll calculate each ingredient using baker's percentages." />
        </p>
      </div>
      <div className="scaleForm">
        <DropDown
          label={intl.formatMessage({ id: "scaleBreadRecipe.recipe", defaultMessage: "Recipe" })}
          value={selectedId}
          options={recipes}
          onChange={(e) => handleRecipeChange(e.target.value)}
          id="recipe-selector"
        />
        <div className="scaleQuickButtons">
          {QUICK_SCALES.map(({ factor, label }) => (
            <Button key={factor} onClick={() => handleQuickScale(factor)} disabled={!recipe}>{label}</Button>
          ))}
        </div>
        <InputWithLabel
          label={intl.formatMessage({ id: "scaleBreadRecipe.targetWeight", defaultMessage: "Target dough weight (g)" })}
          value={totalDough > 0 ? totalDough.toString() : ""}
          onChange={handleDoughChange}
          id="dough-needed"
          type="number"
          placeholder={intl.formatMessage({ id: "scaleBreadRecipe.targetWeightPlaceholder", defaultMessage: "e.g. 800" })}
        />
      </div>
      <Button onClick={handlePrepare} disabled={!recipe || totalDough <= 0}>
        <FormattedMessage id="scaleBreadRecipe.prepare" defaultMessage="Prepare Recipe" />
      </Button>
    </div>
  );
};

export default ScaleBreadRecipe;
