import React, { createContext, useContext, useState, useEffect } from "react";
import { users } from "@/data/mockData.js";

const AuthContext = createContext(undefined);

// Demo credentials - 2 employees now
const demoCredentials = {
  admin: { password: "admin123", userId: "1" },
  manager: { password: "manager123", userId: "2" },
  employee1: { password: "employee123", userId: "3" },
  employee2: { password: "employee456", userId: "4" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for saved credentials
    const savedUser = localStorage.getItem("taskmanager_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const foundUser = users.find((u) => u.id === parsed.id);
      if (foundUser) setUser(foundUser);
    }
  }, []);

  const login = (username, password, remember) => {
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