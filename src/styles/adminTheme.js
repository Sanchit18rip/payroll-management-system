// Shared light theme tokens for admin pages (Employees, Payroll, PayrollReport, Invoices).

const light = {
  bg: {
    page: "#f0f4f8",
    card: "#ffffff",
    cardSolid: "#ffffff",
    input: "#ffffff",
    overlay: "rgba(15,23,42,.35)",
    glass: "#ffffff",
    modal: "#ffffff",
    modalBox: "#ffffff",
    table: "#ffffff",
    tableHeader: "#f8fafc",
    scrollArea: "#ffffff",
    rowAlt: "rgba(0,0,0,.015)",
    rowHover: "rgba(37,99,235,.05)",
  },
  border: {
    default: "1px solid #e2e8f0",
    subtle: "1px solid #f1f5f9",
    accent: "1px solid #2563eb",
    input: "1px solid #d1d5db",
    card: "1px solid #e2e8f0",
  },
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#94a3b8",
    accent: "#2563eb",
    accentAlt: "#3b82f6",
    subtle: "#334155",
    salary: "#059669",
    salaryShadow: "none",
  },
  button: {
    primary: "linear-gradient(135deg, #2563eb, #3b82f6)",
    primaryText: "#ffffff",
    glass: "#ffffff",
    glassText: "#0f172a",
    save: "linear-gradient(135deg, #2563eb, #3b82f6)",
  },
  avatar: {
    bg: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#ffffff",
  },
  shadow: {
    card: "0 1px 3px rgba(0,0,0,.08)",
    elevated: "0 4px 16px rgba(0,0,0,.08)",
    glow: "none",
  },
};

function t() {
  return light;
}

// ── Reusable style factories ──

export function glassButton(extra) {
  const d = t();
  return {
    padding: "12px 22px",
    borderRadius: "16px",
    border: d.border.default,
    background: d.button.glass,
    color: d.button.glassText,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .25s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: d.shadow.card,
    ...extra,
  };
}

export function primaryButton(extra) {
  const d = t();
  return {
    padding: "14px 24px",
    borderRadius: "16px",
    border: "none",
    background: d.button.primary,
    color: d.button.primaryText,
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(37,99,235,.2)",
    transition: "all .25s ease",
    ...extra,
  };
}

export function searchInputStyle(extra) {
  const d = t();
  return {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "16px",
    border: d.border.input,
    background: d.bg.input,
    color: d.text.primary,
    fontSize: "15px",
    outline: "none",
    ...extra,
  };
}

export function inputStyle(extra) {
  const d = t();
  return {
    width: "100%",
    padding: "14px",
    marginBottom: "16px",
    borderRadius: "12px",
    border: d.border.input,
    background: d.bg.input,
    color: d.text.primary,
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    ...extra,
  };
}

export function modalOverlay(extra) {
  return {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(15,23,42,.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    ...extra,
  };
}

export function modalBox(extra) {
  const d = t();
  return {
    background: "#ffffff",
    color: d.text.primary,
    padding: "30px",
    borderRadius: "20px",
    width: "500px",
    border: d.border.card,
    boxShadow: "0 20px 60px rgba(0,0,0,.15)",
    ...extra,
  };
}

export function employeeModal(extra) {
  const d = t();
  return {
    width: "90%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "30px",
    borderRadius: "24px",
    background: "#ffffff",
    border: d.border.card,
    boxShadow: "0 20px 60px rgba(0,0,0,.15)",
    ...extra,
  };
}

export function formContainer(extra) {
  return {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,.08)",
    ...extra,
  };
}

export function tableStyle(extra) {
  return {
    width: "100%",
    minWidth: "1200px",
    tableLayout: "fixed",
    background: "transparent",
    color: "#0f172a",
    borderCollapse: "separate",
    borderSpacing: 0,
    ...extra,
  };
}

export function headerStyle(extra) {
  return {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: "700",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    padding: "18px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px rgba(0,0,0,.04)",
    ...extra,
  };
}

export function tdStyle(extra) {
  return {
    padding: "18px 16px",
    textAlign: "center",
    verticalAlign: "middle",
    borderBottom: "1px solid #f1f5f9",
    color: "#0f172a",
    ...extra,
  };
}

export function paginationInfo(extra) {
  return {
    minWidth: "80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 18px",
    borderRadius: "12px",
    background: "rgba(37,99,235,.08)",
    border: "1px solid rgba(37,99,235,.20)",
    color: "#2563eb",
    fontWeight: "700",
    ...extra,
  };
}

export function paginationButton(extra) {
  return {
    padding: "10px 18px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all .25s ease",
    ...extra,
  };
}

export function glassScrollAreaStyle(extra) {
  return {
    borderRadius: "24px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 16px rgba(0,0,0,.08)",
    ...extra,
  };
}

export function sectionCard(extra) {
  return {
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    boxShadow: "0 4px 16px rgba(0,0,0,.08)",
    padding: "30px",
    minHeight: "400px",
    ...extra,
  };
}

// ── Text helpers ──

export function textColor(type) {
  const d = t();
  return d.text[type] || d.text.primary;
}

export function accentColor() {
  return "#2563eb";
}

// ── Row hover helpers ──

export function rowHoverHandlers() {
  return {
    onMouseEnter: (e) => {
      e.currentTarget.style.background = "rgba(37,99,235,.05)";
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.background = "transparent";
    },
  };
}


export default {
  glassButton,
  primaryButton,
  searchInputStyle,
  inputStyle,
  modalOverlay,
  modalBox,
  employeeModal,
  formContainer,
  tableStyle,
  headerStyle,
  tdStyle,
  paginationInfo,
  paginationButton,
  glassScrollAreaStyle,
  sectionCard,
  textColor,
  accentColor,
  rowHoverHandlers,
};
