import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { apiFetch, API_BASE } from "../api"
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'

function Login() {
  const navigate = useNavigate()
  const { theme, isDark } = useTheme()

  useEffect(() => {

    const checkSavedSession = async () => {

      const keepSignedIn =
        localStorage.getItem("payroll_keep_signed_in") === "true"

      if (!keepSignedIn) {
        return
      }

      try {

        const response = await apiFetch(
          `${API_BASE}/api/test-auth`
        )

        const result = await response.json()

        if (!response.ok) {
          return
        }

        if (result.role === "employee") {
          navigate("/employee-dashboard", { replace: true })
        } else if (result.role === "hr") {
          navigate("/login-animation", { replace: true })
        }

      } catch (error) {
        console.error("Saved session check failed:", error)
      }

    }

    checkSavedSession()

    // Session-only mode: clear Supabase session on tab close
    const handleTabClose = () => {
      const sessionOnly = sessionStorage.getItem("payroll_session_only") === "true"
      if (sessionOnly) {
        supabase.auth.signOut()
      }
    }
    window.addEventListener("beforeunload", handleTabClose)
    return () => window.removeEventListener("beforeunload", handleTabClose)

  }, [navigate])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('employee')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (error) {
        throw error;
      }

      if (keepSignedIn) {
        localStorage.setItem("payroll_keep_signed_in", "true");
        sessionStorage.removeItem("payroll_session_only");
      } else {
        localStorage.removeItem("payroll_keep_signed_in");
        sessionStorage.setItem("payroll_session_only", "true");
      }

      if (role === "hr") {
        navigate("/login-animation", { replace: true });
        return;
      }

      if (role === "employee" && !otpSent) {
        const response = await apiFetch(
          `${API_BASE}/api/login/send-email-otp`,
          { method: "POST" }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to send OTP");
        }

        setOtpSent(true);
        return;
      }

      if (role === "employee" && otpSent) {

        if (!otp || otp.length !== 6) {
          throw new Error("Please enter the 6-digit OTP.");
        }

        const response = await apiFetch(
          `${API_BASE}/api/login/verify-email-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otp }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Invalid OTP");
        }

        navigate("/login-animation?to=/employee-dashboard", { replace: true });
        return;
      }

    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await apiFetch(
        `${API_BASE}/api/login/send-email-otp`,
        { method: "POST" }
      )
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Unable to resend OTP")
      }
      setOtp('')
      alert("A new OTP has been sent to your email.")
    } catch (error) {
      alert(error.message || "Unable to resend OTP")
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      background: isDark
        ? 'radial-gradient(circle at 12% 8%, rgba(56,189,248,0.12), transparent 40%), radial-gradient(circle at 88% 12%, rgba(167,139,250,0.14), transparent 42%), radial-gradient(circle at 50% 95%, rgba(34,211,238,0.10), transparent 45%), linear-gradient(160deg, #020617 0%, #0f172a 55%, #172554 100%)'
        : 'radial-gradient(circle at 12% 8%, rgba(56,189,248,0.06), transparent 40%), radial-gradient(circle at 88% 12%, rgba(167,139,250,0.06), transparent 42%), radial-gradient(circle at 50% 95%, rgba(34,211,238,0.05), transparent 45%), linear-gradient(160deg, #f1f5f9 0%, #e2e8f0 55%, #cbd5e1 100%)'
    }}>

      {/* Aurora gradient backdrop */}
      <div style={auroraLayer} />

      {/* Theme toggle - top right on login page */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <ThemeToggle />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        background: isDark
          ? 'linear-gradient(160deg, rgba(30, 41, 59, 0.65), rgba(15, 23, 42, 0.5))'
          : 'linear-gradient(160deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.7))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        border: isDark
          ? '1px solid rgba(148, 163, 184, 0.18)'
          : '1px solid rgba(0,0,0,0.08)',
        boxShadow: isDark
          ? '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 10px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
        animation: 'fadeInUp 0.6s ease both'
      }}>

        {/* Logo chip */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 20px',
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
        }}>💼</div>

        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '30px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            background: 'linear-gradient(120deg, #38bdf8 0%, #818cf8 45%, #e879f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
            Sign in to access your payroll dashboard
          </p>
        </div>

        {/* Role selector — frosted glass pills */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {['employee', 'hr'].map((r) => (
            <label
              key={r}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '14px',
                background: role === r
                  ? 'linear-gradient(135deg, rgba(56,189,248,0.3), rgba(99,102,241,0.3))'
                  : 'rgba(15, 23, 42, 0.6)',
                border: role === r
                  ? '1px solid rgba(56,189,248,0.5)'
                  : '1px solid rgba(148,163,184,0.18)',
                color: role === r ? '#f8fafc' : '#94a3b8',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: role === r ? '0 4px 20px rgba(56,189,248,0.2)' : 'none'
              }}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => {
                  setRole(r)
                  setOtpSent(false)
                  setOtp('')
                }}
                style={{ display: 'none' }}
              />
              {r === 'employee'
                ? '👤 Employee'
                : '🏢 HR / Admin'}
            </label>
          ))}
        </div>

        <form onSubmit={handleLogin}>

          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              disabled={otpSent}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              disabled={otpSent}
              required
            />
          </div>

          {role === 'employee' && otpSent && (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Email OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ''))
                }
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  fontSize: '22px',
                  letterSpacing: '8px',
                  fontWeight: '700'
                }}
                autoFocus
              />
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px', marginBottom: 0 }}>
                ✉️ Verification code sent to your email
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                style={{
                  marginTop: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '0'
                }}
              >
                ↻ Resend OTP
              </button>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: isDark ? '#cbd5e1' : '#64748b',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) =>
                  setKeepSignedIn(e.target.checked)
                }
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#38bdf8'
                }}
              />
              Keep me signed in
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading
                ? 'rgba(56,189,248,0.4)'
                : 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #8b5cf6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading
              ? (otpSent ? '⏳ Verifying OTP...' : '⏳ Signing In...')
              : (otpSent ? '🔐 Verify OTP' : '🚀 Sign In')
            }
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '14px',
          marginTop: '24px',
          marginBottom: 0
        }}>
          New employee?{' '}
          <Link
            to="/signup"
            style={{
              color: '#38bdf8',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  )
}

/* ── STYLES ── */

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden',
  background:
    'radial-gradient(circle at 12% 8%, rgba(56,189,248,0.12), transparent 40%),' +
    'radial-gradient(circle at 88% 12%, rgba(167,139,250,0.14), transparent 42%),' +
    'radial-gradient(circle at 50% 95%, rgba(34,211,238,0.10), transparent 45%),' +
    'linear-gradient(160deg, #020617 0%, #0f172a 55%, #172554 100%)'
}

const auroraLayer = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  background:
    'radial-gradient(ellipse at 30% 20%, rgba(56,189,248,0.08), transparent 60%),' +
    'radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.08), transparent 60%)'
}

const loginCard = {
  position: 'relative',
  zIndex: 1,
  background: 'linear-gradient(160deg, rgba(30, 41, 59, 0.65), rgba(15, 23, 42, 0.5))',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '40px',
  borderRadius: '24px',
  width: '100%',
  maxWidth: '440px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1px solid var(--border-input)',
  fontSize: '14px',
  outline: 'none',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)'
}

export default Login
