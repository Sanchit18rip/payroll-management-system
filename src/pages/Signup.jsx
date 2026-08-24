import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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

  const handleChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }))
  }

  const addEducationEntry = () => {
    setEducationEntries(prev => [
      ...prev,
      { level: '', institution: '', admissionYear: '', passingYear: '', marksOrCgpa: '', certificateFile: null }
    ])
  }

  const removeEducationEntry = (index) => {
    setEducationEntries(prev => prev.filter((_, i) => i !== index))
  }

  const updateEducationField = (index, field, value) => {
    setEducationEntries(prev =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    )
  }

  const updateEducationFile = (index, file) => {
    setEducationEntries(prev =>
      prev.map((entry, i) => (i === index ? { ...entry, certificateFile: file } : entry))
    )
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!user.email || !user.password || !user.fullName || !user.mobileNumber) {
      alert('Please fill mandatory fields (Email, Password, Full Name, Phone Number)')
      return
    }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      })
      if (authError) throw authError

      let resumeUrl = null
      let idProofUrl = null

      if (resumeFile && authData?.user) {
        const fileExt = resumeFile.name.split('.').pop()
        const fileName = `${authData.user.id}_resume.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, resumeFile)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName)
        resumeUrl = urlData.publicUrl
      }

      if (idProofFile && authData?.user) {
        const fileExt = idProofFile.name.split('.').pop()
        const fileName = `${authData.user.id}_id_proof.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('id-proofs').upload(fileName, idProofFile)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('id-proofs').getPublicUrl(fileName)
        idProofUrl = urlData.publicUrl
      }

      const uploadedEducationEntries = []
      if (authData?.user) {
        for (let i = 0; i < educationEntries.length; i++) {
          const entry = educationEntries[i]
          let certificateUrl = null
          if (entry.certificateFile) {
            const fileExt = entry.certificateFile.name.split('.').pop()
            const fileName = `${authData.user.id}_education_${i}.${fileExt}`
            const { error: certUploadError } = await supabase.storage.from('education-certificates').upload(fileName, entry.certificateFile)
            if (certUploadError) throw certUploadError
            const { data: certUrlData } = supabase.storage.from('education-certificates').getPublicUrl(fileName)
            certificateUrl = certUrlData.publicUrl
          }
          uploadedEducationEntries.push({
            level: entry.level, institution: entry.institution,
            admission_year: entry.admissionYear, passing_year: entry.passingYear,
            marks_or_cgpa: entry.marksOrCgpa, certificate_url: certificateUrl
          })
        }
      }

      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('employee_profiles')
          .insert([{
            id: authData.user.id,
            full_name: user.fullName,
            age: user.age ? parseInt(user.age) : null,
            gender: user.gender,
            blood_group: user.bloodGroup,
            marital_status: user.maritalStatus,
            marriage_date: user.marriageDate || null,
            spouse_name: user.spouseName,
            spouse_occupation: user.spouseOccupation,
            spouse_phone: user.spousePhone,
            has_children: user.hasChildren,
            number_of_children: user.numberOfChildren ? parseInt(user.numberOfChildren) : null,
            children_names: user.childrenNames,
            mobile_number: user.mobileNumber,
            present_address: user.presentAddress,
            permanent_address: user.permanentAddress,
            education_history: uploadedEducationEntries,
            father_name: user.fatherName,
            father_occupation: user.fatherOccupation,
            father_phone: user.fatherPhone,
            mother_name: user.motherName,
            mother_occupation: user.motherOccupation,
            mother_phone: user.motherPhone,
            employment_status: user.employmentStatus,
            has_internship: user.hasInternship,
            intern_company: user.internCompany,
            intern_stipend: user.internStipend,
            intern_department: user.internDepartment,
            past_company: user.pastCompany,
            past_designation: user.pastDesignation,
            joining_year: user.joiningYear,
            leaving_year: user.leavingYear,
            reason_for_leaving: user.reasonForLeaving,
            total_experience_years: user.totalExperienceYears,
            linkedin_url: user.linkedinUrl,
            github_url: user.githubUrl,
            portfolio_url: user.portfolioUrl,
            skills: user.skills,
            languages_known: user.languagesKnown,
            certifications: user.certifications,
            expected_salary: user.expectedSalary ? parseInt(user.expectedSalary) : null,
            notice_period_days: user.noticePeriodDays ? parseInt(user.noticePeriodDays) : null,
            willing_to_relocate: user.willingToRelocate,
            emergency_contact_name: user.emergencyContactName,
            emergency_contact_phone: user.emergencyContactPhone,
            bank_account_number: user.bankAccountNumber,
            bank_name: user.bankName,
            ifsc_code: user.ifscCode,
            pan_number: user.panNumber,
            aadhar_number: user.aadharNumber,
            reference1_name: user.reference1Name,
            reference1_designation: user.reference1Designation,
            reference1_phone: user.reference1Phone,
            reference2_name: user.reference2Name,
            reference2_designation: user.reference2Designation,
            reference2_phone: user.reference2Phone,
            resume_url: resumeUrl,
            id_proof_url: idProofUrl,
            role: 'employee'
          }])

        if (profileError) throw profileError

        alert('Registration successful! Please verify your email before logging in.')
        navigate('/login')
      }
    } catch (error) {
      alert(error.message || 'An error occurred during registration.')
    } finally {
      setLoading(false)
    }
  }

  const SectionHeader = ({ icon, title }) => (
    <h2 style={sectionTitleStyle}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(139,92,246,0.2))',
        border: '1px solid rgba(148,163,184,0.2)',
        fontSize: '16px',
        marginRight: '10px',
        verticalAlign: 'middle'
      }}>{icon}</span>
      {title}
    </h2>
  )

  return (
    <div style={pageWrapperStyle}>
      {/* Aurora gradient backdrop */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.06), transparent 60%),' +
          'radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.06), transparent 60%)'
      }} />

      <div style={{ ...containerStyle, animation: 'fadeInUp 0.6s ease both' }}>

        {/* Logo chip */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 16px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          background: 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(139,92,246,0.25))',
          border: '1px solid rgba(148,163,184,0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
        }}>📋</div>

        <div style={warningBoxStyle}>
          <strong>⚠️ IMPORTANT:</strong> You can only sign up once! Please fill all details carefully. Multiple registrations are strictly prohibited.
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '8px',
          textAlign: 'center',
          background: 'linear-gradient(120deg, #38bdf8 0%, #818cf8 45%, #e879f9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Employee Registration</h1>
        <p style={subtitleStyle}>
          Complete your onboarding into the Corporate Payroll Management System
        </p>

        <form onSubmit={handleSignUp}>

          <SectionHeader icon="🔐" title="Account Credentials" />
          <div style={formGridStyle}>
            <input type="email" placeholder="Email Address *" required value={user.email} onChange={(e) => handleChange('email', e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password *" required value={user.password} onChange={(e) => handleChange('password', e.target.value)} style={inputStyle} />
          </div>

          <SectionHeader icon="👤" title="Personal Details" />
          <div style={formGridStyle}>
            <input type="text" placeholder="Full Name *" required value={user.fullName} onChange={(e) => handleChange('fullName', e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Age" value={user.age} onChange={(e) => handleChange('age', e.target.value)} style={inputStyle} />
            <select value={user.gender} onChange={(e) => handleChange('gender', e.target.value)} style={inputStyle}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input type="text" placeholder="Blood Group" value={user.bloodGroup} onChange={(e) => handleChange('bloodGroup', e.target.value)} style={inputStyle} />
            <select value={user.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)} style={inputStyle}>
              <option value="">Marital Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
            <input type="text" placeholder="Phone Number *" required value={user.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value)} style={inputStyle} />
          </div>
          <textarea placeholder="Present Address" value={user.presentAddress} onChange={(e) => handleChange('presentAddress', e.target.value)} style={{ ...inputStyle, height: '80px', marginTop: '16px' }} />
          <textarea placeholder="Permanent Address" value={user.permanentAddress} onChange={(e) => handleChange('permanentAddress', e.target.value)} style={{ ...inputStyle, height: '80px', marginTop: '16px' }} />

          {user.maritalStatus === 'Married' && (
            <div style={dynamicBoxStyle}>
              <h3 style={subSectionTitle}>💍 Marriage & Spouse Details</h3>
              <div style={formGridStyle}>
                <input type="date" value={user.marriageDate} onChange={(e) => handleChange('marriageDate', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse's Name" value={user.spouseName} onChange={(e) => handleChange('spouseName', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse's Occupation" value={user.spouseOccupation} onChange={(e) => handleChange('spouseOccupation', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse's Contact" value={user.spousePhone} onChange={(e) => handleChange('spousePhone', e.target.value)} style={inputStyle} />
              </div>
              <h3 style={{ ...subSectionTitle, marginTop: '16px' }}>👶 Children Details</h3>
              <div style={formGridStyle}>
                <select value={user.hasChildren} onChange={(e) => handleChange('hasChildren', e.target.value)} style={inputStyle}>
                  <option value="">Do you have children?</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {user.hasChildren === 'Yes' && (
                  <input type="number" placeholder="Number of Children" value={user.numberOfChildren} onChange={(e) => handleChange('numberOfChildren', e.target.value)} style={inputStyle} />
                )}
              </div>
              {user.hasChildren === 'Yes' && (
                <textarea placeholder="Children's Names & Ages (e.g., Riya - 5 yrs, Arjun - 2 yrs)" value={user.childrenNames} onChange={(e) => handleChange('childrenNames', e.target.value)} style={{ ...inputStyle, height: '60px', marginTop: '16px' }} />
              )}
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
                {educationEntries.length > 1 && (
                  <button type="button" onClick={() => removeEducationEntry(index)} style={removeEntryButtonStyle}>
                    ✕ Remove
                  </button>
                )}
              </div>
              <div style={formGridStyle}>
                <select value={entry.level} onChange={(e) => updateEducationField(index, 'level', e.target.value)} style={inputStyle}>
                  <option value="">Select Level</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Degree">Degree (B.E./B.Com/B.Sc)</option>
                  <option value="Masters">Masters (M.E./MBA/M.Sc)</option>
                  <option value="PhD">PhD</option>
                  <option value="Certification">Certification Course</option>
                </select>
                <input type="text" placeholder="School / College Name" value={entry.institution} onChange={(e) => updateEducationField(index, 'institution', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Admission Year" value={entry.admissionYear} onChange={(e) => updateEducationField(index, 'admissionYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Passing Year" value={entry.passingYear} onChange={(e) => updateEducationField(index, 'passingYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Marks % / CGPA" value={entry.marksOrCgpa} onChange={(e) => updateEducationField(index, 'marksOrCgpa', e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginTop: '12px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
                  📎 Upload Certificate (optional, PDF/Image, max 5MB)
                </p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => updateEducationFile(index, e.target.files[0])} style={fileInputStyle} />
                {entry.certificateFile && (
                  <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '6px' }}>
                    ✅ {entry.certificateFile.name}
                  </p>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addEducationEntry} style={addEntryButtonStyle}>
            + Add Another Education Entry
          </button>

          <SectionHeader icon="👨‍👩‍👧" title="Family Information" />
          <div style={formGridStyle}>
            <input type="text" placeholder="Father's Name" value={user.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Father's Occupation" value={user.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Father's Contact" value={user.fatherPhone} onChange={(e) => handleChange('fatherPhone', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Mother's Name" value={user.motherName} onChange={(e) => handleChange('motherName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Mother's Occupation" value={user.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Mother's Contact" value={user.motherPhone} onChange={(e) => handleChange('motherPhone', e.target.value)} style={inputStyle} />
          </div>

          <SectionHeader icon="🏦" title="Bank & Government ID" />
          <div style={formGridStyle}>
            <input type="text" placeholder="Bank Account Number" value={user.bankAccountNumber} onChange={(e) => handleChange('bankAccountNumber', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Bank Name" value={user.bankName} onChange={(e) => handleChange('bankName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="IFSC Code" value={user.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="PAN Number" value={user.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Aadhar Number" value={user.aadharNumber} onChange={(e) => handleChange('aadharNumber', e.target.value)} style={inputStyle} />
          </div>
          <div style={resumeBoxStyle}>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
              📎 Upload ID Proof (Aadhar / PAN card, PDF or Image, max 5MB)
            </p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setIdProofFile(e.target.files[0])} style={fileInputStyle} />
            {idProofFile && (
              <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '8px' }}>
                ✅ {idProofFile.name}
              </p>
            )}
          </div>

          <SectionHeader icon="💼" title="Professional Information" />
          <div style={formGridStyle}>
            <input type="url" placeholder="LinkedIn Profile URL" value={user.linkedinUrl} onChange={(e) => handleChange('linkedinUrl', e.target.value)} style={inputStyle} />
            <input type="url" placeholder="GitHub Profile URL" value={user.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} style={inputStyle} />
            <input type="url" placeholder="Portfolio URL" value={user.portfolioUrl} onChange={(e) => handleChange('portfolioUrl', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Languages Known" value={user.languagesKnown} onChange={(e) => handleChange('languagesKnown', e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Expected Salary (monthly)" value={user.expectedSalary} onChange={(e) => handleChange('expectedSalary', e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Notice Period (days)" value={user.noticePeriodDays} onChange={(e) => handleChange('noticePeriodDays', e.target.value)} style={inputStyle} />
            <select value={user.willingToRelocate} onChange={(e) => handleChange('willingToRelocate', e.target.value)} style={inputStyle}>
              <option value="">Willing to Relocate?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <textarea placeholder="Skills (e.g., React, Node.js, Excel, Communication...)" value={user.skills} onChange={(e) => handleChange('skills', e.target.value)} style={{ ...inputStyle, height: '80px', marginTop: '16px' }} />
          <textarea placeholder="Certifications (e.g., AWS Certified, Google Data Analytics...)" value={user.certifications} onChange={(e) => handleChange('certifications', e.target.value)} style={{ ...inputStyle, height: '80px', marginTop: '16px' }} />

          <SectionHeader icon="🤝" title="Professional References" />
          <div style={dynamicBoxStyle}>
            <h3 style={subSectionTitle}>Reference 1</h3>
            <div style={formGridStyle}>
              <input type="text" placeholder="Name" value={user.reference1Name} onChange={(e) => handleChange('reference1Name', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Designation / Relation" value={user.reference1Designation} onChange={(e) => handleChange('reference1Designation', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Contact Number" value={user.reference1Phone} onChange={(e) => handleChange('reference1Phone', e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={dynamicBoxStyle}>
            <h3 style={subSectionTitle}>Reference 2</h3>
            <div style={formGridStyle}>
              <input type="text" placeholder="Name" value={user.reference2Name} onChange={(e) => handleChange('reference2Name', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Designation / Relation" value={user.reference2Designation} onChange={(e) => handleChange('reference2Designation', e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Contact Number" value={user.reference2Phone} onChange={(e) => handleChange('reference2Phone', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <SectionHeader icon="📄" title="Resume Upload" />
          <div style={resumeBoxStyle}>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
              📎 Upload your resume (PDF or DOC format, max 5MB)
            </p>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} style={fileInputStyle} />
            {resumeFile && (
              <p style={{ color: '#22c55e', fontSize: '13px', marginTop: '8px' }}>
                ✅ {resumeFile.name}
              </p>
            )}
          </div>

          <SectionHeader icon="📊" title="Professional Status" />
          <div style={{ marginBottom: '20px' }}>
            <select required value={user.employmentStatus} onChange={(e) => handleChange('employmentStatus', e.target.value)} style={inputStyle}>
              <option value="">Are you a Fresher or Experienced? *</option>
              <option value="Fresher">Fresher</option>
              <option value="Experienced">Experienced</option>
            </select>
          </div>

          {user.employmentStatus === 'Fresher' && (
            <div style={dynamicBoxStyle}>
              <h3 style={subSectionTitle}>💼 Internship Details</h3>
              <select value={user.hasInternship} onChange={(e) => handleChange('hasInternship', e.target.value)} style={{ ...inputStyle, marginBottom: '16px' }}>
                <option value="">Have you done any Internship?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {user.hasInternship === 'Yes' && (
                <div style={formGridStyle}>
                  <input type="text" placeholder="Company Name" value={user.internCompany} onChange={(e) => handleChange('internCompany', e.target.value)} style={inputStyle} />
                  <input type="text" placeholder="Stipend Received" value={user.internStipend} onChange={(e) => handleChange('internStipend', e.target.value)} style={inputStyle} />
                  <input type="text" placeholder="Department / Domain" value={user.internDepartment} onChange={(e) => handleChange('internDepartment', e.target.value)} style={inputStyle} />
                </div>
              )}
            </div>
          )}

          {user.employmentStatus === 'Experienced' && (
            <div style={dynamicBoxStyle}>
              <h3 style={subSectionTitle}>🏢 Previous Job History</h3>
              <div style={formGridStyle}>
                <input type="text" placeholder="Previous Company" value={user.pastCompany} onChange={(e) => handleChange('pastCompany', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Designation" value={user.pastDesignation} onChange={(e) => handleChange('pastDesignation', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Joining Year" value={user.joiningYear} onChange={(e) => handleChange('joiningYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Leaving Year" value={user.leavingYear} onChange={(e) => handleChange('leavingYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Total Experience (Years)" value={user.totalExperienceYears} onChange={(e) => handleChange('totalExperienceYears', e.target.value)} style={inputStyle} />
              </div>
              <textarea placeholder="Reason for leaving?" value={user.reasonForLeaving} onChange={(e) => handleChange('reasonForLeaving', e.target.value)} style={{ ...inputStyle, height: '60px', marginTop: '16px' }} />
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '14px',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '32px',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading
              ? 'rgba(56,189,248,0.4)'
              : 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #8b5cf6 100%)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            transition: 'all 0.2s ease'
          }}>
            {loading ? '⏳ Processing Registration...' : '🚀 Complete Employee Registration'}
          </button>

          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            marginTop: '20px',
            marginBottom: 0
          }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#38bdf8', fontWeight: '600', textDecoration: 'none' }}>
              Sign In →
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

/* ── STYLES ── */

const pageWrapperStyle = {
  minHeight: '100vh',
  padding: '40px 20px',
  position: 'relative',
  overflow: 'hidden',
  background:
    'radial-gradient(circle at 12% 8%, rgba(56,189,248,0.12), transparent 40%),' +
    'radial-gradient(circle at 88% 12%, rgba(167,139,250,0.14), transparent 42%),' +
    'radial-gradient(circle at 50% 95%, rgba(34,211,238,0.10), transparent 45%),' +
    'linear-gradient(160deg, #020617 0%, #0f172a 55%, #172554 100%)'
}

const containerStyle = {
  position: 'relative',
  zIndex: 1,
  maxWidth: '850px',
  margin: '0 auto',
  padding: '40px',
  background: 'linear-gradient(160deg, rgba(30, 41, 59, 0.65), rgba(15, 23, 42, 0.5))',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '24px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
  fontFamily: 'Inter, Segoe UI, Roboto, sans-serif'
}

const warningBoxStyle = {
  background: 'rgba(220, 38, 38, 0.08)',
  border: '1px solid rgba(220, 38, 38, 0.35)',
  color: '#fca5a5',
  padding: '16px',
  borderRadius: '14px',
  marginBottom: '24px',
  fontSize: '14px',
  fontWeight: '500',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)'
}

const subtitleStyle = {
  fontSize: '14px',
  color: '#94a3b8',
  marginBottom: '30px',
  textAlign: 'center'
}

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#f8fafc',
  borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
  paddingBottom: '12px',
  marginTop: '32px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center'
}

const subSectionTitle = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#cbd5e1',
  marginBottom: '12px'
}

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
}

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'rgba(2, 6, 23, 0.5)',
  color: '#f8fafc',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  transition: 'border-color 0.2s ease'
}

const fileInputStyle = {
  color: '#cbd5e1',
  fontSize: '14px',
  padding: '8px',
  borderRadius: '8px',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  background: 'rgba(2, 6, 23, 0.4)',
  width: '100%'
}

const dynamicBoxStyle = {
  background: 'rgba(2, 6, 23, 0.45)',
  padding: '20px',
  borderRadius: '14px',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  marginTop: '15px',
  marginBottom: '15px'
}

const resumeBoxStyle = {
  background: 'rgba(2, 6, 23, 0.45)',
  padding: '20px',
  borderRadius: '14px',
  border: '1px dashed rgba(148, 163, 184, 0.3)',
  marginBottom: '10px'
}

const addEntryButtonStyle = {
  padding: '12px 20px',
  background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(99,102,241,0.2))',
  color: '#38bdf8',
  border: '1px solid rgba(56,189,248,0.35)',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  marginTop: '8px',
  transition: 'all 0.2s ease'
}

const removeEntryButtonStyle = {
  padding: '6px 14px',
  background: 'rgba(220, 38, 38, 0.1)',
  color: '#fca5a5',
  border: '1px solid rgba(220, 38, 38, 0.35)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '12px'
}

export default SignUp
