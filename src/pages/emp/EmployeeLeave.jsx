import { useState } from 'react'
import { apiFetch, API_BASE } from '../../api'
import useEmployeeData from './useEmployeeData'
import { styles, colors, radius, statusBadge } from './theme'
import { Clock } from 'lucide-react'

function EmployeeLeave() {
  const { loading, errorMsg, employee, leaves, leaveBalance, loadDashboard } = useEmployeeData()
  const [leaveType, setLeaveType] = useState('Unpaid Leave')
  const [halfDaySession, setHalfDaySession] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [applying, setApplying] = useState(false)

  const applyLeave = () => {
    if (!leaveType || !startDate || !endDate || !reason) return alert('Please fill all fields.')
    if (leaveType === 'Half Day' && !halfDaySession) return alert('Select Half Day Session.')
    if (leaveType !== 'Unpaid Leave') {
      const s = new Date(startDate), e = new Date(endDate)
      if (e < s) return alert('End date cannot be before start date.')
      const days = leaveType === 'Half Day' ? 0.5 : Math.ceil((e - s) / 86400000) + 1
      if (leaveType === 'Half Day' && startDate !== endDate) return alert('Half Day Leave is for one day only.')
      if (days > Number(leaveBalance.available_leaves)) return alert(`Insufficient balance. You have ${leaveBalance.available_leaves} leave(s), requested ${days}.`)
    }
    setApplying(true)
    apiFetch(`${API_BASE}/api/leaves`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employee_id: employee.id, leave_type: leaveType, half_day_session: halfDaySession, start_date: startDate, end_date: endDate, reason }) })
      .then(r => r.json()).then(() => { alert('Leave application submitted!'); setStartDate(''); setEndDate(''); setReason(''); setHalfDaySession(''); loadDashboard(employee.id) })
      .catch(() => alert('Failed.')).finally(() => setApplying(false))
  }

  if (loading) return <div style={styles.centerScreen}><div style={{ color: colors.text.secondary }}>Loading...</div></div>
  if (errorMsg) return <div style={styles.centerScreen}><div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}><h2 style={{ color: colors.text.primary }}>Error</h2><p style={{ color: colors.text.secondary }}>{errorMsg}</p></div></div>

  return (
    <div style={styles.pageContainer}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>Leave Management</h1>
        <p style={styles.pageSubtitle}>Apply for leave and track your leave applications</p>
      </div>

      {/* Leave Balance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ ...styles.miniCard, textAlign: 'center', borderLeft: '3px solid #a855f7' }}>
          <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '0 0 4px' }}>Available</p>
          <p style={{ color: '#a855f7', fontSize: 32, fontWeight: 700, margin: 0 }}>{Number(leaveBalance.available_leaves).toFixed(1)}</p>
          <p style={{ color: colors.text.muted, fontSize: 11, margin: '2px 0 0' }}>days</p>
        </div>
        <div style={{ ...styles.miniCard, textAlign: 'center', borderLeft: '3px solid #22c55e' }}>
          <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '0 0 4px' }}>Earned</p>
          <p style={{ color: '#22c55e', fontSize: 32, fontWeight: 700, margin: 0 }}>{Number(leaveBalance.total_leaves_earned).toFixed(1)}</p>
          <p style={{ color: colors.text.muted, fontSize: 11, margin: '2px 0 0' }}>total earned</p>
        </div>
      </div>

      <div style={styles.twoCol}>
        {/* Apply Form */}
        <div style={styles.col()}>
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Apply for Leave</h2>

            {(employee?.employment_status === 'Probation' || employee?.employment_status === 'Intern') && (
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: radius.md, padding: 14, marginBottom: 16, textAlign: 'center' }}>
                <p style={{ color: colors.badge.warning.text, fontWeight: 600, margin: '0 0 4px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} color={colors.badge.warning.text} /> Probation / Internship Period</p>
                <p style={{ color: colors.text.muted, fontSize: 12, margin: 0 }}>Only Unpaid Leave is available during this period.</p>
              </div>
            )}

            <label style={styles.label}>Leave Type</label>
            <select value={leaveType} onChange={e => { setLeaveType(e.target.value); if (e.target.value === 'Half Day') setEndDate(startDate) }} style={styles.select}>
              {employee?.employment_status === 'Permanent'
                ? ['Vacation Leave', 'Sick Leave', 'Half Day', 'Unpaid Leave'].map(t => <option key={t} value={t}>{t}</option>)
                : <option value="Unpaid Leave">Unpaid Leave</option>}
            </select>

            {employee?.employment_status === 'Permanent' && leaveType === 'Half Day' && (
              <>
                <label style={styles.label}>Session</label>
                <select value={halfDaySession} onChange={e => setHalfDaySession(e.target.value)} style={styles.select}>
                  <option value="">Select</option>
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>From Date</label>
                <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); if (leaveType === 'Half Day') setEndDate(e.target.value) }} style={styles.input} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Till Date</label>
                <input type="date" value={endDate} min={startDate} disabled={leaveType === 'Half Day'} onChange={e => setEndDate(e.target.value)} style={{ ...styles.input, opacity: leaveType === 'Half Day' ? 0.5 : 1 }} />
              </div>
            </div>

            <label style={styles.label}>Reason</label>
            <textarea placeholder="Enter reason..." value={reason} onChange={e => setReason(e.target.value)} style={styles.textarea} />

            <button onClick={applyLeave} disabled={applying} style={{ ...styles.primaryBtn, width: '100%', opacity: applying ? 0.6 : 1 }}>
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>

        {/* Leave History */}
        <div style={styles.col('1 1 420px')}>
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Leave History</h2>
            {leaves.length === 0 ? (
              <p style={{ color: colors.text.muted, textAlign: 'center', padding: 20 }}>No leave applications yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Duration</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l.id}>
                        <td style={styles.td}>{l.leave_type}{l.leave_type === 'Half Day' && l.half_day_session ? ` (${l.half_day_session})` : ''}</td>
                        <td style={styles.td}>{l.start_date} — {l.end_date}</td>
                        <td style={styles.td}><span style={statusBadge(l.status)}>{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeLeave
