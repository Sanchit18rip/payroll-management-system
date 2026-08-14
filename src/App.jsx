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
import WorkLogs from "./pages/WorkLogs";
import ProtectedRoute from "./ProtectedRoute";
import AuthenticatorSetup from "./pages/AuthenticatorSetup";
import AuthenticatorVerify from './pages/AuthenticatorVerify'
import AuthenticatorLogin from './pages/AuthenticatorLogin'

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

         <Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={["hr"]}>
      <Dashboard />
    </ProtectedRoute>
  }
/>

          <Route
  path="/employees"
  element={
    <ProtectedRoute allowedRoles={["hr"]}>
      <Employees />
    </ProtectedRoute>
  }
/>

          <Route
  path="/attendance"
  element={
    <ProtectedRoute allowedRoles={["hr", "employee"]}>
      <Attendance />
    </ProtectedRoute>
  }
/>

          <Route
  path="/payroll"
  element={
    <ProtectedRoute allowedRoles={["hr"]}>
      <Payroll />
    </ProtectedRoute>
  }
/>
<Route
  path="/leave"
  element={
    <ProtectedRoute allowedRoles={["hr", "employee"]}>
      <Leave />
    </ProtectedRoute>
  }
/>

          <Route
  path="/performance"
  element={
    <ProtectedRoute allowedRoles={["hr"]}>
      <Performance />
    </ProtectedRoute>
  }
/>

          <Route
  path="/reports"
  element={
    <ProtectedRoute allowedRoles={["hr"]}>
      <Reports />
    </ProtectedRoute>
  }
/>
          <Route
  path="/clients"
  element={
    <ProtectedRoute allowedRoles={["hr"]}>
      <Clients />
    </ProtectedRoute>
  }
/>

          <Route
  path="/outsourced-employees"
  element={
    <ProtectedRoute allowedRoles={["hr"]}>
      <OutsourcedEmployees />
    </ProtectedRoute>
  }
/>

          <Route
            path="/third-party-payroll"
            element={<ThirdPartyPayroll />}
          />

          <Route
  path="/hr-documents"
  element={
    <ProtectedRoute allowedRoles={["hr"]}>
      <HRDocuments />
    </ProtectedRoute>
  }
/>

         <Route
  path="/employee-profile"
  element={
    <ProtectedRoute allowedRoles={["employee"]}>
      <EmployeeProfile />
    </ProtectedRoute>
  }
/>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
  path="/authenticator-login"
  element={<AuthenticatorLogin />}
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
  path="/authenticator-setup"
  element={<AuthenticatorSetup />}
/>
<Route
  path="/authenticator-verify"
  element={<AuthenticatorVerify />}
/>

          <Route
  path="/employee-dashboard"
  element={
    <ProtectedRoute allowedRoles={["employee"]}>
      <EmployeeDashboard />
    </ProtectedRoute>
  }
/>
          <Route
  path="/work-logs"
  element={
    <ProtectedRoute allowedRoles={["employee"]}>
      <WorkLogs />
    </ProtectedRoute>
  }
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