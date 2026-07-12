import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { supabase } from '../supabaseClient'
import * as faceapi from 'face-api.js'

import ChatbotWidget from '../components/ChatbotWidget'

const API_BASE = 'https://payroll-management-system-owo2.onrender.com'

function EmployeeDashboard() {

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null)
  const [payableSalary, setPayableSalary] = useState(0)
  const [leavePopup, setLeavePopup] = useState(false);

const [leavePopupMessage, setLeavePopupMessage] = useState("");
  const [attendance, setAttendance] = useState([])
  const [attendanceSummary, setAttendanceSummary] = useState({
    present_days: 0,
    absent_days: 0,
    paid_leave_days: 0,
    total_days: 0
  })
  const [leaveBalance, setLeaveBalance] = useState({
    available_leaves: 0,
    total_leaves_earned: 0
  })
  const [leaves, setLeaves] = useState([])
  const [performance, setPerformance] = useState([])
  const [increments, setIncrements] = useState([])
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // Terms & Conditions
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [termsChecked, setTermsChecked] = useState(false)
  const [acceptingTerms, setAcceptingTerms] = useState(false)
const [showTerms, setShowTerms] = useState(false);
  // Face Recognition Attendance (FRAS)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [faceEnrolled, setFaceEnrolled] = useState(true)
  const [cameraMode, setCameraMode] = useState(null) 
  const [cameraBusy, setCameraBusy] = useState(false)
  const [cameraMessage, setCameraMessage] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const handleLogout = async () => {

  await supabase.auth.signOut();

  navigate("/login");

};
  useEffect(() => {

    const loadModels = async () => {

      try {
await faceapi.nets.faceRecognitionNet.loadFromUri(
  `${import.meta.env.BASE_URL}models`
);

await faceapi.nets.faceLandmark68Net.loadFromUri(
  `${import.meta.env.BASE_URL}models`
);

await faceapi.nets.tinyFaceDetector.loadFromUri(
  `${import.meta.env.BASE_URL}models`
);

        setModelsLoaded(true)

      }

      catch (err) {
        console.log('Failed to load face-api models', err)
      }

    }

    loadModels()

  }, [])

  const stopCamera = () => {

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setCameraMode(null)
    setCameraMessage('')

  }

  const openCamera = async (mode) => {

    if (!modelsLoaded) {
      alert('Face recognition is still loading, please wait a moment and try again.')
      return
    }

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      streamRef.current = stream
      setCameraMode(mode)
      setCameraMessage('')

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)

    }

    catch (err) {
      console.log(err)
      alert('Camera access is required for this. Please allow camera permission.')
    }

  }

  const captureDescriptor = async () => {

    if (!videoRef.current) return null

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      setCameraMessage('No face detected. Please face the camera clearly and try again.')
      return null
    }

    return detection.descriptor

  }

  const captureSnapshotDataUrl = () => {

    const video = videoRef.current

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    canvas.getContext('2d').drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)

  }

  const dataUrlToBlob = (dataUrl) => {

    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])

    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new Blob([u8arr], { type: mime })

  }

  const submitFaceEnrollment = async () => {

    setCameraBusy(true)
    setCameraMessage('')

    try {

      const descriptor = await captureDescriptor()

      if (!descriptor) {
        setCameraBusy(false)
        return
      }

      const res = await fetch(`${API_BASE}/api/employees/${employee.id}/face-enroll`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  face_descriptor: Array.from(descriptor)
})
      })

      if (!res.ok) {
        throw new Error('Enrollment failed')
      }

      setFaceEnrolled(true)
      stopCamera()
      alert('Face enrolled successfully! You can now use Mark My Attendance daily.')

    }

    catch (err) {
      console.log(err)
      setCameraMessage('Something went wrong while enrolling your face. Please try again.')
    }

    finally {
      setCameraBusy(false)
    }

  }

  const submitAttendanceMark = async () => {

    setCameraBusy(true)
    setCameraMessage('')

    try {

      const liveDescriptor = await captureDescriptor()

      if (!liveDescriptor) {
        setCameraBusy(false)
        return
      }

      const storedDescriptor = new Float32Array(JSON.parse(employee.face_descriptor))
      const distance = faceapi.euclideanDistance(storedDescriptor, liveDescriptor)
      const faceMatch = distance < 0.6

      if (!faceMatch) {
        setCameraMessage('Face not recognized. Please make sure it is really you and try again.')
        setCameraBusy(false)
        return
      }

      navigator.geolocation.getCurrentPosition(async (position) => {

        try {

          const { latitude, longitude } = position.coords

          const dataUrl = captureSnapshotDataUrl()
          const blob = dataUrlToBlob(dataUrl)
          const fileName = `${employee.id}_${Date.now()}.jpg`

          const { error: uploadError } = await supabase.storage
            .from('attendance-photos')
            .upload(fileName, blob)

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('attendance-photos')
            .getPublicUrl(fileName)
          console.log("Sending attendance request...");
          
          const res = await fetch(`${API_BASE}/api/attendance/self-mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employee_id: employee.id,
              photo_url: urlData.publicUrl,
              latitude,
              longitude,
              face_match: true,
              face_distance: distance
            })
          })
          console.log("Response Status:", res.status);

          const result = await res.json()
          console.log(result);
          if (!res.ok) {
            setCameraMessage(result.message || 'Could not mark attendance.')
            setCameraBusy(false)
            return
          }

          alert('Attendance marked as Present!')
          stopCamera()
          setCameraBusy(false)
          loadDashboard(employee.id)

        }

        catch (err) {
          console.log(err)
          setCameraMessage('Something went wrong while marking attendance.')
          setCameraBusy(false)
        }

      }, () => {
        setCameraMessage('Location access is required to mark attendance. Please allow location permission.')
        setCameraBusy(false)
      })

    }

    catch (err) {
      console.log(err)
      setCameraMessage('Something went wrong. Please try again.')
      setCameraBusy(false)
    }

  }

  // Apply for leave form
  const [leaveType, setLeaveType] = useState('Unpaid Leave')
  const [halfDaySession, setHalfDaySession] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [applying, setApplying] = useState(false)

  const loadDashboard = useCallback(async (employeeId) => {

    try {

      const res = await fetch(
        `${API_BASE}/api/employee-dashboard/${employeeId}`
      )

      if (!res.ok) {
        throw new Error('Could not load dashboard data')
      }

      const data = await res.json()

      setEmployee(data.employee)
      setTermsAccepted(!!data.employee.terms_accepted_at)
      setFaceEnrolled(!!data.employee.face_descriptor)
      setPayableSalary(data.payableSalary ?? 0)
      setAttendance(data.attendance)
      setAttendanceSummary(data.attendanceSummary)
      setLeaveBalance(data.leaveBalance)
      setLeaves(data.leaves)
      setPerformance(data.performance)
      setIncrements(data.increments || [])

    }

    catch (err) {

      console.log(err)
      setErrorMsg('Something went wrong while loading your dashboard.')

    }

  }, [])

  useEffect(() => {

    const init = async () => {

      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {

        setErrorMsg('You need to be logged in to view this page.')
        setLoading(false)
        return

      }

      setUserEmail(user.email)

      try {

        const empRes = await fetch(
          `${API_BASE}/api/employees/by-email/${encodeURIComponent(user.email)}`
        )

        if (!empRes.ok) {

          setErrorMsg(
            `No employee profile is linked to ${user.email} yet. Please ask HR to add this email against your employee record.`
          )
          setLoading(false)
          return

        }

        const empData = await empRes.json()

        await loadDashboard(empData.id)

      }

      catch (err) {

        console.log(err)
        setErrorMsg('Something went wrong while loading your dashboard.')

      }

      setLoading(false)

    }

    init()

  }, [loadDashboard])


  useEffect(() => {

    if (!employee?.id) return

    const interval = setInterval(() => {
      loadDashboard(employee.id)
    }, 8000)

    return () => clearInterval(interval)

  }, [employee?.id, loadDashboard])


  useEffect(() => {

  if (
    employee?.employment_status === "Probation" ||
    employee?.employment_status === "Intern"
  ) {

    setLeaveType("Unpaid Leave");
    setHalfDaySession("");

  }

}, [employee])

  const applyLeave = () => {

    if (!leaveType || !startDate || !endDate || !reason) {
      alert('Please fill all the leave details')
      return
    }

    if (leaveType === 'Half Day' && !halfDaySession) {
      alert('Please select Half Day Session.')
      return
    }

    if (leaveType !== "Unpaid Leave") {

  const start = new Date(startDate);

  const end = new Date(endDate);

  if (end < start) {

    alert("End date cannot be earlier than Start date.");

    return;

  }

  const requestedDays =
    leaveType === "Half Day"
      ? 0.5
      : Math.ceil(
          (end - start) /
            (1000 * 60 * 60 * 24)
        ) + 1;
  if (
  leaveType === "Half Day" &&
  startDate !== endDate
) {

  alert(
    "Half Day Leave can only be applied for one day."
  );

  return;

}
  const availableLeaves =
    Number(leaveBalance.available_leaves);

  if (requestedDays > availableLeaves) {

    alert(
      `Insufficient Leave Balance.

You have only ${availableLeaves} leave(s) available.

You requested ${requestedDays} day(s).`
    );

    return;

  }

}

    setApplying(true)

    fetch(`${API_BASE}/api/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: employee.id,
        leave_type: leaveType,
        half_day_session: halfDaySession,
        start_date: startDate,
        end_date: endDate,
        reason
      })
    })
      .then(res => res.json())
      .then(() => {

        alert('Leave application submitted!')

        setStartDate('')
        setEndDate('')
        setReason('')
        setHalfDaySession('')

        return loadDashboard(employee.id)

      })
      .catch(err => {
        console.log(err)
        alert('Something went wrong while applying for leave')
      })
      .finally(() => setApplying(false))

  }

  const acceptTerms = () => {

    if (!termsChecked) return

    setAcceptingTerms(true)

    fetch(`${API_BASE}/api/employees/${employee.id}/accept-terms`, {
      method: 'PUT'
    })
      .then(res => res.json())
      .then(() => {
        setTermsAccepted(true)
      })
      .catch(err => {
        console.log(err)
        alert('Something went wrong while accepting Terms & Conditions. Please try again.')
      })
      .finally(() => setAcceptingTerms(false))

  }

 

  if (loading) {
    return (
      <div style={centerScreen}>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading your dashboard...</p>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div style={centerScreen}>
        <div style={errorCard}>
          <div style={{ fontSize: '36px', marginBottom: '14px' }}>⚠️</div>
          <h2 style={{ color: '#f8fafc', marginBottom: '10px' }}>Can't load your dashboard</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6' }}>{errorMsg}</p>
          {userEmail && (
            <p style={{ color: '#64748b', fontSize: '13px', marginTop: '14px' }}>
              Logged in as: {userEmail}
            </p>
          )}
        </div>
      </div>
    )
  }

  

  const attendancePercentage =
    attendanceSummary.total_days > 0
      ? (
          ((Number(attendanceSummary.present_days) + Number(attendanceSummary.paid_leave_days)) /
            Number(attendanceSummary.total_days)) * 100
        ).toFixed(1)
      : 0

  const averageRating =
    performance.length > 0
      ? (
          performance.reduce((total, p) => total + Number(p.rating), 0) / performance.length
        ).toFixed(1)
      : 0

  const attendanceChartData = [
    { name: 'Present', value: Number(attendanceSummary.present_days) },
    { name: 'Absent', value: Number(attendanceSummary.absent_days) },
    { name: 'Paid Leave', value: Number(attendanceSummary.paid_leave_days) }
  ]

  const performanceChartData = performance
    .slice()
    .reverse()
    .map((p, i) => ({
      review: `#${i + 1}`,
      rating: Number(p.rating)
    }))

  const COLORS = ['#22c55e', '#ef4444', '#a855f7']

  const statusStyle = (status) => ({
    color: status === 'Approved' ? '#16a34a' : status === 'Rejected' ? '#dc2626' : '#d97706',
    background: status === 'Approved' ? '#dcfce7' : status === 'Rejected' ? '#fee2e2' : '#fef3c7',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700'
  })

 
console.log(increments);


  return (
    <div style={pageContainer}>
    <div
  style={{
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999
  }}
>
  <button
    onClick={() => setShowLogoutModal(true)}
    style={{
      background: "#dc2626",
      color: "#fff",
      border: "none",
      padding: "12px 22px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "15px",
      boxShadow: "0 6px 20px rgba(0,0,0,.3)"
    }}
  >
    🚪 Logout
  </button>
</div>
      {(!termsAccepted || showTerms) && (
        <div style={termsOverlay}>
          <div style={termsBox}>
            <h2 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '14px' }}>
              Terms &amp; Conditions
            </h2>
            <div style={termsTextBox}>
              <p><strong>Talent Pay Corner - Terms & Conditions</strong></p>
              <p><small>Last Updated: 08/07/2026</small></p>
              <br />
              <p>Welcome to Talent Pay Corner, an HR and Payroll Management Platform. By accessing, registering, or using this platform, you agree to the following Terms and Conditions.</p>
              <br />
              
              <p><strong>1. Use of the Platform</strong></p>
              <p>Talent Pay Corner provides services including employee management, payroll processing, attendance tracking, leave management, tax records, salary slips, and HR support.</p>
              <br />

              <p><strong>2. User Responsibilities</strong></p>
              <p>Users agree to:</p>
              <p>• Provide accurate and updated information.</p>
              <p>• Maintain the confidentiality of login credentials.</p>
              <p>• Use the platform only for authorized and lawful purposes.</p>
              <p>• Report any unauthorized access or security concerns immediately.</p>
              <br />

              <p><strong>3. Payroll & Employee Data</strong></p>
              <p>The platform may store and process employee information such as:</p>
              <p>• Personal and contact details</p>
              <p>• Attendance and leave records</p>
              <p>• Salary and payroll information</p>
              <p>• Tax and statutory records</p>
              <p>Users are responsible for ensuring that their information is accurate and up to date.</p>
              <br />

              <p><strong>4. Confidentiality</strong></p>
              <p>All payroll and employee information available on the platform is confidential. Users must not share, copy, distribute, or misuse any data without proper authorization.</p>
              <br />

              <p><strong>5. Prohibited Activities</strong></p>
              <p>Users shall not:</p>
              <p>• Attempt unauthorized access to any account or data.</p>
              <p>• Upload malicious software or harmful content.</p>
              <p>• Modify, manipulate, or misuse payroll records.</p>
              <p>• Disrupt the operation or security of the platform.</p>
              <br />

              <p><strong>6. Monitoring</strong></p>
              <p>Talent Pay Corner may monitor platform activity, maintain audit logs, and review system usage for security, compliance, and operational purposes.</p>
              <br />

              <p><strong>7. Service Availability</strong></p>
              <p>While we strive to provide uninterrupted service, we do not guarantee continuous availability. Services may be temporarily unavailable due to maintenance, upgrades, or technical issues.</p>
              <br />

              <p><strong>8. Limitation of Liability</strong></p>
              <p>Talent Pay Corner shall not be liable for any indirect losses, data loss, service interruptions, or damages arising from unauthorized use of the platform.</p>
              <br />

              <p><strong>9. Changes to Terms</strong></p>
              <p>We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform after updates constitutes acceptance of the revised Terms.</p>
              <br />

              <p><strong>10. Governing Law</strong></p>
              <p>These Terms and Conditions shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts of Mumbai, Maharashtra.</p>
              <br />
              
              <hr style={{ borderColor: '#334155', margin: '15px 0' }} />
              
              <p><strong>User Consent</strong></p>
              <p>By clicking "I Agree", you confirm that:</p>
              <p>✔ You have read and understood these Terms and Conditions.</p>
              <p>✔ You agree to the collection and processing of your information for HR and payroll administration purposes.</p>
              <p>✔ You will comply with all applicable company policies and legal requirements.</p>
            </div>

            <label style={termsCheckboxRow}>
              <input
                type="checkbox"
                checked={termsChecked}
                onChange={(e) => setTermsChecked(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: '#cbd5e1', fontSize: '14px' }}>
                I have read and accept the Terms &amp; Conditions
              </span>
            </label>

            <button
              onClick={() => {

  if (!termsAccepted) {

    acceptTerms();

  } else {

    setShowTerms(false);

  }

}}
              disabled={!termsChecked || acceptingTerms}
              style={{
                ...primaryButton,
                opacity: (!termsChecked || acceptingTerms) ? 0.5 : 1,
                cursor: (!termsChecked || acceptingTerms) ? 'not-allowed' : 'pointer'
              }}
            >
              {!termsAccepted
  ? (acceptingTerms ? "Please wait..." : "I Agree")
  : "Close"}
            </button>
          </div>
        </div>
      )}


      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: '38px', marginBottom: '6px' }}>
            Welcome back, {employee.name} 👋
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            {employee.department || 'Department not set'} • {employee.email}
          </p>
        </div>
        
        <span style={{
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
          background: employee.employee_type === 'Third-Party' ? '#fef3c7' : '#dcfce7',
          color: employee.employee_type === 'Third-Party' ? '#d97706' : '#16a34a'
        }}>
          {employee.employee_type || 'Direct'} Employee
        </span>
      </div>
      <button
  onClick={() => setShowTerms(true)}
  style={{
    position: "relative",
top: "-15px",
    padding: "8px 14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  📄 View Terms & Conditions
</button>
      {/* EMPLOYMENT PROFILE */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>Employment Profile</h2>
        <div style={profileGrid}>
          <ProfileField label="Joining Date" value={employee.joining_date || 'Not set'} />
          <ProfileField
            label="Employment Status"
            value={employee.confirmation_date ? `Permanent since ${employee.confirmation_date}` : (employee.employment_status || 'Not set')}
          />
          <ProfileField label="Employee Code" value={employee.employee_code || '-'} />
          <ProfileField label="Last Job Details" value={employee.last_job_details || 'Not provided'} fullWidth />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={summaryGrid}>
        <div style={card}>
          <h3 style={cardLabel}>Net Payable Salary</h3>
          <h1 style={{ ...cardValue, color: '#22c55e' }}>₹{Number(payableSalary).toLocaleString()}</h1>
        </div>
        <div style={card}>
          <h3 style={cardLabel}>Attendance</h3>
          <h1 style={{ ...cardValue, color: '#06b6d4' }}>{attendancePercentage}%</h1>
        </div>
        <div style={card}>
          <h3 style={cardLabel}>Leave Balance</h3>
          <h1 style={{ ...cardValue, color: '#a855f7' }}>{Number(leaveBalance.available_leaves).toFixed(1)}</h1>
          <p style={cardSub}>of {Number(leaveBalance.total_leaves_earned).toFixed(1)} earned</p>
        </div>
        <div style={card}>
          <h3 style={cardLabel}>Performance</h3>
          <h1 style={{ ...cardValue, color: '#f59e0b' }}>{averageRating} ⭐</h1>
          <p style={cardSub}>{performance.length} review(s)</p>
        </div>
      </div>

      <div style={twoColumnLayout}>

        {/* LEFT COLUMN */}
        <div style={{ flex: '1 1 480px' }}>

          {/* SALARY BREAKDOWN */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Salary Breakdown</h2>
            <div style={salaryGrid}>
              <SalaryRow label="Basic Salary" value={employee.salary} />
              <SalaryRow label="HRA" value={employee.hra} />
              <SalaryRow label="TA" value={employee.ta} />
              <SalaryRow label="MA" value={employee.ma} />
              <SalaryRow label="Other Allowances" value={employee.other_allowances} />
              <SalaryRow label="Gross Salary" value={employee.gross_salary} bold />
              <SalaryRow label="PF Deduction" value={employee.pf} negative />
              <SalaryRow label="Bonus" value={employee.bonus} />
              <SalaryRow label="Other Deduction" value={employee.deduction} negative />
            </div>
            <div style={netSalaryBox}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Net Payable</span>
              <span style={{ color: '#22c55e', fontSize: '24px', fontWeight: '700' }}>
                ₹{Number(payableSalary).toLocaleString()}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>
              Gratuity accrued so far: ₹{Number(employee.gratuity || 0).toLocaleString()} (paid out at the end of tenure, not part of monthly salary)
            </p>
          </div>

          {/* MARK MY ATTENDANCE (FRAS) */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Mark My Attendance</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
              Uses your face and current location to mark today's attendance.
            </p>

            {!faceEnrolled ? (
              <div>
                <p style={{ color: '#fbbf24', fontSize: '13px', marginBottom: '12px' }}>
                  You haven't enrolled your face yet. Do this once to start marking your own attendance.
                </p>

                {cameraMode !== 'enroll' ? (
                  <button onClick={() => openCamera('enroll')} style={primaryButton}>
                    Open Camera to Enroll
                  </button>
                ) : (
                  <div>
                    <video ref={videoRef} autoPlay muted style={cameraPreview} />
                    {cameraMessage && (
                      <p style={{ color: '#f87171', fontSize: '13px', marginTop: '10px' }}>{cameraMessage}</p>
                    )}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                      <button
                        onClick={submitFaceEnrollment}
                        disabled={cameraBusy}
                        style={{ ...primaryButton, opacity: cameraBusy ? 0.6 : 1 }}
                      >
                        {cameraBusy ? 'Processing...' : 'Capture & Save'}
                      </button>
                      <button onClick={stopCamera} style={secondaryButton}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : cameraMode !== 'mark' ? (
              <button onClick={() => openCamera('mark')} style={primaryButton}>
                Mark My Attendance
              </button>
            ) : (
              <div>
                <video ref={videoRef} autoPlay muted style={cameraPreview} />
                {cameraMessage && (
                  <p style={{ color: '#f87171', fontSize: '13px', marginTop: '10px' }}>{cameraMessage}</p>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                  <button
                    onClick={submitAttendanceMark}
                    disabled={cameraBusy}
                    style={{ ...primaryButton, opacity: cameraBusy ? 0.6 : 1 }}
                  >
                    {cameraBusy ? 'Verifying...' : 'Capture & Mark Present'}
                  </button>
                  <button onClick={stopCamera} style={secondaryButton}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ATTENDANCE CHART */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Attendance Overview</h2>
            <PieChart width={300} height={250}>
              <Pie data={attendanceChartData} dataKey="value" outerRadius={80}>
                {attendanceChartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          {/* RECENT ATTENDANCE */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Recent Attendance</h2>
            {attendance.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No attendance records yet.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{row.attendance_date}</td>
                      <td style={tdStyle}>
                        <span style={statusStyle(row.status === 'Present' ? 'Approved' : row.status === 'Absent' ? 'Rejected' : 'Pending')}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* INCREMENT HISTORY */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Salary Increment History</h2>
            {increments.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No increments recorded yet.</p>
            ) : (
              increments.map((inc) => (
                <div key={inc.id} style={performanceItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#22c55e', fontWeight: '700' }}>
                      +₹{Number(inc.increment_amount).toLocaleString()} ({Number(inc.increment_percent || 0)}%)
                    </span>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>
                      {inc.effective_date ? new Date(inc.effective_date).toLocaleDateString('en-IN') : ''}
                    </span>
                  </div>
                  {inc.applicable_from_month && (
                    <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '6px 0 0' }}>
                      Applicable from: {inc.applicable_from_month}
                    </p>
                  )}
                  {inc.reason && (
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>{inc.reason}</p>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: '1 1 420px' }}>

          {/* APPLY FOR LEAVE */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>Apply for Leave</h2>

           {(employee?.employment_status === "Probation" ||
  employee?.employment_status === "Intern") && (
              <div style={probationPopup}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>⏳</div>
                <p style={{ color: '#fbbf24', fontWeight: '700', margin: '0 0 6px 0' }}>
                  You are in your Probation / Internship period
                </p>
                <p style={{ color: '#fde68a', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
                  Vacation Leave, Sick Leave and Half Day Leave are not available until you are confirmed as a Permanent employee. During this period you can only apply for Unpaid Leave.
                </p>
              </div>
            )}

            <label style={labelStyle}>Leave Type</label>
            <select value={leaveType} onChange={(e) => {

  setLeaveType(e.target.value);

  if (e.target.value === "Half Day") {
    setEndDate(startDate);
  }

}} style={inputStyle}>
              {employee?.employment_status === "Permanent" ? (
  <>
    <option value="Vacation Leave">Vacation Leave</option>
    <option value="Sick Leave">Sick Leave</option>
    <option value="Half Day">Half Day</option>
    <option value="Unpaid Leave">Unpaid Leave</option>
  </>
) : (
  <>
    <option value="Unpaid Leave">Unpaid Leave</option>
  </>
)}
            </select>

            {employee?.employment_status === "Permanent" &&
 leaveType === "Half Day" && (
              <>
                <label style={labelStyle}>Half Day Session</label>
                <select value={halfDaySession} onChange={(e) => setHalfDaySession(e.target.value)} style={inputStyle}>
                  <option value="">Select Session</option>
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </>
            )}

            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>From Date</label>
                <input type="date" value={startDate} onChange={(e) => {

  setStartDate(e.target.value);

  if (leaveType === "Half Day") {
    setEndDate(e.target.value);
  }

}} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Till Date</label>
<input
  type="date"
  value={endDate}
  min={startDate}
  disabled={leaveType === "Half Day"}
 onChange={(e) => setEndDate(e.target.value)}
  style={{
    ...inputStyle,
    opacity: leaveType === "Half Day" ? 0.6 : 1,
    cursor: leaveType === "Half Day" ? "not-allowed" : "pointer"
  }}
/>              </div>
            </div>

            <label style={labelStyle}>Reason</label>
            <textarea
              placeholder="Enter your reason here..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={textareaStyle}
            />

            <button
              onClick={applyLeave}
              disabled={applying}
              style={{
                ...primaryButton,
                opacity: applying ? 0.6 : 1,
                cursor: applying ? 'not-allowed' : 'pointer'
              }}
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          {/* MY LEAVE APPLICATIONS */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>My Leave Applications</h2>
            {leaves.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>You haven't applied for any leave yet.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Duration</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td style={tdStyle}>
                        {leave.leave_type}
                        {leave.leave_type === 'Half Day' && leave.half_day_session ? ` (${leave.half_day_session})` : ''}
                      </td>
                      <td style={tdStyle}>{leave.start_date} to {leave.end_date}</td>
                      <td style={tdStyle}>
                        <span style={statusStyle(leave.status)}>{leave.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* PERFORMANCE */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}>My Performance</h2>

            {performance.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No performance reviews yet.</p>
            ) : (
              <>
                <BarChart width={350} height={220} data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="review" stroke="#94a3b8" />
                  <YAxis domain={[0, 5]} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>

                <div style={{ marginTop: '14px' }}>
                  {performance.map((p) => (
                    <div key={p.id} style={performanceItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#f59e0b', fontWeight: '700' }}>{p.rating} ⭐</span>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : ''}
                        </span>
                      </div>
                      <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '6px 0 0' }}>{p.feedback}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

      </div>

      <ChatbotWidget role="employee" employeeId={employee.id} employeeName={employee.name} />
    {
  showLogoutModal && (

    <div style={modalOverlay}>

      <div style={modalBox}>

        <h2>
          Logout
        </h2>

        <p>
          Are you sure you want to logout?
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "25px"
          }}
        >

          <button
            style={cancelButton}
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </button>

          <button
            style={confirmButton}
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

    </div>

  )
} 
    </div>
  )
}

function ProfileField({ label, value, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
      <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ color: '#f8fafc', fontSize: '14px', margin: 0 }}>{value}</p>
    </div>
  )
}

function SalaryRow({ label, value, bold, negative }) {
  return (
    <div style={salaryRow}>
      <span style={{ color: '#94a3b8', fontSize: '14px' }}>{label}</span>
      <span style={{
        color: negative ? '#ef4444' : '#f8fafc',
        fontWeight: bold ? '700' : '500',
        fontSize: bold ? '16px' : '14px'
      }}>
        {negative ? '- ' : ''}₹{Number(value || 0).toLocaleString()}
      
      </span>
    </div>
  )
}



const pageContainer = {
  padding: '30px',
  maxWidth: '1400px',
  margin: '0 auto',
  minHeight: '100vh',
  background: '#0f172a'
}

const centerScreen = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0f172a',
  padding: '20px'
}

const errorCard = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '40px',
  maxWidth: '480px',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
}

const termsOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '20px'
}

const termsBox = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '32px',
  maxWidth: '560px',
  width: '100%',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)'
}

const termsTextBox = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '16px 18px',
  maxHeight: '220px',
  overflowY: 'auto',
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '1.7',
  marginBottom: '18px'
}

const termsCheckboxRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px',
  cursor: 'pointer'
}

const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '24px',
  marginBottom: '30px'
}

const card = {
  background: '#1e293b',
  borderRadius: '20px',
  padding: '28px',
  border: '1px solid #334155',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
}

const cardLabel = {
  color: '#94a3b8',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '10px'
}

const cardValue = {
  fontSize: '36px',
  margin: 0
}

const cardSub = {
  marginTop: '8px',
  color: '#94a3b8',
  fontSize: '13px'
}

const twoColumnLayout = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '24px'
}

const sectionCard = {
  background: '#1e293b',
  borderRadius: '20px',
  padding: '24px',
  border: '1px solid #334155',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  marginBottom: '24px'
}

const sectionTitle = {
  color: '#f8fafc',
  fontSize: '20px',
  marginTop: 0,
  marginBottom: '18px'
}

const profileGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '18px'
}

const probationPopup = {
  background: 'rgba(217, 119, 6, 0.12)',
  border: '1px solid #d97706',
  borderRadius: '14px',
  padding: '16px 18px',
  marginBottom: '20px',
  textAlign: 'center'
}

const salaryGrid = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
}

const salaryRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid #334155'
}

const netSalaryBox = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid #334155'
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  color: '#94a3b8',
  fontSize: '13px',
  fontWeight: '600'
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  marginBottom: '16px',
  borderRadius: '10px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
}

const textareaStyle = {
  ...inputStyle,
  height: '90px',
  resize: 'none'
}

const primaryButton = {
  width: '100%',
  padding: '14px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '15px',
  boxShadow: '0 4px 20px rgba(37,99,235,0.3)'
}

const secondaryButton = {
  padding: '14px 20px',
  background: '#334155',
  color: '#f8fafc',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '15px',
  cursor: 'pointer'
}

const cameraPreview = {
  width: '100%',
  maxWidth: '360px',
  borderRadius: '12px',
  border: '1px solid #334155',
  background: '#000'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
}

const thStyle = {
  textAlign: 'left',
  padding: '10px',
  color: '#94a3b8',
  fontSize: '12px',
  textTransform: 'uppercase',
  borderBottom: '1px solid #334155'
}

const tdStyle = {
  padding: '10px',
  color: '#f8fafc',
  fontSize: '14px',
  borderBottom: '1px solid #334155'
}

const performanceItem = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '14px',
  marginBottom: '10px'
}
const modalOverlay = {

  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999

};

const modalBox = {

  background: "#1e293b",
  padding: "30px",
  borderRadius: "20px",
  width: "420px",
  color: "#f8fafc",
  border: "1px solid #334155",
  boxShadow: "0 10px 35px rgba(0,0,0,.45)"

};

const cancelButton = {

  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"

};

const confirmButton = {

  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700"

};
export default EmployeeDashboard
