import { useState } from "react";
import { Toaster } from "react-hot-toast";
import {
  HashRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import Sidebar from "./components/Sidebar";
import EmployeeSidebar from "./components/EmployeeSidebar";
import AIAssistant from "./components/AIAssistant";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import Leave from "./pages/Leave";
import Performance from "./pages/Performance";
import Reports from "./pages/Reports";
import PayrollReport from "./pages/PayrollReport";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OutsourcedEmployees from "./pages/OutsourcedEmployees";
import ThirdPartyPayroll from "./pages/ThirdPartyPayroll";
import LoginAnimation from "./components/LoginAnimation";
import HRDocuments from "./pages/HRDocuments";
import EmployeeProfile from "./pages/EmployeeProfile";
import LogoutModal from "./components/LogoutModal";
import { supabase } from "./supabaseClient";
import WorkLogs from "./pages/WorkLogs";
import InvoiceManagement from "./pages/InvoiceManagement";
import ProtectedRoute from "./ProtectedRoute";

import EmployeeHome from "./pages/emp/EmployeeHome";
import EmployeeAttendance from "./pages/emp/EmployeeAttendance";
import EmployeeLeave from "./pages/emp/EmployeeLeave";
import EmployeePayroll from "./pages/emp/EmployeePayroll";
import EmployeePayrollReport from "./pages/emp/EmployeePayrollReport";
import EmployeeWorkLogs from "./pages/emp/EmployeeWorkLogs";
import EmployeePerformance from "./pages/emp/EmployeePerformance";
import EmployeeProfilePage from "./pages/emp/EmployeeProfile";


function AppContent() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isDark } = useTheme();

  const hideSidebar = ["/", "/login", "/signup", "/login-animation"].includes(location.pathname);

  const hrPages = [
    "/dashboard", "/employees", "/attendance", "/payroll", "/payroll-report",
    "/leave", "/performance", "/reports", "/outsourced-employees",
    "/hr-documents", "/employee-profile", "/work-logs", "/invoices",
  ].includes(location.pathname);

  const empPages = [
    "/employee-dashboard", "/emp-attendance", "/emp-leave", "/emp-payroll",
    "/emp-payroll-report", "/emp-work-logs", "/emp-performance", "/emp-profile",
  ].includes(location.pathname);

  const showHRSidebar = !hideSidebar && hrPages;
  const showEmpSidebar = !hideSidebar && empPages;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("payroll_keep_signed_in");
      sessionStorage.removeItem("payroll_session_only");
      window.location.hash = "#/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Theme Toggle - always top right */}
      {!hideSidebar && (
        <div style={{
          position: "fixed",
          top: 16,
          right: 20,
          zIndex: 9999,
        }}>
          <ThemeToggle />
        </div>
      )}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? "#1e293b" : "#ffffff",
            color: isDark ? "#f8fafc" : "#0f172a",
            border: isDark ? "1px solid rgba(55,255,215,.15)" : "1px solid rgba(0,0,0,0.08)",
            borderRadius: "14px",
            boxShadow: isDark ? "0 12px 35px rgba(0,0,0,.35)" : "0 12px 35px rgba(0,0,0,.1)",
            padding: "14px 18px",
            fontWeight: "600",
          },
          success: { iconTheme: { primary: "#37FFD7", secondary: isDark ? "#08111d" : "#ffffff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
        }}
      />

      {showHRSidebar && (
        <Sidebar onToggle={setSidebarCollapsed} onLogout={() => setShowLogoutModal(true)} />
      )}

      {showEmpSidebar && (
        <EmployeeSidebar onToggle={setSidebarCollapsed} onLogout={() => setShowLogoutModal(true)} />
      )}

      <div
        style={{
          marginLeft: hideSidebar ? "0" : (showHRSidebar || showEmpSidebar) ? (sidebarCollapsed ? "80px" : "280px") : "0",
          padding: hideSidebar ? "0" : "30px",
          minHeight: "100vh",
          background: "transparent",
          transition: "margin-left .3s ease",
          overflowY: "auto",
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login-animation" element={<LoginAnimation />} />

          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["hr"]}><Dashboard /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute allowedRoles={["hr"]}><Employees /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={["hr", "employee"]}><Attendance /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute allowedRoles={["hr"]}><Payroll /></ProtectedRoute>} />
          <Route path="/payroll-report" element={<ProtectedRoute allowedRoles={["hr"]}><PayrollReport /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute allowedRoles={["hr", "employee"]}><Leave /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute allowedRoles={["hr"]}><Performance /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={["hr"]}><Reports /></ProtectedRoute>} />
          <Route path="/outsourced-employees" element={<ProtectedRoute allowedRoles={["hr"]}><OutsourcedEmployees /></ProtectedRoute>} />
          <Route path="/third-party-payroll" element={<ProtectedRoute allowedRoles={["hr"]}><ThirdPartyPayroll /></ProtectedRoute>} />
          <Route path="/hr-documents" element={<ProtectedRoute allowedRoles={["hr"]}><HRDocuments /></ProtectedRoute>} />
          <Route path="/employee-profile" element={<ProtectedRoute allowedRoles={["hr", "employee"]}><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/work-logs" element={<ProtectedRoute allowedRoles={["hr", "employee"]}><WorkLogs /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute allowedRoles={["hr"]}><InvoiceManagement /></ProtectedRoute>} />

          <Route path="/employee-dashboard" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeHome /></ProtectedRoute>} />
          <Route path="/emp-attendance" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeAttendance /></ProtectedRoute>} />
          <Route path="/emp-leave" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeLeave /></ProtectedRoute>} />
          <Route path="/emp-payroll" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeePayroll /></ProtectedRoute>} />
          <Route path="/emp-payroll-report" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeePayrollReport /></ProtectedRoute>} />
          <Route path="/emp-work-logs" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeWorkLogs /></ProtectedRoute>} />
          <Route path="/emp-performance" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeePerformance /></ProtectedRoute>} />
          <Route path="/emp-profile" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeProfilePage /></ProtectedRoute>} />
        </Routes>
        {showHRSidebar && <AIAssistant />}
      </div>
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={async () => { setShowLogoutModal(false); await handleLogout(); }}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
