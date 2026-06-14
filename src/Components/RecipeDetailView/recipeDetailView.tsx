import { useState, useEffect } from "react";
import { Recipe, Ingredient } from "../../types/models";
import UnitToggle from "../UnitToggle/UnitToggle";
import YeastToggle from "../YeastToggle/YeastToggle";
import useConvertYeast, { YeastType } from "../../Hooks/useConvertYeast";
import { isStarter, isWater, isYeast } from "../../Utility/ingredientMatchers";
import "./recipeDetailView.css";
import { CONVERSION_THRESHOLD, CUP_VOLUME, TBLS_VOLUME, TSP_VOLUME } from "../../Utility/constants";
import { tbspToFraction, toFraction } from "../../Utility/helperFunctions";

type RecipeDetailViewProps = {
  recipe: Recipe | null;
};

const RecipeDetailView = ({ recipe }: RecipeDetailViewProps) => {
  const [unit, setUnit] = useState("g")
  const [yeastType, setYeastType] = useState<YeastType>("dry");
  const { convertYeast } = useConvertYeast();

  useEffect(() => {
    if (!recipe) return;
    const volumeUnits = ["cups", "tbls", "tbsp", "tsp"];
    const isVolumeBased = recipe.doughIngredients.some(i =>
      volumeUnits.includes(i.unit.toLowerCase())
    );
    setUnit(isVolumeBased ? "cups" : "g");
    setYeastType(
      recipe.yeastType ?? (recipe.doughIngredients.some(i => isStarter(i.ingredientName)) ? "sourdough" : "dry")
    );
  }, [recipe?.id]);

  if (!recipe) return null;

  const hasWater = recipe.doughIngredients.some(i => isWater(i.ingredientName));
  const hasYeastOrStarter = recipe.doughIngredients.some(i => isYeast(i.ingredientName) || isStarter(i.ingredientName));

  const toggleUnit = () => {
    setUnit(previous => previous === "g" ? "cups" : "g")
  }

  const toggleYeast = () => {
    setYeastType(previous => previous === "dry" ? "sourdough" : "dry");
  };

  const abbreviateUnit = (unit: string) => {
    switch (unit.toLowerCase()) {
      case "grams":
        return "g";
      case "count":
        return "";
      default:
        return unit;
    }
  }

  const displayIngredient = (ing: Ingredient) => {
    if (ing.unit.toLowerCase() === "count") {
      return `${Math.round(ing.quantity)}: ${ing.ingredientName}`;
    }

    const isGrams = ing.unit.toLowerCase() === "grams" || ing.unit.toLowerCase() === "g";
    const isMl = ing.unit.toLowerCase() === "ml";

    if (unit === "g" && !isGrams) {
      if (ing.unit.toLowerCase() === "oz") {
        return `${Math.round(ing.quantity * 28.35)} g: ${ing.ingredientName}`;
      }
      if (ing.grams > 0) {
        return `${ing.grams} g: ${ing.ingredientName}`;
      }
    }

    if (unit === "cups") {
      let ml: number | null = null;
      if (isGrams && ing.densityGPerMl && ing.densityGPerMl > 0) {
        ml = ing.quantity / ing.densityGPerMl;
      } else if (isMl) {
        ml = ing.quantity;
      }

      if (ml !== null) {
        if (ml >= CONVERSION_THRESHOLD) {
          return `${toFraction(ml / CUP_VOLUME)} cups: ${ing.ingredientName}`;
        } else if (ml >= TBLS_VOLUME) {
          return `${tbspToFraction(ml / TBLS_VOLUME)} tbsp: ${ing.ingredientName}`;
        } else {
          return `${tbspToFraction(ml / TSP_VOLUME)} tsp: ${ing.ingredientName}`;
        }
      }
    }

    return `${toFraction(ing.quantity)} ${abbreviateUnit(ing.unit)}: ${ing.ingredientName}`;
  };

  const baseYeastType: YeastType = recipe.yeastType ?? (recipe.doughIngredients.some(i => isStarter(i.ingredientName)) ? "sourdough" : "dry");
  const displayDoughIngredients = yeastType !== baseYeastType
    ? convertYeast(recipe.doughIngredients, baseYeastType)
    : recipe.doughIngredients;
  const displayIngredients = [...displayDoughIngredients, ...(recipe.otherIngredients ?? [])];

  return (
    <div className="recipeDetailView">
      <div className="toggleRow">
        <UnitToggle unit={unit} onChange={toggleUnit} />
        {hasWater && hasYeastOrStarter && (
          <>
            <span className="toggleDivider" />
            <YeastToggle yeastType={yeastType} onChange={toggleYeast} />
          </>
        )}
      </div>
      <h2>{recipe.title}</h2>
      <h5>{recipe.description}</h5>
      <div className="body">
        <div>
          <div className="sectionLabel">Ingredients</div>
          <ul className="ingredients" role="list">
            {displayIngredients.map(ing => (
              <li key={ing.ingredientName}>
                {displayIngredient(ing)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="sectionLabel">Instructions</div>
          <ol className="instructions" role="list">
            {recipe.instructions.map(inst => (
              <li key={inst}>{inst}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
};

export default RecipeDetailView;
