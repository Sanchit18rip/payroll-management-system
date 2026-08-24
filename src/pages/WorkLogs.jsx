import { apiFetch, API_BASE } from "../api";
import { useState, useEffect, useCallback, useMemo } from "react";

function WorkLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [dateFilter, setDateFilter] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const loadWorkLogs = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await apiFetch(`${API_BASE}/api/work-logs`);
      if (!res.ok) throw new Error("Could not load work logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not load work logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkLogs();
    const interval = setInterval(loadWorkLogs, 15000);
    return () => clearInterval(interval);
  }, [loadWorkLogs]);

  // ---- Date-filtered logs ----
  const dateLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!dateFilter) return true;
      const logDateStr = log.slot_start_time
        ? new Date(log.slot_start_time).toLocaleDateString("en-CA")
        : null;
      return logDateStr === dateFilter;
    });
  }, [logs, dateFilter]);

  // ---- Only employees who have work logs (generated = present) ----
  const presentEmployees = useMemo(() => {
    const grouped = {};
    dateLogs.forEach((log) => {
      const key = log.employee_id;
      if (!grouped[key]) {
        grouped[key] = {
          employee_id: log.employee_id,
          employee_name: log.employee_name,
          department: log.department,
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          missed: 0,
        };
      }
      grouped[key].total += 1;
      if (log.status === "Completed") grouped[key].completed += 1;
      else if (log.status === "In Progress") grouped[key].inProgress += 1;
      else if (log.status === "Missed") grouped[key].missed += 1;
      else grouped[key].pending += 1;
    });
    return Object.values(grouped).sort((a, b) =>
      (a.employee_name || "").localeCompare(b.employee_name || "")
    );
  }, [dateLogs]);

  // ---- Department filter options (from present employees) ----
  const departments = useMemo(() => {
    const set = new Set(presentEmployees.map((e) => e.department).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [presentEmployees]);

  // ---- Filtered logs (for table) ----
  const filteredLogs = useMemo(() => {
    let result = dateLogs;

    // If an employee is selected, only show their logs
    if (selectedEmployeeId !== null) {
      result = result.filter((log) => log.employee_id === selectedEmployeeId);
    }

    if (departmentFilter !== "All") {
      result = result.filter((log) => log.department === departmentFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter((log) => log.status === statusFilter);
    }

    // Sort by employee name first, then by slot time
    return result.sort((a, b) => {
      const nameCmp = (a.employee_name || '').localeCompare(b.employee_name || '');
      if (nameCmp !== 0) return nameCmp;
      return new Date(a.slot_start_time) - new Date(b.slot_start_time);
    });
  }, [dateLogs, selectedEmployeeId, departmentFilter, statusFilter]);

  const formatTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div style={pageContainer} className="hr-page-light">
        <p style={{ color: "#94a3b8" }}>Loading work logs...</p>
      </div>
    );
  }

  const selectedEmp = selectedEmployeeId
    ? presentEmployees.find((e) => e.employee_id === selectedEmployeeId)
    : null;

  return (
    <div style={pageContainer} className="hr-page-light">
      <h1 style={pageTitle}>Work Logs</h1>
      <p style={pageSubtitle}>
        Track employee task updates across the day — only present employees
        appear
      </p>

      {errorMsg && <div style={errorBanner}>{errorMsg}</div>}

      {/* Filters */}
      <div style={sectionCard}>
        <div style={filterRow}>
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setSelectedEmployeeId(null);
              }}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={inputStyle}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
            </select>
          </div>
          {selectedEmployeeId !== null && (
            <button
              onClick={() => setSelectedEmployeeId(null)}
              style={clearFilterBtn}
            >
              ✕ Clear Employee Filter
            </button>
          )}
          <button onClick={loadWorkLogs} style={refreshButton}>
            Refresh
          </button>
        </div>
      </div>

      {/* Employee Cards — only present employees */}
      <div style={sectionCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h2 style={sectionTitle}>
            Today's Summary ({dateFilter})
            {selectedEmp && (
              <span style={{ color: "#60a5fa", fontSize: 14, marginLeft: 10 }}>
                — Viewing: {selectedEmp.employee_name}
              </span>
            )}
          </h2>
          {selectedEmployeeId !== null && (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>
              Click a different employee or "Clear" to see all
            </span>
          )}
        </div>

        {presentEmployees.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            No present employees with work logs for this date.
          </p>
        ) : (
          <div style={employeeCardGrid}>
            {presentEmployees.map((emp) => {
              const isSelected = emp.employee_id === selectedEmployeeId;
              const empColor = isSelected ? "#60a5fa" : "#334155";
              return (
                <div
                  key={emp.employee_id}
                  onClick={() =>
                    setSelectedEmployeeId(
                      isSelected ? null : emp.employee_id
                    )
                  }
                  style={{
                    ...employeeCard,
                    border: isSelected
                      ? "2px solid #60a5fa"
                      : "1px solid #334155",
                    background: isSelected
                      ? "rgba(96,165,250,0.1)"
                      : "rgba(15,23,42,0.6)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected
                      ? "0 0 20px rgba(96,165,250,0.15)"
                      : "none",
                  }}
                >
                  {/* Avatar */}
                  <div style={employeeAvatar}>
                    {(emp.employee_name || "?").charAt(0).toUpperCase()}
                  </div>

                  {/* Name + Dept */}
                  <div style={{ marginBottom: 10 }}>
                    <p
                      style={{
                        color: isSelected ? "#60a5fa" : "#f8fafc",
                        fontSize: 16,
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {emp.employee_name}
                    </p>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: 12,
                        margin: "2px 0 0",
                      }}
                    >
                      {emp.department || "-"}
                    </p>
                  </div>

                  {/* Slot stats */}
                  <div style={slotStatsRow}>
                    <span style={slotStat("22c55e")}>
                      ✓ {emp.completed}
                    </span>
                    <span style={slotStat("3b82f6")}>
                      ◷ {emp.inProgress}
                    </span>
                    <span style={slotStat("f59e0b")}>
                      ◷ {emp.pending}
                    </span>
                    {emp.missed > 0 && (
                      <span style={slotStat("ef4444")}>
                        ✕ {emp.missed}
                      </span>
                    )}
                  </div>

                  {/* Total */}
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      margin: "8px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {emp.completed + emp.inProgress}/{emp.total} slots filled
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Logs Table */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>
          {selectedEmp
            ? `Slots — ${selectedEmp.employee_name}`
            : "All Logs"}{" "}
          ({filteredLogs.length} entries)
        </h2>

        {filteredLogs.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            No logs match the selected filters.
          </p>
        ) : (
          <div style={{ maxHeight: 500, overflow: 'auto', borderRadius: 10, border: '1px solid #334155' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Time Slot</th>
                  <th style={thStyle}>Task</th>
                  <th style={thStyle}>Related To</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>% Complete</th>
                  <th style={thStyle}>Screenshot</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      background:
                        log.employee_id === selectedEmployeeId
                          ? "rgba(96,165,250,0.06)"
                          : "transparent",
                    }}
                  >
                    <td style={tdStyle}>{log.employee_name}</td>
                    <td style={tdStyle}>{log.department || "-"}</td>
                    <td style={tdStyle}>
                      {formatTime(log.slot_start_time)} -{" "}
                      {formatTime(log.slot_end_time)}
                    </td>
                    <td style={tdStyle}>{log.task_title || "-"}</td>
                    <td style={tdStyle}>{log.related_to || "-"}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(log.status)}>
                        {log.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{log.percent_complete ?? 0}%</td>
                    <td style={tdStyle}>
                      {log.screenshot_url ? (
                        <button
                          onClick={() =>
                            setScreenshotPreview(log.screenshot_url)
                          }
                          style={viewButton}
                        >
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Preview */}
      {screenshotPreview && (
        <div
          style={modalOverlay}
          onClick={() => setScreenshotPreview(null)}
        >
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <img
              src={screenshotPreview}
              alt="Work log screenshot"
              style={{
                width: "100%",
                borderRadius: "10px",
                display: "block",
              }}
            />
            <button
              onClick={() => setScreenshotPreview(null)}
              style={{ ...refreshButton, marginTop: "16px", width: "100%" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function statusBadgeStyle(status) {
  const base = {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
  };
  if (status === "Completed")
    return {
      ...base,
      background: "rgba(34,197,94,0.15)",
      color: "#22c55e",
    };
  if (status === "In Progress")
    return {
      ...base,
      background: "rgba(37,99,235,0.15)",
      color: "#60a5fa",
    };
  if (status === "Missed")
    return {
      ...base,
      background: "rgba(239,68,68,0.15)",
      color: "#ef4444",
    };
  return {
    ...base,
    background: "rgba(148,163,184,0.15)",
    color: "#94a3b8",
  };
}

const slotStat = (color) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
  padding: "3px 8px",
  borderRadius: "8px",
  fontSize: 12,
  fontWeight: 700,
  background: `${color}18`,
  color: color,
  border: `1px solid ${color}30`,
});

// ---- Styles ----

const pageContainer = {
  padding: "30px",
  maxWidth: "1400px",
  margin: "0 auto",
  minHeight: "100vh",
  background: "var(--bg-page, #0f172a)",
};

const pageTitle = {
  color: "var(--text-primary, #f8fafc)",
  fontSize: "28px",
  margin: "0 0 4px",
};

const pageSubtitle = {
  color: "var(--text-secondary, #94a3b8)",
  fontSize: "14px",
  margin: "0 0 24px",
};

const errorBanner = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid #ef4444",
  color: "#f8fafc",
  borderRadius: "12px",
  padding: "14px 18px",
  marginBottom: "20px",
};

const sectionCard = {
  background: "var(--bg-card-solid, #1e293b)",
  borderRadius: "20px",
  padding: "24px",
  border: "var(--border-card, 1px solid #334155)",
  boxShadow: "var(--shadow-card, 0 8px 32px rgba(0,0,0,0.35))",
  marginBottom: "24px",
};

const sectionTitle = {
  color: "var(--text-primary, #f8fafc)",
  fontSize: "18px",
  marginTop: 0,
  marginBottom: "18px",
  fontWeight: 700,
};

const filterRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: "18px",
  alignItems: "flex-end",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "var(--text-secondary, #94a3b8)",
  fontSize: "13px",
  fontWeight: "600",
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--border-default, #475569)",
  background: "var(--bg-input, #0f172a)",
  color: "var(--text-primary, #f8fafc)",
  fontSize: "14px",
  outline: "none",
  minWidth: "160px",
};

const refreshButton = {
  padding: "11px 20px",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  height: "42px",
};

const clearFilterBtn = {
  padding: "11px 20px",
  background: "rgba(239,68,68,0.15)",
  color: "#f87171",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  height: "42px",
};

const employeeCardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "16px",
};

const employeeCard = {
  borderRadius: "16px",
  padding: "20px",
  textAlign: "center",
};

const employeeAvatar = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 20,
  fontWeight: 700,
  margin: "0 auto 12px",
};

const slotStatsRow = {
  display: "flex",
  justifyContent: "center",
  gap: 6,
  flexWrap: "wrap",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "10px",
  color: "var(--text-secondary, #94a3b8)",
  fontSize: "12px",
  textTransform: "uppercase",
  borderBottom: "1px solid var(--border-default, #334155)",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px",
  color: "var(--text-primary, #f8fafc)",
  fontSize: "14px",
  borderBottom: "1px solid var(--border-default, #334155)",
};

const viewButton = {
  padding: "6px 12px",
  background: "#334155",
  color: "#f8fafc",
  border: "none",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: "20px",
};

const modalBox = {
  background: "var(--bg-card-solid, #1e293b)",
  padding: "20px",
  borderRadius: "20px",
  maxWidth: "480px",
  width: "100%",
  border: "var(--border-card, 1px solid #334155)",
  boxShadow: "0 10px 35px rgba(0,0,0,.45)",
};

export default WorkLogs;
