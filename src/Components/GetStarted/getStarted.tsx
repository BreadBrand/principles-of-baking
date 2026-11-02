import { FormattedMessage } from 'react-intl';
import LearningFooter from '../LearningFooter/learningFooter';
import WaveText from '../WaveText/waveText';
import './getStarted.css';

const waveTag = (chunks: React.ReactNode[]) => <WaveText text={chunks.join("")} />;

const GetStarted = () => {
  return (
    <div className="learnContainer">
      <p>
        <FormattedMessage
          id="getStarted.intro"
          defaultMessage="Get started with baking bread can be <wave>easy</wave>. If you don't have any specialized equipment yet you can start with a simple recipe that doesn't require any special tools. And as you learn, you can decide if you want to invest in more tools."
          values={{ wave: waveTag }}
        />
      </p>
      <p>
        <FormattedMessage id="getStarted.scale" defaultMessage="The most important thing to have is a kitchen scale. This will help you measure your ingredients accurately and consistently. You can find a kitchen scale at most stores that sell kitchen equipment. They are fairly inexpensive and will last you a long time." />
      </p>
      <p>
        <FormattedMessage id="getStarted.bowl" defaultMessage="The next thing you need is a bowl to mix your ingredients in. You can use a glass or metal bowl, or a plastic container. Just make sure it's big enough to hold all your ingredients." />
      </p>
      <p>
        <FormattedMessage
          id="getStarted.units"
          defaultMessage="This first recipe you'll learn I'll give you the ingredients in <wave>cups</wave> and <wave>tablespoons</wave> as well as grams. But as you get more comfortable with baking, you'll want to switch to using grams for more consistent results."
          values={{ wave: waveTag }}
        />
      </p>
      <p>
        <FormattedMessage id="getStarted.needs" defaultMessage="Here are the ingredients you'll need for your first bake:" />
      </p>
      <div className="recipeBox">
        <span className="sectionLabel"><FormattedMessage id="getStarted.ingredients" defaultMessage="Ingredients" /></span>
        <ul className="ingredientList">
          <li><FormattedMessage id="getStarted.ingredient.flour" defaultMessage="4 cups of Bread Flour" /></li>
          <li><FormattedMessage id="getStarted.ingredient.salt" defaultMessage="1 and 2/3 teaspoons of Salt" /></li>
          <li><FormattedMessage id="getStarted.ingredient.yeast" defaultMessage="2 and 1/3 teaspoons of Instant Dry Yeast" /></li>
          <li><FormattedMessage id="getStarted.ingredient.water" defaultMessage="1 and 1/2 cups of Water" /></li>
        </ul>
      </div>
      <p>
        <FormattedMessage id="getStarted.vessel" defaultMessage="You'll also need a baking vessel. You can use a dutch oven, a baking stone, or a baking sheet. If you don't have any of these, you can use a cast iron skillet with a lid or a large pot with a lid." />
      </p>
      <div className="recipeBox">
        <span className="sectionLabel"><FormattedMessage id="getStarted.instructions" defaultMessage="Instructions" /></span>
        <ol className="instructionList">
          <li><FormattedMessage id="getStarted.step1" defaultMessage="Start by adding the water, yeast, and salt to a bowl and mix until the yeast is dissolved." /></li>
          <li><FormattedMessage id="getStarted.step2" defaultMessage="Add the flour and mix until the dough comes together." /></li>
          <li><FormattedMessage id="getStarted.step3" defaultMessage="Cover the bowl with a towel and let it rest for 12-18 min." /></li>
          <li><FormattedMessage id="getStarted.step4" defaultMessage="After the dough has rested, fold the dough over itself a few times." /></li>
          <li><FormattedMessage id="getStarted.step5" defaultMessage="Cover the bowl again and let it rise until the dough has doubled. This may take 1 to 2 hours." /></li>
          <li><FormattedMessage id="getStarted.step6" defaultMessage="Preheat your oven to 450 degrees Ferinheit or 232 Celcius." /></li>
          <li><FormattedMessage id="getStarted.step7" defaultMessage="Place your baking vessel in the oven to heat up." /></li>
          <li><FormattedMessage id="getStarted.step8" defaultMessage="Once the oven is preheated and the dough has risen, carefully remove the baking vessel from the oven." /></li>
          <li><FormattedMessage id="getStarted.step9" defaultMessage="Place the dough in the baking vessel and spray with water if you have a spray bottle and cover with the lid." /></li>
          <li><FormattedMessage id="getStarted.step10" defaultMessage="Bake for 30 minutes covered." /></li>
          <li><FormattedMessage id="getStarted.step11" defaultMessage="Remove the lid and bake for another 15 minutes." /></li>
          <li><FormattedMessage id="getStarted.step12" defaultMessage="Remove the bread from the oven and let it cool before slicing." /></li>
        </ol>
      </div>
      <p>
        <FormattedMessage id="getStarted.next" defaultMessage="Once you've mastered this recipe, you can start experimenting with different flours, adding seeds, nuts, other ingredients, and trying different baking techniques. If you are interested in learning more click next." />
      </p>
      <LearningFooter step={0} />
    </div>
  );
}

export default GetStarted;
