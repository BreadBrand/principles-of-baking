import { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import DropDown from "../DropDown/DropDown";
import Calendar from "../Calendar/Calendar";
import { RecipeContext } from "../../Context/RecipeContext";
import "./recipeSchedule.css";

const RecipeSchedule = () => {
  const recipes = useContext(RecipeContext);
  const intl = useIntl();
  const [selectedIdOverride, setSelectedIdOverride] = useState<string | null>(null);

  const selectedId = selectedIdOverride ?? recipes[0]?.id ?? "";

  const handleRecipeChange = (value: string) => {
    setSelectedIdOverride(value);
  };

  return (
    <div className="calendarLayout">
      <DropDown
        label={intl.formatMessage({ id: "recipeSchedule.recipe", defaultMessage: "Recipe" })}
        value={selectedId}
        options={recipes}
        onChange={(e) => handleRecipeChange(e.target.value)}
        id="recipe-selector"
      />
      <div><FormattedMessage id="recipeSchedule.desiredDate" defaultMessage="desired date to eat" /></div>
      <Calendar />
    </div>
  );
};

export default RecipeSchedule;
