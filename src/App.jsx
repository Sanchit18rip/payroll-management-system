import { useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  HashRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import BackgroundParticles from "./components/BackgroundParticles";
import Sidebar from "./components/Sidebar";
import AIAssistant from "./components/AIAssistant";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import Leave from "./pages/Leave";
import Performance from "./pages/Performance";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Clients from "./pages/Clients";
import OutsourcedEmployees from "./pages/OutsourcedEmployees";
import ThirdPartyPayroll from "./pages/ThirdPartyPayroll";
import LoginAnimation from "./components/LoginAnimation";
import HRDocuments from "./pages/HRDocuments";
import EmployeeProfile from "./pages/EmployeeProfile";
import LogoutModal from "./components/LogoutModal";
import { supabase } from "./supabaseClient";

function AppContent() {
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
 const hideSidebar = [
  "/",
  "/login",
  "/signup",
  "/login-animation",
  "/employee-dashboard",
].includes(location.pathname);
const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    window.location.hash = "#/login";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
  return (
    <>
    <Toaster
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    duration: 3000,

    style: {
      background: "#1e293b",
      color: "#f8fafc",
      border: "1px solid rgba(55,255,215,.15)",
      borderRadius: "14px",
      boxShadow: "0 12px 35px rgba(0,0,0,.35)",
      padding: "14px 18px",
      fontWeight: "600",
    },

    success: {
      iconTheme: {
        primary: "#37FFD7",
        secondary: "#08111d",
      },
    },

    error: {
      iconTheme: {
        primary: "#ef4444",
        secondary: "#ffffff",
      },
    },
  }}
/>
      {!hideSidebar && (
       <Sidebar
  onToggle={setSidebarCollapsed}
  onLogout={() => setShowLogoutModal(true)}
/>
      )}

      <div
        style={{
          marginLeft: hideSidebar
            ? "0"
            : sidebarCollapsed
            ? "80px"
            : "280px",

          padding: hideSidebar ? "0" : "30px",

          minHeight: "100vh",

          background: "transparent",

          transition: "margin-left .3s ease",
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/employees"
            element={<Employees />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/payroll"
            element={<Payroll />}
          />

          <Route
            path="/leave"
            element={<Leave />}
          />

          <Route
            path="/performance"
            element={<Performance />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/clients"
            element={<Clients />}
          />

          <Route
            path="/outsourced-employees"
            element={<OutsourcedEmployees />}
          />

          <Route
            path="/third-party-payroll"
            element={<ThirdPartyPayroll />}
          />

          <Route
            path="/hr-documents"
            element={<HRDocuments />}
          />

          <Route
            path="/employee-profile"
            element={<EmployeeProfile />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/login-animation"
            element={<LoginAnimation />}
          />

          <Route
            path="/employee-dashboard"
            element={<EmployeeDashboard />}
          />
        </Routes>
        {!hideSidebar && <AIAssistant />}
      </div>
      <LogoutModal
  open={showLogoutModal}
  onCancel={() => setShowLogoutModal(false)}
  onConfirm={async () => {
    setShowLogoutModal(false);
    await handleLogout();
  }}
/>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;