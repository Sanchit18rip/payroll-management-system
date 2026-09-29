import { useState, useEffect, useCallback } from 'react'
import { apiFetch, API_BASE } from '../../api'
import { supabase } from '../../supabaseClient'

/**
 * Shared hook for employee data.
 * fetches employee profile + dashboard data once,
 * then provides helper functions for specific API calls.
 *
 * A short in-memory cache (45s) lets page navigation reuse data that was
 * already fetched moments ago, so sidebar clicks open instantly instead of
 * showing a spinner for 20-30s. Data is refreshed in the background and the
 * auto-refresh interval keeps everything current.
 */

const CACHE_TTL_MS = 45 * 1000
const cache = new Map() // employeeId -> { ts, data }

function getCached(id) {
  const entry = cache.get(id)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(id)
    return null
  }
  return entry.data
}

function setCached(id, data) {
  cache.set(id, { ts: Date.now(), data })
}

export default function useEmployeeData() {
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [employee, setEmployee] = useState(null)
  const [payableSalary, setPayableSalary] = useState(0)
  const [attendance, setAttendance] = useState([])
  const [attendanceSummary, setAttendanceSummary] = useState({
    present_days: 0, absent_days: 0, paid_leave_days: 0, total_days: 0,
  })
  const [leaveBalance, setLeaveBalance] = useState({ available_leaves: 0, total_leaves_earned: 0 })
  const [leaves, setLeaves] = useState([])
  const [performance, setPerformance] = useState([])
  const [increments, setIncrements] = useState([])
  const [workLogSummary, setWorkLogSummary] = useState([])

  const loadDashboard = useCallback(async (employeeId) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/employee-dashboard/${employeeId}`)
      if (!res.ok) throw new Error('Could not load dashboard')
      const data = await res.json()
      setEmployee(data.employee)
      setPayableSalary(data.payableSalary ?? 0)
      setAttendance(data.attendance)
      setAttendanceSummary(data.attendanceSummary)
      setLeaveBalance(data.leaveBalance || { available_leaves: 0, total_leaves_earned: 0 })
      setLeaves(data.leaves)
      setPerformance(data.performance)
      setIncrements(data.increments || [])
      setCached(employeeId, data)
    } catch (err) {
      console.error('Dashboard load error:', err)
      throw err
    }
  }, [])

  // Fetch worklog summary
  const loadWorkLogSummary = useCallback(async (employeeId) => {
    try {
      const res = await apiFetch(`${API_BASE}/api/employee-worklogs/${employeeId}/summary`)
      if (res.ok) {
        const data = await res.json()
        setWorkLogSummary(data)
      }
    } catch (err) { console.error(err) }
  }, [])

  const applyDashboard = useCallback((data) => {
    setEmployee(data.employee)
    setPayableSalary(data.payableSalary ?? 0)
    setAttendance(data.attendance)
    setAttendanceSummary(data.attendanceSummary)
    setLeaveBalance(data.leaveBalance || { available_leaves: 0, total_leaves_earned: 0 })
    setLeaves(data.leaves)
    setPerformance(data.performance)
    setIncrements(data.increments || [])
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setErrorMsg('You need to be logged in to view this page.')
        setLoading(false)
        return
      }
      try {
        const empRes = await apiFetch(`${API_BASE}/api/employees/by-email/${encodeURIComponent(user.email)}`)
        if (!empRes.ok) {
          setErrorMsg(`No employee profile linked to ${user.email}. Please ask HR to add this email.`)
          setLoading(false)
          return
        }
        const empData = await empRes.json()
        const cached = getCached(empData.id)

        if (cached) {
          // Paint instantly from cache, then refresh in the background.
          applyDashboard(cached)
          setLoading(false)
          Promise.all([loadDashboard(empData.id), loadWorkLogSummary(empData.id)])
            .catch(() => {})
          return
        }

        // Parallel dashboard + worklog load (was sequential before).
        await Promise.all([loadDashboard(empData.id), loadWorkLogSummary(empData.id)])
      } catch (err) {
        console.error(err)
        setErrorMsg('Something went wrong while loading your data.')
      }
      setLoading(false)
    }
    init()
  }, [applyDashboard, loadDashboard, loadWorkLogSummary])

  // Auto-refresh
  useEffect(() => {
    if (!employee?.id) return
    const interval = setInterval(() => loadDashboard(employee.id).catch(() => {}), 10000)
    return () => clearInterval(interval)
  }, [employee?.id, loadDashboard])

  return {
    loading, errorMsg, employee,
    payableSalary, attendance, attendanceSummary,
    leaveBalance, leaves, performance, increments,
    workLogSummary,
    loadDashboard, loadWorkLogSummary,
  }
}
