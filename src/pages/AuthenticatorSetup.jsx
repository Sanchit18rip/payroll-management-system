import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function AuthenticatorSetup() {
  const navigate = useNavigate();

  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const setupAuthenticator = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Payroll Authenticator",
        });

        if (error) {
          throw error;
        }

        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
      } catch (err) {
        console.error("Authenticator setup error:", err);
        setError(err.message || "Could not start authenticator setup");
      } finally {
        setLoading(false);
      }
    };

    setupAuthenticator();
  }, []);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit authenticator code.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });

      if (challengeError) {
        throw challengeError;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        throw verifyError;
      }

      alert("Authenticator successfully enabled!");

      navigate("/employee-dashboard");
    } catch (err) {
      console.error("Authenticator verification error:", err);
      setError(err.message || "Invalid authenticator code");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Setting up authenticator...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: "40px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "450px",
          border: "1px solid #334155",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#f8fafc",
            marginBottom: "10px",
          }}
        >
          Set Up Authenticator
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "14px",
            lineHeight: "1.6",
            marginBottom: "25px",
          }}
        >
          Open Google Authenticator or another authenticator app and scan
          this QR code.
        </p>

        {error && (
          <div
            style={{
              background: "#450a0a",
              color: "#fca5a5",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {qrCode && (
          <div
            style={{
              background: "#ffffff",
              padding: "15px",
              borderRadius: "15px",
              display: "inline-block",
              marginBottom: "25px",
            }}
          >
            <img
              src={qrCode}
              alt="Authenticator QR Code"
              style={{
                width: "220px",
                height: "220px",
              }}
            />
          </div>
        )}

        <p
          style={{
            color: "#cbd5e1",
            fontSize: "14px",
            marginBottom: "8px",
          }}
        >
          Enter the 6-digit code from your authenticator app
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength="6"
          placeholder="123456"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, ""))
          }
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #475569",
            background: "#0f172a",
            color: "#f8fafc",
            fontSize: "20px",
            textAlign: "center",
            letterSpacing: "6px",
            outline: "none",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "12px",
            background: verifying ? "#93c5fd" : "#2563eb",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "15px",
            cursor: verifying ? "not-allowed" : "pointer",
          }}
        >
          {verifying ? "Verifying..." : "Enable Authenticator"}
        </button>
      </div>
    </div>
  );
}

export default AuthenticatorSetup;