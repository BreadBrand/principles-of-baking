import { useState } from "react";
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

const VOLUME_UNITS = ["cups", "tbls", "tbsp", "tsp"];

function inferBaseYeastType(recipe: Recipe): YeastType {
  return recipe.yeastType ?? (recipe.doughIngredients.some(i => isStarter(i.ingredientName)) ? "sourdough" : "dry");
}

function inferInitialUnit(recipe: Recipe | null): string {
  if (!recipe) return "g";
  const isVolumeBased = recipe.doughIngredients.some(i => VOLUME_UNITS.includes(i.unit.toLowerCase()));
  return isVolumeBased ? "cups" : "g";
}

// Component is remounted via `key={recipe.id}` at each call site, so these
// lazy initializers re-run per recipe without needing an effect to sync them.
const RecipeDetailView = ({ recipe }: RecipeDetailViewProps) => {
  const [unit, setUnit] = useState(() => inferInitialUnit(recipe));
  const [yeastType, setYeastType] = useState<YeastType>(() => recipe ? inferBaseYeastType(recipe) : "dry");
  const { convertYeast } = useConvertYeast();

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
