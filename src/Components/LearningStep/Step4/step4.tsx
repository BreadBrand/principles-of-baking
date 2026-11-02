import { FormattedMessage } from 'react-intl';

const Step4 = () => {
  return (
    <div className="stepContent">
      <p>
        <FormattedMessage id="step4.intro" defaultMessage="This next lesson will go over kneading. Or if you are interested in no-knead techniques, skip to the bottom of the page and read the no-knead section." />
      </p>
      <h2><FormattedMessage id="step4.kneadingTitle" defaultMessage="Kneading" /></h2>
      <p>
        <FormattedMessage id="step4.kneading" defaultMessage="Kneading is the process of working the dough to develop the gluten. Gluten is a protein that gives the dough structure and elasticity. Kneading also helps to evenly distribute the yeast, salt, and other ingredients throughout the dough. without gluten, the dough would not be able to rise properly and would be dense and flat. Kneading is essential for most bread recipes if you plan to make the dough the same day. This task will be made easier if you have a stand mixer with a dough hook attachment. if you don't have a stand mixer, you can knead the dough by hand. To knead by hand, there is no right or wrong way to do it. The dough just needs to be worked until it is smooth and elastic. This can take 10-15 minutes. You can also use the windowpane test to check if the dough is ready. To do this, take a small piece of dough and stretch it between your fingers. If the dough stretches thin enough to see light through it without tearing, it is ready. If it tears, continue kneading. if you use a lower protein flour with a high hydration recipe the dough will be stickier and harder to work and will require more kneading. If you use a higher protein flour with a lower hydration recipe, the dough will be easier to work and will require less kneading. This problem can be exacerbated if you are using oil or butter in the recipe. The fat will coat the gluten strands and make it harder for them to develop. If you are having trouble kneading the dough, try letting it rest for 10-15 minutes and then continue kneading." />
      </p>
      <h3><FormattedMessage id="step4.howTitle" defaultMessage="How to Knead" /></h3>
      <p>
        <FormattedMessage id="step4.how" defaultMessage="This section will go over how I knead dough by hand. There are many ways to knead dough, and you may find a different method that works better for you. So use that instead. But if you are new to kneading, this method is a good place to start." />
      </p>
      <div className="recipeBox">
        <span className="sectionLabel"><FormattedMessage id="step4.slapTitle" defaultMessage="Slap and fold method" /></span>
        <ol className="instructionList">
          <li><FormattedMessage id="step4.slap.flour" defaultMessage="Flour your work surface and hands." /></li>
          <li><FormattedMessage id="step4.slap.place" defaultMessage="Place the dough on the floured surface." /></li>
          <li><FormattedMessage id="step4.slap.scoop" defaultMessage="Using both of your hands scoop under the dough so that your two middle fingers touch one another under the dough." /></li>
          <li><FormattedMessage id="step4.slap.lift" defaultMessage="Lift the dough off your work surface so it folds over your hands" /></li>
          <li><FormattedMessage id="step4.slap.slap" defaultMessage="Then slap the side closest to you onto the counter" /></li>
          <li><FormattedMessage id="step4.slap.turn" defaultMessage="Then turning your hands 90 degrees relative to the dough repeat all steps" /></li>
        </ol>
      </div>
      <p>
        <FormattedMessage id="step4.wet" defaultMessage="This method is good for wet doughs because it requires less direct contact with the dough. If you are having trouble with the dough sticking to your hands, try wetting your hands with water instead of flouring them. This can help prevent the dough from sticking to your hands." />
      </p>
      <p>
        <FormattedMessage id="step4.trust" defaultMessage="But trust the process, after 10 to 15 minutes the dough should be smoother and more stretchy than when you started." />
      </p>
      <h2><FormattedMessage id="step4.noKneadTitle" defaultMessage="No-Knead Technique" /></h2>
      <p>
        <FormattedMessage id="step4.noKnead" defaultMessage="If you aren't interested in kneading, then you don't have to. But there is a trade-off. The dough will not be ready to bake the same day. Instead, you will have to let the dough rest for a long period of time. This can be achieved during cold bulk fermentation or a long room temperature rest if you are using a preferment and won't add the levain until the next day." />
      </p>
      <p>
        <FormattedMessage id="step4.autolyse" defaultMessage="This process is called autolyse. Autolyse is a rest period that allows the flour to fully hydrate and the gluten to develop without kneading. This can take anywhere from 30 minutes to overnight. The longer the rest, the less kneading is required. Mix together the flour, salt and water in a bowl. Then let it rest covered at room temperature. The next day add the levain whether it be a sourdough starter or a poolish or instant dry yeast. Then mix the dough until the levain is fully incorporated. Then do the final fermentation and shaping. This method is great for beginners because it is less hands-on and requires less skill. But it does require more time and planning ahead." />
      </p>
    </div>
  );
};

export default Step4;
