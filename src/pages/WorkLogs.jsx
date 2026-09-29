import { apiFetch, API_BASE } from "../api";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

function WorkLogs() {
  const [logs, setLogs] = useState([]);
  const [todayEmployees, setTodayEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [dateFilter, setDateFilter] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [historyLog, setHistoryLog] = useState(null);

  // Add task state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTaskText, setAddTaskText] = useState("");
  const [addEmployeeId, setAddEmployeeId] = useState(null);
  const [addEmployeeName, setAddEmployeeName] = useState("");
  const [adding, setAdding] = useState(false);

  const loadWorkLogs = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await apiFetch(
        `${API_BASE}/api/work-logs/present-employees?date=${dateFilter}`
      );
      if (!res.ok) throw new Error("Could not load work logs");
      const data = await res.json();
      setLogs(data.logs || []);
      setTodayEmployees(data.employees || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not load work logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    loadWorkLogs();
    const interval = setInterval(loadWorkLogs, 15000);
    return () => clearInterval(interval);
  }, [loadWorkLogs]);

  // ── Add Task ──
  const openAddModal = (empId, empName) => {
    setAddEmployeeId(empId);
    setAddEmployeeName(empName);
    setAddTaskText("");
    setShowAddModal(true);
  };

  const submitAddTask = async (keepOpen = false) => {
    if (!addTaskText.trim() || addTaskText.trim().length < 3) {
      toast.error("Please enter a task (min 3 characters)");
      return;
    }
    setAdding(true);
    try {
      const res = await apiFetch(`${API_BASE}/api/work-logs/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: addEmployeeId,
          task: addTaskText.trim(),
          date: dateFilter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success(data.message || "Task assigned!");

      if (keepOpen) {
        // Keep modal open for adding another task
        setAddTaskText("");
      } else {
        setShowAddModal(false);
      }
      loadWorkLogs();
    } catch (err) {
      toast.error(err.message || "Failed to add task");
    }
    setAdding(false);
  };

  // ── Group logs by employee ──
  const presentEmployees = useMemo(() => {
    const grouped = {};
    logs.forEach((log) => {
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
          updates: 0,
        };
      }
      grouped[key].total += 1;
      if (log.status === "Completed") grouped[key].completed += 1;
      else if (log.status === "In Progress") grouped[key].inProgress += 1;
      else grouped[key].pending += 1;
      if (log.submitted_at) grouped[key].updates += 1;
    });
    // Add present employees from API that have no tasks yet
    todayEmployees.forEach((emp) => {
      const key = emp.employee_id;
      if (!grouped[key]) {
        grouped[key] = {
          employee_id: emp.employee_id,
          employee_name: emp.name,
          department: emp.department,
          total: 0, completed: 0, inProgress: 0, pending: 0, updates: 0,
        };
      }
    });
    return Object.values(grouped).sort((a, b) =>
      (a.employee_name || "").localeCompare(b.employee_name || "")
    );
  }, [logs, todayEmployees]);

  // ── Department filter options ──
  const departments = useMemo(() => {
    const set = new Set(
      presentEmployees.map((e) => e.department).filter(Boolean)
    );
    return ["All", ...Array.from(set)];
  }, [presentEmployees]);

  // ── Filtered logs ──
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (selectedEmployeeId !== null) {
      result = result.filter((log) => log.employee_id === selectedEmployeeId);
    }
    if (departmentFilter !== "All") {
      result = result.filter((log) => log.department === departmentFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter((log) => log.status === statusFilter);
    }

    return result.sort((a, b) => {
      const nameCmp = (a.employee_name || "").localeCompare(
        b.employee_name || ""
      );
      if (nameCmp !== 0) return nameCmp;
      return (
        new Date(b.created_at || b.assigned_at || 0) -
        new Date(a.created_at || a.assigned_at || 0)
      );
    });
  }, [logs, selectedEmployeeId, departmentFilter, statusFilter]);

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
        Assign tasks to present employees — tasks stay until completed
      </p>

      {errorMsg && <div style={errorBanner}>{errorMsg}</div>}

      {/* ── Filters ── */}
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

      {/* ── Employee Cards ── */}
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
            Today's Employees ({dateFilter})
            {selectedEmp && (
              <span style={{ color: "#60a5fa", fontSize: 14, marginLeft: 10 }}>
                — Viewing: {selectedEmp.employee_name}
              </span>
            )}
          </h2>
        </div>

        {presentEmployees.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            No present employees for this date.
          </p>
        ) : (
          <div style={employeeCardGrid}>
            {presentEmployees.map((emp) => {
              const isSelected = emp.employee_id === selectedEmployeeId;
              return (
                <div
                  key={emp.employee_id}
                  onClick={() =>
                    setSelectedEmployeeId(isSelected ? null : emp.employee_id)
                  }
                  style={{
                    ...employeeCard,
                    border: isSelected
                      ? "2px solid #2563eb"
                      : "1px solid #e2e8f0",
                    background: isSelected
                      ? "rgba(37,99,235,0.06)"
                      : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected
                      ? "0 0 20px rgba(96,165,250,0.15)"
                      : "none",
                  }}
                >
                  <div style={employeeAvatar}>
                    {(emp.employee_name || "?").charAt(0).toUpperCase()}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <p
                      style={{
                        color: isSelected ? "#2563eb" : "#0f172a",
                        fontSize: 16,
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {emp.employee_name}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: 12, margin: "2px 0 0" }}>
                      {emp.department || "-"}
                    </p>
                  </div>

                  {/* Task stats */}
                  <div style={slotStatsRow}>
                    <span style={slotStat("#22c55e")}>✓ {emp.completed}</span>
                    <span style={slotStat("#3b82f6")}>◷ {emp.inProgress}</span>
                    <span style={slotStat("#f59e0b")}>◷ {emp.pending}</span>
                  </div>

                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      margin: "8px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {emp.completed}/{emp.total} tasks completed
                  </p>

                  {emp.updates > 0 && (
                    <p
                      style={{
                        color: "#60a5fa",
                        fontSize: 11,
                        margin: "4px 0 0",
                      }}
                    >
                      📝 {emp.updates} update{emp.updates !== 1 ? "s" : ""} submitted
                    </p>
                  )}

                  {/* Add Task Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddModal(emp.employee_id, emp.employee_name);
                    }}
                    style={{
                      marginTop: 10,
                      padding: "7px 14px",
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    + Add Task
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Task History Table ── */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>
          {selectedEmp
            ? `Tasks — ${selectedEmp.employee_name}`
            : "All Tasks"}{" "}
          ({filteredLogs.length} entries)
        </h2>

        {filteredLogs.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            No tasks match the selected filters.
          </p>
        ) : (
          <div
            style={{
              maxHeight: 600,
              overflow: "auto",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
            }}
          >
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Assigned Task</th>
                  <th style={thStyle}>Employee Update</th>
                  <th style={thStyle}>Related To</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>% Complete</th>
                  <th style={thStyle}>Assigned At</th>
                  <th style={thStyle}>Submitted At</th>
                  <th style={thStyle}>Updates</th>
                  <th style={thStyle}>Screenshot</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr
                    key={log.id}
                    style={{
                      background:
                        log.employee_id === selectedEmployeeId
                          ? "rgba(96,165,250,0.06)"
                          : "transparent",
                    }}
                  >
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{log.employee_name}</td>
                    <td style={tdStyle}>{log.department || "-"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        color: log.assigned_task ? "#f59e0b" : "#64748b",
                        fontWeight: log.assigned_task ? 600 : 400,
                      }}
                    >
                      {log.assigned_task || (
                        <span style={{ color: "#64748b", fontStyle: "italic" }}>
                          -
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {log.task_title && log.task_title !== log.assigned_task
                        ? log.task_title
                        : log.submitted_at
                          ? <span style={{ color: "#22c55e" }}>✓ Submitted</span>
                          : <span style={{ color: "#64748b", fontStyle: "italic" }}>-</span>
                      }
                    </td>
                    <td style={tdStyle}>{log.related_to || "-"}</td>
                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(log.status)}>
                        {log.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{log.percent_complete ?? 0}%</td>
                    <td style={tdStyle}>
                      {log.assigned_at
                        ? new Date(log.assigned_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td style={tdStyle}>
                      {log.submitted_at
                        ? new Date(log.submitted_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : <span style={{ color: "#64748b" }}>-</span>}
                    </td>
                    <td style={tdStyle}>
                      {log.history && log.history.length > 0 ? (
                        <button
                          onClick={() => setHistoryLog(log)}
                          style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6, color: '#60a5fa', fontSize: 11, padding: '4px 8px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          📜 {log.history.length} update{log.history.length !== 1 ? 's' : ''}
                        </button>
                      ) : log.submitted_at ? (
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>1</span>
                      ) : (
                        <span style={{ color: "#64748b" }}>0</span>
                      )}
                    </td>
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

      {/* ── Add Task Modal ── */}
      {showAddModal && (
        <div style={modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#0f172a", fontSize: 18, margin: "0 0 8px" }}>
              + Add Task
            </h2>
            <p style={{ color: "#475569", fontSize: 13, margin: "0 0 4px" }}>
              Assigning to:{" "}
              <strong style={{ color: "#2563eb" }}>{addEmployeeName}</strong>
            </p>
            <p style={{ color: "#475569", fontSize: 13, margin: "0 0 16px" }}>
              Each task stays until the employee marks it completed. You can
              assign multiple tasks.
            </p>
            <textarea
              value={addTaskText}
              onChange={(e) => setAddTaskText(e.target.value)}
              placeholder="Enter the task description..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#0f172a",
                fontSize: 14,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                onClick={() => submitAddTask(true)}
                disabled={adding}
                style={{
                  flex: 2,
                  padding: "12px 16px",
                  background: "linear-gradient(135deg, #059669, #047857)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  opacity: adding ? 0.6 : 1,
                }}
              >
                {adding ? "Adding..." : "✅ Add & Add Another"}
              </button>
              <button
                onClick={() => submitAddTask(false)}
                disabled={adding}
                style={{
                  flex: 2,
                  padding: "12px 16px",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  opacity: adding ? 0.6 : 1,
                }}
              >
                {adding ? "Adding..." : "✅ Add & Close"}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Update History Modal ── */}
      {historyLog && (
        <div style={modalOverlay} onClick={() => setHistoryLog(null)}>
          <div style={{ ...modalBox, maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#0f172a', fontSize: 18, margin: '0 0 8px' }}>
              📜 Update History — {historyLog.employee_name}
            </h2>
            <p style={{ color: '#475569', fontSize: 13, margin: '0 0 12px' }}>
              Task: <strong style={{ color: '#f59e0b' }}>{historyLog.assigned_task}</strong>
            </p>

            {/* Current (latest) update */}
            {historyLog.submitted_at && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ color: '#22c55e', fontSize: 12, fontWeight: 700, margin: '0 0 6px' }}>✅ Current (Latest Update)</p>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: 12 }}>
                  <p style={{ color: '#0f172a', fontSize: 13, margin: '0 0 4px' }}><strong>Update:</strong> {historyLog.task_title || historyLog.assigned_task || '-'}</p>
                  {historyLog.related_to && <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 4px' }}>📁 {historyLog.related_to}</p>}
                  <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
                    Status: <span style={{ color: historyLog.status === 'Completed' ? '#22c55e' : '#2563eb' }}>{historyLog.status}</span> — {historyLog.percent_complete}%
                  </p>
                  <p style={{ color: '#64748b', fontSize: 11, margin: '4px 0 0' }}>
                    Submitted: {new Date(historyLog.submitted_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )}

            {/* History entries */}
            {historyLog.history && historyLog.history.length > 0 && (
              <div>
                <p style={{ color: '#f59e0b', fontSize: 12, fontWeight: 700, margin: '0 0 6px' }}>📜 Previous Updates ({historyLog.history.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...historyLog.history].reverse().map((entry, i) => (
                    <div key={i} style={{ background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 10, padding: 12 }}>
                      <p style={{ color: '#0f172a', fontSize: 13, margin: '0 0 4px' }}><strong>Update:</strong> {entry.task_title || '-'}</p>
                      {entry.related_to && <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 4px' }}>📁 {entry.related_to}</p>}
                      <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
                        Status: <span style={{ color: entry.status === 'Completed' ? '#22c55e' : entry.status === 'In Progress' ? '#2563eb' : '#94a3b8' }}>{entry.status}</span> — {entry.percent_complete}%
                      </p>
                      {entry.submitted_at && (
                        <p style={{ color: '#64748b', fontSize: 11, margin: '4px 0 0' }}>
                          Submitted: {new Date(entry.submitted_at).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setHistoryLog(null)}
              style={{ ...refreshButton, marginTop: 16, width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Screenshot Preview ── */}
      {screenshotPreview && (
        <div style={modalOverlay} onClick={() => setScreenshotPreview(null)}>
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
    return { ...base, background: "rgba(34,197,94,0.15)", color: "#22c55e" };
  if (status === "In Progress")
    return { ...base, background: "rgba(37,99,235,0.15)", color: "#60a5fa" };
  return { ...base, background: "rgba(148,163,184,0.15)", color: "#94a3b8" };
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

// ── Styles ──
const pageContainer = {
  padding: "30px",
  maxWidth: "1400px",
  margin: "0 auto",
  minHeight: "100vh",
  background: "var(--bg-page, #f0f4f8)",
};
const pageTitle = {
  color: "var(--text-primary, #0f172a)",
  fontSize: "28px",
  margin: "0 0 4px",
};
const pageSubtitle = {
  color: "var(--text-secondary, #475569)",
  fontSize: "14px",
  margin: "0 0 24px",
};
const errorBanner = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid #ef4444",
  color: "#dc2626",
  borderRadius: "12px",
  padding: "14px 18px",
  marginBottom: "20px",
};
const sectionCard = {
  background: "var(--bg-card-solid, #ffffff)",
  borderRadius: "20px",
  padding: "24px",
  border: "var(--border-card, 1px solid #e2e8f0)",
  boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,.08))",
  marginBottom: "24px",
};
const sectionTitle = {
  color: "var(--text-primary, #0f172a)",
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
  color: "var(--text-secondary, #475569)",
  fontSize: "13px",
  fontWeight: "600",
};
const inputStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--border-default, #d1d5db)",
  background: "var(--bg-input, #ffffff)",
  color: "var(--text-primary, #0f172a)",
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
  color: "var(--text-secondary, #475569)",
  fontSize: "12px",
  textTransform: "uppercase",
  borderBottom: "1px solid var(--border-default, #e2e8f0)",
  whiteSpace: "nowrap",
  background: "var(--bg-input-solid, #f8fafc)",
  position: "sticky",
  top: 0,
  zIndex: 5,
};
const tdStyle = {
  padding: "10px",
  color: "var(--text-primary, #0f172a)",
  fontSize: "14px",
  borderBottom: "1px solid var(--border-default, #e2e8f0)",
};
const viewButton = {
  padding: "6px 12px",
  background: "#2563eb",
  color: "#ffffff",
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
  background: "var(--bg-card-solid, #ffffff)",
  padding: "20px",
  borderRadius: "20px",
  maxWidth: "520px",
  width: "100%",
  border: "var(--border-card, 1px solid #e2e8f0)",
  boxShadow: "0 10px 35px rgba(0,0,0,.12)",
};

export default WorkLogs;
