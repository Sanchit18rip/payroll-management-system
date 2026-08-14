import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function AuthenticatorVerify() {

  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (e) => {

    e.preventDefault()

    if (code.length !== 6) {
      setError('Please enter the 6-digit Authenticator code.')
      return
    }

    setLoading(true)
    setError('')

    try {

      // Get verified TOTP factors
      const {
        data: factors,
        error: factorsError
      } = await supabase.auth.mfa.listFactors()

      if (factorsError) {
        throw factorsError
      }

      const verifiedFactor =
        factors?.totp?.find(
          factor => factor.status === 'verified'
        )

      if (!verifiedFactor) {

        setError(
          'No verified Authenticator found. Please set it up first.'
        )

        return
      }

      // Create MFA challenge
      const {
        data: challenge,
        error: challengeError
      } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id
      })

      if (challengeError) {
        throw challengeError
      }

      // Verify Authenticator code
      const {
        error: verifyError
      } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challenge.id,
        code
      })

      if (verifyError) {
        throw verifyError
      }

      console.log(
        'Authenticator verification successful'
      )

      /*
       * For now we will determine the role
       * from the backend/profile later.
       */

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error(
          'User session could not be found.'
        )
      }

      // Get employee profile using email
      const response = await fetch(
        `http://localhost:5000/api/employees/by-email/${encodeURIComponent(
          user.email
        )}`
      )

      if (response.ok) {

        const employee =
          await response.json()

        navigate('/employee-dashboard', {
          replace: true
        })

        return
      }

      // If not an employee, treat as HR for now
      navigate('/login-animation', {
        replace: true
      })

    } catch (err) {

      console.error(
        'Authenticator verification error:',
        err
      )

      setError(
        err.message ||
        'Invalid Authenticator code.'
      )

    } finally {

      setLoading(false)

    }

  }

  return (
    <div style={pageStyle}>

      <div style={cardStyle}>

        <div style={{ marginBottom: '25px' }}>

          <div style={iconStyle}>
            🔐
          </div>

          <h1 style={headingStyle}>
            Authenticator Verification
          </h1>

          <p style={textStyle}>
            Open Google Authenticator and enter
            the 6-digit code shown for your
            Payroll System account.
          </p>

        </div>

        <form onSubmit={handleVerify}>

          <label style={labelStyle}>
            Authenticator Code
          </label>

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value.replace(/\D/g, '')
              )
            }
            style={inputStyle}
            autoFocus
          />

          {error && (
            <p style={errorStyle}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading
                ? 'not-allowed'
                : 'pointer'
            }}
          >
            {loading
              ? 'Verifying...'
              : 'Verify & Login'}
          </button>

        </form>

        <button
          type="button"
          onClick={() =>
            navigate('/login')
          }
          style={backButtonStyle}
        >
          Back to Login
        </button>

      </div>

    </div>
  )
}

const pageStyle = {
  minHeight: '100vh',
  background: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
}

const cardStyle = {
  width: '100%',
  maxWidth: '450px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '24px',
  padding: '40px',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
}

const iconStyle = {
  fontSize: '42px',
  marginBottom: '10px'
}

const headingStyle = {
  color: '#f8fafc',
  margin: '0 0 10px 0',
  fontSize: '25px'
}

const textStyle = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: 0
}

const labelStyle = {
  display: 'block',
  textAlign: 'left',
  marginBottom: '8px',
  color: '#cbd5e1',
  fontSize: '14px',
  fontWeight: '600'
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '24px',
  textAlign: 'center',
  letterSpacing: '8px',
  outline: 'none'
}

const buttonStyle = {
  width: '100%',
  marginTop: '20px',
  padding: '14px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: '600'
}

const backButtonStyle = {
  marginTop: '15px',
  padding: '10px 20px',
  background: 'transparent',
  color: '#94a3b8',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px'
}

const errorStyle = {
  color: '#f87171',
  fontSize: '14px',
  marginTop: '12px'
}

export default AuthenticatorVerify