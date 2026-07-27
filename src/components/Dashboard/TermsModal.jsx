export default function TermsModal({
  open,
  onClose,
}) {
  if (!open) return null;

  return (
    <>
      {open && (
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

          

            <button
  onClick={() => onClose()}
  style={{
  width: '100%',
  padding: '14px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '15px',
  cursor: 'pointer',
  marginTop: '15px'
}}
>
  Close
</button>
          </div>
        </div>
      )}
    </>
  );
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
};

const termsBox = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '32px',
  maxWidth: '560px',
  width: '100%',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)'
};

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
};
