import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null) // NEW

  const [user, setUser] = useState({
    email: '',
    password: '',
    fullName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    maritalStatus: '',
    mobileNumber: '',
    presentAddress: '',
    permanentAddress: '',
    twelfthMarks: '',
    twelfthPassingYear: '',
    twelfthCollege: '',
    degreeName: '',
    degreeCgpa: '',
    degreePassingYear: '',
    degreeCollege: '',
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
    linkedinUrl: '',           // NEW
    skills: '',                // NEW
    emergencyContactName: '',  // NEW
    emergencyContactPhone: ''  // NEW
  })

  const handleChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }))
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
            mobile_number: user.mobileNumber,
            present_address: user.presentAddress,
            permanent_address: user.permanentAddress,
            twelfth_marks: user.twelfthMarks,
            twelfth_passing_year: user.twelfthPassingYear,
            twelfth_college: user.twelfthCollege,
            degree_name: user.degreeName,
            degree_cgpa: user.degreeCgpa,
            degree_passing_year: user.degreePassingYear,
            degree_college: user.degreeCollege,
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
            linkedin_url: user.linkedinUrl,           // NEW
            skills: user.skills,                      // NEW
            emergency_contact_name: user.emergencyContactName,   // NEW
            emergency_contact_phone: user.emergencyContactPhone, // NEW
            resume_url: resumeUrl,                    // NEW
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
            <input type="text" placeholder="Marital Status" value={user.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Phone Number *" required value={user.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value)} style={inputStyle} />
          </div>
          <textarea placeholder="Present Address" value={user.presentAddress} onChange={(e) => handleChange('presentAddress', e.target.value)} style={{ ...inputStyle, height: '80px', marginTop: '16px' }} />
          <textarea placeholder="Permanent Address" value={user.permanentAddress} onChange={(e) => handleChange('permanentAddress', e.target.value)} style={{ ...inputStyle, height: '80px', marginTop: '16px' }} />

          {/* EMERGENCY CONTACT - NEW */}
          <h2 style={sectionTitleStyle}>Emergency Contact</h2>
          <div style={formGridStyle}>
            <input type="text" placeholder="Emergency Contact Name" value={user.emergencyContactName} onChange={(e) => handleChange('emergencyContactName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Emergency Contact Phone" value={user.emergencyContactPhone} onChange={(e) => handleChange('emergencyContactPhone', e.target.value)} style={inputStyle} />
          </div>

          {/* EDUCATION DETAILS */}
          <h2 style={sectionTitleStyle}>Education Background</h2>
          <h3 style={subSectionTitle}>12th / Diploma Details</h3>
          <div style={formGridStyle}>
            <input type="text" placeholder="12th Marks / Percentage" value={user.twelfthMarks} onChange={(e) => handleChange('twelfthMarks', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Passing Year" value={user.twelfthPassingYear} onChange={(e) => handleChange('twelfthPassingYear', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="School / College Name" value={user.twelfthCollege} onChange={(e) => handleChange('twelfthCollege', e.target.value)} style={inputStyle} />
          </div>

          <h3 style={subSectionTitle}>Degree / Graduation Details</h3>
          <div style={formGridStyle}>
            <input type="text" placeholder="Degree Name (e.g., B.E., B.Com)" value={user.degreeName} onChange={(e) => handleChange('degreeName', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Final CGPA / Percentage" value={user.degreeCgpa} onChange={(e) => handleChange('degreeCgpa', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Passing Year" value={user.degreePassingYear} onChange={(e) => handleChange('degreePassingYear', e.target.value)} style={inputStyle} />
            <input type="text" placeholder="University / College Name" value={user.degreeCollege} onChange={(e) => handleChange('degreeCollege', e.target.value)} style={inputStyle} />
          </div>

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

          {/* PROFESSIONAL INFO - NEW */}
          <h2 style={sectionTitleStyle}>Professional Information</h2>
          <div style={formGridStyle}>
            <input type="url" placeholder="LinkedIn Profile URL" value={user.linkedinUrl} onChange={(e) => handleChange('linkedinUrl', e.target.value)} style={inputStyle} />
          </div>
          <textarea
            placeholder="Skills (e.g., React, Node.js, Excel, Communication...)"
            value={user.skills}
            onChange={(e) => handleChange('skills', e.target.value)}
            style={{ ...inputStyle, height: '80px', marginTop: '16px' }}
          />

          {/* RESUME UPLOAD - NEW */}
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