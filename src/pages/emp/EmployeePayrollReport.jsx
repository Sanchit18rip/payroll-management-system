import { useState, useEffect } from 'react'
import { apiFetch, API_BASE } from '../../api'
import useEmployeeData from './useEmployeeData'
import { styles, colors, radius, formatCurrency, getMonthName } from './theme'
import { generatePayslipPDF } from '../../utils/payslipPdf'
import { FileText, BarChart3, Download } from 'lucide-react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function EmployeePayrollReport() {
  const { loading: dataLoading, errorMsg, employee } = useEmployeeData()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('payslip')

  useEffect(() => {
    if (!employee?.id) return
    setLoading(true)
    apiFetch(`${API_BASE}/api/employee-payroll/${employee.id}/monthly?month=${month}&year=${year}`)
      .then(r => r.json()).then(setPayroll).catch(() => setPayroll(null))
      .finally(() => setLoading(false))
  }, [employee?.id, month, year])

  // Build the salary object in the same shape the HR payslip PDF expects
  const buildSalaryForPdf = () => {
    if (!payroll) return null
    return {
      fixedGrossSalary: Number(payroll.earnings?.gross_salary) || 0,
      basicDA: Number(payroll.earnings?.basic_da) || 0,
      earnBasic: Number(payroll.earnings?.basic_da) || 0,
      earnHRA: Number(payroll.earnings?.hra) || 0,
      earnConv: Number(payroll.earnings?.conveyance) || 0,
      earnMed: Number(payroll.earnings?.medical) || 0,
      earnOther: Number(payroll.earnings?.other_allowance) || 0,
      earnGross: Number(payroll.earnings?.gross_salary) || 0,
      hraFull: Number(payroll.earnings?.hra) || 0,
      convFull: Number(payroll.earnings?.conveyance) || 0,
      medFull: Number(payroll.earnings?.medical) || 0,
      otherFull: Number(payroll.earnings?.other_allowance) || 0,
      pf: Number(payroll.deductions?.pf) || 0,
      esic: Number(payroll.deductions?.esic) || 0,
      pt: Number(payroll.deductions?.professional_tax) || 0,
      lwf: Number(payroll.deductions?.lwf) || 0,
      tds: Number(payroll.deductions?.tds) || 0,
      totalDed: Number(payroll.deductions?.total_deduction) || 0,
      netPayable: Number(payroll.payable_salary) || 0,
      gratuity: Number(payroll.employer_contributions?.gratuity) || 0,
    }
  }

  // Same payslip PDF as HR side (Talent Corner format + stamp/signature)
  const downloadPDF = async () => {
    try {
      const salary = buildSalaryForPdf()
      if (!salary || !employee) { alert('Payslip data is not available.'); return }
      const monthName = getMonthName(month)
      const period = `${monthName} ${year}`
      await generatePayslipPDF(employee, salary, period, monthName, year)
    } catch (err) {
      console.error('Payslip download error:', err)
      alert('Failed to generate payslip.')
    }
  }

  if (dataLoading) return <div style={styles.centerScreen}><div style={{ color: colors.text.secondary }}>Loading...</div></div>
  if (errorMsg) return <div style={styles.centerScreen}><div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}><h2 style={{ color: colors.text.primary }}>Error</h2><p style={{ color: colors.text.secondary }}>{errorMsg}</p></div></div>

  return (
    <div style={styles.pageContainer}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>Payslips</h1>
        <p style={styles.pageSubtitle}>View and download your monthly payslips</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f1f5f9', borderRadius: radius.md, padding: 4, width: 'fit-content', border: colors.border.card }}>
        {[['payslip', 'View Payslip', FileText], ['yearly', 'Yearly Summary', BarChart3]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '8px 18px', borderRadius: radius.sm, border: 'none', background: tab === k ? 'rgba(99,102,241,0.2)' : 'transparent', color: tab === k ? colors.text.primary : colors.text.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={14} /> {l}</button>
        ))}
      </div>

      {/* Date Selector */}
      <div style={styles.dateSelector}>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ ...styles.select, width: 'auto', minWidth: 140 }}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ ...styles.select, width: 'auto', minWidth: 100 }}>
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {tab === 'payslip' && payroll && (
          <button onClick={downloadPDF} style={{ ...styles.primaryBtn, display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> Download Payslip</button>
        )}
      </div>

      {/* Payslip View */}
      {tab === 'payslip' && (
        loading ? (
          <div style={styles.sectionCard}><p style={{ color: colors.text.muted }}>Loading payslip...</p></div>
        ) : payroll ? (
          <div style={{ background: '#ffffff', borderRadius: radius.xl, padding: 40, maxWidth: 700, margin: '0 auto', color: '#1a1a1a', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #6366f1', paddingBottom: 20, marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Talent Corner HR Services Pvt Ltd.</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Payslip for {getMonthName(month)} {year}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Employee: <strong style={{ color: '#1e293b' }}>{employee.name}</strong></p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>ID: {employee.employee_code || '-'}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Dept: {employee.department || '-'}</p>
              </div>
            </div>

            {/* Employee Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: radius.md }}>
              {[
                ['Name', employee.name],
                ['Designation', employee.designation || '-'],
                ['Department', employee.department || '-'],
                ['Joining Date', employee.joining_date || '-'],
              ].map(([l, v]) => (
                <div key={l}>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{l}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Attendance Summary */}
            {payroll.attendance && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                {[
                  ['Present', payroll.attendance.present_days],
                  ['Absent', payroll.attendance.absent_days],
                  ['Leave', payroll.attendance.paid_leave_days],
                  ['Working Days', payroll.attendance.total_days],
                ].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center', padding: 10, background: '#f1f5f9', borderRadius: radius.sm }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{v}</p>
                    <p style={{ margin: 0, fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>{l}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Two columns: Earnings + Deductions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earnings</h3>
                {[
                  ['Basic + DA', payroll.earnings?.basic_da],
                  ['HRA', payroll.earnings?.hra],
                  ['Conveyance', payroll.earnings?.conveyance],
                  ['Medical', payroll.earnings?.medical],
                  ['Other Allowances', payroll.earnings?.other_allowance],
                  ['Bonus', payroll.earnings?.bonus],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#475569' }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{formatCurrency(v)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4, borderTop: '2px solid #16a34a', fontWeight: 700 }}>
                  <span style={{ fontSize: 13, color: '#1e293b' }}>Total Earnings</span>
                  <span style={{ fontSize: 14, color: '#16a34a' }}>{formatCurrency(payroll.earnings?.gross_salary)}</span>
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deductions</h3>
                {[
                  ['PF (Employee)', payroll.deductions?.pf],
                  ['ESIC', payroll.deductions?.esic],
                  ['Professional Tax', payroll.deductions?.professional_tax],
                  ['LWF', payroll.deductions?.lwf],
                  ['TDS', payroll.deductions?.tds],
                  ['Advance', payroll.deductions?.advance],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 12, color: '#475569' }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{formatCurrency(v)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4, borderTop: '2px solid #dc2626', fontWeight: 700 }}>
                  <span style={{ fontSize: 13, color: '#1e293b' }}>Total Deductions</span>
                  <span style={{ fontSize: 14, color: '#dc2626' }}>{formatCurrency(payroll.deductions?.total_deduction)}</span>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: radius.md, color: '#fff' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Net Payable</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{formatCurrency(payroll.payable_salary)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Monthly CTC</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{formatCurrency(payroll.ctc?.monthly)}</p>
              </div>
            </div>

            {/* Footer */}
            <p style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8', marginTop: 24 }}>This is a computer-generated payslip. No signature required.</p>
          </div>
        ) : (
          <div style={styles.sectionCard}><p style={{ color: colors.text.muted, textAlign: 'center', padding: 20 }}>No payslip data for {getMonthName(month)} {year}</p></div>
        )
      )}

      {/* Yearly Summary */}
      {tab === 'yearly' && (
        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Yearly Summary — {year}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Month</th>
                  <th style={styles.th}>Gross Salary</th>
                  <th style={styles.th}>Deductions</th>
                  <th style={styles.th}>Net Pay</th>
                  <th style={styles.th}>Present</th>
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((m, i) => {
                  const isCurrentMonth = (i + 1) === month && year === year
                  return (
                    <tr key={i} style={{ background: isCurrentMonth ? 'rgba(99,102,241,0.08)' : i % 2 === 0 ? 'rgba(148,163,184,0.03)' : 'transparent' }}>
                      <td style={{ ...styles.td, fontWeight: isCurrentMonth ? 600 : 400 }}>{m} {year}{isCurrentMonth ? ' ←' : ''}</td>
                      <td style={styles.td}>{isCurrentMonth && payroll ? formatCurrency(payroll.earnings?.gross_salary) : '—'}</td>
                      <td style={{ ...styles.td, color: isCurrentMonth && payroll ? '#ef4444' : colors.text.muted }}>{isCurrentMonth && payroll ? formatCurrency(payroll.deductions?.total_deduction) : '—'}</td>
                      <td style={{ ...styles.td, color: isCurrentMonth && payroll ? '#22c55e' : colors.text.muted, fontWeight: isCurrentMonth ? 600 : 400 }}>{isCurrentMonth && payroll ? formatCurrency(payroll.payable_salary) : '—'}</td>
                      <td style={styles.td}>{isCurrentMonth && payroll?.attendance ? payroll.attendance.present_days : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={{ color: colors.text.muted, fontSize: 12, marginTop: 16, textAlign: 'center' }}>Note: All months show current payroll structure. Historical data will populate as months are processed by HR.</p>
        </div>
      )}
    </div>
  )
}

export default EmployeePayrollReport
