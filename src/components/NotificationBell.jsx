import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";

const API_BASE = 'http://localhost:5000';

const TYPE_ICONS = {
  leave: "📅",
  payroll: "💰",
  expense: "🧾",
  loan: "🏦",
  document: "📄",
  system: "⚙️",
};

function typeIcon(type) {
  return TYPE_ICONS[type] || "🔔";
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

function NotificationBell({ employeeId }) {
  // notifications === null means "still loading"
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(
    employeeId || null
  );
  const [notifications, setNotifications] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const dropdownRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const initialLoadRef = useRef(false);

  const employee = employeeId || resolvedEmployeeId;

  // Resolve employee id from the logged-in user if none was passed in
  useEffect(() => {
    if (employeeId) return; // prop provided — nothing to resolve

    let cancelled = false;

    const resolveEmployee = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.email) return;

        const res = await fetch(
          `${API_BASE}/api/employees/by-email/${encodeURIComponent(user.email)}`
        );
        if (!res.ok) return;

        const emp = await res.json();
        if (!cancelled && emp?.id) {
          setResolvedEmployeeId(emp.id);
        }
      } catch {
        // Ignore — bell simply stays empty if identity cannot be resolved
      }
    };

    resolveEmployee();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const pushToast = useCallback((n) => {
    const id = `toast-${n.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { id, ...n }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!employee) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/${employee}`
      );
      if (res.ok) {
        const list = await res.json();
        setNotifications(list);
        // First load: remember existing ids silently (no toasts for old ones)
        if (!initialLoadRef.current) {
          initialLoadRef.current = true;
          list.forEach((n) => seenIdsRef.current.add(n.id));
          return;
        }
        // Later loads: toast only genuinely new unread notifications
        const newUnread = list.filter(
          (n) => !n.is_read && !seenIdsRef.current.has(n.id)
        );
        newUnread.forEach((n) => {
          seenIdsRef.current.add(n.id);
          pushToast(n);
        });
      }
    } catch {
      // Ignore network errors
    }
  }, [employee, pushToast]);

  const loadUnreadCount = useCallback(async () => {
    if (!employee) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/notifications/${employee}/unread-count`
      );
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(Number(data.count) || 0);
      }
    } catch {
      // Ignore network errors
    }
  }, [employee]);

  // Initial load + periodic badge refresh. The first load is deferred to a
  // timer callback so the effect body only schedules work.
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotifications();
      loadUnreadCount();
    }, 0);
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadNotifications, loadUnreadCount]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PUT",
      });
    } catch {
      // Ignore — optimistic update below keeps UI consistent
    }
    setNotifications((prev) =>
      prev && prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    loadUnreadCount();
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employee }),
      });
    } catch {
      // Ignore
    }
    setNotifications((prev) =>
      prev && prev.map((n) => ({ ...n, is_read: true }))
    );
    loadUnreadCount();
  };

  const unread = notifications
    ? notifications.filter((n) => !n.is_read).length
    : 0;

  return (
    <>
      <div
        ref={dropdownRef}
        style={{ position: "relative", display: "inline-block" }}
      >
        <button
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) loadNotifications();
          }}
          style={bellButton}
          title="Notifications"
        >
          <span style={{ fontSize: "18px" }}>🔔</span>
          {unreadCount > 0 && (
            <span
              key={unreadCount}
              style={{ ...badgeStyle, animation: "bellBadgePop 0.35s ease" }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            style={{
              ...dropdownStyle,
              animation: "bellDropdownIn 0.18s ease",
            }}
          >
            <div style={dropdownHeader}>
              <span
                style={{
                  fontWeight: 600,
                  color: "#f8fafc",
                  fontSize: "14px",
                }}
              >
                Notifications
              </span>
              {unread > 0 && (
                <button onClick={markAllRead} style={markAllStyle}>
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {notifications === null ? (
                <p style={emptyStyle}>Loading…</p>
              ) : notifications.length === 0 ? (
                <p style={emptyStyle}>No notifications yet</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    style={{
                      ...notificationItem,
                      background: n.is_read ? "#1e293b" : "#182741",
                      borderLeft: n.is_read
                        ? "3px solid transparent"
                        : "3px solid #3b82f6",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>{typeIcon(n.type)}</span>
                      <span
                        style={{
                          fontWeight: n.is_read ? 500 : 700,
                          color: "#f8fafc",
                          fontSize: "13px",
                        }}
                      >
                        {n.title}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "12px",
                        margin: "4px 0 0",
                        textAlign: "left",
                      }}
                    >
                      {n.body}
                    </p>
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "11px",
                        marginTop: "6px",
                      }}
                    >
                      {formatTime(n.created_at)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {toasts.length > 0 && (
        <div style={toastContainer}>
          {toasts.map((t) => (
            <div
              key={t.id}
              style={{ ...toastItem, animation: "bellToastIn 0.25s ease" }}
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
            >
              <span style={{ fontSize: "16px" }}>{typeIcon(t.type)}</span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#f8fafc",
                    fontSize: "13px",
                  }}
                >
                  {t.title}
                </div>
                {t.body && (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px",
                      marginTop: "2px",
                      wordBreak: "break-word",
                    }}
                  >
                    {t.body}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const bellButton = {
  position: "relative",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  top: "44px",
  right: "0",
  width: "320px",
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "14px",
  boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
  zIndex: 3000,
  overflow: "hidden",
};

const dropdownHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  borderBottom: "1px solid #334155",
  background: "#0f172a",
};

const markAllStyle = {
  background: "transparent",
  border: "none",
  color: "#60a5fa",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
};

const notificationItem = {
  display: "block",
  width: "100%",
  textAlign: "left",
  border: "none",
  borderBottom: "1px solid #334155",
  padding: "10px 14px",
  cursor: "pointer",
  boxSizing: "border-box",
};

const emptyStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  textAlign: "center",
  padding: "24px 12px",
  margin: 0,
};

const toastContainer = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 10000,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  pointerEvents: "none",
};

const toastItem = {
  pointerEvents: "auto",
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  background: "#1e293b",
  border: "1px solid #334155",
  borderLeft: "3px solid #3b82f6",
  borderRadius: "12px",
  boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
  padding: "12px 14px",
  minWidth: "260px",
  maxWidth: "340px",
  cursor: "pointer",
};

export default NotificationBell;
