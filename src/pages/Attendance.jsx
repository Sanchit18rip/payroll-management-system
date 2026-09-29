import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from 'react'
import "./Attendance.css";
import StatCard from "../components/Dashboard/StatCard";
import GlassScrollArea from "../components/GlassScrollArea";
import { apiFetch, API_BASE } from "../api";
function Attendance() {

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
    .then(() => {})
    .catch(err => console.error(err))

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

if (!employeeRecord) {
  alert('Attendance record not found')
  return
}

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
    // Backend handles leave balance deduction/return automatically
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
        style={getGlassButton()}
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
    "#ffffff",

  borderRadius: "28px",

  border:
    "1px solid #e2e8f0",

  backdropFilter: "blur(22px)",

  WebkitBackdropFilter: "blur(22px)",

  boxShadow:
    "0 2px 8px rgba(0,0,0,.06)",

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
          color: "#0f172a",
          margin: 0
        }}
      >
        Attendance Calendar
      </h2>

      <p
        style={{
          color: "#64748b",
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
      "rgba(8,145,178,.08)",

    border:
      "1px solid rgba(8,145,178,.25)",

    color: "#0891b2",

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
    "1px solid #e2e8f0",

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
      color: "#0f172a",
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
      color: "#0f172a",
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
      color: "#0f172a",
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
      color: "#0f172a",
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
        color: "#0f172a",
        fontSize: "28px",
        fontWeight: "700",
      }}
    >
      Attendance Records
    </h2>

    <p
      style={{
        marginTop: "6px",
        color: "#64748b",
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
    style={getSearchInput()}
  />
</div>
  <GlassScrollArea height={650}>

<table style={getTableStyle()}>
    <thead>
      <tr>
        <th style={getNewHeader()}>Employee ID</th>
        <th style={getNewHeader()}>Employee Name</th>
        <th style={getNewHeader()}>Status</th>
        <th style={getNewHeader()}>Leave Balance</th>
        <th style={getNewHeader()}>Action</th>
      </tr>
    </thead>

    <tbody>
      {filteredAttendance.map((record) => (
        <tr
  key={record.id}
  style={{
    background:
      record.id % 2 === 0
        ? "rgba(15,23,42,.02)"
        : "transparent",

    transition: ".25s"
  }}

  onMouseEnter={(e)=>{
    e.currentTarget.style.background =
      "rgba(37,99,235,.06)";
  }}

  onMouseLeave={(e)=>{
    e.currentTarget.style.background =
      record.id % 2 === 0
        ? "rgba(15,23,42,.02)"
        : "transparent";
  }}
>
          <td style={getNewCell()}>
            EMP{String(record.employee_id).padStart(3, "0")}
          </td>

          <td style={getNewCell()}>

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
color: "#0f172a"}}
>
{record.name}
</div>

<div
style={{
fontSize:"12px",
color: "#64748b"}}
>
EMP{String(record.employee_id).padStart(3,"0")}
</div>

</div>

</div>

</td>

          <td style={getNewCell()}>
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

          <td style={getNewCell()}>
            {leaveMap[record.employee_id] ?? 0}
          </td>

          <td style={getNewCell()}>
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
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#0f172a",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  fontWeight: "600",
  cursor: "pointer",
  outline: "none",
  transition: ".25s",
  boxShadow: "0 2px 4px rgba(0,0,0,.06)"}}
            >
              <option
  value="Present"
  style={{
    background: "#ffffff",
    color: "#0f172a"}}
>
  🟢 Present
</option>
<option
  value="Absent"
  style={{
    background: "#ffffff",
    color: "#0f172a"}}
>
  🔴 Absent
</option>

<option
  value="Paid Leave"
  style={{
    background: "#ffffff",
    color: "#0f172a"}}
>
  🟠 Paid Leave
</option>

<option
  value="Not Marked"
  style={{
    background: "#ffffff",
    color: "#0f172a"}}
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
 "#ffffff",

backdropFilter:"blur(22px)",

WebkitBackdropFilter:"blur(22px)",

borderRadius:"28px",

padding:"30px",

border: "1px solid #e2e8f0",

boxShadow: "0 2px 8px rgba(0,0,0,.06)",

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
color: "#0f172a",
fontSize:"28px"
}}
>
Monthly Attendance Summary
</h2>

<p
style={{
marginTop:"6px",
color: "#64748b"}}
>
Employee attendance overview for the current month
</p>

</div>

</div>

  <GlassScrollArea height={500}>

<table style={getTableStyle()}>
  

    <thead>
      <tr>
        <th style={getNewHeader()}>
          Employee ID
        </th>

        <th style={getNewHeader()}>
          Employee Name
        </th>

        <th style={getNewHeader()}>
          Present Days
        </th>

        <th style={getNewHeader()}>
          Absent Days
        </th>

        <th style={getNewHeader()}>
          Paid Leave Days
        </th>
        <th style={getNewHeader()}>
  Total Days
</th>
        <th style={getNewHeader()}>
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
        ? "rgba(15,23,42,.02)"
        : "transparent",

    transition: ".25s"
  }}

  onMouseEnter={(e)=>{
    e.currentTarget.style.background =
      "rgba(37,99,235,.06)";
  }}

  onMouseLeave={(e)=>{
    e.currentTarget.style.background =
      employee.id % 2 === 0
        ? "rgba(15,23,42,.02)"
        : "transparent";
  }}
>

            <td style={getNewCell()}>
              EMP{String(employee.id).padStart(3,"0")}
            </td>

            <td style={getNewCell()}>

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
color: "#0f172a"}}
>
{employee.name}
</div>

<div
style={{
fontSize:"12px",
color: "#64748b"}}
>
EMP{String(employee.id).padStart(3,"0")}
</div>

</div>

</div>

</td>

            <td style={getNewCell()}>

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

            <td style={getNewCell()}>

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

            <td style={getNewCell()}>

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
            <td style={getNewCell()}>
  {Number(employee.present_days)
    +
    Number(employee.absent_days)
    +
    Number(employee.paid_leave_days)}
</td>
            <td style={getNewCell()}>

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
function getTableStyle() {
  return {
    width:"100%",
    minWidth:"1200px",
    borderCollapse:"separate",
    borderSpacing:"0",
    color: "#0f172a",
    textAlign:"center",
  };
}


function getNewHeader() {
  return {
    position: "sticky",
    top: 0,
    zIndex: 20,
    padding: "18px 22px",
    textAlign: "left",
    background: "rgba(241,245,249,.98)",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: ".7px",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 2px 4px rgba(0,0,0,.04)",
  };
}
function getNewCell() {
  return {
    padding: "18px 22px",
    color: "#0f172a",
    fontSize: "15px",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    transition: "all .25s ease",
    verticalAlign: "middle",
  };
}

const glassButton = {
  padding: "12px 22px",
  borderRadius: "16px",
  border: "1px solid rgba(0,0,0,0.1)",
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  color: "#0f172a",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all .25s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
};
function getGlassButton() {
  return {
    ...glassButton,
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.85)",
    color: "#0f172a",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
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
  border: "1px solid rgba(0,0,0,0.1)",
  background: "rgba(255,255,255,0.85)",
  color: "#0f172a",
  outline: "none",
  backdropFilter: "blur(18px)",
};
function getSearchInput() {
  return {
    ...searchInput,
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.85)",
    color: "#0f172a",
  };
}
export default Attendance