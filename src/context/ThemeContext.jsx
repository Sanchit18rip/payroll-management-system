import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "payroll-theme-mode";

const getSystemTheme = () => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const resolveTheme = (mode) => mode === "system" ? getSystemTheme() : mode;

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return ["dark","light","system"].includes(saved) ? saved : "dark";
    } catch {
      return "dark";
    }
  });

  const resolvedTheme = resolveTheme(mode);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => {
      const next = media.matches ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.style.colorScheme = next;
    };

    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, [mode]);

  const setThemeMode = (nextMode) => {
    if (!["dark","light","system"].includes(nextMode)) return;
    setMode(nextMode);
    try { localStorage.setItem(STORAGE_KEY, nextMode); } catch {}
  };

  const value = useMemo(() => ({
    mode,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
    setThemeMode,
  }), [mode, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

export default ThemeContext;
