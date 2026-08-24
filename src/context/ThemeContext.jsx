import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext();

const THEMES = {
  dark: {
    name: "dark",
    bg: {
      page: "linear-gradient(160deg, #020617 0%, #0f172a 55%, #172554 100%)",
      card: "rgba(15, 23, 42, 0.72)",
      cardSolid: "#1e293b",
      input: "rgba(2, 6, 23, 0.6)",
      inputSolid: "#0f172a",
      hover: "rgba(55,255,215,.05)",
      overlay: "rgba(0,0,0,0.7)",
      sidebar: "linear-gradient(180deg, #0f172a, #1e293b)",
      sidebarActive: "rgba(55,255,215,0.1)",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
      muted: "#64748b",
      accent: "#37FFD7",
      link: "#38bdf8",
    },
    border: {
      default: "1px solid rgba(148,163,184,0.12)",
      card: "1px solid rgba(148,163,184,0.12)",
      focus: "1px solid rgba(55,255,215,0.5)",
      input: "1px solid rgba(148,163,184,0.2)",
      subtle: "1px solid rgba(255,255,255,0.06)",
    },
    badge: {
      success: { bg: "rgba(34,197,94,0.12)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
      danger: { bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
      warning: { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", border: "rgba(245,158,11,0.25)" },
      info: { bg: "rgba(56,189,248,0.12)", text: "#38bdf8", border: "rgba(56,189,248,0.25)" },
      purple: { bg: "rgba(168,85,247,0.12)", text: "#a855f7", border: "rgba(168,85,247,0.25)" },
    },
    accent: {
      primary: "#37FFD7",
      blue: "#3b82f6",
      green: "#22c55e",
      red: "#ef4444",
      amber: "#f59e0b",
      purple: "#a855f7",
      cyan: "#06b6d4",
      indigo: "#6366f1",
      violet: "#8b5cf6",
    },
    shadow: {
      card: "0 1px 3px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2)",
      elevated: "0 4px 20px rgba(0,0,0,0.4)",
    },
    glass: {
      background: "rgba(30, 41, 59, 0.65)",
      border: "1px solid rgba(148, 163, 184, 0.18)",
      shadow: "0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
    },
  },
  light: {
    name: "light",
    bg: {
      page: "linear-gradient(160deg, #f8fafc 0%, #e2e8f0 55%, #cbd5e1 100%)",
      card: "rgba(255, 255, 255, 0.85)",
      cardSolid: "#ffffff",
      input: "rgba(241, 245, 249, 0.9)",
      inputSolid: "#f1f5f9",
      hover: "rgba(59,130,246,0.06)",
      overlay: "rgba(0,0,0,0.4)",
      sidebar: "linear-gradient(180deg, #ffffff, #f1f5f9)",
      sidebarActive: "rgba(59,130,246,0.1)",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      muted: "#94a3b8",
      accent: "#2563eb",
      link: "#2563eb",
    },
    border: {
      default: "1px solid rgba(0,0,0,0.08)",
      card: "1px solid rgba(0,0,0,0.08)",
      focus: "1px solid rgba(59,130,246,0.5)",
      input: "1px solid rgba(0,0,0,0.12)",
      subtle: "1px solid rgba(0,0,0,0.04)",
    },
    badge: {
      success: { bg: "rgba(34,197,94,0.1)", text: "#16a34a", border: "rgba(34,197,94,0.2)" },
      danger: { bg: "rgba(239,68,68,0.1)", text: "#dc2626", border: "rgba(239,68,68,0.2)" },
      warning: { bg: "rgba(245,158,11,0.1)", text: "#d97706", border: "rgba(245,158,11,0.2)" },
      info: { bg: "rgba(56,189,248,0.1)", text: "#0284c7", border: "rgba(56,189,248,0.2)" },
      purple: { bg: "rgba(168,85,247,0.1)", text: "#7c3aed", border: "rgba(168,85,247,0.2)" },
    },
    accent: {
      primary: "#2563eb",
      blue: "#2563eb",
      green: "#16a34a",
      red: "#dc2626",
      amber: "#d97706",
      purple: "#7c3aed",
      cyan: "#0891b2",
      indigo: "#4f46e5",
      violet: "#7c3aed",
    },
    shadow: {
      card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
      elevated: "0 4px 16px rgba(0,0,0,0.1)",
    },
    glass: {
      background: "rgba(255, 255, 255, 0.85)",
      border: "1px solid rgba(0,0,0,0.08)",
      shadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    },
  },
};

function getSystemTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem("app-theme-mode") || "dark";
    } catch {
      return "dark";
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    return mode === "system" ? getSystemTheme() : mode;
  });

  useEffect(() => {
    const resolved = mode === "system" ? getSystemTheme() : mode;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, [mode]);

  // Listen for system theme changes when mode is "system"
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      setResolvedTheme(e.matches ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setThemeMode = useCallback((newMode) => {
    setMode(newMode);
    try {
      localStorage.setItem("app-theme-mode", newMode);
    } catch {}
  }, []);

  const theme = THEMES[resolvedTheme] || THEMES.dark;
  const isDark = resolvedTheme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, setThemeMode, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { THEMES };
