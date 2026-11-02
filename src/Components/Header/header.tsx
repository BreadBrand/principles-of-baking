import './header.css';
import Button from "../Button/button";
import RoundLogo from '../../assets/roundLogo';
import { useAuth } from '../../Context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDrawer } from '../../Context/DrawerContext';
import BreadIcon from '../../assets/breadIcon';
import { Link, useLocation } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import LanguageSelect from '../LanguageSelect/languageSelect';
import OfflineIndicator from '../OfflineIndicator/offlineIndicator';
import { SYMBOLS } from '../../Constants/untranslated';
import { useInstallPromptContext } from '../../Context/InstallPromptContext';

type HeaderProps = {
  openLogin: () => void;
}

const Header = ({ openLogin }: HeaderProps) => {
  const { user } = useAuth();
  const intl = useIntl();
  const { openDrawer, closeDrawer, openRecipeDrawer, selectedId, activeTab } = useDrawer();
  const location = useLocation();
  // Covers both /tab and /tab/recipes/:id (shareable recipe URLs push the
  // latter when a recipe is selected) -- a strict "/tab" match would hide
  // the mobile drawer-reopen button as soon as a recipe was selected.
  const isTabPage = location.pathname.startsWith("/tab");
  const { canInstall, promptInstall } = useInstallPromptContext();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  }

  return (
    <header className="headerContainer">
      <div className="navContainer">
        <div className="logoAndNav">
          <Link to="/" className="logo">
            <RoundLogo height="75" width="75" />
          </Link>
          <OfflineIndicator />
          <nav className="navLinks">
            <Link to="/learn">
              <FormattedMessage id="header.learn" defaultMessage="Learn how to bake" />
            </Link>
            <Link to="/tab">
              <FormattedMessage id="header.recipes" defaultMessage="Recipes and more" />
            </Link>
            <Link to="/about-me">
              <FormattedMessage id="header.about" defaultMessage="About me" />
            </Link>
          </nav>
        </div>
        <div className="headerActions">
          {canInstall && (
            <Button className="installButton" onClick={promptInstall}>
              <FormattedMessage id="header.install" defaultMessage="Install App" />
            </Button>
          )}
          <LanguageSelect className="headerLanguageSelect" />
          <Button
            className="loginButton"
            style={{ justifySelf: "flex-end" }}
            onClick={() => {
              closeDrawer();
              if (user) {
                handleLogout();
              } else {
                openLogin();
              }
            }}
          >
            {user
              ? intl.formatMessage({ id: "header.logout", defaultMessage: "Logout" })
              : intl.formatMessage({ id: "header.login", defaultMessage: "Login" })}
          </Button>
        </div>
        <div className="mobileButtons">
          <button
            className={`
              recipesButton 
              ${isTabPage && activeTab === "tab1" ? "visible" : ""} 
              ${isTabPage && activeTab === "tab1" && !selectedId ? "pulse" : ""}`
            }
            onClick={openRecipeDrawer}
            aria-label={intl.formatMessage({ id: "header.toggleRecipeList", defaultMessage: "Toggle recipe list" })}
          >
            <BreadIcon />
          </button>
          <button
            className="hamburgerButton"
            onClick={openDrawer}
            aria-label={intl.formatMessage({ id: "header.toggleMenu", defaultMessage: "Toggle menu" })}
          >
            {SYMBOLS.menuBars}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header;
