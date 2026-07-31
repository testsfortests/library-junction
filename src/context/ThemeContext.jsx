"use client";

import { createContext, useContext, useEffect, useState } from "react";

const themes = {
  dark: {
    bg: "#0D0A14",
    surface: "#1B1526",
    surfaceAlt: "#241C33",
    border: "#2E2540",
    primary: "#8B5CF6",
    primaryStrong: "#6D28D9",
    text: "#F4F1FA",
    textMuted: "#A8A0BD",
  },
  light: {
    bg: "#F6F1E7",
    surface: "#FFFFFF",
    surfaceAlt: "#F1EAF9",
    border: "#E5E1D8",
    primary: "#8B5CF6",
    primaryStrong: "#6D28D9",
    text: "#1C1526",
    textMuted: "#6B7280",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setMode(saved);
    setReady(true);
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const colors = themes[mode];

  // avoid a flash of the wrong theme before localStorage is read
  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}