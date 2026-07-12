import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('employee')         // CHANGE 1 - new state

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) throw error

      // CHANGE 2 - navigate based on radio button selection
      if (role === 'employee') {
        navigate('/employee-dashboard')
      } else {
        navigate('/login-animation')
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
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
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
                border: role === r ? '2px solid #3b82f6' : '2px solid #334155',
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
              {r === 'employee' ? '👤 Employee' : '🏢 HR / Admin'}
            </label>
          ))}
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
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
              required
            />
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
            {loading ? 'Signing in...' : 'Sign In'}
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