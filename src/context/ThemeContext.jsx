/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Always set light theme
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }

  const value = useMemo(() => ({
    mode: "light",
    resolvedTheme: "light",
    isDark: false,
    setThemeMode: () => {},
  }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
