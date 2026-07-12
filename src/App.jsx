import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

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

function AppContent() {
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const hideSidebar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/login-animation" ||
    location.pathname === "/employee-dashboard";

  return (
    <>
      {!hideSidebar && (
        <Sidebar onToggle={setSidebarCollapsed} />
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

          background: hideSidebar
            ? "transparent"
            : "#0f172a",

          transition: "margin-left .3s ease",
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />

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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;