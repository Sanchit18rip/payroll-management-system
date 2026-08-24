import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { apiFetch, API_BASE } from "../api";
import { useTheme } from "../context/ThemeContext";
import { Plane, Wallet, CalendarDays, Receipt, Landmark, FileText, Settings, Bell, BellRing, Trash2, X } from "lucide-react";

const TYPE_ICONS = {
  leave: Plane,
  payroll: Wallet,
  attendance: CalendarDays,
  expense: Receipt,
  loan: Landmark,
  document: FileText,
  system: Settings,
};

const TYPE_COLORS = {
  leave: '#a855f7',
  payroll: '#22c55e',
  attendance: '#06b6d4',
  expense: '#f59e0b',
  loan: '#818cf8',
  document: '#94a3b8',
  system: '#64748b',
};

// HR vs Employee accent colors
const ROLE_THEMES = {
  hr: {
    accent: '#10b981',        // emerald
    accentLight: '#10b98120',
    accentBorder: '#10b98140',
    headerBg: 'rgba(5, 46, 30, 0.6)',
    headerBorder: 'rgba(16, 185, 129, 0.15)',
    badge: '#10b981',
    label: 'HR Panel',
  },
  employee: {
    accent: '#3b82f6',        // blue
    accentLight: '#3b82f620',
    accentBorder: '#3b82f640',
    headerBg: 'rgba(15, 23, 42, 0.6)',
    headerBorder: 'rgba(59, 130, 246, 0.15)',
    badge: '#3b82f6',
    label: 'Notifications',
  },
};

function typeIcon(type) {
  const Icon = TYPE_ICONS[type] || Bell;
  const color = TYPE_COLORS[type] || '#64748b';
  return <Icon size={16} color={color} />;
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date)) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationBell({ employeeId, role = 'employee' }) {
  const { isDark } = useTheme();
  const isHR = role === 'hr';
  const theme = isHR ? ROLE_THEMES.hr : ROLE_THEMES.employee;
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(employeeId || null);
  const [notifications, setNotifications] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const initialLoadRef = useRef(false);

  const employee = isHR ? 'hr' : (employeeId || resolvedEmployeeId);

  useEffect(() => {
    if (employeeId || role === 'hr') return;
    let cancelled = false;
    const resolveEmployee = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;
        const res = await apiFetch(`${API_BASE}/api/employees/by-email/${encodeURIComponent(user.email)}`);
        if (!res.ok) return;
        const emp = await res.json();
        if (!cancelled && emp?.id) setResolvedEmployeeId(emp.id);
      } catch { }
    };
    resolveEmployee();
    return () => { cancelled = true; };
  }, [employeeId]);

  const pushToast = useCallback((n) => {
    const id = `toast-${n.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, ...n }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);  const loadNotifications = useCallback(async () => {
    if (employee == null) return;
    try {
      const url = `${API_BASE}/api/notifications/${employee}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const list = await res.json();
        setNotifications(list);
        if (!initialLoadRef.current) {
          initialLoadRef.current = true;
          list.forEach((n) => seenIdsRef.current.add(n.id));
          return;
        }
        const newUnread = list.filter((n) => !n.is_read && !seenIdsRef.current.has(n.id));
        newUnread.forEach((n) => {
          seenIdsRef.current.add(n.id);
          pushToast(n);
        });
      } else {
        console.error('Notification fetch failed:', res.status, res.statusText);
        setNotifications([]);
      }
    } catch (err) {
      console.error('Notification load error:', err);
      setNotifications([]);
    }
  }, [employee, pushToast]);

  const loadUnreadCount = useCallback(async () => {
    if (employee == null) return;
    try {
      const url = `${API_BASE}/api/notifications/${employee}/unread-count`;
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(Number(data.count) || 0);
      } else {
        console.error('Unread count fetch failed:', res.status);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Unread count error:', err);
      setUnreadCount(0);
    }
  }, [employee]);

  useEffect(() => {
    const timer = setTimeout(() => { loadNotifications(); loadUnreadCount(); }, 0);
    const interval = setInterval(() => { loadNotifications(); loadUnreadCount(); }, 15000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [loadNotifications, loadUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiFetch(`${API_BASE}/api/notifications/${id}/read`, { method: "PUT" });
    } catch { }
    setNotifications((prev) => prev && prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    loadUnreadCount();
  };

  const deleteNotification = async (id) => {
    try {
      await apiFetch(`${API_BASE}/api/notifications/${id}`, { method: "DELETE" });
    } catch { }
    setNotifications((prev) => prev && prev.filter((n) => n.id !== id));
    loadUnreadCount();
  };

  const markAllRead = async () => {
    try {
      await apiFetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employee }),
      });
    } catch { }
    setNotifications((prev) => prev && prev.map((n) => ({ ...n, is_read: true })));
    loadUnreadCount();
  };

  const clearAll = async () => {
    if (!notifications || notifications.length === 0) return;
    try {
      await apiFetch(`${API_BASE}/api/notifications/clear-all`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employee }),
      });
    } catch { }
    setNotifications([]);
    setUnreadCount(0);
  };

  const unread = notifications ? notifications.filter((n) => !n.is_read).length : 0;

  return (
    <>
      <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) loadNotifications();
          }}
          style={{
            ...bellButton,
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            border: isDark ? "1px solid rgba(148,163,184,0.2)" : "1px solid rgba(0,0,0,0.1)",
          }}
          title={theme.label}
        >
          <BellRing size={22} color={isDark ? "#f8fafc" : "#475569"} />
          {unreadCount > 0 && (
            <span key={unreadCount} style={{ ...badgeStyle, background: theme.badge, animation: "bellBadgePop 0.35s ease" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div style={{ ...dropdownStyle, borderColor: isDark ? "rgba(148,163,184,0.12)" : "rgba(0,0,0,0.08)", background: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.97)", boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.12)", animation: "bellDropdownIn 0.18s ease" }}>
            {/* Header with role-specific color */}
            <div style={{ ...dropdownHeader, background: isDark ? theme.headerBg : "rgba(241,245,249,0.95)", borderBottomColor: isDark ? theme.headerBorder : "rgba(0,0,0,0.06)" }}>
              <span style={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "14px" }}>
                <span style={{ color: isDark ? theme.accent : (isHR ? '#059669' : '#2563eb'), fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: 6 }}>{theme.label}</span>
                {unread > 0 && <span style={{ color: isDark ? theme.accent : (isHR ? '#059669' : '#2563eb'), fontSize: '12px' }}>({unread} unread)</span>}
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ ...markAllStyle, color: theme.accent }}>Mark all read</button>
                )}
                {notifications && notifications.length > 0 && (
                  <button onClick={clearAll} style={{ ...clearAllStyle, borderColor: `${theme.accent}30`, color: theme.accent }} title="Clear all">
                    <Trash2 size={13} /> Clear all
                  </button>
                )}
              </div>
            </div>

            <div style={scrollArea}>
              {notifications === null ? (
                <p style={emptyStyle}>Loading…</p>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 12px' }}>
                  <Bell size={32} color={isDark ? "#334155" : "#94a3b8"} style={{ marginBottom: 8 }} />
                  <p style={{ ...emptyStyle, margin: 0 }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      ...notificationItem,
                      background: isDark ? (n.is_read ? "rgba(30,41,59,0.5)" : "rgba(24,39,65,0.8)") : (n.is_read ? "rgba(0,0,0,0.02)" : "rgba(59,130,246,0.04)"),
                      borderLeft: n.is_read ? "3px solid transparent" : `3px solid ${TYPE_COLORS[n.type] || theme.accent}`,
                    }}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: `${TYPE_COLORS[n.type] || theme.accent}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {typeIcon(n.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: n.is_read ? 500 : 700, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "14px", display: 'block' }}>
                          {n.title}
                        </span>
                        <p style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "13px", margin: "5px 0 0", lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                          {n.body}
                        </p>
                        <span style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: "11px", marginTop: "6px", display: 'block' }}>
                          {formatTime(n.created_at)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        style={deleteBtn}
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Popups */}
      {toasts.length > 0 && (
        <div style={toastContainer}>
          {toasts.map((t) => (
            <div key={t.id} style={{
              ...toastItem,
              background: isDark ? "rgba(15, 23, 42, 0.95)" : "#ffffff",
              borderLeft: `3px solid ${theme.accent}`,
              boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.1)",
              animation: "bellToastIn 0.3s ease",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${TYPE_COLORS[t.type] || theme.accent}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {typeIcon(t.type)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", fontSize: "13px" }}>{t.title}</div>
                {t.body && (
                  <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "12px", marginTop: "2px", wordBreak: "break-word", lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                    {t.body}
                  </div>
                )}
                <div style={{ color: '#475569', fontSize: '10px', marginTop: 4 }}>Just now</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setToasts((prev) => prev.filter((x) => x.id !== t.id)); }}
                style={toastCloseButton}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes bellBadgePop {
          0% { transform: scale(0.5); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes bellDropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bellToastIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

/* ─── Styles ─── */

const bellButton = {
  position: "relative",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(148,163,184,0.2)",
  cursor: "pointer",
  padding: "10px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "44px",
  height: "44px",
  transition: 'all 0.15s ease',
};

const badgeStyle = {
  position: "absolute",
  top: "0px",
  right: "0px",
  background: "#ef4444",
  color: "#fff",
  fontSize: "10px",
  fontWeight: "700",
  minWidth: "16px",
  height: "16px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 4px",
  boxSizing: "border-box",
};

const dropdownStyle = {
  position: "absolute",
  top: "54px",
  right: 0,
  width: "440px",
  maxHeight: "580px",
  background: "rgba(15, 23, 42, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: "18px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  zIndex: 3000,
  overflow: "hidden",
};

const dropdownHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 20px",
  borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
  background: "rgba(15, 23, 42, 0.6)",
};

const scrollArea = {
  maxHeight: "460px",
  overflowY: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(148,163,184,0.2) transparent",
  padding: '6px 0',
};

const markAllStyle = {
  background: "transparent",
  border: "none",
  color: "#60a5fa",
  fontSize: "11px",
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
  whiteSpace: 'nowrap',
};

const clearAllStyle = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.2)",
  color: "#f87171",
  fontSize: "11px",
  cursor: "pointer",
  padding: "5px 10px",
  borderRadius: "8px",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  whiteSpace: 'nowrap',
};

const notificationItem = {
  display: "flex",
  width: "100%",
  textAlign: "left",
  border: "none",
  borderBottom: "1px solid rgba(148, 163, 184, 0.06)",
  padding: "16px 20px",
  cursor: "pointer",
  boxSizing: "border-box",
  transition: 'background 0.15s ease',
};

const deleteBtn = {
  background: "transparent",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  padding: "6px",
  borderRadius: "6px",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  opacity: 0.4,
  transition: 'opacity 0.15s ease',
  marginLeft: '8px',
};

const emptyStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  textAlign: "center",
  padding: "24px 12px",
};

const toastContainer = {
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10000,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  pointerEvents: "none",
  maxWidth: "400px",
  width: "90%",
};

const toastItem = {
  pointerEvents: "auto",
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  background: "rgba(15, 23, 42, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(148, 163, 184, 0.15)",
  borderRadius: "14px",
  boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
  padding: "12px 14px",
};

const toastCloseButton = {
  background: "transparent",
  border: "none",
  color: "#64748b",
  cursor: "pointer",
  padding: "4px",
  borderRadius: "4px",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'color 0.15s ease',
};

export default NotificationBell;
