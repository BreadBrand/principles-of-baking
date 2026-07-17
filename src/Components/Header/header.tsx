import './header.css';
import Button from "../Button/button";
import RoundLogo from '../../assets/roundLogo';
import { useAuth } from '../../Context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDrawer } from '../../Context/DrawerContext';
import BreadIcon from '../../assets/breadIcon';
import { Link, useLocation } from 'react-router';

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
          <Link to="/" className="logo">
            <RoundLogo height="75" width="75" />
          </Link>
          <nav className="navLinks">
            <Link to="/learn">Learn how to bake</Link>
            <Link to="/tab">Recipes and more</Link>
            <Link to="/about-me">About me</Link>
          </nav>
        </div>
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
