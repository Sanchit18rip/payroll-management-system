function LogoutModal({
  open,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginTop: 0 }}>
          Confirm Logout
        </h2>

        <p>
          Are you sure you want to logout?
        </p>

        <div style={buttonContainer}>
          <button
            style={cancelButton}
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            style={confirmButton}
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999999,
};

const modalStyle = {
  width: "400px",
  maxWidth: "90%",
  background: "#1e293b",
  color: "#fff",
  borderRadius: "20px",
  padding: "30px",
  border: "1px solid #334155",
  boxShadow: "0 20px 60px rgba(0,0,0,.5)",
};

const buttonContainer = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginTop: "25px",
};

const cancelButton = {
  padding: "12px 24px",
  background: "#475569",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
};

const confirmButton = {
  padding: "12px 24px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
};

export default LogoutModal;