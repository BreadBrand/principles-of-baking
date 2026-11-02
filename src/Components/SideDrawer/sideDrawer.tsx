import { Link } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import LanguageSelect from "../LanguageSelect/languageSelect";
import Button from "../Button/button";
import { useAuth } from "../../Context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useDrawer } from "../../Context/DrawerContext";
import { useInstallPromptContext } from "../../Context/InstallPromptContext";
import "./sideDrawer.css";
import { SYMBOLS } from "../../Constants/untranslated";

type SideDrawerProps = {
  openLogin: () => void;
};
const SideDrawer = ({ openLogin }: SideDrawerProps) => {
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { user } = useAuth();
  const intl = useIntl();
  const { canInstall, promptInstall } = useInstallPromptContext();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  }

  return (

    <>
      <div
        className={`drawerOverlay ${isDrawerOpen ? "open" : ""}`}
        onClick={closeDrawer}
      />
      <div className={`sideDrawer ${isDrawerOpen ? "open" : ""}`} inert={isDrawerOpen ? undefined : true}>
        <div className="drawerContent">
          <Link to="/" onClick={closeDrawer}>
            <FormattedMessage id="sideDrawer.home" defaultMessage="Home" />
          </Link>
          <Link to="/learn" onClick={closeDrawer}>
            <FormattedMessage id="sideDrawer.learn" defaultMessage="Learn how to bake" />
          </Link>
          <Link to="/tab" onClick={closeDrawer}>
            <FormattedMessage id="sideDrawer.recipes" defaultMessage="Recipes and more" />
          </Link>
          <Link to="/about-me" onClick={closeDrawer}>
            <FormattedMessage id="sideDrawer.about" defaultMessage="About me" />
          </Link>
          <LanguageSelect />
          {canInstall && (
            <Button
              style={{ alignSelf: "flex-start" }}
              onClick={() => {
                closeDrawer();
                promptInstall();
              }}
            >
              <FormattedMessage id="sideDrawer.install" defaultMessage="Install App" />
            </Button>
          )}
          <Button
            style={{ alignSelf: "flex-start" }}
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
              ? intl.formatMessage({ id: "sideDrawer.logout", defaultMessage: "Logout" })
              : intl.formatMessage({ id: "sideDrawer.login", defaultMessage: "Login" })}
          </Button>
        </div>
        <button
          className="closeDrawerButton"
          onClick={closeDrawer}
          aria-label={intl.formatMessage({ id: "sideDrawer.close", defaultMessage: "Close menu" })}
        >
          {SYMBOLS.closeCross}
        </button>
      </div>
    </>
  );
};

export default SideDrawer;
