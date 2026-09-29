import { apiFetch, API_BASE } from "../api";
import { useState, useEffect } from 'react'
import toast from "react-hot-toast";
import StatCard from "../components/Dashboard/StatCard";
import {
  glassButton as mkGlassBtn,
  primaryButton as mkPrimaryBtn,
  searchInputStyle as mkSearchInput,
  inputStyle as mkInputStyle,
  modalOverlay as mkModalOverlay,
  tableStyle as mkTableStyle,
  headerStyle as mkHeaderStyle,
  tdStyle as mkTdStyle,
  textColor,
} from "../styles/adminTheme";

function Performance() {
  const [employees, setEmployees] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [kpiScore, setKpiScore] = useState('')
  const [managerRemarks, setManagerRemarks] = useState('')
  const [rating, setRating] = useState('')
  const [performances, setPerformances] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [reviewToCancel, setReviewToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedReview, setSelectedReview] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [incrementType, setIncrementType] = useState('rating')
  const [incrementValue, setIncrementValue] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [reason, setReason] = useState('')
  const [dueEmployees, setDueEmployees] = useState([])
  const [showDueModal, setShowDueModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)

  const loadPerformances = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/performance-reviews`)
      const data = await response.json()
      const rows = Array.isArray(data) ? data.map(r => ({
        ...r,
        status: r.status || (r.increment_applied ? 'applied' : 'draft'),
        increment_type: r.increment_type || 'rating',
        increment_value: r.increment_value || 0,
        effective_date: r.effective_date || null,
        reason: r.reason || '',
      })) : []
      setPerformances(rows)
    } catch (err) { console.error(err) }
  }

  const loadDueEmployees = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/increment-due-employees`)
      const data = await response.json()
      setDueEmployees(Array.isArray(data) ? data : [])
    } catch (err) { console.error(err) }
  }

  const loadNotifications = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/increment-notifications`)
      const data = await response.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    loadPerformances()
    loadDueEmployees()
    loadNotifications()
    apiFetch(`${API_BASE}/api/employees`)
      .then(res => res.json())
      .then(data => setEmployees(Array.isArray(data) ? data : []))
  }, [])

  const getIncrementPreview = () => {
    const emp = employees.find(e => String(e.id) === String(employeeId))
    if (!emp) return { percent: 0, amount: 0, newSalary: 0 }
    const currentSalary = Number(emp.salary) || 0
    let percent = 0; let amount;
    if (incrementType === 'percentage') {
      percent = Number(incrementValue) || 0
      amount = Math.round(currentSalary * percent / 100)
    } else if (incrementType === 'amount') {
      amount = Number(incrementValue) || 0
      percent = currentSalary > 0 ? Math.round((amount / currentSalary) * 100) : 0
    } else if (incrementType === 'skip') {
      percent = 0; amount = 0
    } else {
      const r = Number(rating) || 0
      if (r >= 4.5) percent = 15
      else if (r >= 4.0) percent = 10
      else if (r >= 3.5) percent = 5
      amount = Math.round(currentSalary * percent / 100)
    }
    return { percent, amount, newSalary: currentSalary + amount }
  }

  const addPerformance = async () => {
    if (!employeeId || !rating) { toast.error("Select employee and rating"); return }
    try {
      const response = await apiFetch(`${API_BASE}/api/increment-proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId, review_date: effectiveDate || new Date().toISOString().split('T')[0],
          rating: Number(rating), kpi_score: Number(kpiScore) || 0, manager_remarks: managerRemarks,
          increment_type: incrementType, increment_value: Number(incrementValue) || 0,
          effective_date: effectiveDate || null, reason
        })
      })
      const result = await response.json()
      if (!response.ok) { toast.error(result.message || "Failed"); return }
      toast.success(result.message)
      loadPerformances(); loadNotifications()
      setEmployeeId(""); setRating(""); setKpiScore(""); setManagerRemarks("")
      setIncrementType("rating"); setIncrementValue(""); setEffectiveDate(""); setReason("")
    } catch { toast.error("Failed") }
  }

  const applyIncrement = async (reviewId) => {
    try {
      const response = await apiFetch(`${API_BASE}/api/apply-increment/${reviewId}`, { method: "PUT" })
      const result = await response.json()
      if (!response.ok) { toast.error(result.message); return }
      toast.success(result.message)
      loadPerformances(); loadDueEmployees(); loadNotifications()
    } catch { toast.error("Failed") }
  }

  const cancelIncrement = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/cancel-increment/${reviewToCancel}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_reason: cancelReason })
      })
      const result = await response.json()
      toast.success(result.message)
      setShowCancelModal(false); setReviewToCancel(null); setCancelReason("")
      loadPerformances(); loadNotifications()
    } catch { toast.error("Failed") }
  }

  const updateReview = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/increment-proposals/${selectedReview.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(selectedReview.rating), kpi_score: selectedReview.kpi_score,
          manager_remarks: selectedReview.manager_remarks, increment_type: selectedReview.increment_type || 'rating',
          increment_value: selectedReview.increment_value || 0, effective_date: selectedReview.effective_date || null,
          reason: selectedReview.reason || ''
        })
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message || 'Update failed'); return }
      setShowEditModal(false); toast.success(data.message || "Updated"); loadPerformances()
    } catch (err) { console.error(err) }
  }

  const deleteReview = async () => {
    try {
      await apiFetch(`${API_BASE}/api/increment-proposals/${reviewToDelete}`, { method: "DELETE" })
      setPerformances(performances.filter(r => r.id !== reviewToDelete))
      setShowDeleteModal(false); setReviewToDelete(null); toast.success("Deleted")
    } catch (err) { console.error(err) }
  }

  const markNotifRead = async (id) => {
    try {
      await apiFetch(`${API_BASE}/api/increment-notifications/${id}/read`, { method: "PUT" })
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) { console.error(err) }
  }

  const totalReviews = performances.length
  const averageRating = performances.length > 0
    ? (performances.reduce((t, i) => t + Number(i.rating), 0) / performances.length).toFixed(1) : 0
  const totalIncrement = performances.reduce((t, i) => t + Number(i.increment_amount || 0), 0)
  const topPerformer = performances.length > 0
    ? performances.reduce((b, c) => Number(c.rating) > Number(b.rating) ? c : b) : null

  const filteredReviews = performances.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const unreadNotifs = notifications.filter(n => !n.is_read).length
  const preview = getIncrementPreview()

  const _glassBtn = mkGlassBtn();
  const _primaryBtn = mkPrimaryBtn();
  const _searchInput = mkSearchInput();
  const _inputStyle = mkInputStyle();
  const _modalOverlay = mkModalOverlay();
  const _tableStyle = mkTableStyle({ minWidth: "1100px" });
  const _headerStyle = mkHeaderStyle();
  const _tdStyle = mkTdStyle();

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "35px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "42px", fontWeight: 800, color: textColor("primary") }}>
            📊 Performance Management
          </h1>
          <p style={{ marginTop: "10px", color: textColor("secondary"), fontSize: "16px" }}>
            Semi-annual appraisal system • Create proposals → Review → Apply
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => { loadDueEmployees(); setShowDueModal(true) }} style={_glassBtn}>
            🔔 Due for Appraisal ({dueEmployees.length})
          </button>
          <button onClick={() => { loadNotifications(); setShowNotifPanel(!showNotifPanel) }}
            style={{ ..._glassBtn, position: "relative" }}>
            📋 Notifications
            {unreadNotifs > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{unreadNotifs}</span>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginBottom: "35px" }}>
        <StatCard title="Total Reviews" value={totalReviews} color="#3b82f6" delay={0.1} icon="employees" />
        <StatCard title="Average Rating" value={averageRating} color="#f59e0b" delay={0.2} icon="employees" />
        <StatCard title="Total Increment" value={`₹${Math.round(totalIncrement).toLocaleString()}`} color="#22c55e" delay={0.3} icon="employees" />
        <StatCard title="Top Performer" value={topPerformer?.name || "-"} color="#8b5cf6" delay={0.4} icon="employees" />
      </div>

      {/* Notification Panel */}
      {showNotifPanel && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px", marginBottom: "24px", maxHeight: "300px", overflowY: "auto", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ color: textColor("primary"), margin: 0, fontSize: "18px" }}>📋 Increment Notifications</h3>
            <button onClick={() => setShowNotifPanel(false)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, transition: "all .2s" }} onMouseEnter={e => { e.target.style.background = '#fee2e2'; e.target.style.color = '#dc2626'; e.target.style.borderColor = '#fca5a5' }} onMouseLeave={e => { e.target.style.background = '#f8fafc'; e.target.style.color = '#64748b'; e.target.style.borderColor = '#e2e8f0' }}>✕</button>
          </div>
          {notifications.length === 0 ? (
            <p style={{ color: textColor("muted") }}>No notifications yet</p>
          ) : notifications.map(n => (
            <div key={n.id} onClick={() => markNotifRead(n.id)}
              style={{ padding: "14px", borderRadius: "12px", marginBottom: "8px", cursor: "pointer", background: n.is_read ? "#f8fafc" : "#eff6ff", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: textColor("primary"), fontSize: "14px" }}>{n.message}</span>
                {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />}
              </div>
              <span style={{ color: textColor("muted"), fontSize: "12px" }}>{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Create Proposal Form */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "32px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📝</div>
          <div>
            <h3 style={{ color: textColor("primary"), margin: 0, fontSize: "18px", fontWeight: "700" }}>Create Increment Proposal</h3>
            <p style={{ color: textColor("muted"), margin: 0, fontSize: "13px" }}>Select an employee and configure the increment details</p>
          </div>
        </div>

        {/* Row 1: Employee + Rating */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>👤 Employee</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={{ ..._inputStyle, marginBottom: 0 }}>
              <option value="">Choose employee...</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} (₹{Number(emp.salary).toLocaleString()})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>⭐ Rating</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ ..._inputStyle, marginBottom: 0 }}>
              <option value="">Select rating (1-5)</option>
              <option value="5">⭐ 5 — Exceptional</option>
              <option value="4.5">⭐ 4.5 — Excellent</option>
              <option value="4">⭐ 4 — Very Good</option>
              <option value="3.5">⭐ 3.5 — Good</option>
              <option value="3">⭐ 3 — Average</option>
              <option value="2">⭐ 2 — Below Average</option>
              <option value="1">⭐ 1 — Poor</option>
            </select>
          </div>
        </div>

        {/* Row 2: Increment Type + Value + Date + KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>📊 Increment Type</label>
            <select value={incrementType} onChange={(e) => { setIncrementType(e.target.value); setIncrementValue('') }} style={{ ..._inputStyle, marginBottom: 0 }}>
              <option value="rating">Auto from Rating</option>
              <option value="percentage">Custom Percentage</option>
              <option value="amount">Fixed Amount (₹)</option>
              <option value="skip">Skip Increment (0%)</option>
            </select>
          </div>
          {incrementType === 'percentage' && (
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>📈 Percentage (%)</label>
              <input type="number" placeholder="Enter percentage" value={incrementValue} onChange={(e) => setIncrementValue(e.target.value)} style={{ ..._inputStyle, marginBottom: 0 }} min="0" max="100" />
            </div>
          )}
          {incrementType === 'amount' && (
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>💰 Amount (₹)</label>
              <input type="number" placeholder="Enter amount" value={incrementValue} onChange={(e) => setIncrementValue(e.target.value)} style={{ ..._inputStyle, marginBottom: 0 }} min="0" />
            </div>
          )}
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>📅 Effective Month</label>
            <input type="month" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} style={{ ..._inputStyle, marginBottom: 0 }} title="Effective month" />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>📋 KPI Score</label>
            <input type="number" placeholder="e.g. 85" value={kpiScore} onChange={(e) => setKpiScore(e.target.value)} style={{ ..._inputStyle, marginBottom: 0 }} />
          </div>
        </div>

        {/* Row 3: Feedback + Reason */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>💬 Manager Feedback</label>
            <textarea placeholder="Write your feedback / reason for increment..." value={managerRemarks} onChange={(e) => setManagerRemarks(e.target.value)} style={{ ..._inputStyle, height: "100px", resize: "none", marginBottom: 0 }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>📌 Reason</label>
            <input type="text" placeholder="e.g. Annual Appraisal, Promotion, Exceptional Performance" value={reason} onChange={(e) => setReason(e.target.value)} style={{ ..._inputStyle, marginBottom: 0 }} />

            {employeeId && (
              <div style={{ background: "#f0fdf4", padding: "14px", borderRadius: "12px", marginTop: "14px", border: "1px solid #bbf7d0" }}>
                <h4 style={{ color: "#16a34a", margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700" }}>📊 Increment Preview</h4>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>Type: <strong style={{ color: "#0f172a" }}>{incrementType === 'rating' ? 'Auto' : incrementType === 'percentage' ? 'Custom %' : incrementType === 'amount' ? 'Fixed ₹' : 'Skip'}</strong></span>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>Increment: <strong style={{ color: "#16a34a" }}>{preview.percent}% (₹{preview.amount.toLocaleString()})</strong></span>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>New Salary: <strong style={{ color: "#0f172a" }}>₹{preview.newSalary.toLocaleString()}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => { setEmployeeId(""); setRating(""); setKpiScore(""); setManagerRemarks(""); setIncrementType("rating"); setIncrementValue(""); setEffectiveDate(""); setReason("") }} style={{ padding: "12px 24px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "12px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
            Clear Form
          </button>
          <button onClick={addPerformance} style={{ ..._primaryBtn, background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 20px rgba(34,197,94,0.3)", padding: "12px 32px" }}>
            💾 Save as Draft
          </button>
        </div>
      </div>

      {/* Proposals Table */}
      <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,.08)", padding: "24px", marginTop: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap", gap: "10px" }}>
          <h2 style={{ color: textColor("primary"), margin: 0, fontSize: "22px", fontWeight: "700" }}>Increment Proposals</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: "10px 14px", borderRadius: "12px", border: "1px solid #d1d5db", background: "#fff", color: "#0f172a", fontSize: "14px", outline: "none" }}>
              <option value="all">All Status</option>
              <option value="draft">📝 Draft</option>
              <option value="applied">✅ Applied</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
            <input type="text" placeholder="🔍 Search Employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ..._searchInput, flex: "none", width: "250px" }} />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={_tableStyle}>
            <thead>
              <tr>
                <th style={{ ..._headerStyle, width: "220px" }}>Employee</th>
                <th style={{ ..._headerStyle, width: "100px" }}>Rating</th>
                <th style={{ ..._headerStyle, width: "100px" }}>Type</th>
                <th style={{ ..._headerStyle, width: "100px" }}>Increment %</th>
                <th style={{ ..._headerStyle, width: "120px" }}>Amount</th>
                <th style={{ ..._headerStyle, width: "130px" }}>Effective Date</th>
                <th style={{ ..._headerStyle, width: "120px" }}>Status</th>
                <th style={{ ..._headerStyle, width: "200px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? filteredReviews.map((item, idx) => (
                <tr key={item.id} style={{ transition: "all .25s ease", background: idx % 2 === 0 ? "rgba(0,0,0,.015)" : "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,.05)"; e.currentTarget.style.boxShadow = "inset 4px 0 #2563eb" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none" }}>
                  <td style={_tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "16px" }}>
                        {item.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: textColor("primary"), fontWeight: "700" }}>{item.name}</div>
                        <div style={{ color: textColor("muted"), fontSize: "12px" }}>{item.reason || 'Performance Review'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={_tdStyle}>
                    <span style={{ background: item.rating >= 4.5 ? "#dcfce7" : item.rating >= 4 ? "#fef9c3" : "#fee2e2", color: item.rating >= 4.5 ? "#16a34a" : item.rating >= 4 ? "#a16207" : "#dc2626", padding: "6px 14px", borderRadius: "20px", fontWeight: "700", fontSize: "13px" }}>
                      ⭐ {item.rating}
                    </span>
                  </td>
                  <td style={_tdStyle}>
                    <span style={{ color: textColor("secondary"), fontSize: "13px" }}>
                      {item.increment_type === 'percentage' ? '📈 %' : item.increment_type === 'amount' ? '💰 ₹' : item.increment_type === 'skip' ? '⏭️ Skip' : '📊 Auto'}
                    </span>
                  </td>
                  <td style={_tdStyle}>{item.increment_percentage}%</td>
                  <td style={{ ..._tdStyle, color: "#059669", fontWeight: "700" }}>₹{Math.round(item.increment_amount).toLocaleString()}</td>
                  <td style={_tdStyle}>{item.effective_date ? new Date(item.effective_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '-'}</td>
                  <td style={_tdStyle}>
                    <span style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: item.status === 'applied' ? "#dcfce7" : item.status === 'cancelled' ? "#fee2e2" : "#fef3c7", color: item.status === 'applied' ? "#16a34a" : item.status === 'cancelled' ? "#dc2626" : "#a16207" }}>
                      {item.status === 'applied' ? '✅ Applied' : item.status === 'cancelled' ? '❌ Cancelled' : '📝 Draft'}
                    </span>
                  </td>
                  <td style={_tdStyle}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
                      {(item.status === 'draft' || item.status === 'applied') && (
                        <button onClick={() => { setSelectedReview(item); setShowEditModal(true) }} style={{ padding: "7px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>✏️ Edit</button>
                      )}
                      {item.status === 'draft' && (
                        <button onClick={() => { setReviewToDelete(item.id); setShowDeleteModal(true) }} style={{ padding: "7px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>🗑️</button>
                      )}
                      {item.status === 'draft' && (
                        <button onClick={() => applyIncrement(item.id)} style={{ padding: "7px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>✅ Apply</button>
                      )}
                      {item.status === 'applied' && (
                        <button onClick={() => { setReviewToCancel(item.id); setShowCancelModal(true) }} style={{ padding: "7px 14px", background: "#f59e0b", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>↩️ Remove</button>
                      )}
                      {item.status === 'cancelled' && (
                        <span style={{ color: "#ef4444", fontSize: "12px", padding: "5px 10px" }}>Cancelled ✗</span>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" style={{ ..._tdStyle, textAlign: "center", color: textColor("muted"), padding: "40px 0" }}>No increment proposals yet. Create one above!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={_modalOverlay}>
          <div style={{ width: "520px", maxHeight: "90vh", overflowY: "auto", padding: "30px", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
            <h2 style={{ color: textColor("primary"), margin: "0 0 20px 0", fontSize: "22px" }}>✏️ Edit Proposal</h2>
            {selectedReview?.status === 'applied' && (
              <div style={{ background: "#eff6ff", padding: "12px", borderRadius: "10px", marginBottom: "15px", border: "1px solid #bfdbfe" }}>
                <p style={{ color: "#2563eb", margin: 0, fontSize: "13px" }}>ℹ️ <strong>Applied Increment</strong> — Saving will auto-adjust salary.</p>
              </div>
            )}
            <label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>Rating</label>
            <select value={selectedReview?.rating || ""} onChange={(e) => setSelectedReview({ ...selectedReview, rating: e.target.value })} style={{ ..._inputStyle, marginBottom: "12px" }}>
              <option value="">Select</option>
              <option value="5">5 - Exceptional</option><option value="4.5">4.5 - Excellent</option><option value="4">4 - Very Good</option>
              <option value="3.5">3.5 - Good</option><option value="3">3 - Average</option><option value="2">2 - Below Average</option><option value="1">1 - Poor</option>
            </select>
            <label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>KPI Score</label>
            <input type="number" value={selectedReview?.kpi_score || ""} onChange={(e) => setSelectedReview({ ...selectedReview, kpi_score: e.target.value })} style={{ ..._inputStyle, marginBottom: "12px" }} />
            <label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>Increment Type</label>
            <select value={selectedReview?.increment_type || 'rating'} onChange={(e) => setSelectedReview({ ...selectedReview, increment_type: e.target.value })} style={{ ..._inputStyle, marginBottom: "12px" }}>
              <option value="rating">Auto from Rating</option><option value="percentage">Custom %</option><option value="amount">Fixed Amount</option><option value="skip">Skip</option>
            </select>
            {selectedReview?.increment_type === 'percentage' && <><label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>% Value</label><input type="number" value={selectedReview?.increment_value || ""} onChange={(e) => setSelectedReview({ ...selectedReview, increment_value: e.target.value })} style={{ ..._inputStyle, marginBottom: "12px" }} /></>}
            {selectedReview?.increment_type === 'amount' && <><label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>₹ Amount</label><input type="number" value={selectedReview?.increment_value || ""} onChange={(e) => setSelectedReview({ ...selectedReview, increment_value: e.target.value })} style={{ ..._inputStyle, marginBottom: "12px" }} /></>}
            <label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>Effective Date</label>
            <input type="month" value={selectedReview?.effective_date ? selectedReview.effective_date.substring(0, 7) : ""} onChange={(e) => setSelectedReview({ ...selectedReview, effective_date: e.target.value })} style={{ ..._inputStyle, marginBottom: "12px" }} />
            <label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>Remarks</label>
            <textarea value={selectedReview?.manager_remarks || ""} onChange={(e) => setSelectedReview({ ...selectedReview, manager_remarks: e.target.value })} style={{ ..._inputStyle, height: "80px", resize: "none", marginBottom: "12px" }} />
            <label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>Reason</label>
            <input type="text" value={selectedReview?.reason || ""} onChange={(e) => setSelectedReview({ ...selectedReview, reason: e.target.value })} style={_inputStyle} />
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
              <button onClick={updateReview} style={{ padding: "12px 24px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700" }}>💾 Save</button>
              <button onClick={() => setShowEditModal(false)} style={{ padding: "12px 24px", background: "#64748b", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={_modalOverlay}>
          <div style={{ width: "420px", padding: "30px", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,.15)", textAlign: "center" }}>
            <h2 style={{ color: textColor("primary") }}>🗑️ Delete Proposal?</h2>
            <p style={{ color: textColor("secondary") }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={deleteReview} style={{ padding: "12px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700" }}>Delete</button>
              <button onClick={() => { setShowDeleteModal(false); setReviewToDelete(null) }} style={{ padding: "12px 24px", background: "#64748b", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel/Revert Modal */}
      {showCancelModal && (
        <div style={_modalOverlay}>
          <div style={{ width: "480px", padding: "30px", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}>
            <h2 style={{ color: textColor("primary") }}>↩️ Cancel Increment</h2>
            <p style={{ color: textColor("secondary") }}>This will revert the employee's salary.</p>
            <label style={{ color: textColor("secondary"), fontSize: "13px", fontWeight: "600" }}>Reason</label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Why cancelling?" style={{ ..._inputStyle, height: "80px", resize: "none" }} />
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
              <button onClick={cancelIncrement} style={{ padding: "12px 24px", background: "#f59e0b", color: "#000", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700" }}>↩️ Confirm</button>
              <button onClick={() => { setShowCancelModal(false); setReviewToCancel(null); setCancelReason('') }} style={{ padding: "12px 24px", background: "#64748b", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700" }}>Keep It</button>
            </div>
          </div>
        </div>
      )}

      {/* Due for Appraisal Modal */}
      {showDueModal && (
        <div style={_modalOverlay}>
          <div style={{ width: "600px", maxHeight: "80vh", overflowY: "auto", padding: "30px", borderRadius: "24px", background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,.15)", position: "relative" }}>
            <button onClick={() => setShowDueModal(false)} style={{ position: "absolute", top: 16, right: 16, width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, transition: "all .2s", zIndex: 10 }} onMouseEnter={e => { e.target.style.background = '#fee2e2'; e.target.style.color = '#dc2626'; e.target.style.borderColor = '#fca5a5' }} onMouseLeave={e => { e.target.style.background = '#f8fafc'; e.target.style.color = '#64748b'; e.target.style.borderColor = '#e2e8f0' }}>✕</button>
            <h2 style={{ color: textColor("primary"), margin: "0 0 8px 0", fontSize: "22px" }}>🔔 Due for Appraisal</h2>
            <p style={{ color: textColor("secondary"), fontSize: "13px", marginBottom: "20px" }}>Employees without an increment review in 6 months</p>
            {dueEmployees.length === 0 ? (
              <div style={{ color: "#22c55e", textAlign: "center", padding: "30px", fontSize: "14px" }}>✅ All employees are up to date!</div>
            ) : dueEmployees.map(emp => (
              <div key={emp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", borderRadius: "12px", marginBottom: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ color: textColor("primary"), fontWeight: "700" }}>{emp.name}</div>
                  <div style={{ color: textColor("muted"), fontSize: "12px" }}>{emp.department} • ₹{Number(emp.salary).toLocaleString()}</div>
                </div>
                <button onClick={() => { setEmployeeId(String(emp.id)); setShowDueModal(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Create →</button>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button onClick={() => setShowDueModal(false)} style={{ padding: "10px 20px", background: "#64748b", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Performance
