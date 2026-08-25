import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

const OPTIONS = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
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
  const text = isDark ? "#f8fafc" : "#0f172a";
  const panel = isDark ? "#111827" : "#ffffff";
  const border = isDark ? "rgba(148,163,184,.16)" : "rgba(15,23,42,.10)";
  const hover = isDark ? "rgba(55,255,215,.06)" : "rgba(37,99,235,.06)";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          display:"flex", alignItems:"center", gap:8, padding:"8px 14px",
          borderRadius:12, border:`1px solid ${border}`,
          background:isDark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.82)",
          color:text, fontSize:13, fontWeight:600, cursor:"pointer",
          transition:"all .15s ease", backdropFilter:"blur(12px)",
          boxShadow:isDark ? "none" : "0 2px 8px rgba(15,23,42,.06)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = hover;
          e.currentTarget.style.borderColor = isDark ? "rgba(55,255,215,.2)" : "rgba(37,99,235,.18)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.82)";
          e.currentTarget.style.borderColor = border;
        }}
      >
        <CurrentIcon size={16} />
        <span style={{ minWidth:44, textAlign:"left" }}>{current.label}</span>
        <ChevronDown size={14} style={{ transition:"transform .15s", transform:open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position:"absolute", top:"100%", right:0, marginTop:6, width:200,
            background:panel, border:`1px solid ${border}`, borderRadius:14,
            boxShadow:isDark ? "0 15px 40px rgba(0,0,0,.5)" : "0 12px 32px rgba(15,23,42,.12)",
            zIndex:5000, overflow:"hidden", backdropFilter:"blur(20px)",
            animation:"themeDropdownIn .15s ease",
          }}
        >
          <div style={{
            padding:"10px 12px 6px", fontSize:10, fontWeight:700,
            letterSpacing:"1.5px", textTransform:"uppercase", color:"#64748b"
          }}>
            Theme
          </div>

          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = mode === opt.value;
            return (
              <button
                type="button"
                role="menuitemradio"
                aria-checked={active}
                key={opt.value}
                onClick={() => { setThemeMode(opt.value); setOpen(false); }}
                style={{
                  display:"flex", alignItems:"center", gap:10, width:"100%",
                  padding:"10px 14px", background:active ? (isDark ? "rgba(55,255,215,.10)" : "rgba(37,99,235,.08)") : "transparent",
                  border:"none", color:active ? (isDark ? "#37FFD7" : "#2563eb") : text,
                  fontSize:13, fontWeight:active ? 700 : 500, cursor:"pointer",
                  transition:"background .1s", textAlign:"left",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = hover; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={16} />
                <span style={{ flex:1 }}>{opt.label}</span>
                {active && <span style={{ fontSize:14 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes themeDropdownIn {
          from { opacity:0; transform:translateY(-6px) scale(.97); }
          to { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ThemeToggle;
