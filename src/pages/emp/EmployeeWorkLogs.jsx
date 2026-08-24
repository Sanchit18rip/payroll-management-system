import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch, API_BASE } from '../../api'
import { supabase } from '../../supabaseClient'
import useEmployeeData from './useEmployeeData'
import { styles, colors, radius, statusBadge } from './theme'
import { CheckCircle2, Clock, XCircle, ClipboardList, X, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

function MiniCalendar({ selectedDate, onSelect, workLogs }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate + 'T00:00:00'))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toLocaleDateString('en-CA')

  // Get dates that have work logs
  const logDates = {}
  workLogs.forEach(l => {
    if (l.slot_start_time) {
      const d = new Date(l.slot_start_time).toLocaleDateString('en-CA')
      if (!logDates[d]) logDates[d] = { total: 0, completed: 0, pending: 0 }
      logDates[d].total++
      if (l.status === 'Completed') logDates[d].completed++
      if (l.status === 'Pending') logDates[d].pending++
    }
  })

  const days = []
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push(dateStr)
  }

  const monthName = viewDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div style={{
      background: 'rgba(15,23,42,0.6)',
      border: '1px solid rgba(148,163,184,0.1)',
      borderRadius: radius.md,
      padding: 16,
      width: 280,
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          style={{ background: 'none', border: 'none', color: colors.text.primary, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
        >
          <ChevronLeft size={18} />
        </button>
        <span style={{ color: colors.text.primary, fontWeight: 600, fontSize: 14 }}>{monthName}</span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          style={{ background: 'none', border: 'none', color: colors.text.primary, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ textAlign: 'center', color: colors.text.muted, fontSize: 11, fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />
          const info = logDates[dateStr]
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === today
          const hasLogs = !!info

          let dotColor = 'transparent'
          if (info) {
            if (info.completed === info.total) dotColor = '#22c55e' // all done
            else if (info.pending > 0) dotColor = '#f59e0b' // some pending
            else dotColor = '#06b6d4' // partial
          }

          return (
            <button
              key={dateStr}
              onClick={() => onSelect(dateStr)}
              style={{
                background: isSelected ? 'rgba(59,130,246,0.3)' : isToday ? 'rgba(59,130,246,0.1)' : 'transparent',
                border: isSelected ? '1.5px solid #3b82f6' : '1.5px solid transparent',
                borderRadius: 8,
                color: colors.text.primary,
                fontSize: 12,
                fontWeight: isSelected || isToday ? 700 : 400,
                cursor: 'pointer',
                padding: '6px 2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{new Date(dateStr + 'T00:00:00').getDate()}</span>
              {hasLogs && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['#22c55e', 'All Done'], ['#f59e0b', 'Pending'], ['#06b6d4', 'Partial']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
            <span style={{ color: colors.text.muted, fontSize: 10 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmployeeWorkLogs() {
  const { loading: dataLoading, errorMsg, employee, attendance } = useEmployeeData()
  const [workLogs, setWorkLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [activeLog, setActiveLog] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [relatedTo, setRelatedTo] = useState('')
  const [workStatus, setWorkStatus] = useState('In Progress')
  const [pctComplete, setPctComplete] = useState(50)
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [dateFilter, setDateFilter] = useState(new Date().toLocaleDateString('en-CA'))
  const [dismissedSlots, setDismissedSlots] = useState(new Set())
  const slotsRef = useRef(false)

  const loadLogs = useCallback(async (empId) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/work-logs/${empId}`)
      if (res.ok) { const d = await res.json(); setWorkLogs(d) }
    } catch { }
  }, [])

  useEffect(() => {
    if (!employee?.id) return
    setLoading(true)
    loadLogs(employee.id).finally(() => setLoading(false))
    const iv = setInterval(() => loadLogs(employee.id), 15000)
    return () => clearInterval(iv)
  }, [employee?.id, loadLogs])

  // Generate slots on check-in
  useEffect(() => {
    if (!employee?.id) return
    const todayStr = new Date().toLocaleDateString('en-CA')
    const todayRow = attendance.find(r => new Date(r.attendance_date).toLocaleDateString('en-CA') === todayStr)
    if (todayRow?.status === 'Present' && !slotsRef.current) {
      slotsRef.current = true
      apiFetch(`${API_BASE}/api/work-logs/generate-slots`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employee_id: employee.id, slot_hours: 2 }) })
        .then(() => loadLogs(employee.id)).catch(() => {})
    }
  }, [attendance, employee?.id, loadLogs])

  // Auto popup — ONLY for Pending slots, skip dismissed
  useEffect(() => {
    if (showPopup) return
    const now = new Date()
    const slot = workLogs.find(l =>
      l.status === 'Pending' &&
      !dismissedSlots.has(l.id) &&
      now >= new Date(l.slot_start_time) &&
      now <= new Date(l.slot_end_time)
    )
    if (slot) { setActiveLog(slot); setShowPopup(true) }

    // Auto-mark missed
    const missed = workLogs.filter(l => l.status === 'Pending' && now > new Date(l.slot_end_time))
    missed.forEach(l => apiFetch(`${API_BASE}/api/work-logs/${l.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task_title: l.task_title || 'No update submitted', status: 'Missed', percent_complete: 0 }) }).catch(() => {}))
    if (missed.length && employee?.id) setTimeout(() => loadLogs(employee.id), 1000)
  }, [workLogs, showPopup, dismissedSlots, employee?.id, loadLogs])

  const dismissPopup = () => {
    if (activeLog) {
      setDismissedSlots(prev => new Set([...prev, activeLog.id]))
    }
    setShowPopup(false)
  }

  const submitLog = async () => {
    if (!taskTitle.trim() || taskTitle.trim().length < 10) return alert('Describe your task in at least 10 characters.')
    setSubmitting(true)
    try {
      let screenshotUrl = null
      if (screenshotFile) {
        const fn = `worklog_${employee.id}_${Date.now()}_${screenshotFile.name}`
        const { error } = await supabase.storage.from('work-log-screenshots').upload(fn, screenshotFile)
        if (!error) { const { data } = supabase.storage.from('work-log-screenshots').getPublicUrl(fn); screenshotUrl = data.publicUrl }
      }
      const res = await apiFetch(`${API_BASE}/api/work-logs/${activeLog.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task_title: taskTitle, related_to: relatedTo, status: workStatus, percent_complete: Number(pctComplete), screenshot_url: screenshotUrl }) })
      if (!res.ok) throw new Error()
      setShowPopup(false)
      setTaskTitle(''); setRelatedTo(''); setWorkStatus('In Progress'); setPctComplete(50); setScreenshotFile(null)
      loadLogs(employee.id)
    } catch { alert('Failed to submit work log.') }
    setSubmitting(false)
  }

  if (dataLoading || loading) return <div style={styles.centerScreen}><div style={{ color: colors.text.secondary }}>Loading work logs...</div></div>
  if (errorMsg) return <div style={styles.centerScreen}><div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}><h2 style={{ color: colors.text.primary }}>Error</h2><p style={{ color: colors.text.secondary }}>{errorMsg}</p></div></div>

  const filteredLogs = workLogs.filter(l => {
    if (!dateFilter) return true
    const logDate = l.slot_start_time ? new Date(l.slot_start_time).toLocaleDateString('en-CA') : null
    return logDate === dateFilter
  })

  // Today summary
  const todayStr = new Date().toLocaleDateString('en-CA')
  const todayLogs = workLogs.filter(l => l.slot_start_time && new Date(l.slot_start_time).toLocaleDateString('en-CA') === todayStr)
  const todayCompleted = todayLogs.filter(l => l.status === 'Completed').length
  const todayMissed = todayLogs.filter(l => l.status === 'Missed').length
  const todayPending = todayLogs.filter(l => l.status === 'Pending').length
  const todayInProgress = todayLogs.filter(l => l.status === 'In Progress').length

  return (
    <div style={styles.pageContainer}>
      {/* Popup with close button */}
      {showPopup && activeLog && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, position: 'relative' }}>
            {/* Close button in top-right corner */}
            <button
              onClick={dismissPopup}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: 8, color: colors.text.muted, cursor: 'pointer',
                padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease', zIndex: 10,
              }}
              title="Dismiss (you can open again later)"
            >
              <X size={16} />
            </button>

            <h2 style={{ color: colors.text.primary, marginTop: 0, fontSize: 18, paddingRight: 30 }}>Work Log Update</h2>
            <p style={{ color: colors.text.muted, fontSize: 13, marginBottom: 16 }}>
              Slot: {new Date(activeLog.slot_start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} — {new Date(activeLog.slot_end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <label style={styles.label}>What did you work on?</label>
            <textarea placeholder="Describe your task..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} style={styles.textarea} />
            <label style={styles.label}>Related To</label>
            <select value={relatedTo} onChange={e => setRelatedTo(e.target.value)} style={styles.select}>
              <option value="">Select Module</option>
              {['FRAS','Leave Management','Performance Reviews','Payroll','Employee Management','Chatbot','Other'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <label style={styles.label}>Status</label>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              {['In Progress', 'Completed'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.text.primary, fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" name="ws" value={s} checked={workStatus === s} onChange={e => setWorkStatus(e.target.value)} /> {s}
                </label>
              ))}
            </div>
            {workStatus === 'In Progress' && (
              <>
                <label style={styles.label}>% Complete: {pctComplete}%</label>
                <input type="range" min="0" max="100" value={pctComplete} onChange={e => setPctComplete(e.target.value)} style={{ width: '100%', marginBottom: 16 }} />
              </>
            )}
            <label style={styles.label}>Screenshot (optional)</label>
            <input type="file" accept="image/*" onChange={e => setScreenshotFile(e.target.files[0])} style={{ ...styles.select, padding: '8px 14px', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={dismissPopup} style={{ ...styles.secondaryBtn || {}, flex: 1, padding: '10px 16px', background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10, color: colors.text.muted, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Dismiss</button>
              <button onClick={submitLog} disabled={submitting} style={{ ...styles.primaryBtn, flex: 2, opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Submitting...' : 'Submit Update'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>Work Logs</h1>
        <p style={styles.pageSubtitle}>Track your daily work updates — a quick update is requested every 2 hours</p>
      </div>

      {/* Today Summary */}
      <div style={styles.summaryGrid}>
        {[
          ['Completed', todayCompleted, '#22c55e', CheckCircle2],
          ['In Progress', todayInProgress, '#3b82f6', Clock],
          ['Pending', todayPending, '#f59e0b', Clock],
          ['Missed', todayMissed, '#ef4444', XCircle],
          ['Total Slots', todayLogs.length, colors.text.secondary, ClipboardList],
        ].map(([l, v, c, Icon]) => (
          <div key={l} style={{ ...styles.miniCard, borderLeft: `3px solid ${c}` }}>
            <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4 }}><Icon size={12} color={c} /> {l}</p>
            <p style={{ color: c, fontSize: 24, fontWeight: 700, margin: 0 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Calendar + Filter row */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 24 }}>
        <MiniCalendar selectedDate={dateFilter} onSelect={setDateFilter} workLogs={workLogs} />

        {/* Selected date tasks */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ ...styles.sectionCard, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <CalendarDays size={16} color={colors.accent?.blue || '#3b82f6'} />
              <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
                Tasks for {new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <p style={{ color: colors.text.muted, fontSize: 12, margin: 0 }}>
              {filteredLogs.length} slot{filteredLogs.length !== 1 ? 's' : ''} — {filteredLogs.filter(l => l.status === 'Completed').length} completed
            </p>
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ ...styles.sectionCard, textAlign: 'center', padding: 30 }}>
              <ClipboardList size={32} color="#334155" style={{ marginBottom: 8 }} />
              <p style={{ color: colors.text.muted, margin: 0 }}>No work logs for this date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredLogs.map(log => (
                <div key={log.id} style={{
                  ...styles.sectionCard,
                  borderLeft: `3px solid ${log.status === 'Completed' ? '#22c55e' : log.status === 'Pending' ? '#f59e0b' : log.status === 'Missed' ? '#ef4444' : '#3b82f6'}`,
                  padding: '14px 18px',
                  cursor: log.status === 'Pending' ? 'pointer' : 'default',
                }}
                  onClick={() => {
                    if (log.status === 'Pending') {
                      setActiveLog(log)
                      setShowPopup(true)
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <span style={{ color: colors.text.primary, fontWeight: 600, fontSize: 14 }}>
                        {log.slot_start_time ? new Date(log.slot_start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'} — {log.slot_end_time ? new Date(log.slot_end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                      <span style={{ color: colors.text.muted, fontSize: 12, marginLeft: 10 }}>{log.related_to || ''}</span>
                    </div>
                    <span style={statusBadge(log.status)}>{log.status}</span>
                  </div>
                  <p style={{ color: colors.text.secondary, fontSize: 13, margin: '4px 0 0', lineHeight: 1.4 }}>
                    {log.task_title || 'No task description'}
                  </p>
                  {log.percent_complete > 0 && (
                    <div style={{ marginTop: 8, background: 'rgba(148,163,184,0.1)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${log.percent_complete}%`, background: log.status === 'Completed' ? '#22c55e' : '#3b82f6', borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeWorkLogs
