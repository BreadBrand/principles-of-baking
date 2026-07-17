import { useState, useEffect, useRef } from 'react';
import './App.css';
import Tab from './Components/TabComponents/tab';
import useFetchRecipes from './Hooks/UseFetchRecipes';
import Header from './Components/Header/header';
import Landing from './Components/Landing/landing';
import GetStarted from './Components/GetStarted/getStarted';
import LearningStep from './Components/LearningStep/learningStep';
import AboutMe from './Components/AboutMe/aboutMe';
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import { LoginModal } from './Components/Login/Login';
import { Toast } from './Components/Toast/Toast';
import { useAuth } from './Context/AuthContext';
import { useToast } from './Hooks/useToast';
import { DrawerProvider } from './Context/DrawerProvider';
import SideDrawer from './Components/SideDrawer/sideDrawer';
import { RecipeContext } from './Context/RecipeContext';

function App() {
  const { recipes, error } = useFetchRecipes();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const prevUser = useRef(user);

  useEffect(() => {
    if (user === undefined) return;
    if (user) {
      addToast(`Welcome, ${user.displayName || "friend"}!`);
      setIsLoginOpen(false);
    } else if (prevUser.current) {
      addToast("You have logged out.");
    }
    prevUser.current = user;
  }, [user, addToast]);

  useEffect(() => {
    if (error) {
      addToast(`Error fetching recipes: ${error}`, "error");
    }
  }, [error, addToast]);

  return (
    <RecipeContext.Provider value={recipes}>
      <DrawerProvider>
      <Router>
        <Header openLogin={() => setIsLoginOpen(true)} />
        <SideDrawer openLogin={() => setIsLoginOpen(true)} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/tab" element={<Tab />} />
            <Route path="/learn" element={<GetStarted />} />
            <Route path="/learning/step/:step" element={<LearningStep />} />
            <Route path="/about-me" element={<AboutMe />} />
          </Routes>
        </Router>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        <div className="toastContainer">
          {toasts.map((toast, idx) => (
            <Toast
              key={idx}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(idx)}
            />
          ))}
        </div>
      </DrawerProvider>
    </RecipeContext.Provider>
  );
}

export default App
