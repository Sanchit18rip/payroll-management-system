import {
  Link,
  useNavigate
} from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import './Sidebar.css'

function Sidebar({
  onToggle
}) {

  const [collapsed, setCollapsed] =
    useState(false)
  const [

  showLogoutModal,

  setShowLogoutModal

] = useState(false)
  const navigate = useNavigate()
  

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
    ☰
  </button>

  {!collapsed && (
    <h2>Payroll Pro</h2>
  )}

</div>

      <Link to="/">

  📊

  {!collapsed && ' Dashboard'}

</Link>

      <Link to="/employees">
  👥 {!collapsed && 'Employees'}
</Link>

<Link to="/attendance">
  🕒 {!collapsed && 'Attendance'}
</Link>

<Link to="/payroll">
  💰 {!collapsed && 'Payroll'}
</Link>

<Link to="/leave">
  📅 {!collapsed && 'Leave'}
</Link>

<Link to="/performance">
  ⭐ {!collapsed && 'Performance'}
</Link>

<Link to="/reports">
  📈 {!collapsed && 'Reports'}
</Link>

<Link to="/hr-documents">
  📋{!collapsed && 'HR Documents'}
</Link>

<Link
  to="/employee-profile"    
>
  👤 {!collapsed && 'Employee Profile'}
</Link>

<Link to="/clients">
  🏢 {!collapsed && 'Clients'}
</Link>

<Link to="/outsourced-employees">
  🤝 {!collapsed &&
    'Outsourced Employees'}
</Link>

<Link to="/third-party-payroll">
  💳 {!collapsed &&
    'Third Party Payroll'}
</Link>
<button
  onClick={() =>
  setShowLogoutModal(true)
}
  className="logout-btn"
>

  🚪

  {!collapsed &&
    ' Logout'}

</button>
{showLogoutModal && (

  <div className="modal-overlay">

    <div className="logout-modal">

      <h3>
        Confirm Logout
      </h3>

      <p>
        Are you sure you want
        to logout?
      </p>

      <div className="modal-actions">

        <button
          className="cancel-btn"
          onClick={() =>
            setShowLogoutModal(
              false
            )
          }
        >
          Cancel
        </button>

        <button
  className="confirm-btn"
  onClick={async () => {

    setShowLogoutModal(false)

    await handleLogout()

  }}
>
  Logout
</button>

      </div>

    </div>

  </div>

)}

    </div>

  )
}

export default Sidebar