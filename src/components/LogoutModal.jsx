import { motion, AnimatePresence } from "framer-motion";

function LogoutModal({
  open,
  onCancel,
  onConfirm,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={overlayStyle}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 25,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            transition={{
              duration: 0.3,
            }}
            style={modalStyle}
          >
            <div style={iconContainer}>
              🚪
            </div>

            <h2 style={titleStyle}>
              Confirm Logout
            </h2>

            <p style={textStyle}>
              Are you sure you want to logout?
              <br />
              You'll need to sign in again to
              access your dashboard.
            </p>

            <div style={buttonContainer}>
              <button
                style={cancelButton}
                onClick={onCancel}
              >
                Cancel
              </button>

              <button
                style={logoutButton}
                onClick={onConfirm}
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,.72)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999999,
};

const modalStyle = {
  width: "430px",
  maxWidth: "90%",
  padding: "34px",
  borderRadius: "28px",

  background:
    "linear-gradient(145deg, rgba(255,255,255,.07), rgba(255,255,255,.03))",

  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",

  border: "1px solid rgba(255,255,255,.08)",

  boxShadow:
    "0 25px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)",

  textAlign: "center",
  color: "#fff",
};

const iconContainer = {
  width: 82,
  height: 82,
  margin: "0 auto 20px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "34px",

  background:
    "linear-gradient(135deg,#ef4444,#dc2626)",

  boxShadow:
    "0 0 35px rgba(239,68,68,.45)",
};

const titleStyle = {
  margin: 0,
  fontSize: 30,
  fontWeight: 700,
  color: "#f8fafc",
};

const textStyle = {
  marginTop: 15,
  marginBottom: 32,
  color: "rgba(255,255,255,.65)",
  lineHeight: 1.7,
  fontSize: 15,
};

const buttonContainer = {
  display: "flex",
  gap: 14,
};

const cancelButton = {
  flex: 1,
  padding: "14px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,.08)",

  background: "rgba(255,255,255,.05)",

  color: "#fff",

  cursor: "pointer",

  fontWeight: 600,

  transition: ".25s",
};

const logoutButton = {
  flex: 1,
  padding: "14px",

  borderRadius: "16px",

  border: "none",

  background:
    "linear-gradient(135deg,#ef4444,#dc2626)",

  color: "#fff",

  fontWeight: 700,

  cursor: "pointer",

  boxShadow:
    "0 10px 30px rgba(239,68,68,.35)",

  transition: ".25s",
};

export default LogoutModal;