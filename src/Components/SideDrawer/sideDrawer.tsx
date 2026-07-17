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
          <a href="/" onClick={closeDrawer}>
            Home
          </a>
          <a href="/learn" onClick={closeDrawer}>
            Learn how to bake
          </a>
          <a href="/tab" onClick={closeDrawer}>
            Recipes and more
          </a>
          <a href="/about-me" onClick={closeDrawer}>
            About me
          </a>
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
