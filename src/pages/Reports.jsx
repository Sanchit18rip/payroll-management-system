import { apiFetch, API_BASE } from "../api";
import { useState, useEffect } from 'react'


function Reports() {
  const [employees, setEmployees] = useState([])
  const [payroll, setPayroll] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])

  const loadReportData = async () => {

  try {

    const [
      employeeRes,
      attendanceRes,
      payrollRes,
      leaveRes
    ] = await Promise.all([

      apiFetch(
        `${API_BASE}/api/employees`
      ),

      apiFetch(
        `${API_BASE}/api/attendance`
      ),

      apiFetch(
        `${API_BASE}/api/payroll`
      ),

      apiFetch(
        `${API_BASE}/api/leaves`
      )

    ])

    const employeeData =
      await employeeRes.json()

    const attendanceData =
      await attendanceRes.json()

    const payrollData =
      await payrollRes.json()

    const leaveData =
      await leaveRes.json()

    setEmployees(employeeData)

    setAttendance(attendanceData)

    setPayroll(payrollData)

    setLeaves(leaveData)

  }

  catch (err) {

    console.log(
      'Error fetching report data:',
      err
    )

  }

}

  useEffect(() => {

  loadReportData()

}, [])

 const totalEmployees =
  employees.length
  const totalPayroll =
  payroll.reduce(

    (total, employee) =>

      total +
      Number(
        employee.salary
      ),

    0

  )
  const presentEmployees =

  attendance.filter(

    employee =>

      employee.status ===
      'Present'

  ).length
  const approvedLeaves =

  leaves.filter(

    leave =>

      leave.status ===
      'Approved'

  ).length

  const averageSalary = totalEmployees > 0 ? (totalPayroll / totalEmployees).toFixed(0) : 0
  const attendanceRate = totalEmployees > 0 ? ((presentEmployees / totalEmployees) * 100).toFixed(1) : 0

  return (
    <div
  style={{
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    minHeight: '100vh',
    background: 'var(--bg-page, #0f172a)'
  }}
  className="hr-page-light"
>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: "#f8fafc", margin: '0 0 4px 0' }}>
          Reports & Analytics
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Detailed analytical insights of the corporate workforce.
        </p>
        <button
  onClick={loadReportData}
style={{
  marginTop: '15px',
  padding: '12px 20px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow:
    '0 4px 20px rgba(37,99,235,0.3)'
}}
>

  Refresh Reports

</button>
      </div>

      <div style={cardContainer}>
        <div style={{ ...cardStyle, borderTop: '4px solid #3b82f6' }}>
          <h3 style={cardTitle}>Total Employees</h3>
          <h1 style={cardValue}>{totalEmployees}</h1>
        </div>

        <div style={{ ...cardStyle, borderTop: '4px solid #10b981' }}>
          <h3 style={cardTitle}>Total Payroll</h3>
          <h1 style={{ ...cardValue, color: '#10b981' }}>₹{totalPayroll.toLocaleString()}</h1>
        </div>

        <div style={{ ...cardStyle, borderTop: '4px solid #6366f1' }}>
          <h3 style={cardTitle}>Present Employees</h3>
          <h1 style={{ ...cardValue, color: '#6366f1' }}>{presentEmployees}</h1>
        </div>

        <div style={{ ...cardStyle, borderTop: '4px solid #f59e0b' }}>
          <h3 style={cardTitle}>Approved Leaves</h3>
          <h1 style={{ ...cardValue, color: '#f59e0b' }}>{approvedLeaves}</h1>
        </div>
      </div>

      <div style={reportSection}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: "#f8fafc", marginBottom: '20px' }}>
          Company Summary Report
        </h2>

        <div style={tableContainer}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                <th style={thStyle}>Metric Description</th>
                <th style={thStyleRight}>Value / Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={rowStyle}>
                <td style={tdStyle}>Active Workforce Size</td>
                <td style={tdStyleRight}>{totalEmployees} Employees</td>
              </tr>
              <tr style={rowStyle}>
                <td style={tdStyle}>Gross Monthly Expenditure</td>
                <td style={tdStyleRight}>₹{totalPayroll.toLocaleString()}</td>
              </tr>
              <tr style={rowStyle}>
                <td style={tdStyle}>Average Employee Compensation</td>
                <td style={tdStyleRight}>₹{Number(averageSalary).toLocaleString()} / month</td>
              </tr>
              <tr style={rowStyle}>
                <td style={tdStyle}>Daily Attendance Efficiency Rate</td>
                <td style={tdStyleRight}>{attendanceRate}%</td>
              </tr>
              <tr style={{ ...rowStyle, borderBottom: 'none' }}>
                <td style={tdStyle}>Total Monthly Leave Encashments</td>
                <td style={tdStyleRight}>{approvedLeaves} Approved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const cardContainer = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '20px',
  marginBottom: '40px'
}

const cardStyle = {
  background: 'var(--bg-card-solid, #1e293b)',
  padding: '28px',
  borderRadius: '20px',
  border: 'var(--border-card, 1px solid #334155)',
  boxShadow:
    'var(--shadow-card, 0 8px 32px rgba(0,0,0,0.35))',
  transition: 'all 0.3s ease'
}
const cardTitle = {
  color: 'var(--text-secondary, #94a3b8)',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 12px 0'
}

const cardValue = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#2563eb',
  margin: 0
}

const reportSection = {
  background: 'var(--bg-card-solid, #1e293b)',
  padding: '30px',
  borderRadius: '20px',
  boxShadow:
    'var(--shadow-card, 0 8px 32px rgba(0,0,0,0.35))',
  border: 'var(--border-card, 1px solid #334155)'
}

const tableContainer = {
  width: '100%',
  overflowX: 'auto'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
}

const theadRow = {
  borderBottom: '1px solid var(--border-default, #334155)',
  background: 'var(--bg-input, #0f172a)'
}

const thStyle = {
  padding: '16px',
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--text-secondary, #cbd5e1)'
}

const thStyleRight = {
  padding: '16px',
  fontSize: '14px',
  fontWeight: '600',
  color: 'var(--text-secondary, #cbd5e1)',
  textAlign: 'right'
}

const rowStyle = {
  borderBottom: '1px solid var(--border-default, #334155)'
}
const tdStyle = {
  padding: '16px',
  fontSize: '14px',
  color: 'var(--text-primary, #f8fafc)'
}
  

const tdStyleRight = {
  padding: '16px',
  fontSize: '14px',
  color: "var(--text-primary, #f8fafc)",
  fontWeight: '600',
  textAlign: 'right'
}
const exportButton = {
  padding: '10px 16px',
  background: '#0f172a',
  color: '#f8fafc',
  border: '1px solid #334155',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600'
}
export default Reports