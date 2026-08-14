import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { apiFetch } from '../api'
function Login() {
  const navigate = useNavigate()
  useEffect(() => {

  const checkSavedSession = async () => {

    const keepSignedIn =
      localStorage.getItem("payroll_keep_signed_in") === "true"

    // No "Keep Me Signed In"
    if (!keepSignedIn) {
      return
    }

    try {

      const response = await apiFetch(
        "http://localhost:5000/api/test-auth"
      )

      const result = await response.json()

      if (!response.ok) {
        return
      }

      console.log(
        "SAVED SESSION:",
        result
      )

      if (result.role === "employee") {

        navigate(
          "/employee-dashboard",
          { replace: true }
        )

      } else if (result.role === "hr") {

        navigate(
          "/login-animation",
          { replace: true }
        )

      }

    } catch (error) {

      console.error(
        "Saved session check failed:",
        error
      )

    }

  }

  checkSavedSession()

}, [navigate])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
 const [loading, setLoading] = useState(false)
const [loginMethod, setLoginMethod] = useState('email') 
const [role, setRole] = useState('employee')       // CHANGE 1 - new state
const [otp, setOtp] = useState('')
const [otpSent, setOtpSent] = useState(false)
const [keepSignedIn, setKeepSignedIn] = useState(false)
const [phone, setPhone] = useState('')
const [phoneOtpSent, setPhoneOtpSent] = useState(false)
const [phoneOtp, setPhoneOtp] = useState('')
const [authenticatorStarted, setAuthenticatorStarted] = useState(false)
const [authenticatorQr, setAuthenticatorQr] = useState('')
const [authenticatorCode, setAuthenticatorCode] = useState('')


  const handleLogin = async (e) => {
    e.preventDefault()

if (loginMethod === 'authenticator') {

  if (!email) {
    alert('Please enter your email address')
    return
  }

} else if (loginMethod === 'otp') {

  if (!phone) {
    alert('Please enter your phone number')
    return
  }

} else {

  if (!email || !password) {
    alert('Please fill all fields')
    return
  }

}

setLoading(true)

try {
  if (loginMethod === 'otp') {

  if (!phoneOtpSent) {

    alert(
      "Phone OTP sending will be connected next."
    )

    setLoading(false)

    return
  }

}
      if (loginMethod === 'authenticator') {

  if (!email) {
    throw new Error('Please enter your email address.')
  }

  navigate('/authenticator-login', {
    state: {
      email,
      role
    }
  })

  return
}

// ==============================
  // GOOGLE AUTHENTICATOR LOGIN
  // ==============================

  if (loginMethod === 'authenticator') {

    navigate('/authenticator-login', {
      state: {
        email,
        role
      }
    })

    return
  }

  // ==============================
  // NORMAL EMAIL/PASSWORD LOGIN
  // ==============================

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

  if (error) throw error
console.log("LOGIN SUCCESS:", {
  userId: data.user?.id,
  email: data.user?.email,
  keepSignedIn
})
      if (loginMethod === 'email' && !otpSent) {

  const response = await apiFetch(
    "http://localhost:5000/api/login/send-email-otp",
    {
      method: "POST",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.message || "Unable to send OTP"
    )
  }

  setOtpSent(true)

  alert(
    "A verification OTP has been sent to your email."
  )

  return
}

if (loginMethod === 'email' && otpSent) {

  if (!otp || otp.length !== 6) {
    throw new Error("Please enter the 6-digit OTP.")
  }

  const response = await apiFetch(
    "http://localhost:5000/api/login/verify-email-otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otp,
      }),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.message || "Invalid OTP"
    )
  }

  console.log(
    "Email OTP verification successful:",
    result
  )
  if (keepSignedIn) {

  localStorage.setItem(
    "payroll_keep_signed_in",
    "true"
  )

  sessionStorage.removeItem(
    "payroll_session_only"
  )

} else {

  localStorage.removeItem(
    "payroll_keep_signed_in"
  )

  sessionStorage.setItem(
    "payroll_session_only",
    "true"
  )

}
  if (role === 'employee') {

  navigate('/employee-dashboard')

} else {

  navigate('/login-animation')

}

return
}


    } catch (error) {
      alert(error.message || 'Invalid Email or Password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div style={loginCard}>
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f8fafc', margin: '0 0 8px 0' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
            Sign in to access your payroll dashboard
          </p>
        </div>

        {/* CHANGE 3 - role radio buttons */}
        {/* Login method selector */}
{/* Role selector */}
<div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
  {['employee', 'hr'].map((r) => (
    <label
      key={r}
      style={{
        flex: 1,
        padding: '12px',
        borderRadius: '12px',
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '14px',
        background: role === r ? '#1d4ed8' : '#0f172a',
        border:
          role === r
            ? '2px solid #3b82f6'
            : '2px solid #334155',
        color: role === r ? '#fff' : '#94a3b8',
      }}
    >
      <input
        type="radio"
        name="role"
        value={r}
        checked={role === r}
        onChange={() => setRole(r)}
        style={{ display: 'none' }}
      />

      {r === 'employee'
        ? '👤 Employee'
        : '🏢 HR / Admin'}
    </label>
  ))}
</div>

{/* Authentication method selector */}


        <form onSubmit={handleLogin}>
          {loginMethod !== 'otp' && (
  <div style={{ marginBottom: '16px' }}>
    <label style={labelStyle}>Email Address</label>

    <input
      type="email"
      placeholder="name@company.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      style={inputStyle}
      required={loginMethod !== 'otp'}
    />
  </div>
)}

{loginMethod === 'otp' && (
  <div style={{ marginBottom: '16px' }}>
    <label style={labelStyle}>Phone Number</label>

    <input
      type="tel"
      inputMode="numeric"
      placeholder="+91 "
      value={phone}
      onChange={(e) =>
        setPhone(e.target.value)
      }
      style={inputStyle}
      required
    />
  </div>
)}
          
          {loginMethod === 'email' && (
  <div style={{ marginBottom: '24px' }}>
    <label style={labelStyle}>Password</label>

    <input
      type="password"
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={inputStyle}
      required
    />
  </div>
)}
          
          {otpSent && loginMethod === 'email' && (
  <div style={{ marginBottom: '24px' }}>
    <label style={labelStyle}>OTP</label>

    <input
      type="text"
      inputMode="numeric"
      maxLength="6"
      placeholder="Enter 6-digit OTP"
      value={otp}
      onChange={(e) =>
        setOtp(e.target.value.replace(/\D/g, ''))
      }
      style={inputStyle}
    />

    <p
      style={{
        color: '#94a3b8',
        fontSize: '13px',
        marginTop: '8px',
        marginBottom: 0
      }}
    >
      A verification code has been sent to your email.
    </p>
    
    <button
  type="button"
  onClick={async () => {

    try {

      const response = await apiFetch(
        "http://localhost:5000/api/login/send-email-otp",
        {
          method: "POST",
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to resend OTP"
        )
      }

      setOtp('')

      alert("A new OTP has been sent to your email.")

    } catch (error) {

      alert(
        error.message || "Unable to resend OTP"
      )

    }

  }}
  style={{
    marginTop: '12px',
    background: 'transparent',
    border: 'none',
    color: '#60a5fa',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    padding: '0'
  }}
>
  Resend OTP
</button>
  </div>
)}
{loginMethod === 'otp' && phoneOtpSent && (
  <div style={{ marginBottom: '24px' }}>

    <label style={labelStyle}>
      OTP
    </label>

    <input
      type="text"
      inputMode="numeric"
      maxLength="6"
      placeholder="Enter 6-digit OTP"
      value={phoneOtp}
      onChange={(e) =>
        setPhoneOtp(
          e.target.value.replace(/\D/g, '')
        )
      }
      style={inputStyle}
    />

    <p
      style={{
        color: '#94a3b8',
        fontSize: '13px',
        marginTop: '8px',
        marginBottom: 0
      }}
    >
      A verification code has been sent to your phone.
    </p>

  </div>
)}
          <div style={{ marginBottom: '24px' }}>
  <p
    style={{
      color: '#cbd5e1',
      fontSize: '14px',
      fontWeight: '600',
      margin: '0 0 12px 0'
    }}
  >
    How would you like to sign in?
  </p>

  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '22px',
      color: '#cbd5e1',
      fontSize: '14px'
    }}
  >
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        cursor: 'pointer'
      }}
    >
      <input
        type="radio"
        name="loginMethod"
        value="email"
        checked={loginMethod === 'email'}
        onChange={() => setLoginMethod('email')}
      />
      Email
    </label>

    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        cursor: 'pointer'
      }}
    >
      <input
        type="radio"
        name="loginMethod"
        value="otp"
        checked={loginMethod === 'otp'}
        onChange={() => setLoginMethod('otp')}
      />
      OTP
    </label>

    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        cursor: 'pointer'
      }}
    >
      <input
        type="radio"
        name="loginMethod"
        value="authenticator"
        checked={loginMethod === 'authenticator'}
        onChange={() => setLoginMethod('authenticator')}
      />
      Authenticator
    </label>
  </div>
  <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '18px',
marginBottom: '24px',
    color: '#cbd5e1',
    fontSize: '14px'
  }}
>
  <input
    type="checkbox"
    checked={keepSignedIn}
    onChange={(e) =>
      setKeepSignedIn(e.target.checked)
    }
    style={{
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    }}
  />

  <label
    style={{
      cursor: 'pointer'
    }}
    onClick={() =>
      setKeepSignedIn(prev => !prev)
    }
  >
    Keep me signed in
  </label>
</div>
</div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              background: loading ? '#93c5fd' : '#2563eb',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading
  ? (otpSent ? 'Verifying OTP...' : 'Sending OTP...')
  : (otpSent ? 'Verify OTP' : 'Sign In')
}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '20px' }}>
          New employee? <Link to="/signup" style={{ color: '#60a5fa', fontWeight: '600' }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}

const loginCard = {
  background: '#1e293b',
  padding: '40px',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '450px',
  border: '1px solid #334155',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#cbd5e1'
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1px solid #475569',
  fontSize: '14px',
  outline: 'none',
  background: '#0f172a',
  color: '#f8fafc',
  boxSizing: 'border-box'
}

const buttonStyle = {
  width: '100%',
  padding: '14px',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '15px',
  boxShadow: '0 4px 20px rgba(37,99,235,0.3)'
}

export default Login