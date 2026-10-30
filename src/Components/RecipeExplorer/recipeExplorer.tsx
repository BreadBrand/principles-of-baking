import { useContext } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { RecipeContext } from "../../Context/RecipeContext";
import RecipeCard from "../RecipeCard/recipeCard";
import RecipeDetailView from "../RecipeDetailView/recipeDetailView";
import "./recipeExplorer.css";
import RecipeDrawer from "../RecipeDrawer/recipeDrawer";
import { useDrawer } from "../../Context/DrawerContext";
import WaveText from "../WaveText/waveText";
import useRecipeFilter from "../../Hooks/useRecipeFilter";
import useSyncRecipeUrl from "../../Hooks/useSyncRecipeUrl";

const RecipeExplorer = () => {
  const recipes = useContext(RecipeContext);
  const intl = useIntl();
  const { selectedId, setSelectedId } = useDrawer();
  const { filteredRecipes, searchTerm, setSearchTerm } = useRecipeFilter(recipes);
  const { pendingUrlId } = useSyncRecipeUrl();

  const selectedRecipe = recipes.find(r => r.id === selectedId) ?? null;
  const isLoading = recipes.length === 0 && (selectedId !== null || pendingUrlId !== undefined);
  const isNotFound = !isLoading && selectedId !== null && !recipes.some(r => r.id === selectedId);

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
            placeholder={intl.formatMessage({ id: "recipeExplorer.searchPlaceholder", defaultMessage: "Search recipes…" })}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            aria-label={intl.formatMessage({ id: "recipeExplorer.searchLabel", defaultMessage: "Search recipes" })}
          />
          {showCount && (
            <p className="recipeCount">{intl.formatMessage(
              { id: "recipeExplorer.count", defaultMessage: "{shown} of {total, plural, one {# recipe} other {# recipes}}" },
              { shown: filteredRecipes.length, total: recipes.length },
            )}</p>
          )}
        </div>
        <div className="recipeCardsList">
          {filteredRecipes.length === 0 ? (
            <p className="noRecipesMessage">
              <FormattedMessage id="recipeExplorer.noResults" defaultMessage="No recipes match your search." />
            </p>
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
          <RecipeDetailView key={selectedRecipe.id} recipe={selectedRecipe} />
        ) : isLoading ? (
          <div className="promptContainer">
            <p className="desktopPrompt"><FormattedMessage id="recipeExplorer.loading" defaultMessage="Loading recipe…" /></p>
            <p className="mobilePrompt"><FormattedMessage id="recipeExplorer.loading" defaultMessage="Loading recipe…" /></p>
          </div>
        ) : isNotFound ? (
          <div className="promptContainer">
            <p className="desktopPrompt"><FormattedMessage id="recipeExplorer.notFound" defaultMessage="Recipe not found" /></p>
            <p className="mobilePrompt"><FormattedMessage id="recipeExplorer.notFound" defaultMessage="Recipe not found" /></p>
          </div>
        ) : (
          <div className="promptContainer">
            <p className="desktopPrompt">
              <FormattedMessage id="recipeExplorer.selectPrompt" defaultMessage="Select a recipe to view details" />
            </p>
            <p className="mobilePrompt">
              <FormattedMessage
                id="recipeExplorer.drawerPrompt"
                defaultMessage="Click the <wave>bouncing bread icon</wave> to see a list of recipes"
                values={{ wave: (chunks) => <WaveText text={chunks.join("")} /> }}
              />
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipeExplorer;
