import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { API_BASE } from '../api'

function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [idProofFile, setIdProofFile] = useState(null)

  const [user, setUser] = useState({
    email: '', password: '', fullName: '', age: '', gender: '', bloodGroup: '',
    maritalStatus: '', marriageDate: '', spouseName: '', spouseOccupation: '',
    spousePhone: '', hasChildren: '', numberOfChildren: '', childrenNames: '',
    mobileNumber: '', presentAddress: '', permanentAddress: '', fatherName: '',
    fatherOccupation: '', fatherPhone: '', motherName: '', motherOccupation: '',
    motherPhone: '', employmentStatus: '', hasInternship: '', internCompany: '',
    internStipend: '', internDepartment: '', pastCompany: '', pastDesignation: '',
    joiningYear: '', leavingYear: '', reasonForLeaving: '', totalExperienceYears: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '', skills: '', languagesKnown: '',
    certifications: '', expectedSalary: '', noticePeriodDays: '', willingToRelocate: '',
    emergencyContactName: '', emergencyContactPhone: '', bankAccountNumber: '',
    bankName: '', ifscCode: '', panNumber: '', aadharNumber: '', reference1Name: '',
    reference1Designation: '', reference1Phone: '', reference2Name: '',
    reference2Designation: '', reference2Phone: ''
  })

  const [educationEntries, setEducationEntries] = useState([
    { level: '', institution: '', admissionYear: '', passingYear: '', marksOrCgpa: '', certificateFile: null }
  ])

  const handleChange = (field, value) => setUser(prev => ({ ...prev, [field]: value }))
  const addEducationEntry = () => setEducationEntries(prev => [...prev, { level: '', institution: '', admissionYear: '', passingYear: '', marksOrCgpa: '', certificateFile: null }])
  const removeEducationEntry = (index) => setEducationEntries(prev => prev.filter((_, i) => i !== index))
  const updateEducationField = (index, field, value) => setEducationEntries(prev => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)))
  const updateEducationFile = (index, file) => setEducationEntries(prev => prev.map((entry, i) => (i === index ? { ...entry, certificateFile: file } : entry)))

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!user.email || !user.password || !user.fullName || !user.mobileNumber) {
      alert('Please fill mandatory fields'); return
    }
    setLoading(true)
    try {
      // Prevent duplicate registration: if this email already has a profile,
      // stop here with a friendly message instead of hitting the
      // employee_profiles_pkey duplicate-key error.
      const registeredEmail = user.email.trim().toLowerCase()
      try {
        const { data: existingProfile, error: checkError } = await supabase
          .from('employee_profiles')
          .select('id')
          .ilike('email', registeredEmail)
          .maybeSingle()
        if (!checkError && existingProfile) {
          alert('This email is already registered. Please log in instead.')
          navigate('/login')
          return
        }
      } catch (checkErr) {
        // The email column may not exist yet if migration 004 was not applied
        // — fall back to letting the insert report the duplicate.
        console.error('Duplicate-email check failed:', checkErr)
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({ email: user.email, password: user.password })
      if (authError) throw authError
      if (!authData?.user) {
        // Email confirmation is enabled in Supabase and the email is already
        // taken — Supabase intentionally returns no user in that case.
        alert('This email is already registered. Please log in instead.')
        navigate('/login')
        return
      }
      let resumeUrl = null, idProofUrl = null
      if (resumeFile && authData?.user) {
        const ext = resumeFile.name.split('.').pop()
        const fname = `${authData.user.id}_resume.${ext}`
        const { error: ue } = await supabase.storage.from('resumes').upload(fname, resumeFile)
        if (ue) throw ue
        const { data: ud } = supabase.storage.from('resumes').getPublicUrl(fname)
        resumeUrl = ud.publicUrl
      }
      if (idProofFile && authData?.user) {
        const ext = idProofFile.name.split('.').pop()
        const fname = `${authData.user.id}_id_proof.${ext}`
        const { error: ue } = await supabase.storage.from('id-proofs').upload(fname, idProofFile)
        if (ue) throw ue
        const { data: ud } = supabase.storage.from('id-proofs').getPublicUrl(fname)
        idProofUrl = ud.publicUrl
      }
      const uploadedEducation = []
      if (authData?.user) {
        for (let i = 0; i < educationEntries.length; i++) {
          const entry = educationEntries[i]
          let certUrl = null
          if (entry.certificateFile) {
            const ext = entry.certificateFile.name.split('.').pop()
            const fname = `${authData.user.id}_education_${i}.${ext}`
            const { error: ce } = await supabase.storage.from('education-certificates').upload(fname, entry.certificateFile)
            if (ce) throw ce
            const { data: cd } = supabase.storage.from('education-certificates').getPublicUrl(fname)
            certUrl = cd.publicUrl
          }
          uploadedEducation.push({ level: entry.level, institution: entry.institution, admission_year: entry.admissionYear, passing_year: entry.passingYear, marks_or_cgpa: entry.marksOrCgpa, certificate_url: certUrl })
        }
      }
      if (authData?.user) {
        const { error: pe } = await supabase.from('employee_profiles').insert([{
          id: authData.user.id, full_name: user.fullName, age: user.age ? parseInt(user.age) : null,
          gender: user.gender, blood_group: user.bloodGroup, marital_status: user.maritalStatus,
          marriage_date: user.marriageDate || null, spouse_name: user.spouseName,
          spouse_occupation: user.spouseOccupation, spouse_phone: user.spousePhone,
          has_children: user.hasChildren, number_of_children: user.numberOfChildren ? parseInt(user.numberOfChildren) : null,
          children_names: user.childrenNames, mobile_number: user.mobileNumber,
          present_address: user.presentAddress, permanent_address: user.permanentAddress,
          education_history: uploadedEducation, father_name: user.fatherName,
          father_occupation: user.fatherOccupation, father_phone: user.fatherPhone,
          mother_name: user.motherName, mother_occupation: user.motherOccupation,
          mother_phone: user.motherPhone, employment_status: user.employmentStatus,
          has_internship: user.hasInternship, intern_company: user.internCompany,
          intern_stipend: user.internStipend, intern_department: user.internDepartment,
          past_company: user.pastCompany, past_designation: user.pastDesignation,
          joining_year: user.joiningYear, leaving_year: user.leavingYear,
          reason_for_leaving: user.reasonForLeaving, total_experience_years: user.totalExperienceYears,
          linkedin_url: user.linkedinUrl, github_url: user.githubUrl,
          portfolio_url: user.portfolioUrl, skills: user.skills,
          languages_known: user.languagesKnown, certifications: user.certifications,
          expected_salary: user.expectedSalary ? parseInt(user.expectedSalary) : null,
          notice_period_days: user.noticePeriodDays ? parseInt(user.noticePeriodDays) : null,
          willing_to_relocate: user.willingToRelocate,
          emergency_contact_name: user.emergencyContactName,
          emergency_contact_phone: user.emergencyContactPhone,
          bank_account_number: user.bankAccountNumber, bank_name: user.bankName,
          ifsc_code: user.ifscCode, pan_number: user.panNumber, aadhar_number: user.aadharNumber,
          reference1_name: user.reference1Name, reference1_designation: user.reference1Designation,
          reference1_phone: user.reference1Phone, reference2_name: user.reference2Name,
          reference2_designation: user.reference2Designation, reference2_phone: user.reference2Phone,
          resume_url: resumeUrl, id_proof_url: idProofUrl, role: 'employee',
          approval_status: 'pending',
          email: user.email
        }])
        if (pe) {
          // If the profile insert still collides (e.g. the auth user existed
          // but had no profile row), show a friendly message instead of the
          // raw database error.
          if (String(pe.message || '').toLowerCase().includes('duplicate key') || String(pe.message || '').includes('already exists')) {
            alert('This email is already registered. Please log in instead.')
            navigate('/login')
            return
          }
          throw pe
        }

        // Best-effort: auto-confirm the email via the backend service role
        // key so login works for ANY email domain without waiting for a
        // Supabase confirmation link. No verification email is sent.
        try {
          await fetch(`${API_BASE}/api/auth/confirm-signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authData.user.id, email: registeredEmail })
          })
        } catch (emailErr) {
          console.error('Signup email confirmation failed:', emailErr)
        }

        alert('Registration submitted! Your account is pending HR approval. You will be able to log in after approval.')
        navigate('/login')
      }
    } catch (error) {
      alert(error.message || 'An error occurred during registration.')
    } finally { setLoading(false) }
  }

  const SectionHeader = ({ icon, title }) => (
    <h2 style={sectionTitleStyle}>
      <span style={sectionIconStyle}>{icon}</span>
      {title}
    </h2>
  )

  return (
    <div style={pageWrapperStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={brandBadgeStyle}>Talent Pay Corner</div>
          <h1 style={mainTitleStyle}>Employee Registration</h1>
          <p style={subtitleStyle}>Complete your onboarding into the Corporate Payroll Management System</p>
        </div>

        <div style={infoNoteStyle}>
          <span style={{ fontSize: '15px' }}>ℹ️</span>
          <span>Please fill all details carefully. Registration is a one-time process — you can only sign up once with an email.</span>
        </div>

        <form onSubmit={handleSignUp}>
          <SectionHeader icon="🔐" title="Account Credentials" />
          <div style={formGridStyle}>
            <input type="email" placeholder="Email Address *" required value={user.email} onChange={(e) => handleChange('email', e.target.value)} style={inputStyle} />
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Password *" required value={user.password} onChange={(e) => handleChange('password', e.target.value)} style={{ ...inputStyle, paddingRight: '72px' }} />
              <button type="button" onClick={() => setShowPassword((c) => !c)} style={showHideBtnStyle}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          <SectionHeader icon="👤" title="Personal Details" />
          <div style={formGridStyle}>
            <input type="text" placeholder="Full Name *" required value={user.fullName} onChange={(e) => handleChange('fullName', e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Age" value={user.age} onChange={(e) => handleChange('age', e.target.value)} style={inputStyle} />
            <select value={user.gender} onChange={(e) => handleChange('gender', e.target.value)} style={inputStyle}><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
            <input type="text" placeholder="Blood Group" value={user.bloodGroup} onChange={(e) => handleChange('bloodGroup', e.target.value)} style={inputStyle} />
            <select value={user.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)} style={inputStyle}><option value="">Marital Status</option><option value="Single">Single</option><option value="Married">Married</option></select>
            <input type="text" placeholder="Phone Number *" required value={user.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value)} style={inputStyle} />
          </div>
          <textarea placeholder="Present Address" value={user.presentAddress} onChange={(e) => handleChange('presentAddress', e.target.value)} style={{ ...inputStyle, height: '80px', marginTop: '16px' }} />
          <textarea placeholder="Permanent Address" value={user.permanentAddress} onChange={(e) => handleChange('permanentAddress', e.target.value)} style={{ ...inputStyle, height: '80px', marginTop: '16px' }} />

          {user.maritalStatus === 'Married' && (
            <div style={dynamicBoxStyle}>
              <h3 style={subSectionTitle}>💍 Marriage & Spouse Details</h3>
              <div style={formGridStyle}>
                <input type="date" value={user.marriageDate} onChange={(e) => handleChange('marriageDate', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse Name" value={user.spouseName} onChange={(e) => handleChange('spouseName', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse Occupation" value={user.spouseOccupation} onChange={(e) => handleChange('spouseOccupation', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse Contact" value={user.spousePhone} onChange={(e) => handleChange('spousePhone', e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          <SectionHeader icon="🆘" title="Emergency Contact" />
          <div style={formGridStyle}>
            <input type="text" placeholder="Emergency Contact Name" value={user.emergencyContactName} onChange={(e) => handleChange('emergencyContactName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Emergency Contact Phone" value={user.emergencyContactPhone} onChange={(e) => handleChange('emergencyContactPhone', e.target.value)} style={inputStyle} />
          </div>

          <SectionHeader icon="🎓" title="Education Background" />
          {educationEntries.map((entry, index) => (
            <div key={index} style={dynamicBoxStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={subSectionTitle}>📚 Entry {index + 1}</h3>
                {educationEntries.length > 1 && <button type="button" onClick={() => removeEducationEntry(index)} style={removeBtnStyle}>✕ Remove</button>}
              </div>
              <div style={formGridStyle}>
                <select value={entry.level} onChange={(e) => updateEducationField(index, 'level', e.target.value)} style={inputStyle}><option value="">Select Level</option><option value="10th">10th</option><option value="12th">12th</option><option value="Diploma">Diploma</option><option value="Degree">Degree</option><option value="Masters">Masters</option></select>
                <input type="text" placeholder="School / College Name" value={entry.institution} onChange={(e) => updateEducationField(index, 'institution', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Admission Year" value={entry.admissionYear} onChange={(e) => updateEducationField(index, 'admissionYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Passing Year" value={entry.passingYear} onChange={(e) => updateEducationField(index, 'passingYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Marks / CGPA" value={entry.marksOrCgpa} onChange={(e) => updateEducationField(index, 'marksOrCgpa', e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginTop: '12px' }}>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>📎 Upload Certificate (optional)</p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => updateEducationFile(index, e.target.files[0])} style={fileInputStyle} />
              </div>
            </div>
          ))}
          <button type="button" onClick={addEducationEntry} style={addBtnStyle}>+ Add Another Education Entry</button>

          <SectionHeader icon="👨‍👩‍👧" title="Family Information" />
          <div style={formGridStyle}>
            <input type="text" placeholder="Father Name" value={user.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Father Occupation" value={user.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Mother Name" value={user.motherName} onChange={(e) => handleChange('motherName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Mother Occupation" value={user.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} style={inputStyle} />
          </div>

          <SectionHeader icon="🏦" title="Bank & Government ID" />
          <div style={formGridStyle}>
            <input type="text" placeholder="Bank Account Number" value={user.bankAccountNumber} onChange={(e) => handleChange('bankAccountNumber', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Bank Name" value={user.bankName} onChange={(e) => handleChange('bankName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="IFSC Code" value={user.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="PAN Number" value={user.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Aadhar Number" value={user.aadharNumber} onChange={(e) => handleChange('aadharNumber', e.target.value)} style={inputStyle} />
          </div>
          <div style={uploadBoxStyle}>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>📎 Upload ID Proof (Aadhar / PAN card, PDF or Image, max 5MB)</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setIdProofFile(e.target.files[0])} style={fileInputStyle} />
            {idProofFile && <p style={{ color: '#16a34a', fontSize: '13px', marginTop: '8px' }}>✅ {idProofFile.name}</p>}
          </div>

          <SectionHeader icon="💼" title="Professional Information" />
          <div style={formGridStyle}>
            <input type="url" placeholder="LinkedIn URL" value={user.linkedinUrl} onChange={(e) => handleChange('linkedinUrl', e.target.value)} style={inputStyle} />
            <input type="url" placeholder="GitHub URL" value={user.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Skills" value={user.skills} onChange={(e) => handleChange('skills', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Languages Known" value={user.languagesKnown} onChange={(e) => handleChange('languagesKnown', e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Expected Salary" value={user.expectedSalary} onChange={(e) => handleChange('expectedSalary', e.target.value)} style={inputStyle} />
            <select value={user.willingToRelocate} onChange={(e) => handleChange('willingToRelocate', e.target.value)} style={inputStyle}><option value="">Willing to Relocate?</option><option value="Yes">Yes</option><option value="No">No</option></select>
          </div>

          <SectionHeader icon="📊" title="Professional Status" />
          <select required value={user.employmentStatus} onChange={(e) => handleChange('employmentStatus', e.target.value)} style={inputStyle}>
            <option value="">Fresher or Experienced? *</option>
            <option value="Fresher">Fresher</option>
            <option value="Experienced">Experienced</option>
          </select>

          {user.employmentStatus === 'Experienced' && (
            <div style={dynamicBoxStyle}>
              <h3 style={subSectionTitle}>🏢 Previous Job History</h3>
              <div style={formGridStyle}>
                <input type="text" placeholder="Previous Company" value={user.pastCompany} onChange={(e) => handleChange('pastCompany', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Designation" value={user.pastDesignation} onChange={(e) => handleChange('pastDesignation', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Joining Year" value={user.joiningYear} onChange={(e) => handleChange('joiningYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Leaving Year" value={user.leavingYear} onChange={(e) => handleChange('leavingYear', e.target.value)} style={inputStyle} />
              </div>
              <textarea placeholder="Reason for leaving?" value={user.reasonForLeaving} onChange={(e) => handleChange('reasonForLeaving', e.target.value)} style={{ ...inputStyle, height: '60px', marginTop: '16px' }} />
            </div>
          )}

          <SectionHeader icon="🤝" title="Professional References" />
          <div style={dynamicBoxStyle}>
            <h3 style={subSectionTitle}>Reference 1</h3>
            <div style={formGridStyle}>
              <input type="text" placeholder="Name" value={user.reference1Name} onChange={(e) => handleChange('reference1Name', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Designation" value={user.reference1Designation} onChange={(e) => handleChange('reference1Designation', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Contact" value={user.reference1Phone} onChange={(e) => handleChange('reference1Phone', e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={dynamicBoxStyle}>
            <h3 style={subSectionTitle}>Reference 2</h3>
            <div style={formGridStyle}>
              <input type="text" placeholder="Name" value={user.reference2Name} onChange={(e) => handleChange('reference2Name', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Designation" value={user.reference2Designation} onChange={(e) => handleChange('reference2Designation', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Contact" value={user.reference2Phone} onChange={(e) => handleChange('reference2Phone', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <SectionHeader icon="📄" title="Resume Upload" />
          <div style={uploadBoxStyle}>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>📎 Upload your resume (PDF/DOC, max 5MB)</p>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} style={fileInputStyle} />
            {resumeFile && <p style={{ color: '#16a34a', fontSize: '13px', marginTop: '8px' }}>✅ {resumeFile.name}</p>}
          </div>

          <button type="submit" disabled={loading} style={submitBtnStyle}>
            {loading ? '⏳ Processing...' : '🚀 Complete Registration'}
          </button>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginTop: '20px', marginBottom: 0 }}>
            Already registered? <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Sign In →</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

/* ── Light Theme Styles ── */
const pageWrapperStyle = { minHeight: '100vh', padding: '40px 20px', background: 'linear-gradient(160deg, #eef2ff 0%, #f0f4f8 45%, #f8fafc 100%)' }
const containerStyle = { maxWidth: '850px', margin: '0 auto', padding: '44px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(15,23,42,.08)' }
const brandBadgeStyle = { display: 'inline-block', padding: '6px 16px', borderRadius: '999px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }
const infoNoteStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px 16px', borderRadius: '12px', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }
const mainTitleStyle = { fontSize: '30px', fontWeight: '800', margin: '0 0 8px', textAlign: 'center', color: '#0f172a' }
const subtitleStyle = { fontSize: '14px', color: '#64748b', margin: '0 0 28px', textAlign: 'center' }
const sectionTitleStyle = { fontSize: '18px', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginTop: '32px', marginBottom: '20px', display: 'flex', alignItems: 'center' }
const sectionIconStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: '16px', marginRight: '10px' }
const subSectionTitle = { fontSize: '15px', fontWeight: '600', color: '#334155', marginBottom: '12px' }
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }
const inputStyle = { width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a', transition: 'border-color 0.2s ease' }
const fileInputStyle = { color: '#334155', fontSize: '14px', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f8fafc', width: '100%' }
const dynamicBoxStyle = { background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '15px', marginBottom: '15px' }
const uploadBoxStyle = { background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px dashed #d1d5db', marginBottom: '10px' }
const addBtnStyle = { padding: '12px 20px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginTop: '8px' }
const removeBtnStyle = { padding: '6px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }
const showHideBtnStyle = { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '6px 8px', borderRadius: '7px' }
const submitBtnStyle = { width: '100%', padding: '14px', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', marginTop: '32px', cursor: 'pointer', background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #8b5cf6 100%)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)', transition: 'all 0.2s ease' }

export default SignUp