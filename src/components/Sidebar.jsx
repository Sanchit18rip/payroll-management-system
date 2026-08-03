import {
  Link,
  useNavigate
} from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../supabaseClient'
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
} from "lucide-react";

function Sidebar({
  onToggle,
  onLogout,
}) {

  const [collapsed, setCollapsed] =
    useState(false)
  
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
    title: "Clients",
    icon: Building2,
    path: "/clients",
  },
  {
    title: "Worklogs",
    icon: Building2,
    path: "work-logs",
  },
];

const handleLogout = async () => {

  try {

    await supabase.auth.signOut()

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
    <h2>Payroll Pro</h2>
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

  )
}

export default Sidebar