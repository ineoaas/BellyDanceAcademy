"use client";

import { createContext, useContext, useEffect, useState } from "react";

// React Context lets every page read "who is logged in" without passing
// it down manually through every component in between.
const AuthContext = createContext(null);

const STORAGE_KEY = "bda_session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { role: "student"|"instructor", name }
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch (e) {
      // ignore malformed/unavailable storage
    }
    setReady(true);
  }, []);

  function login(role, name) {
    const next = { role, name };
    setSession(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function logout() {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ session, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
