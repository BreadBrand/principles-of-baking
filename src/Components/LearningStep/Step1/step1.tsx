
const Step1 = () => {
  return (
    <div className="stepContent">
      <p>
        This first lesson will cover bakers percentages. Bakers percentages are a way to express the ratio of ingredients in a recipe.
        Understanding bakers percentages will help you understand how to adjust a recipe to fit your needs. It also allows you to tweak
        a recipe you have to change the results you get to suit your tastes. It also allows you to create your own recipes.
      </p>

      <h2>The Formula</h2>
      <p>The basic formula for baker's percentages is:</p>
      <div className="recipeBox">
        <span className="formula">Ingredient % = (Ingredient Weight / Flour Weight) × 100</span>
      </div>
      <p>
        Generally flour is measured in grams and is the ingredient that all other ingredients are measured against.
        So the weight of the flour is always 100% and the other ingredients are expressed as a percentage of the flour weight.
      </p>

      <h2>Worked Example</h2>
      <p>For example, if a recipe calls for 500g of flour, 300g of water, and 10g of salt, the baker's percentages would be:</p>
      <div className="recipeBox">
        <ul className="percentageList">
          <li><span className="ing">Flour</span><span className="pct">100%</span></li>
          <li><span className="ing">Water</span><span className="calc">300 / 500 = 0.6</span><span className="pct">60%</span></li>
          <li><span className="ing">Salt</span><span className="calc">10 / 500 = 0.02</span><span className="pct">2%</span></li>
        </ul>
      </div>

      <h2>Practice</h2>
      <p>
        To practice find a recipe you like and calculate the baker's percentages for each ingredient.
      </p>
      <p>
        As an advanced exercise you can scale the recipe up or down then bake the new scaled up or scaled down recipe to see if it works.
      </p>
    </div>
  );
};

export default Step1;
