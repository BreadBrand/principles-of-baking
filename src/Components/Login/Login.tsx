import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase";
import "./Login.css";
import { FirebaseError } from "firebase/app";
import {
  signInWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithCredential,
} from "firebase/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflowY = "hidden"
    } 

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflowY = "auto"
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (error) {
      console.error("Email login error:", error);
    }
  };

  const handleGithubLogin = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (error) {
      if (!(error instanceof FirebaseError)) {
        console.error("GitHub login error: ", error);
        return;
      }

      if (error.code === "auth/account-exists-with-different-credential") {
        const existingEmail = error.customData?.email;
        const pendingCred = GithubAuthProvider.credentialFromError(error);

        if (!existingEmail || !pendingCred) {
          console.error("Missing email or credential info for merge.");
          return;
        }

        const googleProvider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, googleProvider);
          await linkWithCredential(result.user, pendingCred);
          onClose();
        } catch (linkError) {
          console.log("Failed to link accounts: ", linkError);
        }
      } else {
        console.error("GitHub login error: ", error);
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (error) {
      console.error("Google login error: ", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="modalContent"
      >
        <h2 id="login-title" className="modalTitle">
          Login
        </h2>
        <form onSubmit={handleEmailLogin} className="form">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />

          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />

          <button
            type="submit"
            className="submitButton"
          >
            Sign in with Email
          </button>
        </form>

        <div className="signInButtonContainer">
          <button
            onClick={handleGithubLogin}
            className="githubButton"
          >
            Sign in with GitHub
          </button>
          <button
            onClick={handleGoogleLogin}
            className="googleButton"
          >
            Sign in with Google
          </button>
          <button
            onClick={onClose}
            className="cancelButton"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
