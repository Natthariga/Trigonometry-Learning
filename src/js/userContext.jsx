// src/js/userContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { getUser, logout as authLogout } from "./auth";

export const UserContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout: handleLogout }}>
      {children}
    </UserContext.Provider>
  );
};
