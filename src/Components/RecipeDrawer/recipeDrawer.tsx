import { useDrawer } from "../../Context/DrawerContext";
import { isStarter } from "../../Utility/ingredientMatchers";
import { Recipe } from "../../types/models";
import "./recipeDrawer.css";

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
            placeholder="Search recipes…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search recipes"
          />
          {showCount && (
            <p className="drawerSearchCount">{filteredRecipes.length} of {totalRecipes} recipes</p>
          )}
        </div>
        <div className="recipeDrawerContent">
          {filteredRecipes.length === 0 ? (
            <p className="drawerNoResults">No recipes match your search.</p>
          ) : (
            filteredRecipes.map(recipe => {
              const yeastLabel = recipe.doughIngredients.some(i => isStarter(i.ingredientName))
                ? "sourdough"
                : "dry yeast";
              return (
                <button
                  key={recipe.id}
                  className={`recipeDrawerItem ${recipe.id === selectedId ? "active" : ""}`}
                  onClick={() => handleSelect(recipe.id)}
                >
                  {recipe.title}
                  <span className={`drawerYeastBadge${yeastLabel === "dry yeast" ? " drawerYeastBadgeDry" : ""}`}>{yeastLabel}</span>
                </button>
              );
            })
          )}
        </div>
        <button className="recipeCloseButton" onClick={closeRecipeDrawer}>
          ✕
        </button>
      </div>
    </>
  );
};

export default RecipeDrawer;
