import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch, API_BASE } from '../../api'
import { supabase } from '../../supabaseClient'

/**
 * Shared hook for employee data.
 * fetches employee profile + dashboard data once,
 * then provides helper functions for specific API calls.
 */
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
    } catch (err) {
      console.error('Dashboard load error:', err)
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
    } catch (err) { console.log(err) }
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true)
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
        await loadDashboard(empData.id)
        await loadWorkLogSummary(empData.id)
      } catch (err) {
        console.log(err)
        setErrorMsg('Something went wrong while loading your data.')
      }
      setLoading(false)
    }
    init()
  }, [loadDashboard, loadWorkLogSummary])

  // Auto-refresh
  useEffect(() => {
    if (!employee?.id) return
    const interval = setInterval(() => loadDashboard(employee.id), 10000)
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
