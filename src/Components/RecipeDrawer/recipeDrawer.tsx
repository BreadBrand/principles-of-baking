import { useIntl } from "react-intl";
import { useDrawer } from "../../Context/DrawerContext";
import { isStarter } from "../../Utility/ingredientMatchers";
import { Recipe } from "../../types/models";
import "./recipeDrawer.css";
import { SYMBOLS } from "../../Constants/untranslated";

type RecipeDrawerProps = {
  onSelectRecipe: (id: string) => void;
  selectedId: string | null;
  filteredRecipes: Recipe[];
  totalRecipes: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

const RecipeDrawer = ({
  onSelectRecipe,
  selectedId,
  filteredRecipes,
  totalRecipes,
  searchTerm,
  setSearchTerm,
}: RecipeDrawerProps) => {
  const { isRecipeDrawerOpen, closeRecipeDrawer } = useDrawer();
  const intl = useIntl();

  const handleSelect = (id: string) => {
    onSelectRecipe(id);
    closeRecipeDrawer();
  };

  const showCount = filteredRecipes.length > 0 && filteredRecipes.length < totalRecipes;

  return (
    <>
      <div
        className={`recipeDrawerOverlay ${isRecipeDrawerOpen ? "open" : ""}`}
        onClick={closeRecipeDrawer}
      />
      <div className={`recipeDrawer ${isRecipeDrawerOpen ? "open" : ""}`} inert={isRecipeDrawerOpen ? undefined : true}>
        <div className="drawerSearchWrapper">
          <input
            className="drawerSearchInput"
            type="search"
            placeholder={intl.formatMessage({ id: "recipeDrawer.searchPlaceholder", defaultMessage: "Search recipes…" })}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label={intl.formatMessage({ id: "recipeDrawer.searchLabel", defaultMessage: "Search recipes" })}
          />
          {showCount && (
            <p className="drawerSearchCount">{intl.formatMessage(
              { id: "recipeDrawer.count", defaultMessage: "{shown} of {total, plural, one {# recipe} other {# recipes}}" },
              { shown: filteredRecipes.length, total: totalRecipes },
            )}</p>
          )}
        </div>
        <div className="recipeDrawerContent">
          {filteredRecipes.length === 0 ? (
            <p className="drawerNoResults">{intl.formatMessage({ id: "recipeDrawer.noResults", defaultMessage: "No recipes match your search." })}</p>
          ) : (
            filteredRecipes.map(recipe => {
              const isSourdough = recipe.doughIngredients.some(i => isStarter(i.ingredientName));
              const yeastLabel = isSourdough
                ? intl.formatMessage({ id: "recipeDrawer.sourdough", defaultMessage: "sourdough" })
                : intl.formatMessage({ id: "recipeDrawer.dryYeast", defaultMessage: "dry yeast" });
              return (
                <button
                  key={recipe.id}
                  className={`recipeDrawerItem ${recipe.id === selectedId ? "active" : ""}`}
                  onClick={() => handleSelect(recipe.id)}
                >
                  {recipe.title}
                  <span className={`drawerYeastBadge${isSourdough ? "" : " drawerYeastBadgeDry"}`}>{yeastLabel}</span>
                </button>
              );
            })
          )}
        </div>
        <button
          className="recipeCloseButton"
          onClick={closeRecipeDrawer}
          aria-label={intl.formatMessage({ id: "recipeDrawer.close", defaultMessage: "Close recipe list" })}
        >
          {SYMBOLS.closeCross}
        </button>
      </div>
    </>
  );
};

export default RecipeDrawer;
