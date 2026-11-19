import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "../Button/button";
import "./copyPasteInputForm.css"
import { useParseRecipe } from "../../Hooks/useParseRecipe";
import RecipePreviewModal from "../RecipePreviewModal/recipePreviewModal";
import { useRecipeActions } from "../../Context/RecipeActionsContext";
import { useToastContext } from "../../Context/ToastContext";

const CopyPasteInputForm = () => {
  const intl = useIntl();
  const { refreshRecipes } = useRecipeActions();
  const { addToast } = useToastContext();
  const [text, setText] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [originalText, setOriginalText] = useState<string>("");

  const { recipe, loading, error, parseFailed, parseRecipe, clearError } = useParseRecipe();

  const errorText = error?.kind === "empty"
    ? intl.formatMessage({ id: "copyPasteInputForm.emptyError", defaultMessage: "Recipe text cannot be empty." })
    : error?.message ?? intl.formatMessage({ id: "copyPasteInputForm.parseError", defaultMessage: "Failed to parse recipe." });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (error) clearError();
  };

  const handleParse = async () => {
    const ok = await parseRecipe(text);
    if (ok) {
      setOriginalText(text);
      setShowPreview(true);
    }
  }

  const handleManualEntry = () => {
    setOriginalText(text);
    clearError();
    setShowPreview(true);
  };

  const handleClose = () => setShowPreview(false);

  const handleSaved = () => {
    setText("");
    addToast(intl.formatMessage({ id: "recipePreviewModal.saved", defaultMessage: "Recipe saved" }), "success");
    refreshRecipes();
  };

  return (
    <div className="copyPasteForm">
      <label htmlFor="copyPasteTextArea" className="copyPasteLabel">
        <FormattedMessage id="copyPasteInputForm.label" defaultMessage="Add a recipe" />
      </label>
      <p id="copyPasteHelper" className="copyPasteHelper">
        <FormattedMessage id="copyPasteInputForm.helper" defaultMessage="Paste a recipe from anywhere, with its ingredients and steps. We'll sort it into fields you can review before saving." />
      </p>
      <textarea
        id="copyPasteTextArea"
        aria-describedby="copyPasteHelper"
        className="textAreaStyles"
        value={text}
        onChange={handleChange}
        placeholder={intl.formatMessage({ id: "copyPasteInputForm.placeholder", defaultMessage: "Paste your recipe here..." })}
      ></textarea>
      <Button
        onClick={handleParse}
        disabled={!text.trim() || loading}
      >
        {loading
          ? intl.formatMessage({ id: "copyPasteInputForm.parsing", defaultMessage: "Parsing..." })
          : intl.formatMessage({ id: "copyPasteInputForm.parse", defaultMessage: "Parse" })}
      </Button>

      {error && (
        <div className="parseErrorBlock">
          <p className="parseErrorText">{errorText}</p>
          {parseFailed && (
            <button className="manualEntryBtn" onClick={handleManualEntry} type="button">
              <FormattedMessage id="copyPasteInputForm.enterManually" defaultMessage="Enter manually" />
            </button>
          )}
        </div>
      )}

      {showPreview && (
        <RecipePreviewModal
          recipe={recipe}
          originalText={originalText}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default CopyPasteInputForm;
