import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function AuthenticatorSetup() {

  const navigate = useNavigate()

  const [qrCode, setQrCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {

    const setupAuthenticator = async () => {

      try {

        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!session) {
          navigate('/login', { replace: true })
          return
        }

        // Check whether a verified Authenticator already exists
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

        if (verifiedFactor) {

          navigate('/authenticator-verify', {
            replace: true
          })

          return
        }

        // Remove any old unverified TOTP factor
        const unverifiedFactors =
          factors?.totp?.filter(
            factor => factor.status !== 'verified'
          ) || []

        for (const factor of unverifiedFactors) {

          await supabase.auth.mfa.unenroll({
            factorId: factor.id
          })

        }

        // Create new TOTP factor
        const { data, error } =
          await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: 'Payroll System'
          })

        if (error) {
          throw error
        }

        setFactorId(data.id)

        setQrCode(
          data.totp.qr_code
        )

      } catch (err) {

        console.error(
          'Authenticator setup error:',
          err
        )

        setError(
          err.message ||
          'Unable to setup Authenticator.'
        )

      } finally {

        setLoading(false)

      }

    }

    setupAuthenticator()

  }, [navigate])


  const handleVerify = async () => {

    if (!code || code.length !== 6) {

      setError(
        'Enter the 6-digit code from Google Authenticator.'
      )

      return
    }

    setVerifying(true)
    setError('')

    try {

      // Create MFA challenge
      const {
        data: challenge,
        error: challengeError
      } = await supabase.auth.mfa.challenge({
        factorId
      })

      if (challengeError) {
        throw challengeError
      }

      // Verify the code
      const {
        error: verifyError
      } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code
      })

      if (verifyError) {
        throw verifyError
      }

      alert(
        'Authenticator setup completed successfully.'
      )

      navigate('/employee-dashboard', {
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

      setVerifying(false)

    }

  }


  if (loading) {

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={headingStyle}>
            Setting up Authenticator...
          </h2>

          <p style={textStyle}>
            Please wait.
          </p>
        </div>
      </div>
    )

  }


  if (error && !qrCode) {

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>

          <h2 style={headingStyle}>
            Authenticator Setup
          </h2>

          <p style={errorStyle}>
            {error}
          </p>

          <button
            onClick={() => navigate('/login')}
            style={buttonStyle}
          >
            Back to Login
          </button>

        </div>
      </div>
    )

  }


  return (
    <div style={pageStyle}>

      <div style={cardStyle}>

        <h2 style={headingStyle}>
          Set Up Authenticator
        </h2>

        <p style={textStyle}>
          Scan this QR code using
          Google Authenticator.
        </p>

        <div style={qrContainerStyle}>
          <img
            src={qrCode}
            alt="Authenticator QR Code"
            style={{
              width: '220px',
              height: '220px'
            }}
          />
        </div>

        <p style={textStyle}>
          After scanning the QR code,
          enter the 6-digit code shown
          in Google Authenticator.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength="6"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value.replace(/\D/g, '')
            )
          }
          style={inputStyle}
        />

        {error && (
          <p style={errorStyle}>
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{
            ...buttonStyle,
            opacity: verifying ? 0.6 : 1
          }}
        >
          {verifying
            ? 'Verifying...'
            : 'Verify & Continue'}
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

const headingStyle = {
  color: '#f8fafc',
  marginBottom: '12px'
}

const textStyle = {
  color: '#94a3b8',
  fontSize: '14px',
  lineHeight: '1.6'
}

const qrContainerStyle = {
  background: '#ffffff',
  width: '240px',
  height: '240px',
  margin: '25px auto',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  boxSizing: 'border-box',
  borderRadius: '12px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '18px',
  textAlign: 'center',
  letterSpacing: '5px',
  outline: 'none'
}

const buttonStyle = {
  width: '100%',
  marginTop: '18px',
  padding: '14px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  cursor: 'pointer'
}

const errorStyle = {
  color: '#f87171',
  fontSize: '14px',
  marginTop: '12px'
}

export default AuthenticatorSetup