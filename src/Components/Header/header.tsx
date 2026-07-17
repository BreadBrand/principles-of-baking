import './header.css';
import Button from "../Button/button";
import RoundLogo from '../../assets/roundLogo';
import { useAuth } from '../../Context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDrawer } from '../../Context/DrawerContext';
import BreadIcon from '../../assets/breadIcon';
import { useLocation } from 'react-router';

type HeaderProps = {
  openLogin: () => void;
}

const Header = ({ openLogin }: HeaderProps) => {
  const { user } = useAuth();
  const { openDrawer, closeDrawer, openRecipeDrawer, selectedId, activeTab } = useDrawer();
  const location = useLocation();
  const isTabPage = location.pathname === "/tab";

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
          <a href="/" className="logo">
            <RoundLogo height="75" width="75" />
          </a>
          <nav className="navLinks">
            <a href="/learn">Learn how to bake</a>
            <a href="/tab">Recipes and more</a>
            <a href="about-me">About me</a>
          </nav>
        </div>
        <Button
          className="loginButton"
          style={{ justifySelf: "flex-end" }}
          onClick={() => {
            closeDrawer();
            user ? handleLogout() : openLogin();
          }}
        >
          {user ? "Logout" : "Login"}
        </Button>
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
