// Shared light theme design tokens for employee pages.

export const colors = {
  bg: {
    page: "linear-gradient(160deg, #f8fafc 0%, #e2e8f0 55%, #cbd5e1 100%)",
    card: "rgba(255,255,255,.88)",
    cardHover: "rgba(248,250,252,.96)",
    input: "rgba(255,255,255,.92)",
    overlay: "rgba(15,23,42,.35)",
  },
  border: {
    default: "1px solid rgba(15,23,42,.10)",
    subtle: "1px solid rgba(15,23,42,.06)",
    focus: "1px solid rgba(37,99,235,.45)",
    card: "1px solid rgba(15,23,42,.09)",
  },
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#64748b",
    accent: "#2563eb",
  },
  badge: {
    success: { bg: "#dcfce7", text: "#15803d", border: "rgba(22,163,74,.22)" },
    danger: { bg: "#fee2e2", text: "#b91c1c", border: "rgba(220,38,38,.22)" },
    warning: { bg: "#fef3c7", text: "#b45309", border: "rgba(217,119,6,.22)" },
    info: { bg: "#e0f2fe", text: "#0369a1", border: "rgba(2,132,199,.22)" },
    purple: { bg: "#ede9fe", text: "#6d28d9", border: "rgba(124,58,237,.22)" },
    neutral: { bg: "#f1f5f9", text: "#475569", border: "rgba(71,85,105,.16)" },
  },
  accent: {
    blue: "#2563eb", indigo: "#4f46e5", violet: "#7c3aed",
    green: "#16a34a", red: "#dc2626", amber: "#d97706", cyan: "#0284c7",
  },
};

export const spacing = {
  page: { padding: "32px", maxWidth: "1440px", margin: "0 auto" },
  section: { marginBottom: "24px" },
  cardPadding: "24px",
  gap: "16px",
};

export const radius = { sm: "8px", md: "12px", lg: "16px", xl: "20px" };

export const shadow = {
  card: "0 1px 3px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.06)",
  elevated: "0 8px 28px rgba(15,23,42,.10)",
  glow: (color) => `0 0 15px ${color}22`,
};

export const styles = {
  pageContainer: {
    padding: "32px", maxWidth: "1440px", margin: "0 auto", minHeight: "100vh",
    background: colors.bg.page, color: colors.text.primary, animation: "pageFadeIn .3s ease",
  },
  sectionCard: {
    background: colors.bg.card, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderRadius: radius.xl, padding: spacing.cardPadding, border: colors.border.card,
    boxShadow: shadow.card, marginBottom: spacing.section, color: colors.text.primary,
  },
  miniCard: {
    background: colors.bg.card, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderRadius: radius.lg, padding: "20px", border: colors.border.card,
    boxShadow: shadow.card, color: colors.text.primary,
  },
  pageTitle: {
    fontSize: "28px", fontWeight: "700", color: colors.text.primary,
    marginTop: 0, marginBottom: "4px", letterSpacing: "-.5px",
  },
  pageSubtitle: {
    fontSize: "14px", color: colors.text.secondary, margin: "0 0 28px 0",
  },
  sectionTitle: {
    fontSize: "17px", fontWeight: "600", color: colors.text.primary,
    marginTop: 0, marginBottom: "16px", letterSpacing: "-.3px",
  },
  label: {
    display: "block", marginBottom: "6px", color: colors.text.secondary,
    fontSize: "13px", fontWeight: "500",
  },
  input: {
    width: "100%", padding: "10px 14px", borderRadius: radius.md,
    border: colors.border.default, background: colors.bg.input, color: colors.text.primary,
    fontSize: "14px", outline: "none", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "10px 14px", borderRadius: radius.md,
    border: colors.border.default, background: colors.bg.input, color: colors.text.primary,
    fontSize: "14px", outline: "none", boxSizing: "border-box",
    height: "90px", resize: "none",
  },
  select: {
    width: "100%", padding: "10px 14px", borderRadius: radius.md,
    border: colors.border.default, background: colors.bg.input, color: colors.text.primary,
    fontSize: "14px", outline: "none", boxSizing: "border-box",
    cursor: "pointer", appearance: "none", paddingRight: "36px",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  },
  primaryBtn: {
    padding: "10px 20px",
    background: `linear-gradient(135deg, ${colors.accent.indigo}, ${colors.accent.violet})`,
    color: "#fff", border: "none", borderRadius: radius.md,
    fontWeight: "600", fontSize: "14px", cursor: "pointer",
    boxShadow: "0 2px 8px rgba(37,99,235,.18)",
  },
  secondaryBtn: {
    padding: "10px 20px", background: "#f8fafc",
    color: colors.text.primary, border: colors.border.default, borderRadius: radius.md,
    fontWeight: "500", fontSize: "14px", cursor: "pointer",
  },
  dangerBtn: {
    padding: "10px 20px", background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff", border: "none", borderRadius: radius.md,
    fontWeight: "600", fontSize: "14px", cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
  th: {
    textAlign: "left", padding: "10px 14px", color: colors.text.secondary,
    fontSize: "12px", fontWeight: "600", textTransform: "uppercase",
    letterSpacing: ".5px",
    borderBottom: "1px solid rgba(15,23,42,.08)",
    background: "rgba(241,245,249,.95)",
    position: "sticky", top: 0, zIndex: 1,
  },
  td: {
    padding: "12px 14px", color: colors.text.primary, fontSize: "14px",
    borderBottom: "1px solid rgba(15,23,42,.05)",
  },
  badge: (variant = "neutral") => {
    const badge = colors.badge[variant] || colors.badge.neutral;
    return {
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: "20px", fontSize: "12px", fontWeight: "600",
      background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`,
      whiteSpace: "nowrap",
    };
  },
  summaryGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "16px", marginBottom: "24px",
  },
  twoCol: { display: "flex", flexWrap: "wrap", gap: "24px" },
  col: (flex = "1 1 480px") => ({ flex, minWidth: 0 }),
  profileGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px",
  },
  dateSelector: {
    display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap",
  },
  overlay: {
    position: "fixed", inset: 0, background: colors.bg.overlay, display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px",
  },
  modal: {
    background: "rgba(255,255,255,.97)",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: colors.border.card, borderRadius: radius.xl, padding: "32px",
    maxWidth: "560px", width: "100%", boxShadow: shadow.elevated, color: colors.text.primary,
  },
  centerScreen: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: colors.bg.page, padding: "20px", color: colors.text.primary,
  },
  emptyState: {
    textAlign: "center", padding: "40px 20px", color: colors.text.secondary, fontSize: "14px",
  },
};

export const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const formatNumber = (value, decimals = 0) => {
  const num = Number(value || 0);
  return decimals > 0 ? num.toFixed(decimals) : num.toLocaleString("en-IN");
};

export const getMonthName = (month) => {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return months[Number(month) - 1] || "";
};

export const statusBadge = (status) => {
  const map = {
    Present: "success", Approved: "success", Completed: "success", Active: "success",
    "Paid Leave": "info", Absent: "danger", Rejected: "danger", Missed: "danger",
    Pending: "warning", "In Progress": "info", "Half Day": "purple",
  };
  return styles.badge(map[status] || "neutral");
};