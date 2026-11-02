import { FormattedMessage } from 'react-intl';

const Step2 = () => {
  return (
    <div className="stepContent">
      <p>
        <FormattedMessage id="step2.intro" defaultMessage="The next lesson will cover dough hydration. Dough hydration is the ratio of liquid to flour in a recipe." />
      </p>
      <p>
        <FormattedMessage id="step2.liquids" defaultMessage="This is easy to figure out if the recipe only contains water. If you add eggs, butter, oil, or other liquids you need to add those to the total liquid amount." />
      </p>
      <p>
        <FormattedMessage id="step2.benefits" defaultMessage="Hydration helps bread last longer, have a better crumb, and a better crust. It also helps the dough be more extensible and easier to work with." />
      </p>
      <p>
        <FormattedMessage id="step2.flours" defaultMessage="Not all flour can handle the same hydration levels. Whole wheat flour can handle more hydration than white flour and high protein flour can handle more hydration than low protein flour. Its important to use a high protein flour if you are making a high hydration dough." />
      </p>
      <p>
        <FormattedMessage id="step2.examples" defaultMessage="Some breads like focaccia and ciabatta have very high hydration levels. While other breads like bagels and pretzels have very low hydration. Pay attention to the hydration levels in the recipe and adjust as needed when you want to make your own recipes." />
      </p>
    </div>
  );
};

export default Step2;
