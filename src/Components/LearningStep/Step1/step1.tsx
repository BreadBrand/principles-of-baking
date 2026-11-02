import { FormattedMessage, useIntl } from 'react-intl';

const Step1 = () => {
  const intl = useIntl();
  const percent = (value: number) => intl.formatNumber(value, { style: 'percent' });
  const calc = (dividend: number, divisor: number) =>
    intl.formatMessage(
      { id: 'step1.calc', defaultMessage: '{dividend} / {divisor} = {quotient}' },
      { dividend: intl.formatNumber(dividend), divisor: intl.formatNumber(divisor), quotient: intl.formatNumber(dividend / divisor) },
    );
  return (
    <div className="stepContent">
      <p>
        <FormattedMessage id="step1.intro" defaultMessage="This first lesson will cover bakers percentages. Bakers percentages are a way to express the ratio of ingredients in a recipe. Understanding bakers percentages will help you understand how to adjust a recipe to fit your needs. It also allows you to tweak a recipe you have to change the results you get to suit your tastes. It also allows you to create your own recipes." />
      </p>

      <h2><FormattedMessage id="step1.formulaTitle" defaultMessage="The Formula" /></h2>
      <p><FormattedMessage id="step1.formulaIntro" defaultMessage="The basic formula for baker's percentages is:" /></p>
      <div className="recipeBox">
        <span className="formula"><FormattedMessage id="step1.formula" defaultMessage="Ingredient % = (Ingredient Weight / Flour Weight) × 100" /></span>
      </div>
      <p>
        <FormattedMessage id="step1.formulaExplain" defaultMessage="Generally flour is measured in grams and is the ingredient that all other ingredients are measured against. So the weight of the flour is always 100% and the other ingredients are expressed as a percentage of the flour weight." />
      </p>

      <h2><FormattedMessage id="step1.exampleTitle" defaultMessage="Worked Example" /></h2>
      <p><FormattedMessage id="step1.exampleIntro" defaultMessage="For example, if a recipe calls for 500g of flour, 300g of water, and 10g of salt, the baker's percentages would be:" /></p>
      <div className="recipeBox">
        <ul className="percentageList">
          <li><span className="ing"><FormattedMessage id="step1.flour" defaultMessage="Flour" /></span><span className="pct">{percent(1)}</span></li>
          <li><span className="ing"><FormattedMessage id="step1.water" defaultMessage="Water" /></span><span className="calc">{calc(300, 500)}</span><span className="pct">{percent(0.6)}</span></li>
          <li><span className="ing"><FormattedMessage id="step1.salt" defaultMessage="Salt" /></span><span className="calc">{calc(10, 500)}</span><span className="pct">{percent(0.02)}</span></li>
        </ul>
      </div>

      <h2><FormattedMessage id="step1.practiceTitle" defaultMessage="Practice" /></h2>
      <p>
        <FormattedMessage id="step1.practice" defaultMessage="To practice find a recipe you like and calculate the baker's percentages for each ingredient." />
      </p>
      <p>
        <FormattedMessage id="step1.advanced" defaultMessage="As an advanced exercise you can scale the recipe up or down then bake the new scaled up or scaled down recipe to see if it works." />
      </p>
    </div>
  );
};

export default Step1;
