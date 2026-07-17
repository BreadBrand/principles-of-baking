import { useContext } from "react";
import { RecipeContext } from "../../Context/RecipeContext";
import RecipeCard from "../RecipeCard/recipeCard";
import RecipeDetailView from "../RecipeDetailView/recipeDetailView";
import "./recipeExplorer.css";
import RecipeDrawer from "../RecipeDrawer/recipeDrawer";
import { useDrawer } from "../../Context/DrawerContext";
import WaveText from "../WaveText/waveText";
import useRecipeFilter from "../../Hooks/useRecipeFilter";

const RecipeExplorer = () => {
  const recipes = useContext(RecipeContext);
  const { selectedId, setSelectedId } = useDrawer();
  const { filteredRecipes, searchTerm, setSearchTerm } = useRecipeFilter(recipes);

  const selectedRecipe = filteredRecipes.find(r => r.id === selectedId) ?? null;

  const showCount = filteredRecipes.length < recipes.length;

  return (
    <div className="exploreContainer">
      <RecipeDrawer
        onSelectRecipe={setSelectedId}
        selectedId={selectedId}
        filteredRecipes={filteredRecipes}
        totalRecipes={recipes.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <aside className="recipeCards">
        <div className="recipeSearchWrapper">
          <input
            className="recipeSearchInput"
            type="search"
            placeholder="Search recipes…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search recipes"
          />
          {showCount && (
            <p className="recipeCount">{filteredRecipes.length} of {recipes.length} recipes</p>
          )}
        </div>
        <div className="recipeCardsList">
          {filteredRecipes.length === 0 ? (
            <p className="noRecipesMessage">No recipes match your search.</p>
          ) : (
            filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isActive={recipe.id === selectedId}
                onClick={() => setSelectedId(recipe.id)}
              />
            ))
          )}
        </div>
      </aside>
      <main className="recipeView">
        {selectedRecipe ? (
          <RecipeDetailView recipe={selectedRecipe} />
        ) : (
          <div className="promptContainer">
            <p className="desktopPrompt">Select a recipe to view details</p>
            <p className="mobilePrompt">Click the <WaveText text="bouncing bread icon" /> to see a list of recipes</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipeExplorer;
