import { useState, useEffect, useRef, useCallback } from 'react'
import { apiFetch, API_BASE } from '../../api'
import { supabase } from '../../supabaseClient'
import useEmployeeData from './useEmployeeData'
import { styles, colors, radius, getMonthName, statusBadge } from './theme'
import * as faceapi from 'face-api.js'
import { Camera, CalendarDays, BarChart3, CheckCircle2, XCircle, Plane, Clock, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

const OFFICE_LAT = 19.0760
const OFFICE_LNG = 72.8777
const OFFICE_RADIUS = 200
function distMeters(la1, lo1, la2, lo2) {
  const R = 6371000, toR = d => d * Math.PI / 180
  const dLat = toR(la2 - la1), dLng = toR(lo2 - lo1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(la1)) * Math.cos(toR(la2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
function eyeAR(pts) {
  const d = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  return (d(pts[1], pts[5]) + d(pts[2], pts[4])) / (2 * d(pts[0], pts[3]))
}

const DAYS_IN_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ── Mini Calendar Component ── */
function AttendanceCalendar({ selectedDate, onSelect, attendanceMap, month, year }) {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA')
  const calDays = new Date(year, month, 0).getDate()
  const firstDay = new Date(year, month - 1, 1).getDay()

  const handlePrev = () => {
    if (month === 1) onSelect({ month: 12, year: year - 1, day: 1 })
    else onSelect({ month: month - 1, year, day: 1 })
  }
  const handleNext = () => {
    if (month === 12) onSelect({ month: 1, year: year + 1, day: 1 })
    else onSelect({ month: month + 1, year, day: 1 })
  }

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= calDays; d++) days.push(d)

  const monthName = new Date(year, month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div style={{
      background: 'rgba(15,23,42,0.6)',
      border: '1px solid rgba(148,163,184,0.1)',
      borderRadius: radius.md,
      padding: 18,
      minWidth: 300,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={handlePrev} style={{ background: 'none', border: 'none', color: colors.text.primary, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ color: colors.text.primary, fontWeight: 700, fontSize: 15 }}>{monthName}</span>
        <button onClick={handleNext} style={{ background: 'none', border: 'none', color: colors.text.primary, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 6 }}>
        {DAYS_IN_WEEK.map(d => (
          <div key={d} style={{ textAlign: 'center', color: colors.text.muted, fontSize: 11, fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const rec = attendanceMap[dateStr]
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate

          // Background color based on status
          let bg = 'rgba(148,163,184,0.04)'
          let dotColor = '#475569' // not marked - grey
          if (rec) {
            if (rec.status === 'Present') { bg = 'rgba(34,197,94,0.15)'; dotColor = '#22c55e' }
            else if (rec.status === 'Absent') { bg = 'rgba(239,68,68,0.15)'; dotColor = '#ef4444' }
            else if (rec.status === 'Paid Leave') { bg = 'rgba(168,85,247,0.15)'; dotColor = '#a855f7' }
            else if (rec.status === 'Half Day') { bg = 'rgba(245,158,11,0.15)'; dotColor = '#f59e0b' }
          }

          // Past date with no record = Not Generated (grey)
          const isPastNoRecord = !rec && dateStr < todayStr

          return (
            <button
              key={day}
              onClick={() => onSelect({ month, year, day })}
              style={{
                textAlign: 'center',
                padding: '8px 4px',
                borderRadius: 8,
                background: bg,
                border: isSelected ? '1.5px solid #3b82f6' : isToday ? '1.5px solid rgba(99,102,241,0.4)' : '1.5px solid transparent',
                fontSize: 13,
                color: colors.text.primary,
                cursor: 'pointer',
                fontWeight: isToday || isSelected ? 700 : 400,
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              <span>{day}</span>
              <span style={{
                display: 'block', width: 5, height: 5, borderRadius: '50%',
                background: isPastNoRecord ? '#475569' : dotColor,
                margin: '3px auto 0', opacity: rec || isPastNoRecord ? 1 : 0,
              }} />
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          ['#22c55e', 'Present'],
          ['#ef4444', 'Absent'],
          ['#a855f7', 'Leave'],
          ['#f59e0b', 'Half Day'],
          ['#475569', 'Not Marked'],
        ].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
            <span style={{ color: colors.text.muted, fontSize: 10 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Component ── */
function EmployeeAttendance() {
  const { loading: dataLoading, errorMsg, employee, attendance, loadDashboard } = useEmployeeData()
  const [tab, setTab] = useState('monthly')
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedDate, setSelectedDate] = useState(now.toLocaleDateString('en-CA'))
  const [monthlyData, setMonthlyData] = useState({ attendance: [], summary: {} })
  const [yearlyData, setYearlyData] = useState([])
  const [monthLoading, setMonthLoading] = useState(false)

  // FRAS state
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [faceEnrolled, setFaceEnrolled] = useState(true)
  const [cameraMode, setCameraMode] = useState(null)
  const [cameraBusy, setCameraBusy] = useState(false)
  const [cameraMessage, setCameraMessage] = useState('')
  const [liveMatchFound, setLiveMatchFound] = useState(false)
  const [liveDetectedName, setLiveDetectedName] = useState('')
  const [liveDetectedCode, setLiveDetectedCode] = useState('')
  const [attendanceType, setAttendanceType] = useState('')
  const [geofenceChecking, setGeofenceChecking] = useState(false)
  const [blinkDetected, setBlinkDetected] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const detectionRef = useRef(null)
  const eyeRef = useRef('open')

  useEffect(() => { if (employee) setFaceEnrolled(!!employee.face_descriptor) }, [employee])

  useEffect(() => {
    const load = async () => {
      try {
        await faceapi.nets.faceRecognitionNet.loadFromUri(`${import.meta.env.BASE_URL}models`)
        await faceapi.nets.faceLandmark68Net.loadFromUri(`${import.meta.env.BASE_URL}models`)
        await faceapi.nets.tinyFaceDetector.loadFromUri(`${import.meta.env.BASE_URL}models`)
        setModelsLoaded(true)
      } catch (e) { console.log('Models failed', e) }
    }
    load()
  }, [])

  // Load monthly attendance
  const refreshMonthly = useCallback(() => {
    if (!employee?.id) return
    setMonthLoading(true)
    apiFetch(`${API_BASE}/api/employee-attendance/${employee.id}/monthly?month=${selectedMonth}&year=${selectedYear}`)
      .then(r => r.json()).then(setMonthlyData).catch(() => setMonthlyData({ attendance: [], summary: {} }))
      .finally(() => setMonthLoading(false))
  }, [employee?.id, selectedMonth, selectedYear])

  useEffect(() => { refreshMonthly() }, [refreshMonthly])

  // Also refresh when attendance prop changes (after self-mark)
  useEffect(() => { refreshMonthly() }, [attendance?.length, refreshMonthly])

  // Load yearly attendance
  useEffect(() => {
    if (!employee?.id || tab !== 'yearly') return
    apiFetch(`${API_BASE}/api/employee-attendance/${employee.id}/yearly?year=${selectedYear}`)
      .then(r => r.json()).then(setYearlyData).catch(() => setYearlyData([]))
  }, [employee?.id, tab, selectedYear])

  // Camera functions
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraMode(null); setCameraMessage(''); setLiveMatchFound(false); setBlinkDetected(false); eyeRef.current = 'open'
  }

  const openCamera = async (mode) => {
    if (!modelsLoaded) return alert('Face recognition still loading...')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream; setCameraMode(mode); setCameraMessage('')
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 100)
    } catch { alert('Camera access required.') }
  }

  const captureDesc = async () => {
    if (!videoRef.current) return null
    const det = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()
    if (!det) { setCameraMessage('No face detected.'); return null }
    return det.descriptor
  }

  useEffect(() => {
    if (['mark', 'exit', 'liveness'].includes(cameraMode) && modelsLoaded && employee?.face_descriptor) {
      const empName = employee.name
      const empCode = employee.employee_code || `EMP${String(employee.id).padStart(4, '0')}`
      const empDescriptor = employee.face_descriptor
      detectionRef.current = setInterval(async () => {
        if (!videoRef.current) return
        const det = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor()
        if (!det) { setLiveMatchFound(false); return }
        const avg = (eyeAR(det.landmarks.getLeftEye()) + eyeAR(det.landmarks.getRightEye())) / 2
        if (avg < 0.22) eyeRef.current = 'closed'
        else { if (eyeRef.current === 'closed') setBlinkDetected(true); eyeRef.current = 'open' }
        const stored = new Float32Array(JSON.parse(empDescriptor))
        const dist = faceapi.euclideanDistance(stored, det.descriptor)
        if (dist < 0.6) { setLiveMatchFound(true); setLiveDetectedName(empName); setLiveDetectedCode(empCode) }
        else { setLiveMatchFound(false) }
      }, 1500)
    }
    return () => { if (detectionRef.current) { clearInterval(detectionRef.current); detectionRef.current = null } }
  }, [cameraMode, modelsLoaded, employee?.face_descriptor])

  const captureSnapshot = () => {
    const v = videoRef.current, c = document.createElement('canvas')
    c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0)
    return c.toDataURL('image/jpeg', 0.8)
  }

  const dataUrlBlob = (du) => {
    const a = du.split(','), m = a[0].match(/:(.*?);/)[1], b = atob(a[1])
    let n = b.length; const u = new Uint8Array(n); while (n--) u[n] = b.charCodeAt(n)
    return new Blob([u], { type: m })
  }

  const submitEnroll = async () => {
    setCameraBusy(true)
    const desc = await captureDesc()
    if (!desc) { setCameraBusy(false); return }
    const res = await apiFetch(`${API_BASE}/api/employees/${employee.id}/face-enroll`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ face_descriptor: Array.from(desc) }) })
    const r = await res.json()
    if (!res.ok) { setCameraMessage(r.message || 'Enrollment failed.'); setCameraBusy(false); return }
    setFaceEnrolled(true); stopCamera(); alert('Face enrolled!')
    setCameraBusy(false)
  }

  const submitMark = async () => {
    setCameraBusy(true)
    const desc = await captureDesc()
    if (!desc) { setCameraBusy(false); return }
    const stored = new Float32Array(JSON.parse(employee.face_descriptor))
    if (faceapi.euclideanDistance(stored, desc) >= 0.6) { setCameraMessage('Face not recognized.'); setCameraBusy(false); return }
    if (!blinkDetected) { setCameraMessage('Please blink to confirm liveness.'); setCameraBusy(false); return }
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude: lat, longitude: lng } = pos.coords
        const du = captureSnapshot(), blob = dataUrlBlob(du)
        const fn = `${employee.id}_${Date.now()}.jpg`
        const { error: ue } = await supabase.storage.from('attendance-photos').upload(fn, blob)
        if (ue) throw ue
        const { data: url } = supabase.storage.from('attendance-photos').getPublicUrl(fn)
        const res = await apiFetch(`${API_BASE}/api/attendance/self-mark`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employee_id: employee.id, photo_url: url.publicUrl, latitude: lat, longitude: lng, face_match: true, attendance_type: attendanceType }) })
        const r = await res.json()
        if (!res.ok) { setCameraMessage(r.message || 'Failed.'); setCameraBusy(false); return }
        alert('Attendance marked!'); stopCamera(); loadDashboard(employee.id)
      } catch { setCameraMessage('Something went wrong.'); }
      setCameraBusy(false)
    }, () => { setCameraMessage('Location access required.'); setCameraBusy(false) })
  }

  const submitExit = async () => {
    setCameraBusy(true)
    const desc = await captureDesc()
    if (!desc) { setCameraBusy(false); return }
    const stored = new Float32Array(JSON.parse(employee.face_descriptor))
    if (faceapi.euclideanDistance(stored, desc) >= 0.6) { setCameraMessage('Face not recognized.'); setCameraBusy(false); return }
    if (!blinkDetected) { setCameraMessage('Please blink.'); setCameraBusy(false); return }
    navigator.geolocation.getCurrentPosition(async pos => {
      const res = await apiFetch(`${API_BASE}/api/attendance/self-mark-exit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employee_id: employee.id, latitude: pos.coords.latitude, longitude: pos.coords.longitude, face_match: true }) })
      const r = await res.json()
      if (!res.ok) { setCameraMessage(r.message || 'Failed.'); setCameraBusy(false); return }
      alert('Exit marked!'); stopCamera(); loadDashboard(employee.id); setCameraBusy(false)
    }, () => { setCameraMessage('Location required.'); setCameraBusy(false) })
  }

  if (dataLoading) return <div style={styles.centerScreen}><div style={{ color: colors.text.secondary }}>Loading...</div></div>
  if (errorMsg) return <div style={styles.centerScreen}><div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}><h2 style={{ color: colors.text.primary }}>Error</h2><p style={{ color: colors.text.secondary }}>{errorMsg}</p></div></div>

  const todayStr = now.toLocaleDateString('en-CA')
  const todayRecord = attendance.find(r => new Date(r.attendance_date).toLocaleDateString('en-CA') === todayStr)
  const isCheckedIn = todayRecord?.status === 'Present'
  const isCheckedOut = !!todayRecord?.check_out_time

  // Build attendance map — merge API data + useEmployeeData attendance
  const attMap = {}
  // First load all monthly API records
  monthlyData.attendance?.forEach(a => {
    const d = new Date(a.attendance_date).toLocaleDateString('en-CA')
    attMap[d] = a
  })
  // Then merge real-time attendance from useEmployeeData (covers today etc.)
  attendance?.forEach(a => {
    const d = new Date(a.attendance_date).toLocaleDateString('en-CA')
    // Only override if not already present, or if the record has check_in_time (more data)
    if (!attMap[d] || (a.check_in_time && !attMap[d].check_in_time)) {
      attMap[d] = a
    }
  })

  // Recalculate summary from merged attMap
  const allRecords = Object.values(attMap)
  const mergedSummary = {
    present_days: allRecords.filter(r => r.status === 'Present').length,
    absent_days: allRecords.filter(r => r.status === 'Absent').length,
    paid_leave_days: allRecords.filter(r => r.status === 'Paid Leave').length,
    half_day_days: allRecords.filter(r => r.status === 'Half Day').length,
  }
  const displaySummary = (monthlyData.summary?.present_days > 0 || monthlyData.summary?.absent_days > 0) ? monthlyData.summary : mergedSummary

  // Selected date record
  const selectedRecord = attMap[selectedDate] || null

  // Handle calendar date select
  const handleCalendarSelect = ({ month: m, year: y, day: d }) => {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    setSelectedDate(dateStr)
    if (m !== selectedMonth || y !== selectedYear) {
      setSelectedMonth(m)
      setSelectedYear(y)
    }
  }

  // Today's status card
  const todayStatusColor = isCheckedIn ? '#22c55e' : '#ef4444'
  const todayStatusText = isCheckedIn ? (isCheckedOut ? 'Checked Out' : 'Checked In') : 'Not Marked'

  return (
    <div style={styles.pageContainer}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>Attendance</h1>
        <p style={styles.pageSubtitle}>Track and manage your daily attendance records</p>
      </div>

      {/* Today Status Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${todayStatusColor}15, ${todayStatusColor}08)`,
        border: `1px solid ${todayStatusColor}30`,
        borderRadius: radius.md,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${todayStatusColor}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isCheckedIn ? <CheckCircle2 size={22} color="#22c55e" /> : <XCircle size={22} color="#ef4444" />}
          </div>
          <div>
            <p style={{ color: colors.text.muted, fontSize: 12, margin: 0 }}>Today's Status</p>
            <p style={{ color: todayStatusColor, fontSize: 18, fontWeight: 700, margin: '2px 0 0' }}>{todayStatusText}</p>
          </div>
        </div>
        {todayRecord && (
          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            {todayRecord.check_in_time && (
              <div>
                <span style={{ color: colors.text.muted }}>In: </span>
                <span style={{ color: colors.text.primary, fontWeight: 600 }}>
                  {new Date(todayRecord.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {todayRecord.check_out_time && (
              <div>
                <span style={{ color: colors.text.muted }}>Out: </span>
                <span style={{ color: colors.text.primary, fontWeight: 600 }}>
                  {new Date(todayRecord.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {todayRecord.attendance_type && (
              <div>
                <span style={{ color: colors.text.muted }}>Type: </span>
                <span style={{ color: colors.text.primary, fontWeight: 600 }}>{todayRecord.attendance_type}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(15,23,42,0.5)', borderRadius: radius.md, padding: 4, width: 'fit-content', border: colors.border.card }}>
        {[['fras', 'Mark Attendance', Camera], ['monthly', 'Monthly View', CalendarDays], ['yearly', 'Yearly Summary', BarChart3]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '8px 18px', borderRadius: radius.sm, border: 'none', background: tab === key ? 'rgba(99,102,241,0.2)' : 'transparent', color: tab === key ? colors.text.primary : colors.text.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* FRAS Tab */}
      {tab === 'fras' && (
        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Face Recognition Attendance</h2>
          {!faceEnrolled ? (
            <div>
              <p style={{ color: colors.badge.warning.text, fontSize: 13, marginBottom: 12 }}>Enroll your face once to start marking attendance.</p>
              {cameraMode !== 'enroll' ? (
                <button onClick={() => openCamera('enroll')} style={styles.primaryBtn}>Open Camera to Enroll</button>
              ) : (
                <div>
                  <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: 360, borderRadius: radius.md, background: '#000' }} />
                  {cameraMessage && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{cameraMessage}</p>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button onClick={submitEnroll} disabled={cameraBusy} style={{ ...styles.primaryBtn, opacity: cameraBusy ? 0.6 : 1 }}>{cameraBusy ? 'Processing...' : 'Capture & Save'}</button>
                    <button onClick={stopCamera} style={styles.secondaryBtn}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ) : isCheckedIn && isCheckedOut ? (
            <p style={{ color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} color="#22c55e" /> Checked in and checked out for today.</p>
          ) : isCheckedIn && !isCheckedOut ? (
            cameraMode !== 'exit' ? (
              <button onClick={() => openCamera('exit')} style={styles.primaryBtn}>Mark My Exit</button>
            ) : (
              <div>
                <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: 360, borderRadius: radius.md, background: '#000' }} />
                <div style={{ marginTop: 10, padding: 10, background: 'rgba(2,6,23,0.5)', borderRadius: radius.sm, textAlign: 'center', border: colors.border.subtle }}>
                  {liveMatchFound ? <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} color="#22c55e" /> {liveDetectedName}</span> : <span style={{ color: '#fbbf24', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Search size={14} color="#fbbf24" /> Detecting face...</span>}
                  {liveMatchFound && !blinkDetected && <p style={{ color: '#fbbf24', fontSize: 11, margin: '4px 0 0' }}>Blink to confirm liveness</p>}
                </div>
                {cameraMessage && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{cameraMessage}</p>}
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  {liveMatchFound && blinkDetected && <button onClick={submitExit} disabled={cameraBusy} style={{ ...styles.primaryBtn, opacity: cameraBusy ? 0.6 : 1 }}>{cameraBusy ? 'Verifying...' : 'Mark Exit'}</button>}
                  <button onClick={stopCamera} style={styles.secondaryBtn}>Cancel</button>
                </div>
              </div>
            )
          ) : cameraMode !== 'mark' ? (
            <div>
              <label style={styles.label}>Where are you working from?</label>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                {['Office', 'WFH'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.text.primary, fontSize: 13, cursor: 'pointer' }}>
                    <input type="radio" name="attType" value={t} checked={attendanceType === t} onChange={e => setAttendanceType(e.target.value)} /> {t}
                  </label>
                ))}
              </div>
              <button onClick={() => {
                if (!attendanceType) return alert('Select Office or WFH first.')
                if (attendanceType === 'Office') {
                  setGeofenceChecking(true)
                  navigator.geolocation.getCurrentPosition(pos => {
                    setGeofenceChecking(false)
                    if (distMeters(pos.coords.latitude, pos.coords.longitude, OFFICE_LAT, OFFICE_LNG) > OFFICE_RADIUS) return alert('You must be within office premises.')
                    openCamera('mark')
                  }, () => { setGeofenceChecking(false); alert('Location access required.') })
                } else openCamera('mark')
              }} disabled={geofenceChecking} style={{ ...styles.primaryBtn, opacity: geofenceChecking ? 0.6 : 1 }}>
                {geofenceChecking ? 'Checking location...' : 'Mark My Attendance'}
              </button>
            </div>
          ) : (
            <div>
              <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: 360, borderRadius: radius.md, background: '#000' }} />
              <div style={{ marginTop: 10, padding: 10, background: 'rgba(2,6,23,0.5)', borderRadius: radius.sm, textAlign: 'center', border: colors.border.subtle }}>
                {liveMatchFound ? <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} color="#22c55e" /> {liveDetectedName}</span> : <span style={{ color: '#fbbf24', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><Search size={14} color="#fbbf24" /> Detecting face...</span>}
                {liveMatchFound && !blinkDetected && <p style={{ color: '#fbbf24', fontSize: 11, margin: '4px 0 0' }}>Blink to confirm</p>}
              </div>
              {cameraMessage && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{cameraMessage}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {liveMatchFound && blinkDetected && <button onClick={submitMark} disabled={cameraBusy} style={{ ...styles.primaryBtn, opacity: cameraBusy ? 0.6 : 1 }}>{cameraBusy ? 'Verifying...' : 'Mark Present'}</button>}
                <button onClick={stopCamera} style={styles.secondaryBtn}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly View */}
      {tab === 'monthly' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Calendar */}
          <AttendanceCalendar
            selectedDate={selectedDate}
            onSelect={handleCalendarSelect}
            attendanceMap={attMap}
            month={selectedMonth}
            year={selectedYear}
          />

          {/* Right side — selected date details */}
          <div style={{ flex: 1, minWidth: 320 }}>
            {/* Month Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                ['Present', displaySummary.present_days, '#22c55e', CheckCircle2],
                ['Absent', displaySummary.absent_days, '#ef4444', XCircle],
                ['Leave', displaySummary.paid_leave_days, '#a855f7', Plane],
                ['Half Day', displaySummary.half_day_days, '#f59e0b', Clock],
              ].map(([label, val, color, Icon]) => (
                <div key={label} style={{ padding: '14px', borderRadius: radius.md, background: `${color}10`, border: `1px solid ${color}25`, textAlign: 'center' }}>
                  <Icon size={16} color={color} style={{ margin: '0 auto' }} />
                  <p style={{ color, fontSize: 22, fontWeight: 700, margin: '4px 0 0' }}>{val ?? 0}</p>
                  <p style={{ color: colors.text.muted, fontSize: 11, margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Selected Date Detail Card */}
            <div style={{
              ...styles.sectionCard,
              borderLeft: selectedRecord
                ? `3px solid ${selectedRecord.status === 'Present' ? '#22c55e' : selectedRecord.status === 'Absent' ? '#ef4444' : selectedRecord.status === 'Paid Leave' ? '#a855f7' : '#f59e0b'}`
                : '3px solid #475569',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ color: colors.text.primary, fontSize: 16, margin: 0, fontWeight: 700 }}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                </h3>
                {selectedRecord ? (
                  <span style={statusBadge(selectedRecord.status)}>{selectedRecord.status}</span>
                ) : (
                  <span style={{ ...statusBadge(''), background: 'rgba(71,85,105,0.2)', color: '#94a3b8', border: '1px solid rgba(71,85,105,0.3)' }}>Not Marked</span>
                )}
              </div>

              {selectedRecord ? (
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {selectedRecord.check_in_time && (
                    <div>
                      <p style={{ color: colors.text.muted, fontSize: 11, margin: '0 0 2px', textTransform: 'uppercase' }}>Check In</p>
                      <p style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, margin: 0 }}>
                        {new Date(selectedRecord.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                  {selectedRecord.check_out_time && (
                    <div>
                      <p style={{ color: colors.text.muted, fontSize: 11, margin: '0 0 2px', textTransform: 'uppercase' }}>Check Out</p>
                      <p style={{ color: '#ef4444', fontSize: 16, fontWeight: 600, margin: 0 }}>
                        {new Date(selectedRecord.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                  {selectedRecord.attendance_type && (
                    <div>
                      <p style={{ color: colors.text.muted, fontSize: 11, margin: '0 0 2px', textTransform: 'uppercase' }}>Type</p>
                      <p style={{ color: colors.text.primary, fontSize: 16, fontWeight: 600, margin: 0 }}>{selectedRecord.attendance_type}</p>
                    </div>
                  )}
                  {selectedRecord.check_in_time && selectedRecord.check_out_time && (
                    <div>
                      <p style={{ color: colors.text.muted, fontSize: 11, margin: '0 0 2px', textTransform: 'uppercase' }}>Duration</p>
                      <p style={{ color: colors.text.primary, fontSize: 16, fontWeight: 600, margin: 0 }}>
                        {(() => {
                          const diff = new Date(selectedRecord.check_out_time) - new Date(selectedRecord.check_in_time)
                          const hrs = Math.floor(diff / 3600000)
                          const mins = Math.floor((diff % 3600000) / 60000)
                          return `${hrs}h ${mins}m`
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: colors.text.muted, fontSize: 13, margin: 0 }}>No attendance record for this date. {selectedDate === todayStr ? 'Mark your attendance now!' : ''}</p>
              )}
            </div>

            {/* Daily Records Table */}
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Daily Records — {getMonthName(selectedMonth)} {selectedYear}</h2>
              <div style={{ maxHeight: 350, overflowY: 'auto', borderRadius: radius.sm, scrollbarWidth: 'thin' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Day</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>In</th>
                      <th style={styles.th}>Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRecords.length === 0 && (
                      <tr><td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: colors.text.muted }}>No records for this month</td></tr>
                    )}
                    {allRecords.filter(r => {
                      const rd = new Date(r.attendance_date)
                      return rd.getMonth() + 1 === selectedMonth && rd.getFullYear() === selectedYear
                    }).sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date)).map((a, i) => (
                      <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedDate(new Date(a.attendance_date).toLocaleDateString('en-CA'))}>
                        <td style={styles.td}>{a.attendance_date}</td>
                        <td style={{ ...styles.td, color: colors.text.muted, fontSize: 12 }}>{new Date(a.attendance_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}</td>
                        <td style={styles.td}><span style={statusBadge(a.status)}>{a.status}</span></td>
                        <td style={styles.td}>{a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        <td style={styles.td}>{a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yearly View */}
      {tab === 'yearly' && (
        <div style={styles.sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ ...styles.sectionTitle, margin: 0 }}>Yearly Attendance — {selectedYear}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setSelectedYear(y => y - 1)}
                style={{ background: 'none', border: 'none', color: colors.text.primary, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ color: colors.text.primary, fontWeight: 700, fontSize: 16 }}>{selectedYear}</span>
              <button
                onClick={() => setSelectedYear(y => y + 1)}
                style={{ background: 'none', border: 'none', color: colors.text.primary, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Yearly summary cards */}
          {yearlyData.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                ['Total Present', yearlyData.reduce((s, r) => s + Number(r.present_days || 0), 0), '#22c55e'],
                ['Total Absent', yearlyData.reduce((s, r) => s + Number(r.absent_days || 0), 0), '#ef4444'],
                ['Total Leave', yearlyData.reduce((s, r) => s + Number(r.paid_leave_days || 0), 0), '#a855f7'],
                ['Avg Attendance', yearlyData.length > 0 ? Math.round(yearlyData.reduce((s, r) => s + Number(r.attendance_percentage || 0), 0) / yearlyData.length) : 0, '#3b82f6'],
              ].map(([label, val, c]) => (
                <div key={label} style={{ padding: '16px', borderRadius: radius.md, background: `${c}10`, border: `1px solid ${c}25`, textAlign: 'center' }}>
                  <p style={{ color: c, fontSize: 26, fontWeight: 700, margin: 0 }}>{label === 'Avg Attendance' ? `${val}%` : val}</p>
                  <p style={{ color: colors.text.muted, fontSize: 12, margin: '4px 0 0' }}>{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Monthly breakdown table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Month</th>
                  <th style={styles.th}>Present</th>
                  <th style={styles.th}>Absent</th>
                  <th style={styles.th}>Leave</th>
                  <th style={styles.th}>Half Day</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.length === 0 && (
                  <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: colors.text.muted }}>No data for this year</td></tr>
                )}
                {yearlyData.map((row, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => { setSelectedMonth(Number(row.month)); setTab('monthly') }}>
                    <td style={styles.td}>{getMonthName(row.month)}</td>
                    <td style={{ ...styles.td, color: '#22c55e', fontWeight: 600 }}>{row.present_days}</td>
                    <td style={{ ...styles.td, color: '#ef4444', fontWeight: 600 }}>{row.absent_days}</td>
                    <td style={{ ...styles.td, color: '#a855f7', fontWeight: 600 }}>{row.paid_leave_days}</td>
                    <td style={{ ...styles.td, color: '#f59e0b', fontWeight: 600 }}>{row.half_day_days}</td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{row.total_days}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'rgba(148,163,184,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${row.attendance_percentage || 0}%`, background: Number(row.attendance_percentage) >= 90 ? '#22c55e' : Number(row.attendance_percentage) >= 70 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.primary, minWidth: 45 }}>{row.attendance_percentage || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeAttendance
