import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

const OPTIONS = [
  { value: "dark", label: "Dark", icon: Moon, desc: "Dark theme" },
  { value: "light", label: "Light", icon: Sun, desc: "Light theme" },
  { value: "system", label: "System", icon: Monitor, desc: "Match OS setting" },
];

function ThemeToggle() {
  const { mode, setThemeMode, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = OPTIONS.find((o) => o.value === mode) || OPTIONS[0];
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 12,
          border: isDark
            ? "1px solid rgba(148,163,184,0.2)"
            : "1px solid rgba(0,0,0,0.1)",
          background: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)",
          color: isDark ? "#f8fafc" : "#0f172a",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
          backdropFilter: "blur(12px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.07)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)";
        }}
      >
        <CurrentIcon size={16} />
        <span style={{ minWidth: 44, textAlign: "left" }}>{current.label}</span>
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.15s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 6,
            width: 180,
            background: isDark
              ? "rgba(17,24,39,.96)"
              : "rgba(255,255,255,.96)",
            border: isDark
              ? "1px solid rgba(55,255,215,.15)"
              : "1px solid rgba(0,0,0,0.1)",
            borderRadius: 14,
            boxShadow: isDark
              ? "0 15px 40px rgba(0,0,0,.5)"
              : "0 8px 30px rgba(0,0,0,.12)",
            zIndex: 5000,
            overflow: "hidden",
            backdropFilter: "blur(20px)",
            animation: "themeDropdownIn 0.15s ease",
          }}
        >
          <div
            style={{
              padding: "10px 12px 6px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: isDark ? "#64748b" : "#94a3b8",
            }}
          >
            Theme
          </div>
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = mode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setThemeMode(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 14px",
                  background: isActive
                    ? isDark
                      ? "rgba(55,255,215,.1)"
                      : "rgba(37,99,235,.08)"
                    : "transparent",
                  border: "none",
                  color: isActive
                    ? isDark
                      ? "#37FFD7"
                      : "#2563eb"
                    : isDark
                      ? "#f8fafc"
                      : "#0f172a",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "background 0.1s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = isDark
                      ? "rgba(55,255,215,.05)"
                      : "rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isActive && (
                  <span style={{ fontSize: 14 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes themeDropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ThemeToggle;
