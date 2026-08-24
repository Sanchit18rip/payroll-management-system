import {
  Link,
  useNavigate,
} from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useTheme } from '../context/ThemeContext'
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
  LogOut,
  Menu,
  FileText,
} from "lucide-react";

function Sidebar({
  onToggle,
  onLogout,
}) {

  const [collapsed, setCollapsed] =
    useState(false)
  const [showBrand, setShowBrand] = useState(false)
  const { isDark } = useTheme()
  const navigate = useNavigate()
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
    title: "Invoices",
    icon: FileText,
    path: "/invoices",
  },
];

const handleLogout = async () => {

  try {

    await supabase.auth.signOut()
    localStorage.removeItem('payroll_keep_signed_in')
    sessionStorage.removeItem('payroll_session_only')

    navigate('/login')

  }

  catch (error) {

    console.error(
      'Logout failed:',
      error
    )

  }

}
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
    <div className="sidebar-brand" onClick={() => setShowBrand(true)} style={{ cursor: 'pointer' }}>
      <img src="/images/logo.png" alt="Logo" className="sidebar-logo" />
      <span className="sidebar-title">Payroll</span>
    </div>
  )}

</div>

      {menuItems.map((item) => {
  const Icon = item.icon;

  return (
    <Link
      key={item.path}
      to={item.path}
      className="sidebar-link"
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
            background: isDark ? 'rgba(2,6,23,0.85)' : 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
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
              src="/images/logo.png"
              alt="Logo"
              style={{
                width: 140,
                height: 140,
                borderRadius: 32,
                boxShadow: isDark
                  ? '0 0 60px rgba(99,102,241,0.4), 0 20px 50px rgba(0,0,0,0.5)'
                  : '0 0 40px rgba(59,130,246,0.2), 0 15px 40px rgba(0,0,0,0.1)',
                marginBottom: 24,
              }}
            />
            <h1
              style={{
                margin: 0,
                fontSize: 42,
                fontWeight: 800,
                background: 'linear-gradient(90deg, #6366f1, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px',
              }}
            >
              Payroll Management
            </h1>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 16,
                color: isDark ? '#94a3b8' : '#64748b',
                fontWeight: 500,
              }}
            >
              Talent Pay Corner
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13,
                color: isDark ? '#64748b' : '#94a3b8',
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