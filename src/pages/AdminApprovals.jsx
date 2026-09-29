import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiFetch, API_BASE } from "../api";
import GlassScrollArea from "../components/GlassScrollArea";
import {
  glassButton as mkGlassBtn,
  searchInputStyle as mkSearchInput,
  tableStyle as mkTableStyle,
  headerStyle as mkHeaderStyle,
  tdStyle as mkTdStyle,
  paginationButton as mkPaginationBtn,
  paginationInfo as mkPaginationInfo,
  glassScrollAreaStyle as mkScrollArea,
  textColor,
  modalOverlay as mkModalOverlay,
} from "../styles/adminTheme";
import StatCard from "../components/Dashboard/StatCard";

function AdminApprovals() {
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const employeesPerPage = 10;

  useEffect(() => {
    fetchPending().catch((err) => {
      console.error(err);
      toast.error("Unable to load pending approvals.");
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchPending = async () => {
    const response = await apiFetch(
      `${API_BASE}/api/approvals/pending`
    );
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Unable to load pending approvals.");
    }

    if (!Array.isArray(data)) {
      throw new Error("Invalid response from server.");
    }

    setPendingEmployees(data);
  };

  const handleApprove = async (profile) => {
    const confirmed = window.confirm(
      `Approve ${profile.full_name || "this employee"}?\n\nThey will be added to the Employee Management page.`
    );
    if (!confirmed) return;

    try {
      toast.loading("Approving...");
      const response = await apiFetch(
        `${API_BASE}/api/approvals/${profile.id}/approve`,
        { method: "POST" }
      );
      const data = await response.json().catch(() => null);
      toast.dismiss();

      if (!response.ok) {
        throw new Error(data?.message || "Approval failed.");
      }

      toast.success(
        `${profile.full_name || "Employee"} approved and added!`
      );
      setShowDetailModal(false);
      setSelectedProfile(null);
      await fetchPending();
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || "Something went wrong.");
    }
  };

  const handleReject = async (profile) => {
    const confirmed = window.confirm(
      `Reject ${profile.full_name || "this employee"}?\n\nThey will not be added to the system.`
    );
    if (!confirmed) return;

    try {
      toast.loading("Rejecting...");
      const response = await apiFetch(
        `${API_BASE}/api/approvals/${profile.id}/reject`,
        { method: "POST" }
      );
      const data = await response.json().catch(() => null);
      toast.dismiss();

      if (!response.ok) {
        throw new Error(data?.message || "Rejection failed.");
      }

      toast.success(
        `${profile.full_name || "Employee"} rejected.`
      );
      setShowDetailModal(false);
      setSelectedProfile(null);
      await fetchPending();
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || "Something went wrong.");
    }
  };

  const filteredEmployees = pendingEmployees.filter((emp) => {
    const search = searchTerm.toLowerCase();
    return (
      (emp.full_name || "").toLowerCase().includes(search) ||
      (emp.mobile_number || "").toLowerCase().includes(search)
    );
  });

  const indexOfLast = currentPage * employeesPerPage;
  const indexOfFirst = indexOfLast - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    filteredEmployees.length / employeesPerPage
  );

  const _glassBtn = mkGlassBtn();
  const _searchInput = mkSearchInput();
  const _tableStyle = mkTableStyle({ minWidth: "1200px" });
  const _headerStyle = mkHeaderStyle();
  const _tdStyle = mkTdStyle();
  const _scrollArea = mkScrollArea({
    marginTop: "24px",
    maxHeight: "650px",
  });

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "35px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "42px",
              fontWeight: 800,
              color: textColor("primary"),
            }}
          >
            ✅ Employee Approvals
          </h1>
          <p
            style={{
              marginTop: "10px",
              color: textColor("secondary"),
              fontSize: "16px",
            }}
          >
            Review and approve employee signup requests.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          marginBottom: "35px",
        }}
      >
        <StatCard
          title="Pending Approvals"
          value={pendingEmployees.length}
          color="#f59e0b"
          delay={0.15}
          icon="employees"
        />
      </div>

      {/* Search + Refresh */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <input
          placeholder="🔍 Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ..._searchInput, maxWidth: "500px" }}
        />
        <button
          onClick={() => {
            toast.loading("Refreshing...");
            fetchPending()
              .then(() => toast.dismiss())
              .catch(() => {
                toast.dismiss();
                toast.error("Failed to refresh.");
              });
          }}
          style={_glassBtn}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Pagination Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "10px",
          padding: "0 10px",
          color: textColor("subtle"),
        }}
      >
        <span>
          Showing{" "}
          {filteredEmployees.length === 0
            ? 0
            : indexOfFirst + 1}{" "}
          -{" "}
          {Math.min(indexOfLast, filteredEmployees.length)} of{" "}
          {filteredEmployees.length} pending requests
        </span>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            style={mkPaginationBtn()}
          >
            ◀ Previous
          </button>
          <span style={mkPaginationInfo()}>
            {currentPage} / {totalPages || 1}
          </span>
          <button
            disabled={
              currentPage === totalPages || totalPages === 0
            }
            onClick={() => setCurrentPage(currentPage + 1)}
            style={mkPaginationBtn()}
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Table */}
      <GlassScrollArea style={_scrollArea}>
        <table style={_tableStyle}>
          <thead>
            <tr>
              <th style={{ ..._headerStyle, width: "80px" }}>
                #
              </th>
              <th style={{ ..._headerStyle, width: "280px" }}>
                Full Name
              </th>
              <th style={{ ..._headerStyle, width: "170px" }}>
                Phone
              </th>
              <th style={{ ..._headerStyle, width: "130px" }}>
                Gender
              </th>
              <th style={{ ..._headerStyle, width: "140px" }}>
                Skills
              </th>
              <th style={{ ..._headerStyle, width: "140px" }}>
                Expected Salary
              </th>
              <th style={{ ..._headerStyle, width: "140px" }}>
                Applied On
              </th>
              <th style={{ ..._headerStyle, width: "200px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    ..._tdStyle,
                    padding: "60px 20px",
                    color: textColor("muted"),
                    fontSize: "16px",
                  }}
                >
                  {pendingEmployees.length === 0
                    ? "🎉 No pending approval requests"
                    : "No matching results found."}
                </td>
              </tr>
            )}
            {currentEmployees.map((emp, index) => (
              <tr
                key={emp.id}
                style={{
                  transition: "all .25s ease",
                  background:
                    index % 2 === 0
                      ? "rgba(0,0,0,.015)"
                      : "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(37,99,235,.05)";
                  e.currentTarget.style.boxShadow =
                    "inset 4px 0 #2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    index % 2 === 0
                      ? "rgba(0,0,0,.015)"
                      : "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => {
                  setSelectedProfile(emp);
                  setShowDetailModal(true);
                }}
              >
                <td style={_tdStyle}>{indexOfFirst + index + 1}</td>
                <td
                  style={{
                    ..._tdStyle,
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg,#f59e0b,#d97706)",
                        color: "#ffffff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontWeight: "700",
                        fontSize: "18px",
                        boxShadow:
                          "0 6px 15px rgba(245,158,11,.25)",
                      }}
                    >
                      {(emp.full_name || "E").charAt(0).toUpperCase()}
                    </div>
                    <span>{emp.full_name || "-"}</span>
                  </div>
                </td>
                <td style={_tdStyle}>{emp.mobile_number || "-"}</td>
                <td style={_tdStyle}>{emp.gender || "-"}</td>
                <td
                  style={{
                    ..._tdStyle,
                    maxWidth: "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {emp.skills || "-"}
                </td>
                <td
                  style={{
                    ..._tdStyle,
                    color: "#059669",
                    fontWeight: "700",
                  }}
                >
                  {emp.expected_salary
                    ? `₹${Number(emp.expected_salary).toLocaleString()}`
                    : "-"}
                </td>
                <td style={_tdStyle}>
                  {emp.created_at
                    ? new Date(emp.created_at).toLocaleDateString(
                        "en-GB"
                      )
                    : "-"}
                </td>
                <td style={_tdStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(emp);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: "none",
                        background:
                          "linear-gradient(135deg,#22c55e,#16a34a)",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "13px",
                        transition: ".25s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(emp);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: "none",
                        background:
                          "linear-gradient(135deg,#ef4444,#dc2626)",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "13px",
                        transition: ".25s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassScrollArea>

      {/* Detail Modal */}
      {showDetailModal && selectedProfile && (
        <div style={mkModalOverlay()}>
          <div
            style={{
              width: "90%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "30px",
              borderRadius: "24px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 60px rgba(0,0,0,.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: textColor("primary"),
                  fontSize: "28px",
                }}
              >
                👤 Employee Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProfile(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: textColor("primary"),
                  fontSize: "28px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Profile Avatar + Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "24px",
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(245,158,11,.06)",
                border: "1px solid rgba(245,158,11,.15)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#ffffff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "700",
                  fontSize: "24px",
                }}
              >
                {(selectedProfile.full_name || "E")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "700",
                    color: textColor("primary"),
                  }}
                >
                  {selectedProfile.full_name || "-"}
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: textColor("secondary"),
                    fontSize: "14px",
                  }}
                >
                  {selectedProfile.mobile_number || "-"}
                </p>
              </div>
            </div>

            {/* Detail Sections */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <DetailItem label="Gender" value={selectedProfile.gender} />
              <DetailItem label="Blood Group" value={selectedProfile.blood_group} />
              <DetailItem label="Marital Status" value={selectedProfile.marital_status} />
              <DetailItem label="Age" value={selectedProfile.age} />
              <DetailItem label="Skills" value={selectedProfile.skills} />
              <DetailItem label="Languages" value={selectedProfile.languages_known} />
              <DetailItem
                label="Expected Salary"
                value={
                  selectedProfile.expected_salary
                    ? `₹${Number(selectedProfile.expected_salary).toLocaleString()}`
                    : null
                }
              />
              <DetailItem label="Notice Period" value={selectedProfile.notice_period_days ? `${selectedProfile.notice_period_days} days` : null} />
              <DetailItem label="PAN Number" value={selectedProfile.pan_number} />
              <DetailItem label="Aadhar Number" value={selectedProfile.aadhar_number} />
              <DetailItem label="Bank Name" value={selectedProfile.bank_name} />
              <DetailItem label="Account Number" value={selectedProfile.bank_account_number} />
            </div>

            {/* Addresses */}
            {selectedProfile.present_address && (
              <div style={{ marginBottom: "16px" }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: textColor("secondary"),
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Present Address
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    color: textColor("primary"),
                    lineHeight: "1.5",
                  }}
                >
                  {selectedProfile.present_address}
                </p>
              </div>
            )}

            {/* Emergency Contact */}
            {(selectedProfile.emergency_contact_name ||
              selectedProfile.emergency_contact_phone) && (
              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: textColor("secondary"),
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  🆘 Emergency Contact
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    color: textColor("primary"),
                  }}
                >
                  {selectedProfile.emergency_contact_name || "-"} •{" "}
                  {selectedProfile.emergency_contact_phone || "-"}
                </p>
              </div>
            )}

            {/* Documents Links */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              {selectedProfile.resume_url && (
                <a
                  href={selectedProfile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...mkGlassBtn(),
                    textDecoration: "none",
                    fontSize: "13px",
                  }}
                >
                  📄 View Resume
                </a>
              )}
              {selectedProfile.id_proof_url && (
                <a
                  href={selectedProfile.id_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...mkGlassBtn(),
                    textDecoration: "none",
                    fontSize: "13px",
                  }}
                >
                  🪪 View ID Proof
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => handleReject(selectedProfile)}
                style={{
                  padding: "14px 32px",
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "15px",
                  boxShadow: "0 2px 8px rgba(239,68,68,.2)",
                  transition: "all .25s ease",
                }}
              >
                ❌ Reject
              </button>
              <button
                onClick={() => handleApprove(selectedProfile)}
                style={{
                  padding: "14px 32px",
                  borderRadius: "16px",
                  border: "none",
                  background:
                    "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "15px",
                  boxShadow: "0 2px 8px rgba(34,197,94,.2)",
                  transition: "all .25s ease",
                }}
              >
                ✅ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p
        style={{
          margin: "0 0 4px",
          fontSize: "12px",
          fontWeight: "600",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "15px",
          color: "#0f172a",
          fontWeight: "500",
        }}
      >
        {value || "-"}
      </p>
    </div>
  );
}

export default AdminApprovals;
