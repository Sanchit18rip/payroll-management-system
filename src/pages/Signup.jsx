import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [idProofFile, setIdProofFile] = useState(null) // NEW

  const [user, setUser] = useState({
    email: '',
    password: '',
    fullName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    marriageDate: '',           // NEW
    spouseName: '',             // NEW
    spouseOccupation: '',       // NEW
    spousePhone: '',            // NEW
    hasChildren: '',            // NEW
    numberOfChildren: '',       // NEW
    childrenNames: '',          // NEW
    mobileNumber: '',
    presentAddress: '',
    permanentAddress: '',
    fatherName: '',
    fatherOccupation: '',
    fatherPhone: '',
    motherName: '',
    motherOccupation: '',
    motherPhone: '',
    employmentStatus: '',
    hasInternship: '',
    internCompany: '',
    internStipend: '',
    internDepartment: '',
    pastCompany: '',
    pastDesignation: '',
    joiningYear: '',
    leavingYear: '',
    reasonForLeaving: '',
    totalExperienceYears: '',
    linkedinUrl: '',
    githubUrl: '',                     // NEW
    portfolioUrl: '',                  // NEW
    skills: '',
    languagesKnown: '',                // NEW
    certifications: '',                // NEW
    expectedSalary: '',                // NEW
    noticePeriodDays: '',              // NEW
    willingToRelocate: '',             // NEW
    emergencyContactName: '',
    emergencyContactPhone: '',
    bankAccountNumber: '',             // NEW
    bankName: '',                      // NEW
    ifscCode: '',                      // NEW
    panNumber: '',                     // NEW
    aadharNumber: '',                  // NEW
    reference1Name: '',                // NEW
    reference1Designation: '',         // NEW
    reference1Phone: '',               // NEW
    reference2Name: '',                // NEW
    reference2Designation: '',         // NEW
    reference2Phone: ''                // NEW
  })

  // NEW - dynamic education entries (10th, 12th, Diploma, Degree, Masters, PhD, Certification...)
  const [educationEntries, setEducationEntries] = useState([
    { level: '', institution: '', admissionYear: '', passingYear: '', marksOrCgpa: '', certificateFile: null }
  ])

  const handleChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }))
  }

  // NEW - education entry handlers
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
      // Step 1: Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      })
      if (authError) throw authError

      let resumeUrl = null
      let idProofUrl = null // NEW

      // Step 2: Upload Resume to Supabase Storage
      if (resumeFile && authData?.user) {
        const fileExt = resumeFile.name.split('.').pop()
        const fileName = `${authData.user.id}_resume.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName)

        resumeUrl = urlData.publicUrl
      }

      // Step 2b: NEW - Upload ID Proof to Supabase Storage
      if (idProofFile && authData?.user) {
        const fileExt = idProofFile.name.split('.').pop()
        const fileName = `${authData.user.id}_id_proof.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('id-proofs')
          .upload(fileName, idProofFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('id-proofs')
          .getPublicUrl(fileName)

        idProofUrl = urlData.publicUrl
      }

      // Step 2c: NEW - Upload each education certificate
      const uploadedEducationEntries = []
      if (authData?.user) {
        for (let i = 0; i < educationEntries.length; i++) {
          const entry = educationEntries[i]
          let certificateUrl = null

          if (entry.certificateFile) {
            const fileExt = entry.certificateFile.name.split('.').pop()
            const fileName = `${authData.user.id}_education_${i}.${fileExt}`

            const { error: certUploadError } = await supabase.storage
              .from('education-certificates')
              .upload(fileName, entry.certificateFile)

            if (certUploadError) throw certUploadError

            const { data: certUrlData } = supabase.storage
              .from('education-certificates')
              .getPublicUrl(fileName)

            certificateUrl = certUrlData.publicUrl
          }

          uploadedEducationEntries.push({
            level: entry.level,
            institution: entry.institution,
            admission_year: entry.admissionYear,
            passing_year: entry.passingYear,
            marks_or_cgpa: entry.marksOrCgpa,
            certificate_url: certificateUrl
          })
        }
      }

      // Step 3: Insert profile into Supabase table
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
            marriage_date: user.marriageDate || null,                                        // NEW
            spouse_name: user.spouseName,                                                     // NEW
            spouse_occupation: user.spouseOccupation,                                         // NEW
            spouse_phone: user.spousePhone,                                                   // NEW
            has_children: user.hasChildren,                                                   // NEW
            number_of_children: user.numberOfChildren ? parseInt(user.numberOfChildren) : null, // NEW
            children_names: user.childrenNames,                                               // NEW
            mobile_number: user.mobileNumber,
            present_address: user.presentAddress,
            permanent_address: user.permanentAddress,
            education_history: uploadedEducationEntries,                                      // NEW (jsonb column)
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
            github_url: user.githubUrl,                       // NEW
            portfolio_url: user.portfolioUrl,                 // NEW
            skills: user.skills,
            languages_known: user.languagesKnown,             // NEW
            certifications: user.certifications,               // NEW
            expected_salary: user.expectedSalary ? parseInt(user.expectedSalary) : null, // NEW
            notice_period_days: user.noticePeriodDays ? parseInt(user.noticePeriodDays) : null, // NEW
            willing_to_relocate: user.willingToRelocate,       // NEW
            emergency_contact_name: user.emergencyContactName,
            emergency_contact_phone: user.emergencyContactPhone,
            bank_account_number: user.bankAccountNumber,       // NEW
            bank_name: user.bankName,                          // NEW
            ifsc_code: user.ifscCode,                          // NEW
            pan_number: user.panNumber,                        // NEW
            aadhar_number: user.aadharNumber,                  // NEW
            reference1_name: user.reference1Name,               // NEW
            reference1_designation: user.reference1Designation, // NEW
            reference1_phone: user.reference1Phone,             // NEW
            reference2_name: user.reference2Name,               // NEW
            reference2_designation: user.reference2Designation, // NEW
            reference2_phone: user.reference2Phone,             // NEW
            resume_url: resumeUrl,
            id_proof_url: idProofUrl,                          // NEW
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

  return (
    <div style={pageWrapperStyle}>
      <div style={containerStyle}>
        <div style={warningBoxStyle}>
          <strong>⚠️ IMPORTANT NOTE:</strong> You can only sign up once! Please fill all details carefully. Multiple registrations are strictly prohibited.
        </div>

        <h1 style={titleStyle}>Employee Registration &amp; Onboarding Form</h1>
        <p style={subtitleStyle}>
          Provide complete details to register into the Corporate Payroll Management System
        </p>

        <form onSubmit={handleSignUp}>

          {/* ACCOUNT DETAILS */}
          <h2 style={sectionTitleStyle}>Account Credentials</h2>
          <div style={formGridStyle}>
            <input type="email" placeholder="Email Address *" required value={user.email} onChange={(e) => handleChange('email', e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Password *" required value={user.password} onChange={(e) => handleChange('password', e.target.value)} style={inputStyle} />
          </div>

          {/* PERSONAL DETAILS */}
          <h2 style={sectionTitleStyle}>Personal Details</h2>
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

          {/* MARRIAGE & FAMILY - NEW */}
          {user.maritalStatus === 'Married' && (
            <div style={dynamicBoxStyle}>
              <h3 style={subSectionTitle}>Marriage &amp; Spouse Details</h3>
              <div style={formGridStyle}>
                <input type="date" placeholder="Marriage Date" value={user.marriageDate} onChange={(e) => handleChange('marriageDate', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse's Name" value={user.spouseName} onChange={(e) => handleChange('spouseName', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse's Occupation" value={user.spouseOccupation} onChange={(e) => handleChange('spouseOccupation', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Spouse's Contact Number" value={user.spousePhone} onChange={(e) => handleChange('spousePhone', e.target.value)} style={inputStyle} />
              </div>

              <h3 style={{ ...subSectionTitle, marginTop: '16px' }}>Children Details</h3>
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
                <textarea placeholder="Children's Names & Ages (e.g., Riya - 5 years, Arjun - 2 years)" value={user.childrenNames} onChange={(e) => handleChange('childrenNames', e.target.value)} style={{ ...inputStyle, height: '60px', marginTop: '16px' }} />
              )}
            </div>
          )}

          {/* EMERGENCY CONTACT */}
          <h2 style={sectionTitleStyle}>Emergency Contact</h2>
          <div style={formGridStyle}>
            <input type="text" placeholder="Emergency Contact Name" value={user.emergencyContactName} onChange={(e) => handleChange('emergencyContactName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Emergency Contact Phone" value={user.emergencyContactPhone} onChange={(e) => handleChange('emergencyContactPhone', e.target.value)} style={inputStyle} />
          </div>

          {/* EDUCATION DETAILS - NEW: fully dynamic, add as many as needed */}
          <h2 style={sectionTitleStyle}>Education Background</h2>
          {educationEntries.map((entry, index) => (
            <div key={index} style={dynamicBoxStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={subSectionTitle}>Education Entry {index + 1}</h3>
                {educationEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducationEntry(index)}
                    style={removeEntryButtonStyle}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div style={formGridStyle}>
                <select
                  value={entry.level}
                  onChange={(e) => updateEducationField(index, 'level', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select Level</option>
                  <option value="10th">10th</option>
                  <option value="12th">12th</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Degree">Degree (B.E./B.Com/B.Sc/etc.)</option>
                  <option value="Masters">Masters (M.E./MBA/M.Sc/etc.)</option>
                  <option value="PhD">PhD</option>
                  <option value="Certification">Certification Course</option>
                </select>
                <input
                  type="text"
                  placeholder="School / College / University Name"
                  value={entry.institution}
                  onChange={(e) => updateEducationField(index, 'institution', e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Admission Year"
                  value={entry.admissionYear}
                  onChange={(e) => updateEducationField(index, 'admissionYear', e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Passing Year"
                  value={entry.passingYear}
                  onChange={(e) => updateEducationField(index, 'passingYear', e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Marks % / CGPA"
                  value={entry.marksOrCgpa}
                  onChange={(e) => updateEducationField(index, 'marksOrCgpa', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginTop: '12px' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
                  Upload Certificate (optional, PDF/Image, max 5MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => updateEducationFile(index, e.target.files[0])}
                  style={{ color: '#f8fafc', fontSize: '14px' }}
                />
                {entry.certificateFile && (
                  <p style={{ color: '#4ade80', fontSize: '13px', marginTop: '6px' }}>
                    ✅ Selected: {entry.certificateFile.name}
                  </p>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addEducationEntry} style={addEntryButtonStyle}>
            + Add Another Education Entry
          </button>

          {/* FAMILY DETAILS */}
          <h2 style={sectionTitleStyle}>Family Information</h2>
          <div style={formGridStyle}>
            <input type="text" placeholder="Father's Name" value={user.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Father's Occupation" value={user.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Father's Contact Number" value={user.fatherPhone} onChange={(e) => handleChange('fatherPhone', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Mother's Name" value={user.motherName} onChange={(e) => handleChange('motherName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Mother's Occupation" value={user.motherOccupation} onChange={(e) => handleChange('motherOccupation', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Mother's Contact Number" value={user.motherPhone} onChange={(e) => handleChange('motherPhone', e.target.value)} style={inputStyle} />
          </div>

          {/* BANK & GOVERNMENT ID DETAILS - NEW */}
          <h2 style={sectionTitleStyle}>Bank &amp; Government ID Details</h2>
          <div style={formGridStyle}>
            <input type="text" placeholder="Bank Account Number" value={user.bankAccountNumber} onChange={(e) => handleChange('bankAccountNumber', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Bank Name" value={user.bankName} onChange={(e) => handleChange('bankName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="IFSC Code" value={user.ifscCode} onChange={(e) => handleChange('ifscCode', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="PAN Number" value={user.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Aadhar Number" value={user.aadharNumber} onChange={(e) => handleChange('aadharNumber', e.target.value)} style={inputStyle} />
          </div>
          <div style={resumeBoxStyle}>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
              Upload ID Proof (Aadhar / PAN card scan, PDF or Image, max 5MB)
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setIdProofFile(e.target.files[0])}
              style={{ color: '#f8fafc', fontSize: '14px' }}
            />
            {idProofFile && (
              <p style={{ color: '#4ade80', fontSize: '13px', marginTop: '8px' }}>
                ✅ Selected: {idProofFile.name}
              </p>
            )}
          </div>

          {/* PROFESSIONAL INFO */}
          <h2 style={sectionTitleStyle}>Professional Information</h2>
          <div style={formGridStyle}>
            <input type="url" placeholder="LinkedIn Profile URL" value={user.linkedinUrl} onChange={(e) => handleChange('linkedinUrl', e.target.value)} style={inputStyle} />
            <input type="url" placeholder="GitHub Profile URL" value={user.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} style={inputStyle} />
            <input type="url" placeholder="Portfolio / Personal Website URL" value={user.portfolioUrl} onChange={(e) => handleChange('portfolioUrl', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Languages Known (e.g., English, Hindi, Marathi)" value={user.languagesKnown} onChange={(e) => handleChange('languagesKnown', e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Expected Salary (per month)" value={user.expectedSalary} onChange={(e) => handleChange('expectedSalary', e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Notice Period (in days)" value={user.noticePeriodDays} onChange={(e) => handleChange('noticePeriodDays', e.target.value)} style={inputStyle} />
            <select value={user.willingToRelocate} onChange={(e) => handleChange('willingToRelocate', e.target.value)} style={inputStyle}>
              <option value="">Willing to Relocate?</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <textarea
            placeholder="Skills (e.g., React, Node.js, Excel, Communication...)"
            value={user.skills}
            onChange={(e) => handleChange('skills', e.target.value)}
            style={{ ...inputStyle, height: '80px', marginTop: '16px' }}
          />
          <textarea
            placeholder="Certifications / Online Courses (e.g., AWS Certified, Google Data Analytics...)"
            value={user.certifications}
            onChange={(e) => handleChange('certifications', e.target.value)}
            style={{ ...inputStyle, height: '80px', marginTop: '16px' }}
          />

          {/* REFERENCES - NEW */}
          <h2 style={sectionTitleStyle}>Professional References</h2>
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

          {/* RESUME UPLOAD */}
          <h2 style={sectionTitleStyle}>Resume Upload</h2>
          <div style={resumeBoxStyle}>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px' }}>
              Upload your resume (PDF or DOC format, max 5MB)
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              style={{ color: '#f8fafc', fontSize: '14px' }}
            />
            {resumeFile && (
              <p style={{ color: '#4ade80', fontSize: '13px', marginTop: '8px' }}>
                ✅ Selected: {resumeFile.name}
              </p>
            )}
          </div>

          {/* PROFESSIONAL STATUS */}
          <h2 style={sectionTitleStyle}>Professional Status</h2>
          <div style={{ marginBottom: '20px' }}>
            <select required value={user.employmentStatus} onChange={(e) => handleChange('employmentStatus', e.target.value)} style={inputStyle}>
              <option value="">Are you a Fresher or Experienced? *</option>
              <option value="Fresher">Fresher</option>
              <option value="Experienced">Experienced</option>
            </select>
          </div>

          {/* FRESHER */}
          {user.employmentStatus === 'Fresher' && (
            <div style={dynamicBoxStyle}>
              <h3 style={subSectionTitle}>Internship Details</h3>
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

          {/* EXPERIENCED */}
          {user.employmentStatus === 'Experienced' && (
            <div style={dynamicBoxStyle}>
              <h3 style={subSectionTitle}>Previous Job History</h3>
              <div style={formGridStyle}>
                <input type="text" placeholder="Previous Company Name" value={user.pastCompany} onChange={(e) => handleChange('pastCompany', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Designation" value={user.pastDesignation} onChange={(e) => handleChange('pastDesignation', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Joining Year" value={user.joiningYear} onChange={(e) => handleChange('joiningYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Leaving Year" value={user.leavingYear} onChange={(e) => handleChange('leavingYear', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="Total Experience (in Years)" value={user.totalExperienceYears} onChange={(e) => handleChange('totalExperienceYears', e.target.value)} style={inputStyle} />
              </div>
              <textarea placeholder="Reason for leaving last job?" value={user.reasonForLeaving} onChange={(e) => handleChange('reasonForLeaving', e.target.value)} style={{ ...inputStyle, height: '60px', marginTop: '16px' }} />
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            ...buttonStyle,
            background: loading ? '#93c5fd' : '#2563eb',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Processing Registration...' : 'Complete Employee Registration'}
          </button>
        </form>
      </div>
    </div>
  )
}

const pageWrapperStyle = {
  minHeight: '100vh',
  background: '#0f172a',
  padding: '40px 20px'
}

const containerStyle = {
  maxWidth: '850px',
  margin: '0 auto',
  padding: '40px',
  background: '#1e293b',
  borderRadius: '24px',
  border: '1px solid #334155',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
}

const warningBoxStyle = {
  background: 'rgba(220, 38, 38, 0.1)',
  border: '1px solid #dc2626',
  color: '#fca5a5',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '24px',
  fontSize: '14px',
  fontWeight: '500'
}

const titleStyle = {
  fontSize: '30px',
  fontWeight: '700',
  color: '#f8fafc',
  marginBottom: '8px',
  textAlign: 'center'
}

const subtitleStyle = {
  fontSize: '14px',
  color: '#94a3b8',
  marginBottom: '30px',
  textAlign: 'center'
}

const sectionTitleStyle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#f8fafc',
  borderBottom: '2px solid #334155',
  paddingBottom: '10px',
  marginTop: '35px',
  marginBottom: '20px'
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
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid #475569',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#0f172a',
  color: '#f8fafc'
}

const dynamicBoxStyle = {
  background: '#0f172a',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #334155',
  marginTop: '15px',
  marginBottom: '15px'
}

const resumeBoxStyle = {
  background: '#0f172a',
  padding: '20px',
  borderRadius: '12px',
  border: '1px dashed #475569',
  marginBottom: '10px'
}

const addEntryButtonStyle = {
  padding: '10px 18px',
  background: '#1e40af',
  color: '#ffffff',
  border: '1px solid #3b82f6',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  marginTop: '4px'
}

const removeEntryButtonStyle = {
  padding: '6px 14px',
  background: 'rgba(220, 38, 38, 0.15)',
  color: '#fca5a5',
  border: '1px solid #dc2626',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '12px'
}

const buttonStyle = {
  width: '100%',
  padding: '14px',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '600',
  marginTop: '40px',
  boxShadow: '0 4px 20px rgba(37,99,235,0.3)'
}

export default SignUp
