import { useState, useEffect } from "react";
import { Recipe } from "../../types/models";
import UnitToggle from "../UnitToggle/UnitToggle";
import YeastToggle from "../YeastToggle/YeastToggle";
import useConvertYeast, { YeastType } from "../../Hooks/useConvertYeast";
import { isStarter, isWater, isYeast } from "../../Utility/ingredientMatchers";
import { formatIngredientDisplay } from "../../Utility/formatIngredientDisplay";
import "./recipeDetailView.css";

type RecipeDetailViewProps = {
  recipe: Recipe | null;
};

function inferBaseYeastType(recipe: Recipe): YeastType {
  return recipe.yeastType ?? (recipe.doughIngredients.some(i => isStarter(i.ingredientName)) ? "sourdough" : "dry");
}

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
    setYeastType(inferBaseYeastType(recipe));
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

  const baseYeastType: YeastType = inferBaseYeastType(recipe);
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
                {formatIngredientDisplay(ing, unit)}
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
