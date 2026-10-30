import { ChangeEvent, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import InputWithLabel from "../InputWithLabel/inputWithLabel";
import useCreateRecipe from "../../Hooks/UseCreateRecipe";
import Dropdown from "../DropDown/DropDown";
import TextArea from "../TextArea/TextArea";
import Button from "../Button/button";
import { useToast } from "../../Hooks/useToast";
import YeastToggle from "../YeastToggle/YeastToggle";
import "./addBreadRecipe.css";
import { 
  UNITS, 
  type Unit, 
  type IngredientDraft, 
  type RecipeRequest 
} from "../../types/dto";

const AddBreadRecipe = () => {
  const { createRecipe, loading } = useCreateRecipe();
  const { addToast } = useToast();
  const intl = useIntl();

  const [instructionCount, setInstructionCount] = useState(1);
  const [unit, setUnit] = useState<Unit>(UNITS[0]);
  const [addIngredient, setAddIngredient] = useState<IngredientDraft>({ ingredientName: "", quantity: 0, unit: unit });
  const [addInstruction, setAddInstruction] = useState<string>("");
  const [newRecipe, setNewRecipe] = useState<RecipeRequest>({
    title: "",
    description: "",
    doughIngredients: [],
    instructions: [],
    yeastType: "dry",
  });

  const addIngredientOnClick = () => {
    if (addIngredient) {
      setNewRecipe({ ...newRecipe, doughIngredients: [...newRecipe.doughIngredients, addIngredient] });
      setAddIngredient({ ingredientName: "", quantity: 0, unit: unit });
    }
  }

  const onChangeRecipeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setNewRecipe({ ...newRecipe, title: e.target.value });
  }

  const onChangeRecipeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setNewRecipe({ ...newRecipe, description: e.target.value });
  }

  const onChangeIngredientName = (e: ChangeEvent<HTMLInputElement>) => {
    setAddIngredient({
      ...addIngredient,
      ingredientName: e.target.value
    });
  }

  const onChangeMeasurement = (e: ChangeEvent<HTMLInputElement>) => {
    setAddIngredient({
      ...addIngredient,
      quantity: Number(e.target.value)
    })
  }

  const onSubmit = async () => {
    const success = await createRecipe(newRecipe);
    if (success) {
      addToast(intl.formatMessage({ id: "addBreadRecipe.created", defaultMessage: "Recipe created successfully!" }), "success");
    } else {
      addToast(intl.formatMessage({ id: "addBreadRecipe.failed", defaultMessage: "Failed to create recipe. Please try again." }), "error");
    }
  }

  const addInstructionOnClick = () => {
    setNewRecipe({ ...newRecipe, instructions: [...newRecipe.instructions, `${instructionCount}. ${addInstruction}`] });
    setInstructionCount(instructionCount + 1);
    setAddInstruction("");
  }

  const toggleYeastType = () => {
    setNewRecipe(prev => ({ ...prev, yeastType: prev.yeastType === "dry" ? "sourdough" : "dry" }));
  };

  return (
    <div className="addRecipeContainer">
      <InputWithLabel
        label={intl.formatMessage({ id: "addBreadRecipe.title", defaultMessage: "Title" })}
        value={newRecipe?.title ? newRecipe.title : ""}
        onChange={onChangeRecipeTitle}
        id="recipe-title-input"
      />
      <InputWithLabel
        label={intl.formatMessage({ id: "addBreadRecipe.description", defaultMessage: "Description" })}
        value={newRecipe?.description ? newRecipe.description : ""}
        onChange={onChangeRecipeDescription}
        id="recipe-description-input"
      />
      <div className="flex">
        <InputWithLabel
          label={intl.formatMessage({ id: "addBreadRecipe.addIngredient", defaultMessage: "Add Ingredient" })}
          value={addIngredient?.ingredientName ? addIngredient.ingredientName : ""}
          onChange={onChangeIngredientName}
          id="ingredient-name"
        />
        <InputWithLabel
          label={intl.formatMessage({ id: "addBreadRecipe.measurement", defaultMessage: "measurement" })}
          value={addIngredient.quantity ? addIngredient.quantity.toString() : '0'}
          onChange={onChangeMeasurement}
          id="ingredient-qty"
        />
        <Dropdown
          label={intl.formatMessage({ id: "addBreadRecipe.selectUnit", defaultMessage: "Select Unit: " })}
          value={unit}
          options={UNITS}
          onChange={(e) => setUnit(e.target.value)}
          id="unit"
        />
        <Button
          onClick={addIngredientOnClick}
        >
          <FormattedMessage id="addBreadRecipe.add" defaultMessage="Add" />
        </Button>
      </div>
      <div className="flex">
        <div className="alignSelfFlexStart">
          {intl.formatMessage({ id: "addBreadRecipe.instructionNumber", defaultMessage: "{number}." }, { number: instructionCount })}
        </div>
        <TextArea
          id="add-instruction"
          htmlFor="add-instructions"
          label={intl.formatMessage({ id: "addBreadRecipe.addInstruction", defaultMessage: "Add Instruction" })}
          value={addInstruction}
          setChange={setAddInstruction}
          labelStyle={{ alignSelf: "flex-start"}}
        />
        <Button
          style={{ alignSelf: "flex-start"}}
          onClick={addInstructionOnClick}
        >
          <FormattedMessage id="addBreadRecipe.add" defaultMessage="Add" />
        </Button>
      </div>
      <div>
        {
          newRecipe?.doughIngredients.map(({ ingredientName, quantity, unit }) => (
            <div key={ingredientName + quantity} className="flex">
              <div>
                {intl.formatMessage(
                  { id: "addBreadRecipe.ingredientLine", defaultMessage: "{name}: {quantity}{unit}" },
                  { name: ingredientName, quantity: quantity.toString(), unit },
                )}
              </div>
            </div>
          ))
        }
        {
          newRecipe?.instructions.map((instruction, index) => (
            <div key={instruction + index} className="flex">
              <div>{instruction}</div>
            </div>
          ))
        }
      </div>
      <YeastToggle yeastType={newRecipe.yeastType} onChange={toggleYeastType} />
      <Button style={{alignSelf: "flex-start"}} onClick={onSubmit} disabled={loading}>
        {loading
          ? intl.formatMessage({ id: "addBreadRecipe.sending", defaultMessage: "Sending" })
          : intl.formatMessage({ id: "addBreadRecipe.submit", defaultMessage: "Submit" })}
      </Button>
    </div >
  )
}

export default AddBreadRecipe;
