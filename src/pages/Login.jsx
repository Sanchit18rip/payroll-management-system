import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { apiFetch, API_BASE } from "../api"

function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    const checkSavedSession = async () => {
      const keepSignedIn = localStorage.getItem("payroll_keep_signed_in") === "true"
      if (!keepSignedIn) return
      try {
        const response = await apiFetch(`${API_BASE}/api/test-auth`)
        const result = await response.json()
        if (!response.ok) return
        if (result.role === "employee") navigate("/employee-dashboard", { replace: true })
        else if (result.role === "hr") navigate("/login-animation", { replace: true })
      } catch (error) {
        console.error("Saved session check failed:", error)
      }
    }
    checkSavedSession()
    const handleTabClose = () => {
      const sessionOnly = sessionStorage.getItem("payroll_session_only") === "true"
      if (sessionOnly) supabase.auth.signOut()
    }
    window.addEventListener("beforeunload", handleTabClose)
    return () => window.removeEventListener("beforeunload", handleTabClose)
  }, [navigate])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('employee')
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { alert("Please fill all fields"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message && /not confirmed/i.test(error.message)) {
          setEmailNotConfirmed(true);
          throw new Error("Your email is not confirmed yet. Please contact HR or wait for your account to be activated.");
        }
        throw error;
      }
      if (keepSignedIn) {
        localStorage.setItem("payroll_keep_signed_in", "true");
        sessionStorage.removeItem("payroll_session_only");
      } else {
        localStorage.removeItem("payroll_keep_signed_in");
        sessionStorage.removeItem("payroll_session_only");
      }
      if (role === "hr") { navigate("/login-animation", { replace: true }); return; }

      // Employee: check HR approval status before letting them in.
      // No OTP / email verification is required anymore — the account
      // becomes usable with the same email + password once HR approves.
      const { data: profile, error: profileError } = await supabase
        .from("employee_profiles")
        .select("approval_status")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("No employee profile found for this account. Please register first.");
      }

      if (profile.approval_status === "pending") {
        await supabase.auth.signOut();
        throw new Error("Your registration is pending HR approval. Please try logging in again after approval.");
      }

      if (profile.approval_status === "rejected") {
        await supabase.auth.signOut();
        throw new Error("Your registration was rejected. Please contact HR.");
      }

      navigate("/login-animation?to=/employee-dashboard", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message || "Invalid Email or Password");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: '#f0f4f8',
    }}>
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: '#ffffff',
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,.06)',
        animation: 'fadeInUp 0.6s ease both'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/images/Logo.png"
            alt="Company Logo"
            style={{
              width: '200px',
              maxWidth: '80%',
              height: 'auto',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>

        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            margin: '0 0 8px 0',
            color: '#0f172a'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#334155', margin: 0, fontSize: '14px', fontWeight: '500' }}>
            Sign in to access your payroll dashboard
          </p>
        </div>

        {/* Role selector */}
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
                  ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15))'
                  : '#f8fafc',
                border: role === r
                  ? '1px solid rgba(56,189,248,0.35)'
                  : '1px solid #e2e8f0',
                color: role === r ? '#1e3a8a' : '#334155',
                transition: 'all 0.2s ease',
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
              {r === 'employee' ? '👤 Employee' : '🏢 HR / Admin'}
            </label>
          ))}
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '18px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyleLocal}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyleLocal, paddingRight: '72px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((c) => !c)}
                style={{
                  position: 'absolute', right: '8px', top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none', background: 'transparent',
                  color: '#64748b', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '600', padding: '6px 8px',
                  borderRadius: '7px'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
              />
              Keep me signed in
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading
                ? 'rgba(99,102,241,0.4)'
                : 'linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #8b5cf6 100%)',
              color: '#ffffff', border: 'none', borderRadius: '12px',
              fontWeight: '600', fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? '⏳ Signing In...' : '🚀 Sign In'}
          </button>
        </form>

        {emailNotConfirmed && (
          <div style={{ marginTop: '18px', padding: '14px 16px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e', fontSize: '13px', lineHeight: '1.5' }}>
            <p style={{ margin: 0, marginBottom: '8px', fontWeight: '600' }}>⚠️ Your email is not confirmed yet.</p>
            <p style={{ margin: 0 }}>
              Your registration is pending HR approval. Please try logging in again after HR approves your account.
            </p>
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '14px', marginTop: '24px', marginBottom: 0 }}>
          Need an account?{' '}
          <Link to="/signup" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', marginBottom: '8px', fontSize: '13px',
  fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px'
}

const inputStyleLocal = {
  width: '100%', padding: '14px 16px', borderRadius: '12px',
  border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
  background: '#ffffff', color: '#0f172a', boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
}

export default Login
