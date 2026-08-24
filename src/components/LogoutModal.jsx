import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

function LogoutModal({
  open,
  onCancel,
  onConfirm,
}) {
  const { isDark } = useTheme();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            inset: 0,
            background: isDark ? "rgba(2,6,23,.72)" : "rgba(0,0,0,.35)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999999,
          }}
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
            style={{
              width: "430px",
              maxWidth: "90%",
              padding: "34px",
              borderRadius: "28px",
              background: isDark
                ? "linear-gradient(145deg, rgba(255,255,255,.07), rgba(255,255,255,.03))"
                : "#ffffff",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: isDark
                ? "1px solid rgba(255,255,255,.08)"
                : "1px solid rgba(0,0,0,0.08)",
              boxShadow: isDark
                ? "0 25px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)"
                : "0 25px 70px rgba(0,0,0,.12)",
              textAlign: "center",
              color: isDark ? "#fff" : "#0f172a",
            }}
          >
            <div style={{
              width: 82, height: 82, margin: "0 auto 20px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "34px",
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              boxShadow: "0 0 35px rgba(239,68,68,.45)",
            }}>
              🚪
            </div>

            <h2 style={{
              margin: 0, fontSize: 30, fontWeight: 700,
              color: isDark ? "#f8fafc" : "#0f172a",
            }}>
              Confirm Logout
            </h2>

            <p style={{
              marginTop: 15, marginBottom: 32,
              color: isDark ? "rgba(255,255,255,.65)" : "#64748b",
              lineHeight: 1.7, fontSize: 15,
            }}>
              Are you sure you want to logout?
              <br />
              You'll need to sign in again to
              access your dashboard.
            </p>

            <div style={{ display: "flex", gap: 14 }}>
              <button
                style={{
                  flex: 1, padding: "14px", borderRadius: "16px",
                  border: isDark ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(0,0,0,0.1)",
                  background: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,0.05)",
                  color: isDark ? "#fff" : "#0f172a",
                  cursor: "pointer", fontWeight: 600, transition: ".25s", fontSize: "14px",
                }}
                onClick={onCancel}
              >
                Cancel
              </button>

              <button
                style={{
                  flex: 1, padding: "14px", borderRadius: "16px", border: "none",
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "#fff", fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(239,68,68,.35)", transition: ".25s", fontSize: "14px",
                }}
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

export default LogoutModal;