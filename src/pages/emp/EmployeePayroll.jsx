import { useState, useEffect } from 'react'
import { apiFetch, API_BASE } from '../../api'
import useEmployeeData from './useEmployeeData'
import { styles, colors, radius, formatCurrency, getMonthName } from './theme'
import { Wallet, TrendingUp } from 'lucide-react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function EarnDeductRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
      <span style={{ color: colors.text.secondary, fontSize: 13 }}>{label}</span>
      <span style={{ color: color || colors.text.primary, fontSize: 13, fontWeight: 600 }}>{formatCurrency(value)}</span>
    </div>
  )
}

function EmployeePayroll() {
  const { loading: dataLoading, errorMsg, employee, increments } = useEmployeeData()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('current')

  useEffect(() => {
    if (!employee?.id) return
    setLoading(true)
    apiFetch(`${API_BASE}/api/employee-payroll/${employee.id}/monthly?month=${month}&year=${year}`)
      .then(r => r.json()).then(setPayroll).catch(() => setPayroll(null))
      .finally(() => setLoading(false))
  }, [employee?.id, month, year])

  if (dataLoading) return <div style={styles.centerScreen}><div style={{ color: colors.text.secondary }}>Loading...</div></div>
  if (errorMsg) return <div style={styles.centerScreen}><div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}><h2 style={{ color: colors.text.primary }}>Error</h2><p style={{ color: colors.text.secondary }}>{errorMsg}</p></div></div>

  return (
    <div style={styles.pageContainer}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>My Payroll</h1>
        <p style={styles.pageSubtitle}>View your monthly salary details and breakdown</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(15,23,42,0.5)', borderRadius: radius.md, padding: 4, width: 'fit-content', border: colors.border.card }}>
        {[['current', 'Monthly Payroll', Wallet], ['increments', 'Increment History', TrendingUp]].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '8px 18px', borderRadius: radius.sm, border: 'none', background: tab === k ? 'rgba(99,102,241,0.2)' : 'transparent', color: tab === k ? colors.text.primary : colors.text.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={14} /> {l}</button>
        ))}
      </div>

      {/* Month Selector */}
      {tab === 'current' && (
        <div style={styles.dateSelector}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ ...styles.select, width: 'auto', minWidth: 140 }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ ...styles.select, width: 'auto', minWidth: 100 }}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {payroll && (
            <span style={{ color: colors.text.muted, fontSize: 13 }}>{getMonthName(month)} {year} Payroll</span>
          )}
        </div>
      )}

      {/* Monthly Payroll */}
      {tab === 'current' && (
        loading ? (
          <div style={styles.sectionCard}><p style={{ color: colors.text.muted }}>Loading payroll data...</p></div>
        ) : payroll ? (
          <>
            {/* Top Summary */}
            <div style={styles.summaryGrid}>
              <div style={{ ...styles.miniCard, borderLeft: '3px solid #22c55e' }}>
                <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '0 0 4px' }}>Net Pay</p>
                <p style={{ color: '#22c55e', fontSize: 28, fontWeight: 700, margin: 0 }}>{formatCurrency(payroll.payable_salary)}</p>
              </div>
              <div style={{ ...styles.miniCard, borderLeft: '3px solid #06b6d4' }}>
                <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '0 0 4px' }}>Gross Salary</p>
                <p style={{ color: '#06b6d4', fontSize: 28, fontWeight: 700, margin: 0 }}>{formatCurrency(payroll.earnings?.gross_salary)}</p>
              </div>
              <div style={{ ...styles.miniCard, borderLeft: '3px solid #ef4444' }}>
                <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '0 0 4px' }}>Total Deductions</p>
                <p style={{ color: '#ef4444', fontSize: 28, fontWeight: 700, margin: 0 }}>{formatCurrency(payroll.deductions?.total_deduction)}</p>
              </div>
              <div style={{ ...styles.miniCard, borderLeft: '3px solid #a855f7' }}>
                <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', margin: '0 0 4px' }}>Monthly CTC</p>
                <p style={{ color: '#a855f7', fontSize: 28, fontWeight: 700, margin: 0 }}>{formatCurrency(payroll.ctc?.monthly)}</p>
              </div>
            </div>

            {/* Attendance for this month */}
            {payroll.attendance && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  ['Present', payroll.attendance.present_days, '#22c55e'],
                  ['Absent', payroll.attendance.absent_days, '#ef4444'],
                  ['Leave', payroll.attendance.paid_leave_days, '#a855f7'],
                  ['Working Days', payroll.attendance.total_days, colors.text.secondary],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ padding: '12px', borderRadius: radius.md, background: `${c}10`, border: `1px solid ${c}20`, textAlign: 'center' }}>
                    <p style={{ color: c, fontSize: 20, fontWeight: 700, margin: 0 }}>{v}</p>
                    <p style={{ color: colors.text.muted, fontSize: 11, margin: '2px 0 0' }}>{l}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.twoCol}>
              {/* Earnings */}
              <div style={styles.col()}>
                <div style={styles.sectionCard}>
                  <h2 style={styles.sectionTitle}>Earnings</h2>
                  <EarnDeductRow label="Basic + DA" value={payroll.earnings?.basic_da} />
                  <EarnDeductRow label="House Rent Allowance (HRA)" value={payroll.earnings?.hra} />
                  <EarnDeductRow label="Conveyance Allowance" value={payroll.earnings?.conveyance} />
                  <EarnDeductRow label="Medical Allowance" value={payroll.earnings?.medical} />
                  <EarnDeductRow label="Other Allowances" value={payroll.earnings?.other_allowance} />
                  <EarnDeductRow label="Bonus" value={payroll.earnings?.bonus} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 4, borderTop: '2px solid rgba(34,197,94,0.2)' }}>
                    <span style={{ color: colors.text.primary, fontWeight: 700, fontSize: 14 }}>Total Earnings</span>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 16 }}>{formatCurrency(payroll.earnings?.gross_salary)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div style={styles.col('1 1 420px')}>
                <div style={styles.sectionCard}>
                  <h2 style={styles.sectionTitle}>Deductions</h2>
                  <EarnDeductRow label="PF (Employee)" value={payroll.deductions?.pf} color="#ef4444" />
                  <EarnDeductRow label="ESIC" value={payroll.deductions?.esic} color="#ef4444" />
                  <EarnDeductRow label="Professional Tax" value={payroll.deductions?.professional_tax} color="#ef4444" />
                  <EarnDeductRow label="LWF" value={payroll.deductions?.lwf} color="#ef4444" />
                  <EarnDeductRow label="TDS" value={payroll.deductions?.tds} color="#ef4444" />
                  <EarnDeductRow label="Advance" value={payroll.deductions?.advance} color="#ef4444" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 4, borderTop: '2px solid rgba(239,68,68,0.2)' }}>
                    <span style={{ color: colors.text.primary, fontWeight: 700, fontSize: 14 }}>Total Deductions</span>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 16 }}>{formatCurrency(payroll.deductions?.total_deduction)}</span>
                  </div>
                </div>

                {/* Employer Contributions */}
                <div style={styles.sectionCard}>
                  <h2 style={styles.sectionTitle}>Employer Contributions</h2>
                  <EarnDeductRow label="PF (Employer)" value={payroll.employer_contributions?.employer_pf} color="#818cf8" />
                  <EarnDeductRow label="ESIC (Employer)" value={payroll.employer_contributions?.employer_esic} color="#818cf8" />
                  <EarnDeductRow label="LWF (Employer)" value={payroll.employer_contributions?.employer_lwf} color="#818cf8" />
                  <EarnDeductRow label="Gratuity" value={payroll.employer_contributions?.gratuity} color="#818cf8" />
                </div>

                {/* Net Pay */}
                <div style={{ ...styles.sectionCard, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: colors.text.secondary, fontSize: 12, textTransform: 'uppercase', margin: '0 0 2px' }}>Net Payable Salary</p>
                      <p style={{ color: '#22c55e', fontSize: 30, fontWeight: 700, margin: 0 }}>{formatCurrency(payroll.payable_salary)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: colors.text.muted, fontSize: 12, margin: 0 }}>Annual CTC</p>
                      <p style={{ color: colors.text.secondary, fontSize: 16, fontWeight: 600, margin: 0 }}>{formatCurrency(payroll.ctc?.annual)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={styles.sectionCard}><p style={{ color: colors.text.muted, textAlign: 'center', padding: 20 }}>No payroll data available for {getMonthName(month)} {year}</p></div>
        )
      )}

      {/* Increments */}
      {tab === 'increments' && (
        <div style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Increment History</h2>
          {increments.length === 0 ? (
            <p style={{ color: colors.text.muted, textAlign: 'center', padding: 20 }}>No increments recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Previous Salary</th>
                    <th style={styles.th}>Increment</th>
                    <th style={styles.th}>New Salary</th>
                    <th style={styles.th}>Applicable From</th>
                    <th style={styles.th}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {increments.map(inc => (
                    <tr key={inc.id}>
                      <td style={styles.td}>{inc.effective_date ? new Date(inc.effective_date).toLocaleDateString('en-IN') : '-'}</td>
                      <td style={styles.td}>{formatCurrency(inc.previous_salary)}</td>
                      <td style={{ ...styles.td, color: '#22c55e', fontWeight: 600 }}>+{formatCurrency(inc.increment_amount)} ({Number(inc.increment_percent || 0)}%)</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{formatCurrency(inc.new_salary)}</td>
                      <td style={styles.td}>{inc.applicable_from_month || '-'}</td>
                      <td style={styles.td}>{inc.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EmployeePayroll
