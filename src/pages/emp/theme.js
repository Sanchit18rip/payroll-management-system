// =============================================
// SHARED THEME - shadCN-inspired design tokens
// Now theme-aware: reads data-theme from <html>
// =============================================

function isLight() {
  try {
    return document.documentElement.getAttribute('data-theme') === 'light';
  } catch {
    return false;
  }
}

// ── Dark colors (default) ──
const darkColors = {
  bg: {
    page: 'linear-gradient(160deg, #020617 0%, #0f172a 55%, #172554 100%)',
    card: 'rgba(15, 23, 42, 0.6)',
    cardHover: 'rgba(30, 41, 59, 0.7)',
    input: 'rgba(2, 6, 23, 0.6)',
    overlay: 'rgba(0,0,0,0.7)',
  },
  border: {
    default: '1px solid rgba(148, 163, 184, 0.1)',
    subtle: '1px solid rgba(148, 163, 184, 0.06)',
    focus: '1px solid rgba(99, 102, 241, 0.5)',
    card: '1px solid rgba(148, 163, 184, 0.12)',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    muted: '#64748b',
    accent: '#818cf8',
  },
  badge: {
    success: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' },
    danger: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.25)' },
    warning: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
    info: { bg: 'rgba(56,189,248,0.12)', text: '#38bdf8', border: 'rgba(56,189,248,0.25)' },
    purple: { bg: 'rgba(168,85,247,0.12)', text: '#a855f7', border: 'rgba(168,85,247,0.25)' },
    neutral: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
  },
  accent: {
    blue: '#3b82f6',
    indigo: '#6366f1',
    violet: '#8b5cf6',
    green: '#22c55e',
    red: '#ef4444',
    amber: '#f59e0b',
    cyan: '#06b6d4',
  },
};

// ── Light colors ──
const lightColors = {
  bg: {
    page: 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 55%, #cbd5e1 100%)',
    card: 'rgba(255, 255, 255, 0.85)',
    cardHover: 'rgba(241, 245, 249, 0.9)',
    input: 'rgba(241, 245, 249, 0.9)',
    overlay: 'rgba(0,0,0,0.4)',
  },
  border: {
    default: '1px solid rgba(0, 0, 0, 0.08)',
    subtle: '1px solid rgba(0, 0, 0, 0.04)',
    focus: '1px solid rgba(59, 130, 246, 0.5)',
    card: '1px solid rgba(0, 0, 0, 0.08)',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#94a3b8',
    accent: '#4f46e5',
  },
  badge: {
    success: { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', border: 'rgba(34,197,94,0.25)' },
    danger: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', border: 'rgba(239,68,68,0.25)' },
    warning: { bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: 'rgba(245,158,11,0.25)' },
    info: { bg: 'rgba(56,189,248,0.1)', text: '#0284c7', border: 'rgba(56,189,248,0.25)' },
    purple: { bg: 'rgba(168,85,247,0.1)', text: '#7c3aed', border: 'rgba(168,85,247,0.25)' },
    neutral: { bg: 'rgba(148,163,184,0.08)', text: '#64748b', border: 'rgba(148,163,184,0.15)' },
  },
  accent: {
    blue: '#2563eb',
    indigo: '#4f46e5',
    violet: '#7c3aed',
    green: '#16a34a',
    red: '#dc2626',
    amber: '#d97706',
    cyan: '#0284c7',
  },
};

// ── Spacing / Radius / Shadow (same for both themes) ──
export const spacing = {
  page: { padding: '32px', maxWidth: '1440px', margin: '0 auto' },
  section: { marginBottom: '24px' },
  cardPadding: '24px',
  gap: '16px',
};

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
};

const darkShadow = {
  card: '0 1px 3px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2)',
  elevated: '0 4px 20px rgba(0,0,0,0.4)',
  glow: (color) => `0 0 20px ${color}33`,
};

const lightShadow = {
  card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03)',
  elevated: '0 4px 16px rgba(0,0,0,0.08)',
  glow: (color) => `0 0 15px ${color}22`,
};

export const shadow = new Proxy(darkShadow, {
  get(target, prop) {
    const cur = isLight() ? lightShadow : darkShadow;
    return cur[prop] !== undefined ? cur[prop] : target[prop];
  }
});

// ── Dynamic colors getter ──
export const colors = new Proxy(darkColors, {
  get(target, prop) {
    const cur = isLight() ? lightColors : darkColors;
    if (cur[prop] !== undefined) return cur[prop];
    return target[prop];
  }
});

// ── Shared component styles (dynamic) ──
function makeStyles() {
  const light = isLight();
  const c = light ? lightColors : darkColors;
  const s = light ? lightShadow : darkShadow;

  return {
    pageContainer: {
      padding: '32px',
      maxWidth: '1440px',
      margin: '0 auto',
      minHeight: '100vh',
      background: c.bg.page,
      animation: 'pageFadeIn 0.3s ease',
    },

    sectionCard: {
      background: c.bg.card,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: radius.xl,
      padding: spacing.cardPadding,
      border: c.border.card,
      boxShadow: s.card,
      marginBottom: spacing.section,
    },

    miniCard: {
      background: c.bg.card,
      backdropFilter: 'blur(12px)',
      borderRadius: radius.lg,
      padding: '20px',
      border: c.border.card,
      boxShadow: s.card,
    },

    pageTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: c.text.primary,
      marginTop: 0,
      marginBottom: '4px',
      letterSpacing: '-0.5px',
    },

    pageSubtitle: {
      fontSize: '14px',
      color: c.text.secondary,
      margin: '0 0 28px 0',
    },

    sectionTitle: {
      fontSize: '17px',
      fontWeight: '600',
      color: c.text.primary,
      marginTop: 0,
      marginBottom: '16px',
      letterSpacing: '-0.3px',
    },

    label: {
      display: 'block',
      marginBottom: '6px',
      color: c.text.secondary,
      fontSize: '13px',
      fontWeight: '500',
    },

    input: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: radius.md,
      border: light ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(148,163,184,0.2)',
      background: c.bg.input,
      color: c.text.primary,
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.15s ease',
    },

    textarea: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: radius.md,
      border: light ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(148,163,184,0.2)',
      background: c.bg.input,
      color: c.text.primary,
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      height: '90px',
      resize: 'none',
    },

    select: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: radius.md,
      border: light ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(148,163,184,0.2)',
      background: c.bg.input,
      color: c.text.primary,
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: light
        ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: '36px',
    },

    primaryBtn: {
      padding: '10px 20px',
      background: `linear-gradient(135deg, ${c.accent.indigo}, ${c.accent.violet})`,
      color: '#fff',
      border: 'none',
      borderRadius: radius.md,
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      boxShadow: light
        ? '0 2px 8px rgba(79,70,229,0.2)'
        : '0 2px 10px rgba(99,102,241,0.25)',
      transition: 'all 0.15s ease',
    },

    secondaryBtn: {
      padding: '10px 20px',
      background: light ? 'rgba(0,0,0,0.05)' : 'rgba(51,65,85,0.5)',
      color: c.text.primary,
      border: light ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(148,163,184,0.15)',
      borderRadius: radius.md,
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    },

    dangerBtn: {
      padding: '10px 20px',
      background: `linear-gradient(135deg, #ef4444, #dc2626)`,
      color: '#fff',
      border: 'none',
      borderRadius: radius.md,
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
    },

    // Table styles
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      padding: '10px 14px',
      color: c.text.secondary,
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: light ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(148,163,184,0.1)',
      background: light ? 'rgba(241,245,249,0.9)' : 'rgba(2,6,23,0.4)',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    },
    td: {
      padding: '12px 14px',
      color: c.text.primary,
      fontSize: '14px',
      borderBottom: light ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(148,163,184,0.06)',
    },

    // Badge
    badge: (variant = 'neutral') => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: c.badge[variant].bg,
      color: c.badge[variant].text,
      border: `1px solid ${c.badge[variant].border}`,
      whiteSpace: 'nowrap',
    }),

    // Grid layouts
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },

    twoCol: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '24px',
    },

    col: (flex = '1 1 480px') => ({
      flex,
      minWidth: 0,
    }),

    profileGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
    },

    // Month/Year selector
    dateSelector: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    },

    // Overlay
    overlay: {
      position: 'fixed',
      inset: 0,
      background: c.bg.overlay,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
    },

    modal: {
      background: light ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.9)',
      backdropFilter: 'blur(24px)',
      border: light ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(148,163,184,0.15)',
      borderRadius: radius.xl,
      padding: '32px',
      maxWidth: '560px',
      width: '100%',
      boxShadow: s.elevated,
    },

    centerScreen: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: c.bg.page,
      padding: '20px',
    },

    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: c.text.secondary,
      fontSize: '14px',
    },
  };
}

// Use Proxy so styles always reflect current theme at access time
export const styles = new Proxy({}, {
  get(_, prop) {
    const s = makeStyles();
    return s[prop];
  }
});

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const formatNumber = (value, decimals = 0) => {
  const num = Number(value || 0);
  return decimals > 0 ? num.toFixed(decimals) : num.toLocaleString('en-IN');
};

export const getMonthName = (month) => {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return months[Number(month) - 1] || '';
};

export const statusBadge = (status) => {
  const map = {
    'Present': 'success',
    'Approved': 'success',
    'Completed': 'success',
    'Active': 'success',
    'Paid Leave': 'info',
    'Absent': 'danger',
    'Rejected': 'danger',
    'Missed': 'danger',
    'Pending': 'warning',
    'In Progress': 'info',
    'Half Day': 'purple',
  };
  return styles.badge(map[status] || 'neutral');
};
