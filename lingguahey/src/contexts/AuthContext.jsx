import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();


  const currentTime = Date.now() / 1000;

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded);
      console.log(currentTime);
      if (decoded.exp < currentTime) {
        console.warn("Token expired. Logging out user.");
        localStorage.removeItem("token"); // Clear the expired token
        navigate("/login");

      }
      else {
        localStorage.setItem("token", token);
      }
    } else {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [token]);

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};