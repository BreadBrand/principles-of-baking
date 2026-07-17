import { Link } from "react-router";
import Button from "../Button/button";
import { useAuth } from "../../Context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useDrawer } from "../../Context/DrawerContext";
import "./sideDrawer.css";

type SideDrawerProps = {
  openLogin: () => void;
};
const SideDrawer = ({ openLogin }: SideDrawerProps) => {
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { user } = useAuth();

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
            Home
          </Link>
          <Link to="/learn" onClick={closeDrawer}>
            Learn how to bake
          </Link>
          <Link to="/tab" onClick={closeDrawer}>
            Recipes and more
          </Link>
          <Link to="/about-me" onClick={closeDrawer}>
            About me
          </Link>
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
            {user ? "Logout" : "Login"}
          </Button>
        </div>
        <button className="closeDrawerButton" onClick={closeDrawer}>
          ✕
        </button>
      </div>
    </>
  );
};

export default SideDrawer;
