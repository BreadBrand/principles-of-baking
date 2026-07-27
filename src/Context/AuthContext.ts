import { createContext, useContext } from "react";
import { User } from "firebase/auth";

interface AuthContextType {
  user: User | null | undefined;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
