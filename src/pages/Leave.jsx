import { apiFetch, API_BASE } from "../api";
import { useState, useEffect, useMemo } from "react";

function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLeaves = () => {
    apiFetch(`${API_BASE}/api/leaves`)
      .then((res) => res.json())
      .then((data) => setLeaves(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = (id, newStatus) => {
    apiFetch(`${API_BASE}/api/leaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then(() => {
        alert(`Application ${newStatus}!`);
        fetchLeaves();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const filteredLeaves = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return leaves;
    return leaves.filter(
      (leave) =>
        (leave.employee_name || "").toLowerCase().includes(query) ||
        (leave.employee_code || "").toLowerCase().includes(query)
    );
  }, [leaves, searchTerm]);

  return (
    <div
      className="hr-page-light"
      style={{
        padding: "30px",
        fontFamily: "sans-serif",
        background: "var(--bg-page, #f0f4f8)",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "34px",
          fontWeight: "700",
          color: "#0f172a",
        }}
      >
        Leave Management
      </h1>
      <p style={{ color: "#475569", margin: "0 0 25px 0", fontSize: "15px" }}>
        Review and manage employee leave requests.
      </p>

      {/* Applications Table */}
      <div style={tableCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "15px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            Leave Requests
          </h2>

          <input
            type="text"
            placeholder="Search Employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
          />
        </div>

        <div
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "70vh",
          }}
        >
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "var(--bg-input, #f8fafc)", textAlign: "left" }}>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Leave Type</th>
                <th style={thStyle}>Duration</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave, index) => (
                  <tr
                    key={leave.id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      background:
                        index % 2 === 0
                          ? "var(--bg-card-hover, rgba(0,0,0,0.02))"
                          : "transparent",
                    }}
                  >
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            background: "#2563eb",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#fff",
                            fontWeight: "700",
                            fontSize: "16px",
                          }}
                        >
                          {leave.employee_name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div style={{ color: "#0f172a", fontWeight: "700" }}>
                            {leave.employee_name}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "12px" }}>
                            {leave.employee_code || "Employee"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background:
                            leave.leave_type === "Vacation Leave"
                              ? "#16a34a"
                              : leave.leave_type === "Sick Leave"
                                ? "#dc2626"
                                : leave.leave_type === "Half Day"
                                  ? "#ca8a04"
                                  : "#2563eb",
                          color: "#fff",
                          padding: "7px 14px",
                          borderRadius: "50px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {leave.leave_type}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {(() => {
                        const fmt = (d) => {
                          if (!d) return "N/A";
                          try {
                            const dt = new Date(d);
                            return dt.toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            });
                          } catch {
                            return d;
                          }
                        };
                        return `${fmt(leave.start_date)} to ${fmt(leave.end_date)}`;
                      })()}
                    </td>
                    <td style={tdStyle}>{leave.reason}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background:
                            leave.status === "Approved"
                              ? "#dcfce7"
                              : leave.status === "Rejected"
                                ? "#fee2e2"
                                : "#fef3c7",
                          color:
                            leave.status === "Approved"
                              ? "#15803d"
                              : leave.status === "Rejected"
                                ? "#b91c1c"
                                : "#b45309",
                          padding: "7px 15px",
                          borderRadius: "50px",
                          fontWeight: "700",
                          fontSize: "12px",
                        }}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {leave.status === "Pending" ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => updateStatus(leave.id, "Approved")}
                            style={approveButton}
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => updateStatus(leave.id, "Rejected")}
                            style={rejectButton}
                          >
                            Reject
                          </button>
                        </div>
                      ) : leave.status === "Approved" ? (
                        <button disabled style={{ ...approveButton, opacity: 0.7, cursor: "not-allowed" }}>
                          ✓ Approved
                        </button>
                      ) : (
                        <button disabled style={{ ...rejectButton, opacity: 0.7, cursor: "not-allowed" }}>
                          ✕ Rejected
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const approveButton = {
  padding: "10px 18px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
  transition: ".2s",
};
const rejectButton = {
  padding: "10px 18px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
  transition: ".2s",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  color: "#0f172a",
};
const thStyle = {
  padding: "18px 20px",
  color: "var(--text-secondary, #475569)",
  background: "var(--bg-input, #f8fafc)",
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: ".5px",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
  position: "sticky",
  top: 0,
  zIndex: 5,
};
const tdStyle = {
  padding: "18px 20px",
  color: "var(--text-primary, #0f172a)",
  fontSize: "14px",
  verticalAlign: "middle",
};
const tableCard = {
  background: "var(--bg-card-solid, #ffffff)",
  borderRadius: "20px",
  border: "var(--border-card, 1px solid #e2e8f0)",
  boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,.08))",
  padding: "20px",
  marginTop: "30px",
};
const searchInput = {
  width: "300px",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "1px solid var(--border-default, #d1d5db)",
  background: "var(--bg-input, #ffffff)",
  color: "var(--text-primary, #0f172a)",
  outline: "none",
  fontSize: "14px",
};
export default Leave;
