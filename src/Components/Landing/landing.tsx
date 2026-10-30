import './landing.css';
import { FormattedMessage } from 'react-intl';
import Button from '../Button/button';
import { useInstallPromptContext } from '../../Context/InstallPromptContext';

const Landing = () => {
  const { canInstall, promptInstall } = useInstallPromptContext();

  return (
    <div className="landingContainer">
      <div className="heroImage" />
      <div className="heroText">
        <h1><FormattedMessage id="landing.heroTitle" defaultMessage="Learn to make your own bread" /></h1>
        <h2><FormattedMessage id="landing.heroSubtitle" defaultMessage="Making your own bread isn't as complicated as you might think." /></h2>
      </div>
      <div className="glass noticeContainer">
        <div className='noticeText'>
          <FormattedMessage id="landing.noticePreferments" defaultMessage="Learn about different preferments" />
        </div>
        <div className='noticeText'>
          <FormattedMessage id="landing.noticeHydration" defaultMessage="Discover how to make high hydration dough" />
        </div>
        <div className='noticeText'>
          <FormattedMessage id="landing.noticeElevation" defaultMessage="Find out how elevation can effect bake times and temperature requirements" />
        </div>
      </div>
      <div className="underViewContainer">
        <h1><FormattedMessage id="landing.welcomeTitle" defaultMessage="Welcome to the Bread Machine" /></h1>
        <p><FormattedMessage id="landing.welcomeText" defaultMessage="An app to help you scale your bread recipes and help you experiment!" /></p>
        {canInstall && (
          <Button className="landingInstallButton" onClick={promptInstall}>
            <FormattedMessage id="landing.install" defaultMessage="Install App" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default Landing;
