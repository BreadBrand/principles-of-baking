import { createContext, useContext } from "react";
import { User } from "firebase/auth";

interface AuthContextType {
  user: User | null | undefined;
}

export const AuthContext = createContext<AuthContextType>({ user: undefined });

export const useAuth = () => useContext(AuthContext);
