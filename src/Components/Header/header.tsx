import './header.css';
import Button from "../Button/button";
import RoundLogo from '../../assets/roundLogo';
import { useAuth } from '../../Context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDrawer } from '../../Context/DrawerContext';
import BreadIcon from '../../assets/breadIcon';
import { Link, useLocation } from 'react-router';
import OfflineIndicator from '../OfflineIndicator/offlineIndicator';
import { useInstallPromptContext } from '../../Context/InstallPromptContext';

type HeaderProps = {
  openLogin: () => void;
}

const Header = ({ openLogin }: HeaderProps) => {
  const { user } = useAuth();
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
            <Link to="/learn">Learn how to bake</Link>
            <Link to="/tab">Recipes and more</Link>
            <Link to="/about-me">About me</Link>
          </nav>
        </div>
        <div className="headerActions">
          {canInstall && (
            <Button className="installButton" onClick={promptInstall}>
              Install App
            </Button>
          )}
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
            {user ? "Logout" : "Login"}
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
            aria-label="Toggle recipe list"
          >
            <BreadIcon />
          </button>
          <button
            className="hamburgerButton"
            onClick={openDrawer}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header;
