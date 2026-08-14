import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function AuthenticatorLogin() {
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState(
  location.state?.email || ''
)
  const role = location.state?.role || 'employee'

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [error, setError] = useState('')

  const generateAuthenticator = async () => {
    if (!email) {
      setError('Email address is missing.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/authenticator/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to generate Authenticator QR code.'
        )
      }

      setQrCode(result.qrCode)

    } catch (error) {

      console.error(
        'Authenticator generation failed:',
        error
      )

      setError(
        error.message ||
        'Unable to generate Authenticator QR code.'
      )

    } finally {
      setLoading(false)
    }
  }

  const verifyAuthenticator = async (e) => {
    e.preventDefault()

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit Authenticator code.')
      return
    }

    setLoading(true)
    setError('')

    try {

      const response = await fetch(
        'http://localhost:5000/api/authenticator/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
  email,
  token: code,
})
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message ||
          'Invalid Authenticator code.'
        )
      }

      console.log(
        'AUTHENTICATOR LOGIN SUCCESS:',
        result
      )
      if (!result.token) {
  throw new Error(
    "Authenticator login token was not received."
  )
}

localStorage.setItem(
  "payroll_authenticator_token",
  result.token
)

localStorage.setItem(
  "payroll_authenticator_user",
  JSON.stringify(result.user)
)
      if (role === 'employee') {

        navigate(
          '/employee-dashboard',
          { replace: true }
        )

      } else {

        navigate(
          '/login-animation',
          { replace: true }
        )

      }

    } catch (error) {

      console.error(
        'Authenticator verification failed:',
        error
      )

      setError(
        error.message ||
        'Invalid Authenticator code.'
      )

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

      <div style={cardStyle}>

        <h1 style={titleStyle}>
          Google Authenticator
        </h1>

        <p style={subtitleStyle}>
          {email
            ? `Sign in as ${email}`
            : 'Authenticator Login'}
        </p>

        {!email && (
  <div style={{ marginBottom: '20px' }}>

    <label style={labelStyle}>
      Email Address
    </label>

    <input
      type="email"
      placeholder="Enter your email address"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      style={inputStyle}
    />

  </div>
)}

        {!qrCode && (
  <>
    {!email && (
      <div style={{ marginBottom: '20px' }}>

        <label style={labelStyle}>
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

      </div>
    )}

    {email && (
      <button
        type="button"
        onClick={generateAuthenticator}
        disabled={loading}
        style={{
          ...buttonStyle,
          opacity: loading ? 0.7 : 1,
          cursor: loading
            ? 'not-allowed'
            : 'pointer'
        }}
      >
        {loading
          ? 'Generating QR Code...'
          : 'Continue'}
      </button>
    )}
  </>
)}

        {qrCode && (
          <>
            <div style={qrContainerStyle}>

              <p
                style={{
                  color: '#cbd5e1',
                  fontSize: '14px',
                  marginBottom: '18px',
                  lineHeight: '1.5'
                }}
              >
                Open <strong>Google Authenticator</strong>
                on your phone and scan this QR code.
              </p>

              <img
                src={qrCode}
                alt="Google Authenticator QR Code"
                style={{
                  width: '230px',
                  height: '230px',
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '16px',
                  display: 'block',
                  margin: '0 auto'
                }}
              />

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  marginTop: '18px',
                  lineHeight: '1.5'
                }}
              >
                After scanning, Google Authenticator
                will generate a 6-digit verification code.
              </p>

            </div>

            <form onSubmit={verifyAuthenticator}>

              <div style={{ marginBottom: '20px' }}>

                <label style={labelStyle}>
                  Authenticator Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  style={{
                    ...inputStyle,
                    textAlign: 'center',
                    fontSize: '24px',
                    letterSpacing: '8px'
                  }}
                />

              </div>

              {error && (
                <div style={errorStyle}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  code.length !== 6
                }
                style={{
                  ...buttonStyle,
                  opacity:
                    loading ||
                    code.length !== 6
                      ? 0.6
                      : 1,
                  cursor:
                    loading ||
                    code.length !== 6
                      ? 'not-allowed'
                      : 'pointer'
                }}
              >
                {loading
                  ? 'Verifying...'
                  : 'Verify & Sign In'}
              </button>

            </form>

          </>
        )}

        {error && !qrCode && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/login')}
          style={backButtonStyle}
        >
          ← Back to Login
        </button>

      </div>

    </div>
  )
}

const cardStyle = {
  width: '100%',
  maxWidth: '450px',
  background: '#1e293b',
  padding: '40px',
  borderRadius: '24px',
  border: '1px solid #334155',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  textAlign: 'center'
}

const titleStyle = {
  color: '#f8fafc',
  fontSize: '28px',
  margin: '0 0 8px 0'
}

const subtitleStyle = {
  color: '#94a3b8',
  fontSize: '14px',
  marginBottom: '25px'
}

const infoBoxStyle = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '16px',
  padding: '25px',
  marginBottom: '20px'
}

const qrContainerStyle = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '16px',
  padding: '22px',
  marginBottom: '22px'
}

const labelStyle = {
  display: 'block',
  color: '#cbd5e1',
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '8px',
  textAlign: 'left'
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  boxSizing: 'border-box',
  outline: 'none'
}

const buttonStyle = {
  width: '100%',
  padding: '14px',
  border: 'none',
  borderRadius: '12px',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  boxShadow: '0 4px 20px rgba(37,99,235,0.3)'
}

const errorStyle = {
  background: 'rgba(220,38,38,0.12)',
  border: '1px solid #dc2626',
  color: '#fca5a5',
  padding: '12px',
  borderRadius: '10px',
  fontSize: '13px',
  marginBottom: '18px'
}

const backButtonStyle = {
  marginTop: '20px',
  background: 'transparent',
  border: 'none',
  color: '#60a5fa',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
}

export default AuthenticatorLogin