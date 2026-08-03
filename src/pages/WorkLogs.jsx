import { useState, useEffect, useCallback, useMemo } from "react"

const API_BASE = 'https://payroll-management-system-three.vercel.app'

function WorkLogs() {

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState(new Date().toLocaleDateString('en-CA'))

  const [screenshotPreview, setScreenshotPreview] = useState(null)

  const loadWorkLogs = useCallback(async () => {

    setLoading(true)
    setErrorMsg('')

    try {

      const res = await fetch(`${API_BASE}/api/work-logs`)

      if (!res.ok) {
        throw new Error('Could not load work logs')
      }

      const data = await res.json()

      setLogs(data)

    }

    catch (err) {

      console.log(err)
      setErrorMsg('Could not load work logs. Please try again.')

    }

    finally {

      setLoading(false)

    }

  }, [])

  useEffect(() => {

    loadWorkLogs()

    const interval = setInterval(loadWorkLogs, 15000)

    return () => clearInterval(interval)

  }, [loadWorkLogs])

  const departments = useMemo(() => {

    const set = new Set(logs.map(log => log.department).filter(Boolean))

    return ['All', ...Array.from(set)]

  }, [logs])

  const filteredLogs = useMemo(() => {

    return logs.filter(log => {

      const logDateStr = log.slot_start_time
        ? new Date(log.slot_start_time).toLocaleDateString('en-CA')
        : null

      if (dateFilter && logDateStr !== dateFilter) return false
      if (departmentFilter !== 'All' && log.department !== departmentFilter) return false
      if (statusFilter !== 'All' && log.status !== statusFilter) return false

      return true

    }).sort((a, b) => new Date(a.slot_start_time) - new Date(b.slot_start_time))

  }, [logs, dateFilter, departmentFilter, statusFilter])

  const employeeSummaries = useMemo(() => {

    const todaysLogs = logs.filter(log => {

      const logDateStr = log.slot_start_time
        ? new Date(log.slot_start_time).toLocaleDateString('en-CA')
        : null

      return logDateStr === dateFilter
    })

    const grouped = {}

    todaysLogs.forEach(log => {

      const key = log.employee_id

      if (!grouped[key]) {
        grouped[key] = {
          employee_id: log.employee_id,
          employee_name: log.employee_name,
          department: log.department,
          total: 0,
          filled: 0,
          missed: 0
        }
      }

      grouped[key].total += 1

      if (log.status === 'Missed') {
        grouped[key].missed += 1
      }

      else if (log.status !== 'Pending') {
        grouped[key].filled += 1
      }

    })

    return Object.values(grouped).sort((a, b) =>
      (a.employee_name || '').localeCompare(b.employee_name || '')
    )

  }, [logs, dateFilter])

  const formatTime = (value) => {

    if (!value) return '-'

    return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  }

  if (loading && logs.length === 0) {

    return (
      <div style={pageContainer}>
        <p style={{ color: '#94a3b8' }}>Loading work logs...</p>
      </div>
    )

  }

  return (
    <div style={pageContainer}>

      <h1 style={pageTitle}>Work Logs</h1>
      <p style={pageSubtitle}>Track employee task updates across the day</p>

      {errorMsg && (
        <div style={errorBanner}>{errorMsg}</div>
      )}

      <div style={sectionCard}>

        <div style={filterRow}>

          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
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
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
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

          <button onClick={loadWorkLogs} style={refreshButton}>
            Refresh
          </button>

        </div>

      </div>

      <div style={sectionCard}>

        <h2 style={sectionTitle}>Today's Summary ({dateFilter})</h2>

        {employeeSummaries.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No work log activity for this date.</p>
        ) : (
          <div style={summaryGrid}>

            {employeeSummaries.map(summary => (
              <div key={summary.employee_id} style={summaryCard}>

                <p style={summaryName}>{summary.employee_name}</p>
                <p style={summaryDept}>{summary.department || '-'}</p>

                <p style={summaryStat}>
                  {summary.filled}/{summary.total} slots filled
                </p>

                {summary.missed > 0 && (
                  <p style={summaryMissed}>{summary.missed} missed</p>
                )}

              </div>
            ))}

          </div>
        )}

      </div>

      <div style={sectionCard}>

        <h2 style={sectionTitle}>All Logs</h2>

        {filteredLogs.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No logs match the selected filters.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>

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

                {filteredLogs.map(log => (
                  <tr key={log.id}>

                    <td style={tdStyle}>{log.employee_name}</td>
                    <td style={tdStyle}>{log.department || '-'}</td>

                    <td style={tdStyle}>
                      {formatTime(log.slot_start_time)} - {formatTime(log.slot_end_time)}
                    </td>

                    <td style={tdStyle}>{log.task_title || '-'}</td>
                    <td style={tdStyle}>{log.related_to || '-'}</td>

                    <td style={tdStyle}>
                      <span style={statusBadgeStyle(log.status)}>{log.status}</span>
                    </td>

                    <td style={tdStyle}>{log.percent_complete ?? 0}%</td>

                    <td style={tdStyle}>
                      {log.screenshot_url ? (
                        <button
                          onClick={() => setScreenshotPreview(log.screenshot_url)}
                          style={viewButton}
                        >
                          View
                        </button>
                      ) : '-'}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {screenshotPreview && (
        <div style={modalOverlay} onClick={() => setScreenshotPreview(null)}>

          <div style={modalBox} onClick={(e) => e.stopPropagation()}>

            <img
              src={screenshotPreview}
              alt="Work log screenshot"
              style={{ width: '100%', borderRadius: '10px', display: 'block' }}
            />

            <button
              onClick={() => setScreenshotPreview(null)}
              style={{ ...refreshButton, marginTop: '16px', width: '100%' }}
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  )

}

function statusBadgeStyle(status) {

  const base = {
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  }

  if (status === 'Completed') {
    return { ...base, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
  }

  if (status === 'In Progress') {
    return { ...base, background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }
  }

  if (status === 'Missed') {
    return { ...base, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
  }

  return { ...base, background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }

}

const pageContainer = {
  padding: '30px',
  maxWidth: '1400px',
  margin: '0 auto',
  minHeight: '100vh',
  background: '#0f172a'
}

const pageTitle = {
  color: '#f8fafc',
  fontSize: '28px',
  margin: '0 0 4px'
}

const pageSubtitle = {
  color: '#94a3b8',
  fontSize: '14px',
  margin: '0 0 24px'
}

const errorBanner = {
  background: 'rgba(239,68,68,0.12)',
  border: '1px solid #ef4444',
  color: '#f8fafc',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '20px'
}

const sectionCard = {
  background: '#1e293b',
  borderRadius: '20px',
  padding: '24px',
  border: '1px solid #334155',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  marginBottom: '24px'
}

const sectionTitle = {
  color: '#f8fafc',
  fontSize: '18px',
  marginTop: 0,
  marginBottom: '18px'
}

const filterRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '18px',
  alignItems: 'flex-end'
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: '600'
}

const inputStyle = {
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  minWidth: '160px'
}

const refreshButton = {
  padding: '11px 20px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '600',
  fontSize: '14px',
  cursor: 'pointer',
  height: '42px'
}

const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px'
}

const summaryCard = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '14px',
  padding: '16px'
}

const summaryName = {
  color: '#f8fafc',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 2px'
}

const summaryDept = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0 0 10px'
}

const summaryStat = {
  color: '#e2e8f0',
  fontSize: '14px',
  margin: 0
}

const summaryMissed = {
  color: '#ef4444',
  fontSize: '13px',
  margin: '4px 0 0',
  fontWeight: '600'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
}

const thStyle = {
  textAlign: 'left',
  padding: '10px',
  color: '#94a3b8',
  fontSize: '12px',
  textTransform: 'uppercase',
  borderBottom: '1px solid #334155',
  whiteSpace: 'nowrap'
}

const tdStyle = {
  padding: '10px',
  color: '#f8fafc',
  fontSize: '14px',
  borderBottom: '1px solid #334155'
}

const viewButton = {
  padding: '6px 12px',
  background: '#334155',
  color: '#f8fafc',
  border: 'none',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer'
}

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,.65)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: '20px'
}

const modalBox = {
  background: '#1e293b',
  padding: '20px',
  borderRadius: '20px',
  maxWidth: '480px',
  width: '100%',
  border: '1px solid #334155',
  boxShadow: '0 10px 35px rgba(0,0,0,.45)'
}

export default WorkLogs
