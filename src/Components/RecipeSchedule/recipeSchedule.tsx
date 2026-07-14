import { useContext, useEffect, useState } from "react";
import DropDown from "../DropDown/DropDown";
import Calendar from "../Calendar/Calendar";
import { RecipeContext } from "../../App";
import "./recipeSchedule.css";

const RecipeSchedule = () => {
  const recipes = useContext(RecipeContext);
  const [selectedId, setSelectedId] = useState<string>(recipes[0]?.id ?? "");

  useEffect(() => {
    if (recipes.length > 0 && !selectedId) {
      setSelectedId(recipes[0].id);
    }
  }, [recipes]);

  const handleRecipeChange = (value: string) => {
    setSelectedId(value);
  };

  return (
    <div className="calendarLayout">
      <DropDown
        label="Recipe"
        value={selectedId}
        options={recipes}
        onChange={(e) => handleRecipeChange(e.target.value)}
        id="recipe-selector"
      />
      <div>desired date to eat</div>
      <Calendar />
    </div>
  );
};

export default RecipeSchedule;
