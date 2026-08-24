import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { apiFetch, API_BASE } from '../../api'
import useEmployeeData from './useEmployeeData'
import NotificationBell from '../../components/NotificationBell'
import ChatbotWidget from '../../components/ChatbotWidget'
import { styles, colors, radius, formatCurrency, statusBadge } from './theme'
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Plane,
  BarChart3,
  ClipboardList,
  UserCircle,
  FileText,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CalendarX,
  Star,
  Mail,
} from 'lucide-react'

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return { text: 'Good Morning', emoji: '🌅' }
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', emoji: '☀️' }
  if (h >= 17 && h < 21) return { text: 'Good Evening', emoji: '🌆' }
  return { text: 'Good Night', emoji: '🌙' }
}

function getTimeHeroAccent() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(139,92,246,0.1), rgba(15,23,42,0.6))'
  if (h >= 12 && h < 17) return 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(139,92,246,0.1), rgba(15,23,42,0.6))'
  if (h >= 17 && h < 21) return 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(236,72,153,0.1), rgba(15,23,42,0.6))'
  return 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(56,189,248,0.08), rgba(15,23,42,0.6))'
}

function StatCard({ icon, label, value, sub, color, animDelay }) {
  return (
    <div style={{ ...styles.miniCard, animation: `fadeInUp 0.4s ease ${animDelay} both` }}>
      <div style={{ width: 40, height: 40, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12, background: `${color}18`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <p style={{ color: colors.text.secondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px', fontWeight: 500 }}>{label}</p>
      <p style={{ color, fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ color: colors.text.muted, fontSize: 12, margin: '4px 0 0' }}>{sub}</p>}
    </div>
  )
}

function QuickAction({ icon: Icon, label, path, color = colors.text.primary }) {
  return (
    <a href={`#${path}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 12px', background: 'rgba(15,23,42,0.4)', border: colors.border.card, borderRadius: radius.lg, textDecoration: 'none', transition: 'all 0.15s ease', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.4)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.12)' }}
    >
      {Icon && <Icon size={20} style={{ color }} />}
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
    </a>
  )
}

function EmployeeHome() {
  const greet = getTimeGreeting()
  const { loading, errorMsg, employee, payableSalary, attendanceSummary, leaveBalance, performance, leaves, attendance, workLogSummary, increments, loadDashboard } = useEmployeeData()
  const [showTerms, setShowTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [termsChecked, setTermsChecked] = useState(false)
  const [acceptingTerms, setAcceptingTerms] = useState(false)

  useEffect(() => { if (employee) setTermsAccepted(!!employee.terms_accepted_at) }, [employee])

  const acceptTerms = () => {
    if (!termsChecked) return
    setAcceptingTerms(true)
    apiFetch(`${API_BASE}/api/employees/${employee.id}/accept-terms`, { method: 'PUT' })
      .then(r => r.json()).then(() => setTermsAccepted(true))
      .catch(() => alert('Something went wrong.'))
      .finally(() => setAcceptingTerms(false))
  }

  if (loading) return (
    <div style={styles.centerScreen}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', animation: 'welcomePulse 1.6s ease-in-out infinite' }}><Briefcase size={30} color={colors.accent.indigo} /></div>
        <h1 style={{ fontSize: 22, margin: '0 0 8px', color: colors.text.primary }}>{greet.text}</h1>
        <p style={{ color: colors.text.secondary, fontSize: 14, margin: '0 0 20px' }}>Loading your workspace...</p>
        <div style={{ width: 36, height: 36, margin: '0 auto', borderRadius: '50%', border: '2px solid rgba(148,163,184,0.15)', borderTopColor: colors.accent.indigo, borderRightColor: colors.accent.violet, animation: 'welcomeSpin 0.8s linear infinite' }} />
      </div>
    </div>
  )

  if (errorMsg) return (
    <div style={styles.centerScreen}>
      <div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}>
        <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: 12 }} />
        <h2 style={{ color: colors.text.primary, fontSize: 18, marginBottom: 8 }}>Unable to load dashboard</h2>
        <p style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 1.6 }}>{errorMsg}</p>
      </div>
    </div>
  )

  const attPct = attendanceSummary.total_days > 0
    ? (((Number(attendanceSummary.present_days) + Number(attendanceSummary.paid_leave_days)) / Number(attendanceSummary.total_days)) * 100).toFixed(1)
    : 0

  const avgRating = performance.length > 0
    ? (performance.reduce((s, p) => s + Number(p.rating), 0) / performance.length).toFixed(1)
    : 0

  const pieData = [
    { name: 'Present', value: Number(attendanceSummary.present_days) },
    { name: 'Absent', value: Number(attendanceSummary.absent_days) },
    { name: 'Paid Leave', value: Number(attendanceSummary.paid_leave_days) },
  ]
  const PIE_COLORS = ['#22c55e', '#ef4444', '#a855f7']

  // Today's worklog
  const todayStr = new Date().toLocaleDateString('en-CA')
  const todayWL = workLogSummary.find(w => w.attendance_date === todayStr)
  const todayRecord = attendance.find(r => new Date(r.attendance_date).toLocaleDateString('en-CA') === todayStr)
  const isCheckedIn = todayRecord && todayRecord.status === 'Present'
  const isCheckedOut = todayRecord && !!todayRecord.check_out_time

  // Latest leave
  const latestLeave = leaves.length > 0 ? leaves[0] : null

  return (
    <div style={styles.pageContainer}>
      {/* Terms Modal */}
      {(!termsAccepted || showTerms) && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ color: colors.text.primary, marginTop: 0, fontSize: 18 }}>Terms &amp; Conditions</h2>
            <div style={{ background: 'rgba(2,6,23,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: radius.md, padding: '14px 16px', maxHeight: 200, overflowY: 'auto', color: colors.text.secondary, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              <p><strong>Talent Pay Corner - Terms & Conditions</strong></p>
              <p>Welcome to Talent Pay Corner. By using this platform you agree to provide accurate information, maintain login confidentiality, and use the platform only for authorized purposes.</p>
              <p>All payroll and employee information is confidential. Governing law: India, jurisdiction: Mumbai, Maharashtra.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)} style={{ width: 18, height: 18 }} />
              <span style={{ color: colors.text.secondary, fontSize: 13 }}>I accept the Terms & Conditions</span>
            </label>
            <button onClick={() => { if (!termsAccepted) acceptTerms(); else setShowTerms(false); }} disabled={!termsChecked || acceptingTerms} style={{ ...styles.primaryBtn, width: '100%', opacity: (!termsChecked || acceptingTerms) ? 0.5 : 1 }}>
              {!termsAccepted ? (acceptingTerms ? 'Please wait...' : 'I Agree') : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: '24px 28px', borderRadius: radius.xl, background: getTimeHeroAccent(), backdropFilter: 'blur(16px)', border: colors.border.card, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', position: 'relative', zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: 30, margin: '0 0 4px', fontWeight: 700, background: 'linear-gradient(120deg, #38bdf8, #818cf8, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {greet.text}, {employee.name}
          </h1>
          <p style={{ color: colors.text.secondary, fontSize: 14, margin: '0 0 8px' }}>{employee.department || 'Department'} • {employee.email}</p>
          <button
            onClick={() => setShowTerms(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#818cf8', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)' }}
          >
            <FileText size={13} /> Terms & Conditions
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NotificationBell employeeId={employee.id} />
          <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: employee.employee_type === 'Third-Party' ? colors.badge.warning.bg : colors.badge.success.bg, color: employee.employee_type === 'Third-Party' ? colors.badge.warning.text : colors.badge.success.text, border: `1px solid ${employee.employee_type === 'Third-Party' ? colors.badge.warning.border : colors.badge.success.border}` }}>
            {employee.employee_type || 'Direct'} Employee
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 24 }}>
        <QuickAction icon={Wallet} label="Payroll" path="emp-payroll" color="#22c55e" />
        <QuickAction icon={CalendarDays} label="Attendance" path="emp-attendance" color="#06b6d4" />
        <QuickAction icon={Plane} label="Leave" path="emp-leave" color="#a855f7" />
        <QuickAction icon={ClipboardList} label="Work Logs" path="emp-work-logs" color="#f59e0b" />
        <QuickAction icon={BarChart3} label="Performance" path="emp-performance" color="#ef4444" />
        <QuickAction icon={FileText} label="Payslips" path="emp-payroll-report" color="#38bdf8" />
      </div>

      {/* Today's Activity */}
      <div style={styles.sectionCard}>
        <h2 style={styles.sectionTitle}>Today's Activity</h2>
        <div style={styles.summaryGrid}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: isCheckedIn ? (isCheckedOut ? 'rgba(34,197,94,0.08)' : 'rgba(56,189,248,0.08)') : 'rgba(148,163,184,0.06)', borderRadius: radius.md, border: `1px solid ${isCheckedIn ? (isCheckedOut ? 'rgba(34,197,94,0.2)' : 'rgba(56,189,248,0.2)') : 'rgba(148,163,184,0.1)'}` }}>
            {isCheckedIn ? (isCheckedOut ? <CheckCircle2 size={20} color="#22c55e" /> : <Clock size={20} color="#06b6d4" />) : <CalendarX size={20} color="#94a3b8" />}
            <div>
              <p style={{ color: colors.text.secondary, fontSize: 11, textTransform: 'uppercase', margin: 0 }}>Attendance</p>
              <p style={{ color: colors.text.primary, fontSize: 14, fontWeight: 600, margin: '2px 0 0' }}>{isCheckedIn ? (isCheckedOut ? 'Completed' : 'Checked In') : 'Not Marked'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: todayWL ? (Number(todayWL.completed) > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)') : 'rgba(148,163,184,0.06)', borderRadius: radius.md, border: `1px solid ${todayWL ? (Number(todayWL.completed) > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)') : 'rgba(148,163,184,0.1)'}` }}>
            <ClipboardList size={20} color={todayWL ? (Number(todayWL.completed) > 0 ? '#22c55e' : '#f59e0b') : '#94a3b8'} />
            <div>
              <p style={{ color: colors.text.secondary, fontSize: 11, textTransform: 'uppercase', margin: 0 }}>Work Logs</p>
              <p style={{ color: colors.text.primary, fontSize: 14, fontWeight: 600, margin: '2px 0 0' }}>{todayWL ? `${todayWL.completed}/${todayWL.total_slots} completed` : 'No slots yet'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(168,85,247,0.08)', borderRadius: radius.md, border: '1px solid rgba(168,85,247,0.2)' }}>
            <Plane size={20} color="#a855f7" />
            <div>
              <p style={{ color: colors.text.secondary, fontSize: 11, textTransform: 'uppercase', margin: 0 }}>Leave Balance</p>
              <p style={{ color: colors.text.primary, fontSize: 14, fontWeight: 600, margin: '2px 0 0' }}>{Number(leaveBalance.available_leaves).toFixed(1)} days available</p>
            </div>
          </div>
          {latestLeave && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(15,23,42,0.4)', borderRadius: radius.md, border: colors.border.card }}>
              <Mail size={20} color="#06b6d4" />
              <div>
                <p style={{ color: colors.text.secondary, fontSize: 11, textTransform: 'uppercase', margin: 0 }}>Latest Leave</p>
                <p style={{ color: colors.text.primary, fontSize: 14, fontWeight: 600, margin: '2px 0 0' }}>{latestLeave.leave_type} <span style={statusBadge(latestLeave.status)}>{latestLeave.status}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.summaryGrid}>
        <StatCard icon={<Wallet size={18} color="#22c55e" />} label="Net Payable" value={formatCurrency(payableSalary)} color="#22c55e" animDelay="0.05s" />
        <StatCard icon={<CalendarDays size={18} color="#06b6d4" />} label="Attendance" value={`${attPct}%`} sub={`${attendanceSummary.total_days} days total`} color="#06b6d4" animDelay="0.1s" />
        <StatCard icon={<Plane size={18} color="#a855f7" />} label="Leaves" value={Number(leaveBalance.available_leaves).toFixed(1)} sub={`of ${Number(leaveBalance.total_leaves_earned).toFixed(1)} earned`} color="#a855f7" animDelay="0.15s" />
        <StatCard icon={<Star size={18} color="#f59e0b" />} label="Performance" value={avgRating} sub={`${performance.length} reviews`} color="#f59e0b" animDelay="0.2s" />
      </div>

      <div style={styles.twoCol}>
        {/* Left */}
        <div style={styles.col()}>
          {/* Salary Breakdown */}
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Salary Breakdown</h2>
            {[
              ['Basic Salary', employee.salary],
              ['HRA', employee.hra],
              ['TA', employee.ta],
              ['MA', employee.ma],
              ['Other Allowances', employee.other_allowances],
              ['Gross Salary', employee.gross_salary, true],
              ['PF Deduction', employee.pf, false, true],
              ['Bonus', employee.bonus],
              ['Other Deduction', employee.deduction, false, true],
            ].map(([label, val, bold, neg], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                <span style={{ color: colors.text.secondary, fontSize: 13 }}>{label}</span>
                <span style={{ color: neg ? '#ef4444' : colors.text.primary, fontWeight: bold ? 700 : 500, fontSize: bold ? 15 : 13 }}>
                  {neg ? '- ' : ''}{formatCurrency(val)}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTop: '2px solid rgba(148,163,184,0.12)' }}>
              <span style={{ color: colors.text.secondary, fontSize: 14, fontWeight: 600 }}>Net Payable</span>
              <span style={{ color: '#22c55e', fontSize: 22, fontWeight: 700 }}>{formatCurrency(payableSalary)}</span>
            </div>
          </div>

          {/* Attendance Chart */}
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Attendance Overview</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={280} height={220}>
                <Pie data={pieData} dataKey="value" outerRadius={70} innerRadius={35} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 8, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={styles.col('1 1 420px')}>
          {/* Performance */}
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Performance</h2>
            {performance.length === 0 ? (
              <p style={{ color: colors.text.muted, fontSize: 13 }}>No performance reviews yet.</p>
            ) : (
              performance.slice(0, 5).map(p => (
                <div key={p.id} style={{ background: 'rgba(2,6,23,0.4)', border: colors.border.subtle, borderRadius: radius.md, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>{p.rating} <Star size={14} color="#f59e0b" fill="#f59e0b" /></span>
                    <span style={{ color: colors.text.muted, fontSize: 11 }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                  <p style={{ color: colors.text.secondary, fontSize: 13, margin: '4px 0 0', lineHeight: 1.5 }}>{p.feedback}</p>
                </div>
              ))
            )}
          </div>

          {/* Increments */}
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>Recent Increments</h2>
            {increments.length === 0 ? (
              <p style={{ color: colors.text.muted, fontSize: 13 }}>No increments recorded yet.</p>
            ) : (
              increments.slice(0, 3).map(inc => (
                <div key={inc.id} style={{ background: 'rgba(2,6,23,0.4)', border: colors.border.subtle, borderRadius: radius.md, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>+{formatCurrency(inc.increment_amount)} ({Number(inc.increment_percent || 0)}%)</span>
                    <span style={{ color: colors.text.muted, fontSize: 11 }}>{inc.effective_date ? new Date(inc.effective_date).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                  {inc.reason && <p style={{ color: colors.text.muted, fontSize: 12, margin: '4px 0 0' }}>{inc.reason}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>



      <ChatbotWidget role="employee" employeeId={employee.id} employeeName={employee.name} />
    </div>
  )
}

export default EmployeeHome
