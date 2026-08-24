import useEmployeeData from './useEmployeeData'
import { styles, colors } from './theme'
import { User, Building2, Landmark, FileText, Briefcase } from 'lucide-react'

function ProfileField({ label, value }) {
  return (
    <div>
      <p style={{ color: colors.text.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px', fontWeight: 500 }}>{label}</p>
      <p style={{ color: colors.text.primary, fontSize: 14, margin: 0 }}>{value || '—'}</p>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={styles.sectionCard}>
      <h2 style={{ ...styles.sectionTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={16} color={colors.text.secondary} />} {title}
      </h2>
      <div style={styles.profileGrid}>{children}</div>
    </div>
  )
}

function EmployeeProfile() {
  const { loading, errorMsg, employee } = useEmployeeData()

  if (loading) return <div style={styles.centerScreen}><div style={{ color: colors.text.secondary }}>Loading...</div></div>
  if (errorMsg) return <div style={styles.centerScreen}><div style={{ ...styles.sectionCard, maxWidth: 440, textAlign: 'center' }}><h2 style={{ color: colors.text.primary }}>Error</h2><p style={{ color: colors.text.secondary }}>{errorMsg}</p></div></div>

  const initials = employee.name ? employee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'

  return (
    <div style={styles.pageContainer}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.pageTitle}>My Profile</h1>
        <p style={styles.pageSubtitle}>View your personal and employment details</p>
      </div>

      {/* Profile Header */}
      <div style={{ ...styles.sectionCard, padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: colors.accent.indigo, border: '2px solid rgba(99,102,241,0.3)', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ color: colors.text.primary, margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>{employee.name}</h2>
            <p style={{ color: colors.text.secondary, margin: '0 0 8px', fontSize: 14 }}>{employee.email}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={styles.badge('success')}>{employee.employment_status || 'Active'}</span>
              {employee.employee_code && <span style={styles.badge('info')}>{employee.employee_code}</span>}
              {employee.department && <span style={styles.badge('purple')}>{employee.department}</span>}
            </div>
          </div>
        </div>
      </div>

      <Section title="Personal Details" icon={User}>
        <ProfileField label="Full Name" value={employee.name} />
        <ProfileField label="Email" value={employee.email} />
        <ProfileField label="Phone" value={employee.phone} />
        <ProfileField label="Date of Birth" value={employee.date_of_birth} />
        <ProfileField label="Gender" value={employee.gender} />
        <ProfileField label="Address" value={employee.address} />
      </Section>

      <Section title="Employment Details" icon={Building2}>
        <ProfileField label="Employee Code" value={employee.employee_code} />
        <ProfileField label="Department" value={employee.department} />
        <ProfileField label="Designation" value={employee.designation} />
        <ProfileField label="Joining Date" value={employee.joining_date} />
        <ProfileField label="Status" value={employee.confirmation_date ? `Permanent since ${employee.confirmation_date}` : employee.employment_status} />
        <ProfileField label="Employee Type" value={employee.employee_type || 'Direct'} />
        <ProfileField label="Reporting Manager" value={employee.reporting_manager} />
      </Section>

      <div style={styles.twoCol}>
        <div style={styles.col()}>
          <Section title="Bank Details" icon={Landmark}>
            <ProfileField label="Bank Name" value={employee.bank_name} />
            <ProfileField label="Account Number" value={employee.bank_account_number} />
            <ProfileField label="IFSC Code" value={employee.ifsc_code} />
          </Section>
        </div>
        <div style={styles.col('1 1 420px')}>
          <Section title="Statutory Documents" icon={FileText}>
            <ProfileField label="PAN Number" value={employee.pan_number} />
            <ProfileField label="Aadhaar Number" value={employee.aadhaar_number} />
            <ProfileField label="Passport Number" value={employee.passport_number} />
          </Section>
        </div>
      </div>

      {employee.last_job_details && (
        <Section title="Previous Experience" icon={Briefcase}>
          <ProfileField label="Last Job Details" value={employee.last_job_details} />
        </Section>
      )}
    </div>
  )
}

export default EmployeeProfile
