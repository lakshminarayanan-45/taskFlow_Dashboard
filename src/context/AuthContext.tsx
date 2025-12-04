import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types/task";
import { users } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, remember: boolean) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials
const demoCredentials: Record<string, { password: string; userId: string }> = {
  admin: { password: "admin123", userId: "1" },
  manager: { password: "manager123", userId: "2" },
  employee: { password: "employee123", userId: "3" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved credentials
    const savedUser = localStorage.getItem("taskmanager_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const foundUser = users.find((u) => u.id === parsed.id);
      if (foundUser) setUser(foundUser);
    }
  }, []);

  const login = (username: string, password: string, remember: boolean): boolean => {
    const creds = demoCredentials[username.toLowerCase()];
    if (creds && creds.password === password) {
      const foundUser = users.find((u) => u.id === creds.userId);
      if (foundUser) {
        setUser(foundUser);
        if (remember) {
          localStorage.setItem("taskmanager_user", JSON.stringify({ id: foundUser.id }));
        }
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("taskmanager_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
