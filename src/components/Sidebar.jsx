import {
  Link,
  useLocation,
} from 'react-router-dom'
import { useState } from 'react'
import './Sidebar.css'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  Plane,
  BarChart3,
  ClipboardList,
  Building2,
  UserCircle,
  Menu,
  FileText,
  UserCheck,
} from "lucide-react";

function Sidebar({
  onToggle,
  onLogout,
}) {

  const [collapsed, setCollapsed] =
    useState(false)
  const [showBrand, setShowBrand] = useState(false)
  const location = useLocation()
const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Employees",
    icon: Users,
    path: "/employees",
  },
  {
    title: "Attendance",
    icon: CalendarDays,
    path: "/attendance",
  },
  {
    title: "Payroll",
    icon: Wallet,
    path: "/payroll",
  },
  {
    title: "Payroll Reports",
    icon: FileText,
    path: "/payroll-report",
  },
  {
    title: "Leave",
    icon: Plane,
    path: "/leave",
  },
  {
    title: "Performance",
    icon: BarChart3,
    path: "/performance",
  },
  {
    title: "Reports",
    icon: ClipboardList,
    path: "/reports",
  },
  {
    title: "HR Documents",
    icon: ClipboardList,
    path: "/hr-documents",
  },
  {
    title: "Employee Profile",
    icon: UserCircle,
    path: "/employee-profile",
  },
  {
    title: "Worklogs",
    icon: Building2,
    path: "/work-logs",
  },
  {
    title: "Approvals",
    icon: UserCheck,
    path: "/approvals",
  },
];

  return (
    <>
    <div
  className={`sidebar ${
    collapsed ? 'collapsed' : ''
  }`}
>

      <div className="sidebar-header">

  <button
    className="toggle-btn"
    onClick={() => {

  const newState =
    !collapsed

  setCollapsed(
    newState
  )

  onToggle(
    newState
  )

}}
  >
    <Menu size={20} />
  </button>

  {!collapsed && (
    <div className="sidebar-brand" onClick={() => setShowBrand(true)} style={{ cursor: 'pointer' }}>            <img src="/images/Logo.png" alt="Logo" className="sidebar-logo" />
            <span className="sidebar-title">Payroll</span>
    </div>
  )}

</div>

      {menuItems.map((item) => {
  const Icon = item.icon;
  const isActive = location.pathname === item.path;

  return (
    <Link
      key={item.path}
      to={item.path}
      className={`sidebar-link ${isActive ? 'active' : ''}`}
    >
      <Icon size={20} />

      {!collapsed && (
        <span>{item.title}</span>
      )}
    </Link>
    
  );
})}
<button
  onClick={onLogout}

  className="logout-btn"
>

  

  {!collapsed &&
    ' Logout'}

</button>


    </div>

      {/* Brand Overlay */}
      {showBrand && (
        <div
          onClick={() => setShowBrand(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            animation: 'brandFadeIn 0.3s ease',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              animation: 'brandScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <img
              src="/images/Logo.png"
              alt="Logo"
              style={{
                width: 260,
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto 24px',
              }}
            />
            <h1
              style={{
                margin: 0,
                fontSize: 42,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-1px',
              }}
            >
              Payroll Management
            </h1>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 16,
                color: '#0f172a',
                fontWeight: 600,
              }}
            >
              Talent Pay Corner
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13,
                color: '#334155',
              }}
            >
              Click anywhere to close
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes brandFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes brandScaleIn {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}

export default Sidebar