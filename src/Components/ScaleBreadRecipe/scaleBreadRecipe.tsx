import { useContext, useState, useMemo, useEffect, ChangeEvent } from "react";
import InputWithLabel from "../InputWithLabel/inputWithLabel";
import DropDown from "../DropDown/DropDown";
import { RecipeContext } from "../../Context/RecipeContext";
import Button from "../Button/button";
import { scaleRecipe, buildScaledRecipe, getGrams } from "../../Utility/scaleRecipe";
import RecipeDetailView from "../RecipeDetailView/recipeDetailView";
import "./scaleBreadRecipe.css";

const ScaleBreadRecipe = () => {
  const recipes = useContext(RecipeContext);
  const [selectedId, setSelectedId] = useState<string>(recipes[0]?.id ?? "");
  const [totalDough, setTotalDough] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (recipes.length > 0 && !selectedId) {
      setSelectedId(recipes[0].id);
    }
  }, [recipes]);

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
    setSelectedId(value);
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
    return <p className="scaleEmpty">No recipes available. Check your connection and try again.</p>;
  }

  if (showResult && scaledRecipe) {
    return (
      <div className="scaleResultContainer">
        <div className="scaleResultHeader">
          <Button onClick={() => { setShowResult(false); setTotalDough(0); }} className="scaleBackBtn" aria-label="Back to scaler">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Button>
          <div className="scalePrintGroup">
            <button className="scalePrintButton" onClick={() => window.print()}>
              Save as PDF
            </button>
            <span className="scalePrintHint">Select "Save as PDF" in the print dialog</span>
          </div>
        </div>
        <RecipeDetailView recipe={scaledRecipe} />
      </div>
    );
  }

  return (
    <div className="scaleContainer">
      <div className="scaleIntro">
        <h2 className="scaleTitle">Scale a Recipe</h2>
        <p className="scaleSubtitle">
          Enter your target dough weight and we'll calculate each ingredient using baker's percentages.
        </p>
      </div>
      <div className="scaleForm">
        <DropDown
          label="Recipe"
          value={selectedId}
          options={recipes}
          onChange={(e) => handleRecipeChange(e.target.value)}
          id="recipe-selector"
        />
        <div className="scaleQuickButtons">
          <Button onClick={() => handleQuickScale(0.5)} disabled={!recipe}>½</Button>
          <Button onClick={() => handleQuickScale(2)} disabled={!recipe}>×2</Button>
          <Button onClick={() => handleQuickScale(3)} disabled={!recipe}>×3</Button>
        </div>
        <InputWithLabel
          label="Target dough weight (g)"
          value={totalDough > 0 ? totalDough.toString() : ""}
          onChange={handleDoughChange}
          id="dough-needed"
          type="number"
          placeholder="e.g. 800"
        />
      </div>
      <Button onClick={handlePrepare} disabled={!recipe || totalDough <= 0}>
        Prepare Recipe
      </Button>
    </div>
  );
};

export default ScaleBreadRecipe;
