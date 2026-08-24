import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from 'react'
import "./Attendance.css";
import StatCard from "../components/Dashboard/StatCard";
import GlassScrollArea from "../components/GlassScrollArea";
import { apiFetch, API_BASE } from "../api";
import { useTheme } from "../context/ThemeContext";
function Attendance() {
  const { isDark } = useTheme();

  const [attendance, setAttendance] = useState([])
  const [selectedDate, setSelectedDate] = useState(
  new Date().toLocaleDateString(
    'en-CA'
  )
)
  const [leaveBalance, setLeaveBalance] = useState([])
  const [monthlySummary, setMonthlySummary] = useState([])
  const [searchTerm, setSearchTerm] =
  useState("");
  useEffect(() => {

  apiFetch(`${API_BASE}/api/attendance/${selectedDate}`)
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setAttendance(data); })
    .catch(err => console.error(err))

}, [selectedDate])
  
useEffect(() => {

  apiFetch(`${API_BASE}/api/leave-balance`)
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setLeaveBalance(data); })
    .catch(err => console.error(err))

}, [])
useEffect(() => {

  apiFetch(`${API_BASE}/api/monthly-attendance-summary`)
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setMonthlySummary(data); })
    .catch(err => console.error(err))

}, [])
useEffect(() => {

  apiFetch(`${API_BASE}/api/process-monthly-leaves`,
    {
      method: "POST"
    }
  )
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log(err))

}, [])
useEffect(() => {

  const interval = setInterval(() => {

    const currentDate =
  new Date()
    .toLocaleDateString(
      'en-CA'
    )

    if (currentDate !== selectedDate) {

      setSelectedDate(currentDate)

    }

  }, 60000)

  return () => clearInterval(interval)

}, [selectedDate])
  

const leaveMap = {}

leaveBalance.forEach(item => {

  leaveMap[item.employee_id] =
    item.available_leaves

})
const updateAttendance = (
  id,
  employeeId,
  status
) => {

  const currentLeaveBalance =
    leaveMap[employeeId] ?? 0

  const employeeRecord =
  attendance.find(
    record => record.id === id
  )

if (
  employeeRecord.status === status
) {

  alert(
    `Employee is already marked as ${status}`
  )

  return

}

  if (
    status === "Paid Leave" &&
    currentLeaveBalance <= 0
  ) {
    alert("No paid leaves remaining")
    return
  }

  apiFetch(`${API_BASE}/api/attendance/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('Failed to update attendance');
    if (status === "Paid Leave") {

      return apiFetch(`${API_BASE}/api/leave-balance/${employeeId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            available_leaves:
              currentLeaveBalance - 1
          })
        }
      )

    }

  })
  .then(() =>
  Promise.all([
    apiFetch(`${API_BASE}/api/attendance/${selectedDate}`
    ).then(res => res.json()),

    apiFetch(`${API_BASE}/api/leave-balance`
    ).then(res => res.json()),

    apiFetch(`${API_BASE}/api/monthly-attendance-summary`
    ).then(res => res.json())
  ])
)
.then((
  [
    attendanceData,
    leaveData,
    monthlyData
  ]
) => {

  if (Array.isArray(attendanceData)) setAttendance(attendanceData)

  if (Array.isArray(leaveData)) setLeaveBalance(leaveData)

  if (Array.isArray(monthlyData)) setMonthlySummary(monthlyData)

})
.catch(err => console.error(err))}
const generateTodayAttendance = () => {

  apiFetch(`${API_BASE}/api/attendance/generate-today`,
    {
      method: "POST"
    }
  )
    .then(res => {
      if (!res.ok) throw new Error('Failed to generate attendance');
      return res.json();
    })

    .then(data => {

      alert(data.message)

      const currentDate =
  new Date()
    .toLocaleDateString(
      'en-CA'
    )

      setSelectedDate(currentDate)

      return apiFetch(`${API_BASE}/api/attendance/${currentDate}`)

    })

    .then(res => res.json())

    .then(data => {
      if (Array.isArray(data)) setAttendance(data);
    })

    .catch(err => {
      console.error(err);
      alert('Error: ' + err.message);
    })

}
const formattedDate = new Date(
  selectedDate
).toLocaleDateString(
  'en-GB',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
)
const previousDay = () => {

  const date = new Date(selectedDate)

  date.setDate(date.getDate() - 1)

  setSelectedDate(
  date.toLocaleDateString(
    'en-CA'
  )
)

}
const nextDay = () => {

  if (selectedDate >= todayDate) {
    return
  }

  const date = new Date(selectedDate)

  date.setDate(date.getDate() + 1)

  setSelectedDate(
  date.toLocaleDateString(
    'en-CA'
  )
)

}
const todayDate =
  new Date()
    .toLocaleDateString(
      'en-CA'
    )


const filteredAttendance =
  attendance.filter((record) =>
    record.name
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  );
  return (
    

    <div className="hr-page-light">

      <div className="attendanceHero">

    <div>

        <div className="heroBadge">
            DAILY OPERATIONS
        </div>

        <h1 className="heroTitle">
            📅 Attendance Management
        </h1>

        <p className="heroSubtitle">
            Manage employee attendance, leaves and daily workforce records.
        </p>

    </div>

    <button
        onClick={generateTodayAttendance}
        style={getGlassButton(isDark)}
    >
        📅 Generate Attendance
    </button>

</div>
<div style={cardContainer}>

  <StatCard
    title="Total Employees"
    value={attendance.length}
    subtitle="All Registered"
    color="#3b82f6"
    delay={0.15}
    icon="employees"
  />

  <StatCard
    title="Present"
    value={
      attendance.filter(
        e => e.status === "Present"
      ).length
    }
    subtitle="Today"
    color="#22c55e"
    delay={0.3}
    icon="attendance"
  />

  <StatCard
    title="Absent"
    value={
      attendance.filter(
        e => e.status === "Absent"
      ).length
    }
    subtitle="Today"
    color="#ef4444"
    delay={0.45}
    icon="attendance"
  />

  <StatCard
    title="On Leave"
    value={
      attendance.filter(
        e => e.status === "Paid Leave"
      ).length
    }
    subtitle="Paid Leave"
    color="#f59e0b"
    delay={0.6}
    icon="leave"
  />

  <StatCard
    title="Not Marked"
    value={
      attendance.filter(
        e => e.status === "Not Marked"
      ).length
    }
    subtitle="Pending"
    color="#64748b"
    delay={0.75}
    icon="attendance"
  />

</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: "24px",
    alignItems: "start",
    marginBottom: "30px",
  }}
>
<div
  style={{
  background:
    "linear-gradient(180deg,rgba(17,24,39,.75),rgba(15,23,42,.75))",

  borderRadius: "28px",

  border:
    "1px solid rgba(255,255,255,.08)",

  backdropFilter: "blur(22px)",

  WebkitBackdropFilter: "blur(22px)",

  boxShadow:
    "0 15px 40px rgba(0,0,0,.28)",

  padding: "30px",
}}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "20px"
    }}
  >
    <div>
      <h2
        style={{
          color: "#f8fafc",
          margin: 0
        }}
      >
        Attendance Calendar
      </h2>

      <p
        style={{
          color: "#94a3b8",
          marginTop: "5px"
        }}
      >
        Select a date to manage attendance
      </p>
    </div>

    <div
  style={{
    padding: "10px 18px",

    borderRadius: "14px",

    background:
      "rgba(55,255,215,.08)",

    border:
      "1px solid rgba(55,255,215,.18)",

    color: "#37FFD7",

    fontWeight: "700",

    fontSize: "14px",

    letterSpacing: ".5px",
  }}
>
  {formattedDate}
</div>
  </div>

  <Calendar
  className="attendance-calendar"
  value={new Date(selectedDate)}
  maxDate={new Date()}
  onChange={(date) =>
    setSelectedDate(
      date.toLocaleDateString("en-CA")
    )
  }
/>
<div
  style={{
  marginTop: "24px",

  paddingTop: "24px",

  borderTop:
    "1px solid rgba(255,255,255,.08)",

  display: "flex",

  gap: "24px",

  flexWrap: "wrap",
}}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#f8fafc",
      fontSize: "14px"
    }}
  >
    <span
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "#22c55e",
        display: "inline-block"
      }}
    />
    Full Day Marked
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#f8fafc",
      fontSize: "14px"
    }}
  >
    <span
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "#f59e0b",
        display: "inline-block"
      }}
    />
    Partially Marked
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#f8fafc",
      fontSize: "14px"
    }}
  >
    <span
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "#64748b",
        display: "inline-block"
      }}
    />
    Not Generated
  </div>
</div>

</div>

<div>

      
  <h2
    style={{
      color: "#f8fafc",
      marginBottom: "20px"
    }}
  >
    Attendance for {formattedDate}
  </h2>
  
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  }}
>
  <div>
    <h2
      style={{
        margin: 0,
        color: "#f8fafc",
        fontSize: "28px",
        fontWeight: "700",
      }}
    >
      Attendance Records
    </h2>

    <p
      style={{
        marginTop: "6px",
        color: "#94a3b8",
      }}
    >
      Daily employee attendance overview
    </p>
  </div>

  <input
    type="text"
    placeholder="🔍 Search employee..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={searchInput}
  />
</div>
  <GlassScrollArea height={650}>

<table style={tableStyle}>
    <thead>
      <tr>
        <th style={newHeader}>Employee ID</th>
        <th style={newHeader}>Employee Name</th>
        <th style={newHeader}>Status</th>
        <th style={newHeader}>Leave Balance</th>
        <th style={newHeader}>Action</th>
      </tr>
    </thead>

    <tbody>
      {filteredAttendance.map((record) => (
        <tr
  key={record.id}
  style={{
    background:
      record.id % 2 === 0
        ? "rgba(255,255,255,.02)"
        : "transparent",

    transition: ".25s"
  }}

  onMouseEnter={(e)=>{
    e.currentTarget.style.background =
      "rgba(0,212,255,.06)";
  }}

  onMouseLeave={(e)=>{
    e.currentTarget.style.background =
      record.id % 2 === 0
        ? "rgba(255,255,255,.02)"
        : "transparent";
  }}
>
          <td style={newCell}>
            EMP{String(record.employee_id).padStart(3, "0")}
          </td>

          <td style={newCell}>

<div
style={{
display:"flex",
alignItems:"center",
gap:"14px"
}}
>

<div
style={{
width:"42px",
height:"42px",
borderRadius:"50%",
background:
"linear-gradient(135deg,#00d4ff,#2563eb)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontWeight:"700",
fontSize:"16px"
}}
>
{record.name.charAt(0)}
</div>

<div>

<div
style={{
fontWeight:"700",
color:"#fff"
}}
>
{record.name}
</div>

<div
style={{
fontSize:"12px",
color:"#94a3b8"
}}
>
EMP{String(record.employee_id).padStart(3,"0")}
</div>

</div>

</div>

</td>

          <td style={newCell}>
            <span
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",

    padding: "8px 16px",

    borderRadius: "999px",

    fontWeight: "700",

    fontSize: "13px",

    border:
      record.status === "Present"
        ? "1px solid rgba(34,197,94,.35)"
        : record.status === "Absent"
        ? "1px solid rgba(239,68,68,.35)"
        : record.status === "Paid Leave"
        ? "1px solid rgba(245,158,11,.35)"
        : "1px solid rgba(148,163,184,.35)",

    background:
      record.status === "Present"
        ? "rgba(34,197,94,.12)"
        : record.status === "Absent"
        ? "rgba(239,68,68,.12)"
        : record.status === "Paid Leave"
        ? "rgba(245,158,11,.12)"
        : "rgba(148,163,184,.12)",

    color:
      record.status === "Present"
        ? "#4ade80"
        : record.status === "Absent"
        ? "#f87171"
        : record.status === "Paid Leave"
        ? "#fbbf24"
        : "#cbd5e1",

    boxShadow:
      record.status === "Present"
        ? "0 0 15px rgba(34,197,94,.18)"
        : record.status === "Absent"
        ? "0 0 15px rgba(239,68,68,.18)"
        : record.status === "Paid Leave"
        ? "0 0 15px rgba(245,158,11,.18)"
        : "none",
  }}
>
  {record.status === "Present" && "🟢"}
  {record.status === "Absent" && "🔴"}
  {record.status === "Paid Leave" && "🟠"}
  {record.status === "Not Marked" && "⚪"}

  {record.status}
</span>
          </td>

          <td style={newCell}>
            {leaveMap[record.employee_id] ?? 0}
          </td>

          <td style={newCell}>
            <select
              value={record.status}
              onChange={(e) =>
                updateAttendance(
                  record.id,
                  record.employee_id,
                  e.target.value
                )
              }
             style={{
  width: "170px",

  padding: "11px 14px",

  borderRadius: "12px",

  border: "1px solid rgba(255,255,255,.08)",

  background:
    "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",

  color: "#f8fafc",

  backdropFilter: "blur(18px)",

  WebkitBackdropFilter: "blur(18px)",

  fontWeight: "600",

  cursor: "pointer",

  outline: "none",

  transition: ".25s",

  boxShadow:
    "0 8px 22px rgba(0,0,0,.22)"
}}
            >
              <option
  value="Present"
  style={{
    background: "#0f172a",
    color: "#fff"
  }}
>
  🟢 Present
</option>
<option
  value="Absent"
  style={{
    background: "#0f172a",
    color: "#fff"
  }}
>
  🔴 Absent
</option>

<option
  value="Paid Leave"
  style={{
    background: "#0f172a",
    color: "#fff"
  }}
>
  🟠 Paid Leave
</option>

<option
  value="Not Marked"
  style={{
    background: "#0f172a",
    color: "#fff"
  }}
>
  ⚪ Not Marked
</option>
            </select>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  </GlassScrollArea>
</div>
</div>
      <div
 style={{

background:
"linear-gradient(180deg,rgba(17,24,39,.78),rgba(15,23,42,.78))",

backdropFilter:"blur(22px)",

WebkitBackdropFilter:"blur(22px)",

borderRadius:"28px",

padding:"30px",

border:"1px solid rgba(255,255,255,.08)",

boxShadow:"0 18px 45px rgba(0,0,0,.28)",

marginTop:"30px"

}}
>
  <div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"24px"
}}
>

<div>

<h2
style={{
margin:0,
color:"#fff",
fontSize:"28px"
}}
>
Monthly Attendance Summary
</h2>

<p
style={{
marginTop:"6px",
color:"#94a3b8"
}}
>
Employee attendance overview for the current month
</p>

</div>

</div>

  <GlassScrollArea height={500}>

<table style={tableStyle}>
  

    <thead>
      <tr>
        <th style={newHeader}>
          Employee ID
        </th>

        <th style={newHeader}>
          Employee Name
        </th>

        <th style={newHeader}>
          Present Days
        </th>

        <th style={newHeader}>
          Absent Days
        </th>

        <th style={newHeader}>
          Paid Leave Days
        </th>
        <th style={newHeader}>
  Total Days
</th>
        <th style={newHeader}>
          Attendance %
        </th>
      </tr>
    </thead>

    <tbody>

      {monthlySummary.map(
        (employee) => (

          <tr
  key={employee.id}
  style={{
    background:
      employee.id % 2 === 0
        ? "rgba(255,255,255,.02)"
        : "transparent",

    transition: ".25s"
  }}

  onMouseEnter={(e)=>{
    e.currentTarget.style.background =
      "rgba(0,212,255,.06)";
  }}

  onMouseLeave={(e)=>{
    e.currentTarget.style.background =
      employee.id % 2 === 0
        ? "rgba(255,255,255,.02)"
        : "transparent";
  }}
>

            <td style={newCell}>
              EMP{String(employee.id).padStart(3,"0")}
            </td>

            <td style={newCell}>

<div
style={{
display:"flex",
alignItems:"center",
gap:"14px"
}}
>

<div
style={{
width:"42px",
height:"42px",
borderRadius:"50%",
background:
"linear-gradient(135deg,#00d4ff,#2563eb)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontWeight:"700",
fontSize:"16px",
flexShrink:0
}}
>
{employee.name.charAt(0)}
</div>

<div>

<div
style={{
fontWeight:"700",
color:"#fff"
}}
>
{employee.name}
</div>

<div
style={{
fontSize:"12px",
color:"#94a3b8"
}}
>
EMP{String(employee.id).padStart(3,"0")}
</div>

</div>

</div>

</td>

            <td style={newCell}>

<span
style={{
padding:"8px 14px",
borderRadius:"999px",
background:"rgba(34,197,94,.12)",
border:"1px solid rgba(34,197,94,.3)",
color:"#4ade80",
fontWeight:"700"
}}
>
🟢 {employee.present_days}
</span>

</td>

            <td style={newCell}>

<span
style={{
padding:"8px 14px",
borderRadius:"999px",
background:"rgba(239,68,68,.12)",
border:"1px solid rgba(239,68,68,.3)",
color:"#f87171",
fontWeight:"700"
}}
>
🔴 {employee.absent_days}
</span>

</td>

            <td style={newCell}>

<span
style={{
padding:"8px 14px",
borderRadius:"999px",
background:"rgba(245,158,11,.12)",
border:"1px solid rgba(245,158,11,.3)",
color:"#fbbf24",
fontWeight:"700"
}}
>
🟠 {employee.paid_leave_days}
</span>

</td>
            <td style={newCell}>
  {Number(employee.present_days)
    +
    Number(employee.absent_days)
    +
    Number(employee.paid_leave_days)}
</td>
            <td style={newCell}>

<span
style={{

display:"inline-flex",

alignItems:"center",

padding:"8px 16px",

borderRadius:"999px",

background:"rgba(34,197,94,.12)",

border:"1px solid rgba(34,197,94,.30)",

color:"#4ade80",

fontWeight:"700",

boxShadow:"0 0 15px rgba(34,197,94,.18)"

}}
>

🟢 {employee.attendance_percentage}%

</span>

</td>

          </tr>

      ))}

    </tbody>
  </table>
  </GlassScrollArea>
</div>



    </div>

  )
}
const generateButton = {
  padding: '14px 22px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  marginBottom: '24px',
  fontWeight: '600',
  boxShadow:
    '0 4px 20px rgba(37,99,235,0.3)'
}
const tableStyle = {

    width:"100%",

    minWidth:"1200px",

    borderCollapse:"separate",

    borderSpacing:"0",

    color:"#f8fafc",

    textAlign:"center",

}



const headerStyle = {
  padding: '18px',
  textAlign: 'left',
  borderBottom: '1px solid #334155',
  fontSize: '15px',
  color: '#cbd5e1',
  background: '#0f172a'
}
const rowStyle = {
  borderBottom: '1px solid #334155'
}

const cardsContainer = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
}

const dashboardCard = {
  background: '#1e293b',
  borderRadius: '20px',
  padding: '28px',
  textAlign: 'center',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)'
}
const blueCardNumber = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#2563eb'
}

const greenCardNumber = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#16a34a'
}

const redCardNumber = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#dc2626'
}

const orangeCardNumber = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#ea580c'
}

const dateBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
}

const navButton = {
  padding: '12px 20px',
  background: '#1d4ed8',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  boxShadow:
    '0 4px 20px rgba(37,99,235,0.3)'
}
const newHeader = {
  position: "sticky",
  top: 0,
  zIndex: 20,

  padding: "18px 22px",

  textAlign: "left",

  background:
    "linear-gradient(180deg,#0f172a,#111827)",

  color: "#e2e8f0",

  fontSize: "14px",

  fontWeight: "700",

  letterSpacing: ".7px",

  textTransform: "uppercase",

  borderBottom:
    "1px solid rgba(255,255,255,.08)",

  backdropFilter: "blur(18px)",

  boxShadow:
    "0 6px 20px rgba(0,0,0,.18)"
};
const newCell = {

  padding: "18px 22px",

  color: "#f8fafc",

  fontSize: "15px",

  borderBottom:
    "1px solid rgba(255,255,255,.06)",

  transition: "all .25s ease",

  verticalAlign: "middle"
};

const glassButton = {
  padding: "12px 22px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,.08)",
  background: "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  color: "#f8fafc",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all .25s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 12px 30px rgba(0,0,0,.25)"
};
function getGlassButton(isDark) {
  return {
    ...glassButton,
    border: isDark ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(0,0,0,0.1)",
    background: isDark
      ? "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))"
      : "rgba(255,255,255,0.85)",
    color: isDark ? "#f8fafc" : "#0f172a",
    boxShadow: isDark ? "0 12px 30px rgba(0,0,0,.25)" : "0 2px 8px rgba(0,0,0,0.06)",
  };
}
const cardContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};
const searchInput = {
  width: "300px",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.04)",
  color: "#f8fafc",
  outline: "none",
  backdropFilter: "blur(18px)",
};
function getSearchInput(isDark) {
  return {
    ...searchInput,
    border: isDark ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(0,0,0,0.1)",
    background: isDark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,0.85)",
    color: isDark ? "#f8fafc" : "#0f172a",
  };
}
export default Attendance