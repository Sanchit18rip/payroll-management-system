import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch, API_BASE } from '../../api'
import { supabase } from '../../supabaseClient'
import useEmployeeData from './useEmployeeData'
import { styles, colors, radius, statusBadge } from './theme'
import { CheckCircle2, Clock, ClipboardList, X, ChevronLeft, ChevronRight, CalendarDays, Send } from 'lucide-react'

// Normalize any date value into a local YYYY-MM-DD key.
// Handles plain 'YYYY-MM-DD' strings and ISO timestamps (e.g. '2026-09-03T18:30:00.000Z'),
// so dots/filters always land on the same calendar day the employee actually saw.
const toDateKey = (val) => {
  if (!val) return null
  const s = typeof val === 'string' ? val : String(val)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-CA')
}

// ── Mini Calendar ──────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelect, workLogs }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate + 'T00:00:00'))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toLocaleDateString('en-CA')

  const logDates = {}
  workLogs.forEach(l => {
    const d = toDateKey(l.attendance_date)
    if (d) {
      if (!logDates[d]) logDates[d] = { total: 0, completed: 0 }
      logDates[d].total++
      if (l.status === 'Completed') logDates[d].completed++
    }
  })

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push(dateStr)
  }

  const monthName = viewDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div style={{
      background: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: radius.md, padding: 16, width: 280, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', color: colors.text.primary, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ color: colors.text.primary, fontWeight: 600, fontSize: 14 }}>{monthName}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', color: colors.text.primary, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{ textAlign: 'center', color: colors.text.muted, fontSize: 11, fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {days.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} />
          const info = logDates[dateStr]
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === today
          return (
            <button key={dateStr} onClick={() => onSelect(dateStr)} style={{
              background: isSelected ? 'rgba(59,130,246,0.3)' : isToday ? 'rgba(59,130,246,0.1)' : 'transparent',
              border: isSelected ? '1.5px solid #3b82f6' : '1.5px solid transparent',
              borderRadius: 8, color: colors.text.primary, fontSize: 12,
              fontWeight: isSelected || isToday ? 700 : 400, cursor: 'pointer',
              padding: '6px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              transition: 'all 0.15s ease',
            }}>
              <span>{new Date(dateStr + 'T00:00:00').getDate()}</span>
              {info && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: info.completed === info.total ? '#22c55e' : '#f59e0b' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────
function EmployeeWorkLogs() {
  const { loading: dataLoading, errorMsg, employee } = useEmployeeData()
  const [workLogs, setWorkLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(new Date().toLocaleDateString('en-CA'))

  // Modal state
  const [activeLog, setActiveLog] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [relatedTo, setRelatedTo] = useState('')
  const [workStatus, setWorkStatus] = useState('In Progress')
  const [pctComplete, setPctComplete] = useState(0)
  const [screenshotFile, setScreenshotFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Auto-popup state
  const popupTimerRef = useRef(null)
  const [autoPopupTask, setAutoPopupTask] = useState(null)

  // History modal state
  const [historyLog, setHistoryLog] = useState(null)

  const loadLogs = useCallback(async (empId) => {
    try {
      const url = `${API_BASE}/api/work-logs/${empId}`
      const res = await apiFetch(url)
      if (res.ok) {
        const d = await res.json()
        setWorkLogs(d)
      } else {
        console.error('❌ Work logs API error:', res.status, await res.text())
      }
    } catch (err) {
      console.error('❌ Work logs fetch error:', err)
    }
  }, [])

  useEffect(() => {
    if (!employee?.id) {
      return
    }
    setLoading(true)
    loadLogs(employee.id).finally(() => setLoading(false))
    const iv = setInterval(() => loadLogs(employee.id), 15000)
    return () => clearInterval(iv)
  }, [employee?.id, loadLogs])

  // ── Auto-popup every 2 hours for unsubmitted tasks ─────────────
  useEffect(() => {
    if (!employee?.id) return

    const checkAutoPopup = () => {
      const now = Date.now()
      const TWO_HOURS = 2 * 60 * 60 * 1000

      // Find incomplete tasks (not submitted / not completed)
      const today = new Date().toLocaleDateString('en-CA')
      const incompleteTasks = workLogs.filter(l => {
        if (l.status === 'Completed' || l.submitted_at) return false
        return toDateKey(l.attendance_date) === today
      })

      if (incompleteTasks.length === 0) return

      // Pick the first incomplete task that hasn't been shown recently
      for (const task of incompleteTasks) {
        const assignedTime = new Date(task.assigned_at || task.created_at).getTime()
        const elapsed = now - assignedTime
        // Show popup if at least 2 hours have passed since assignment
        // and we haven't already shown a popup for this task recently
        if (elapsed >= 0) {
          // Check if we're at a 2-hour boundary
          const hoursSinceAssignment = Math.floor(elapsed / TWO_HOURS)
          const popupKey = `popup_${task.id}_${hoursSinceAssignment}`
          const lastShown = localStorage.getItem(popupKey)

          if (!lastShown) {
            setAutoPopupTask(task)
            localStorage.setItem(popupKey, now.toString())
            break
          }
        }
      }
    }

    // Check immediately
    checkAutoPopup()

    // Then check every 5 minutes
    popupTimerRef.current = setInterval(checkAutoPopup, 5 * 60 * 1000)
    return () => clearInterval(popupTimerRef.current)
  }, [employee?.id, workLogs])

  const openTask = (log) => {
    setActiveLog(log)
    setTaskTitle(log.task_title || log.assigned_task || '')
    setRelatedTo(log.related_to || '')
    setWorkStatus(log.status === 'Completed' ? 'Completed' : 'In Progress')
    setPctComplete(log.percent_complete || 0)
    setScreenshotFile(null)
    setAutoPopupTask(null) // Close auto-popup if open
  }

  const closeTask = () => {
    setActiveLog(null)
    setTaskTitle('')
    setRelatedTo('')
    setWorkStatus('In Progress')
    setPctComplete(0)
    setScreenshotFile(null)
  }

  const closeAutoPopup = () => {
    setAutoPopupTask(null)
  }

  const submitLog = async () => {
    if (!taskTitle.trim() || taskTitle.trim().length < 3) {
      alert('Describe your task in at least 3 characters.')
      return
    }
    setSubmitting(true)
    try {
      let screenshotUrl = null
      if (screenshotFile) {
        const fn = `worklog_${employee.id}_${Date.now()}_${screenshotFile.name}`
        const { error } = await supabase.storage.from('work-log-screenshots').upload(fn, screenshotFile)
        if (!error) {
          const { data } = supabase.storage.from('work-log-screenshots').getPublicUrl(fn)
          screenshotUrl = data.publicUrl
        }
      }
      const res = await apiFetch(`${API_BASE}/api/work-logs/${activeLog.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_title: taskTitle,
          related_to: relatedTo,
          status: workStatus,
          percent_complete: Number(pctComplete),
          screenshot_url: screenshotUrl
        })
      })
      if (!res.ok) throw new Error()
      closeTask()
      closeAutoPopup()
      loadLogs(employee.id)
    } catch {
      alert('Failed to submit update.')
    }
    setSubmitting(false)
  }

  if (dataLoading || loading) return (
    <div style={styles.centerScreen}>
      <div style={{ color: colors.text.secondary }}>Loading work logs...</div>
    </div>
  )

  if (errorMsg) return (
    <div style={styles.centerScreen}>
      <div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}>
        <h2 style={{ color: colors.text.primary }}>Error</h2>
        <p style={{ color: colors.text.secondary }}>{errorMsg}</p>
      </div>
    </div>
  )

  // Filter by date — only show tasks that have assigned_task (skip old empty slots)
  const meaningfulLogs = workLogs.filter(l => l.assigned_task && l.assigned_task.trim() !== '' && l.assigned_task !== 'EMPTY')
  const filteredLogs = meaningfulLogs.filter(l => {
    if (!dateFilter) return true
    return toDateKey(l.attendance_date) === dateFilter
  })

  // If no tasks for selected date, show ALL meaningful tasks
  const showAllLogs = filteredLogs.length === 0 && meaningfulLogs.length > 0
  const displayLogs = showAllLogs ? meaningfulLogs : filteredLogs

  // Stats summary — based on displayed tasks (all tasks if no today tasks)
  const displayCompleted = displayLogs.filter(l => l.status === 'Completed').length
  const displayPending = displayLogs.filter(l => l.status === 'Pending').length
  const displayInProgress = displayLogs.filter(l => l.status === 'In Progress').length

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={styles.pageContainer}>
      {/* ══════ TASK UPDATE MODAL ══════ */}
      {activeLog && (
        <div style={styles.overlay} onClick={closeTask}>
          <div style={{ ...styles.modal, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={closeTask} style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 8, color: colors.text.muted, cursor: 'pointer',
              padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease', zIndex: 10,
            }} title="Close">
              <X size={16} />
            </button>

            <h2 style={{ color: colors.text.primary, marginTop: 0, fontSize: 18, paddingRight: 30 }}>
              {activeLog.status === 'Completed' ? '📋 Task Details' : '✏️ Update Task'}
            </h2>

            {/* Assigned task from HR */}
            {activeLog.assigned_task && (
              <div style={{
                background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)',
                borderRadius: 10, padding: '12px 14px', marginBottom: 16,
              }}>
                <p style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📋 Assigned Task
                </p>
                <p style={{ color: colors.text.primary, fontSize: 14, margin: 0, lineHeight: 1.4 }}>
                  {activeLog.assigned_task}
                </p>
              </div>
            )}

            {/* Task description */}
            <label style={styles.label}>What did you work on?</label>
            <textarea
              placeholder={activeLog.assigned_task ? `Update on: ${activeLog.assigned_task.substring(0, 50)}...` : 'Describe your task...'}
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              style={styles.textarea}
              disabled={activeLog.status === 'Completed'}
            />

            {/* Related To */}
            <label style={styles.label}>Related To</label>
            <select value={relatedTo} onChange={e => setRelatedTo(e.target.value)} style={styles.select} disabled={activeLog.status === 'Completed'}>
              <option value="">Select Module</option>
              {['FRAS', 'Leave Management', 'Performance Reviews', 'Payroll', 'Employee Management', 'Chatbot', 'Other'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Status */}
            <label style={styles.label}>Status</label>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              {['In Progress', 'Completed'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.text.primary, fontSize: 13, cursor: activeLog.status === 'Completed' ? 'default' : 'pointer', opacity: activeLog.status === 'Completed' ? 0.6 : 1 }}>
                  <input type="radio" name="ws" value={s} checked={workStatus === s} onChange={e => setWorkStatus(e.target.value)} disabled={activeLog.status === 'Completed'} /> {s}
                </label>
              ))}
            </div>

            {/* Percent slider */}
            {workStatus === 'In Progress' && activeLog.status !== 'Completed' && (
              <>
                <label style={styles.label}>% Complete: {pctComplete}%</label>
                <input type="range" min="0" max="100" value={pctComplete} onChange={e => setPctComplete(e.target.value)} style={{ width: '100%', marginBottom: 16 }} />
              </>
            )}

            {/* Screenshot */}
            {activeLog.status !== 'Completed' && (
              <>
                <label style={styles.label}>Screenshot (optional)</label>
                <input type="file" accept="image/*" onChange={e => setScreenshotFile(e.target.files[0])} style={{ ...styles.select, padding: '8px 14px', marginBottom: 16 }} />
              </>
            )}

            {/* Screenshot preview */}
            {activeLog.screenshot_url && (
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Current Screenshot</label>
                <img src={activeLog.screenshot_url} alt="Screenshot" style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(148,163,184,0.1)' }} />
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={closeTask} style={{ ...styles.secondaryBtn, flex: 1 }}>Close</button>
              {activeLog.status !== 'Completed' && (
                <button onClick={submitLog} disabled={submitting} style={{ ...styles.primaryBtn, flex: 2, opacity: submitting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Submit Update'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════ AUTO-POPUP (every 2 hours for unsubmitted tasks) ══════ */}
      {autoPopupTask && !activeLog && (
        <div style={styles.overlay} onClick={closeAutoPopup}>
          <div style={{ ...styles.modal, position: 'relative', borderLeft: '3px solid #f59e0b' }} onClick={e => e.stopPropagation()}>
            <button onClick={closeAutoPopup} style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 8, color: colors.text.muted, cursor: 'pointer',
              padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10,
            }} title="Close">
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Clock size={20} color="#f59e0b" />
              <h2 style={{ color: colors.text.primary, margin: 0, fontSize: 18 }}>Task Reminder</h2>
            </div>

            <p style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 16 }}>
              You have an unsubmitted task. Please update your progress.
            </p>

            {autoPopupTask.assigned_task && (
              <div style={{
                background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)',
                borderRadius: 10, padding: '12px 14px', marginBottom: 16,
              }}>
                <p style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>
                  📋 Assigned Task
                </p>
                <p style={{ color: colors.text.primary, fontSize: 14, margin: 0, lineHeight: 1.4 }}>
                  {autoPopupTask.assigned_task}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={closeAutoPopup} style={{ ...styles.secondaryBtn, flex: 1 }}>Dismiss</button>
              <button onClick={() => openTask(autoPopupTask)} style={{ ...styles.primaryBtn, flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Send size={14} /> Update Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ UPDATE HISTORY MODAL ══════ */}
      {historyLog && (
        <div style={styles.overlay} onClick={() => setHistoryLog(null)}>
          <div style={{ ...styles.modal, position: 'relative', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setHistoryLog(null)} style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.15)',
              borderRadius: 8, color: colors.text.muted, cursor: 'pointer',
              padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10,
            }} title="Close">
              <X size={16} />
            </button>

            <h2 style={{ color: colors.text.primary, marginTop: 0, fontSize: 18, paddingRight: 30 }}>
              📜 Update History
            </h2>

            {/* Assigned task from HR */}
            {historyLog.assigned_task && (
              <div style={{
                background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)',
                borderRadius: 10, padding: '12px 14px', marginBottom: 16,
              }}>
                <p style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase' }}>
                  📋 Assigned Task
                </p>
                <p style={{ color: colors.text.primary, fontSize: 14, margin: 0, lineHeight: 1.4 }}>
                  {historyLog.assigned_task}
                </p>
              </div>
            )}

            {/* Current (latest) update */}
            {historyLog.submitted_at && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ color: '#22c55e', fontSize: 12, fontWeight: 700, margin: '0 0 6px' }}>✅ Current (Latest Update)</p>
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: 12 }}>
                  <p style={{ color: colors.text.primary, fontSize: 13, margin: '0 0 4px' }}><strong>Update:</strong> {historyLog.task_title || historyLog.assigned_task || '-'}</p>
                  {historyLog.related_to && <p style={{ color: colors.text.secondary, fontSize: 12, margin: '0 0 4px' }}>📁 {historyLog.related_to}</p>}
                  <p style={{ color: colors.text.secondary, fontSize: 12, margin: 0 }}>
                    Status: <span style={{ color: historyLog.status === 'Completed' ? '#22c55e' : '#3b82f6' }}>{historyLog.status}</span> — {historyLog.percent_complete}%
                  </p>
                  <p style={{ color: colors.text.muted, fontSize: 11, margin: '4px 0 0' }}>
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
                      <p style={{ color: colors.text.primary, fontSize: 13, margin: '0 0 4px' }}><strong>Update:</strong> {entry.task_title || '-'}</p>
                      {entry.related_to && <p style={{ color: colors.text.secondary, fontSize: 12, margin: '0 0 4px' }}>📁 {entry.related_to}</p>}
                      <p style={{ color: colors.text.secondary, fontSize: 12, margin: 0 }}>
                        Status: <span style={{ color: entry.status === 'Completed' ? '#22c55e' : entry.status === 'In Progress' ? '#3b82f6' : '#94a3b8' }}>{entry.status}</span> — {entry.percent_complete}%
                      </p>
                      {entry.submitted_at && (
                        <p style={{ color: colors.text.muted, fontSize: 11, margin: '4px 0 0' }}>
                          Submitted: {new Date(entry.submitted_at).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button onClick={() => setHistoryLog(null)} style={{ ...styles.secondaryBtn, width: '100%' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ PAGE CONTENT ══════ */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>Work Logs</h1>
        <p style={styles.pageSubtitle}>View and update your assigned tasks — click any task card to update progress</p>
      </div>

      {/* Summary */}
      <div style={styles.summaryGrid}>
        {[
          ['Completed', displayCompleted, '#22c55e', CheckCircle2],
          ['In Progress', displayInProgress, '#3b82f6', Clock],
          ['Pending', displayPending, '#f59e0b', Clock],
          ['Total Tasks', displayLogs.length, colors.text.secondary, ClipboardList],
        ].map(([l, v, c, Icon]) => (
          <div key={l} style={{ ...styles.miniCard, borderLeft: `3px solid ${c}` }}>
            <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon size={12} color={c} /> {l}
            </p>
            <p style={{ color: c, fontSize: 24, fontWeight: 700, margin: 0 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Calendar + Task cards */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 24 }}>
        <MiniCalendar selectedDate={dateFilter} onSelect={setDateFilter} workLogs={meaningfulLogs} />

        <div style={{ flex: 1, minWidth: 300 }}>
          {/* Date header */}
          <div style={{ ...styles.sectionCard, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <CalendarDays size={16} color={colors.accent?.blue || '#3b82f6'} />
              <h2 style={{ ...styles.sectionTitle, margin: 0 }}>
                {showAllLogs ? 'All Assigned Tasks' : `Tasks for ${new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              </h2>
            </div>
            <p style={{ color: colors.text.muted, fontSize: 12, margin: 0 }}>
              {showAllLogs && <span style={{ color: '#f59e0b' }}>No tasks for selected date — showing all tasks. </span>}
              {displayLogs.length} task{displayLogs.length !== 1 ? 's' : ''} — {displayLogs.filter(l => l.status === 'Completed').length} completed
            </p>
          </div>

          {/* Empty state */}
          {displayLogs.length === 0 ? (
            <div style={{ ...styles.sectionCard, textAlign: 'center', padding: 30 }}>
              <ClipboardList size={32} color="#334155" style={{ marginBottom: 8 }} />
              <p style={{ color: colors.text.muted, margin: 0 }}>No tasks assigned yet. HR will assign tasks here.</p>
            </div>
          ) : (
            /* ══════ HORIZONTAL TASK CARDS ══════ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayLogs.map((log, idx) => {
                const isCompleted = log.status === 'Completed'
                const isPending = log.status === 'Pending'
                const borderColor = isCompleted ? '#22c55e' : isPending ? '#f59e0b' : '#3b82f6'
                const isSubmitted = !!log.submitted_at

                return (
                  <div
                    key={log.id}
                    onClick={() => openTask(log)}
                    style={{
                      ...styles.sectionCard,
                      borderLeft: `4px solid ${borderColor}`,
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      marginBottom: 0,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = `0 4px 20px ${borderColor}22`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = styles.sectionCard.boxShadow
                    }}
                  >
                    {/* Task number */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: `${borderColor}20`, border: `2px solid ${borderColor}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: borderColor, fontSize: 14, fontWeight: 700, flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>

                    {/* Task content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: colors.text.primary, fontWeight: 600, fontSize: 14, margin: 0, lineHeight: 1.4 }}>
                        {log.assigned_task || 'No task assigned'}
                      </p>
                      {log.task_title && log.task_title !== log.assigned_task && (
                        <p style={{ color: colors.text.secondary, fontSize: 12, margin: '4px 0 0', lineHeight: 1.3 }}>
                          📝 {log.task_title}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {log.related_to && (
                          <span style={{ color: colors.text.muted, fontSize: 11 }}>📁 {log.related_to}</span>
                        )}
                        {toDateKey(log.attendance_date) && (
                          <span style={{ color: colors.text.muted, fontSize: 11 }}>
                            📅 {new Date(toDateKey(log.attendance_date) + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {log.assigned_at ? ` • ${new Date(log.assigned_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}
                          </span>
                        )}
                        {log.submitted_at && (
                          <span style={{ color: '#22c55e', fontSize: 11 }}>
                            ✅ Updated: {new Date(log.submitted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      {log.percent_complete > 0 && (
                        <div style={{ marginTop: 8, background: 'rgba(148,163,184,0.1)', borderRadius: 4, height: 4, overflow: 'hidden', maxWidth: 200 }}>
                          <div style={{ height: '100%', width: `${log.percent_complete}%`, background: borderColor, borderRadius: 4, transition: 'width 0.3s ease' }} />
                        </div>
                      )}
                    </div>

                    {/* Status + action */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span style={statusBadge(log.status)}>{log.status}</span>
                      {(log.history && log.history.length > 0) && (
                        <button
                          onClick={e => { e.stopPropagation(); setHistoryLog(log) }}
                          style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 6, color: colors.text.muted, fontSize: 10, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          📜 History ({log.history.length})
                        </button>
                      )}
                      <p style={{ color: colors.text.muted, fontSize: 11, margin: 0 }}>
                        {isCompleted
                          ? '✅ View details'
                          : isSubmitted
                            ? '✏️ Click to update'
                            : '👆 Click to update'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmployeeWorkLogs
