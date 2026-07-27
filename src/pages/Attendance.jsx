import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState, useEffect } from 'react'

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

  fetch(
    `https://payroll-management-system-three.vercel.app/api/attendance/${selectedDate}`
  )
    .then(res => res.json())
    .then(data => setAttendance(data))
    .catch(err => console.log(err))

}, [selectedDate])
  
useEffect(() => {

  fetch('https://payroll-management-system-three.vercel.app/api/leave-balance')
    .then(res => res.json())
    .then(data => setLeaveBalance(data))
    .catch(err => console.log(err))

}, [])
useEffect(() => {

  fetch(
    "https://payroll-management-system-three.vercel.app/api/monthly-attendance-summary"
  )
    .then(res => res.json())
    .then(data => setMonthlySummary(data))
    .catch(err => console.log(err))

}, [])
useEffect(() => {

  fetch(
    "https://payroll-management-system-three.vercel.app/api/process-monthly-leaves",
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
  console.log(attendance[0])
  

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

  fetch(`https://payroll-management-system-three.vercel.app/api/attendance/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status
    })
  })
  .then(() => {
    
    if (status === "Paid Leave") {

      return fetch(
        `https://payroll-management-system-three.vercel.app/api/leave-balance/${employeeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
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
    fetch(
      `https://payroll-management-system-three.vercel.app/api/attendance/${selectedDate}`
    ).then(res => res.json()),

    fetch(
      "https://payroll-management-system-three.vercel.app/api/leave-balance"
    ).then(res => res.json()),

    fetch(
      "https://payroll-management-system-three.vercel.app/api/monthly-attendance-summary"
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

  setAttendance(attendanceData)

  setLeaveBalance(leaveData)

  setMonthlySummary(monthlyData)

})}
const generateTodayAttendance = () => {

  fetch(
    "https://payroll-management-system-three.vercel.app/api/attendance/generate-today",
    {
      method: "POST"
    }
  )
    .then(res => res.json())

    .then(data => {

      alert(data.message)

      const currentDate =
  new Date()
    .toLocaleDateString(
      'en-CA'
    )

      setSelectedDate(currentDate)

      return fetch(
        `https://payroll-management-system-three.vercel.app/api/attendance/${currentDate}`
      )

    })

    .then(res => res.json())

    .then(data => setAttendance(data))

    .catch(err => console.log(err))

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

console.log(
  "Selected Date:",
  selectedDate
)

console.log(
  "Current Date:",
  new Date()
    .toLocaleDateString(
      'en-CA'
    )
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
    

    <div
  style={{
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#0f172a'
  }}
>

      <>
  <h1
    style={{
      fontSize: '42px',
      fontWeight: '700',
      color: "#f8fafc",
      marginBottom: '8px'
    }}
  >
    Attendance Management
  </h1>

  <p
    style={{
      color: '#94a3b8',
      marginBottom: '25px'
    }}
  >
    Manage daily employee attendance and leave records
  </p>
  <div
  style={{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:'25px'
  }}
>
  <div />

  <button
    onClick={generateTodayAttendance}
    style={{
      background:'#2563eb',
      color:'#fff',
      border:'none',
      borderRadius:'12px',
      padding:'14px 24px',
      cursor:'pointer',
      fontWeight:'600'
    }}
  >
    📅 Generate Today's Attendance
  </button>
</div>
</>
<div style={cardsContainer}>

  <div style={dashboardCard}>
    <h3>Total Employees</h3>
<p style={{
  color:'#94a3b8',
  marginTop:'10px'
}}>
  All registered
</p>
    <p style={blueCardNumber}>
      {attendance.length}
    </p>
  </div>

  <div style={dashboardCard}>
    <h3>Present</h3>
<p style={{
  color:'#94a3b8',
  marginTop:'10px'
}}>
  Today
</p>
    <p style={greenCardNumber}>
      {
        attendance.filter(
          e => e.status === "Present"
        ).length
      }
    </p>
  </div>

  <div style={dashboardCard}>
    <h3>Absent</h3>
<p style={{
  color:'#94a3b8',
  marginTop:'10px'
}}>
  Today
</p>
    <p style={redCardNumber}>
      {
        attendance.filter(
          e => e.status === "Absent"
        ).length
      }
    </p>
  </div>

  <div style={dashboardCard}>
    <h3>On Leave</h3>
<p style={{
  color:'#94a3b8',
  marginTop:'10px'
}}>
  Paid Leave
</p>
    <p style={orangeCardNumber}>
      {
        attendance.filter(
          e =>
            e.status ===
            "Paid Leave"
        ).length
      }
    </p>
  </div>
  <div style={dashboardCard}>

  <h3>Not Marked</h3>
<p style={{
  color:'#94a3b8',
  marginTop:'10px'
}}>
  Pending
</p>

  <p
    style={{

      fontSize: '32px',

      fontWeight: '700',

      color: '#64748b'

    }}
  >

    {

      attendance.filter(

        e =>

          e.status ===

          "Not Marked"

      ).length

    }

  </p>

</div>
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
"480px 1fr",
    gap: "24px",
    marginBottom: "30px"
  }}
>
<div
  style={{
    background: "#1e293b",
    padding: "32px",
    borderRadius: "20px",
    border: "1px solid #334155",
    marginBottom: "25px",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.35)"
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
        color: "#38bdf8",
        fontWeight: "600"
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
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #334155",
    display: "flex",
    gap: "20px",
    flexWrap: "wrap"
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

      <div
  style={{
    background: "#1e293b",
    borderRadius: "20px",
    padding: "25px",
    border: "1px solid #334155",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.35)",
    marginTop: "0px"
  }}
>
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
    marginBottom: "20px"
  }}
>
  <div>
  <h3
    style={{
      color: "#f8fafc",
      margin: 0
    }}
  >
    Employee Attendance
  </h3>

  <p
    style={{
      color: "#94a3b8",
      margin: "4px 0 0 0",
      fontSize: "14px"
    }}
  >
    {filteredAttendance.length} Employees
  </p>
</div>
  <input
    type="text"
    placeholder="🔍 Search Employee..."
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
    style={{
      width: "260px",
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid #334155",
      background: "#0f172a",
      color: "#f8fafc",
      fontSize: "15px"
    }}
  />
</div>
  <table
  style={{
    width:"100%",
    borderCollapse:"collapse",
    tableLayout:"fixed",
    color:"#fff"
  }}
>
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
        <tr key={record.id}>
          <td style={newCell}>
            EMP{String(record.employee_id).padStart(3, "0")}
          </td>

          <td style={newCell}>
            {record.name}
          </td>

          <td style={newCell}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                fontWeight: "600",

                background:
                  record.status === "Present"
                    ? "rgba(34,197,94,.15)"
                    : record.status === "Absent"
                    ? "rgba(239,68,68,.15)"
                    : record.status === "Paid Leave"
                    ? "rgba(245,158,11,.15)"
                    : "rgba(148,163,184,.15)",

                color:
                  record.status === "Present"
                    ? "#22c55e"
                    : record.status === "Absent"
                    ? "#ef4444"
                    : record.status === "Paid Leave"
                    ? "#f59e0b"
                    : "#94a3b8"
              }}
            >
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
  background:
    record.status === "Present"
      ? "#166534"
      : record.status === "Absent"
      ? "#991b1b"
      : record.status === "Paid Leave"
      ? "#9a3412"
      : "#475569",

  color: "#ffffff",

  border: "none",

  padding: "10px",

  borderRadius: "10px",

  width: "160px",

  fontWeight: "600",

  cursor: "pointer"
}}
            >
              <option value="Present">
  🟢 Present
</option>

<option value="Absent">
  🔴 Absent
</option>

<option value="Paid Leave">
  🟠 Paid Leave
</option>

<option value="Not Marked">
  ⚪ Not Marked
</option>
            </select>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
</div>
      <div
  style={{
    background:"#1e293b",
    borderRadius:"20px",
    padding:"25px",
    border:"1px solid #334155",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.35)",
    marginTop:"30px"
  }}
>
  <h2
    style={{
      color:"#f8fafc",
      marginTop:0,
      marginBottom:"25px"
    }}
  >
    Monthly Attendance Summary
  </h2>

  <table
  style={{
    width:"100%",
    borderCollapse:"collapse",
    color:"#f8fafc",
    tableLayout:"fixed"
  }}
>
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

          <tr key={employee.id}>

            <td style={newCell}>
              EMP{String(employee.id).padStart(3,"0")}
            </td>

            <td style={newCell}>
              {employee.name}
            </td>

            <td
              style={{
                ...newCell,
                color:"#22c55e",
                fontWeight:"600"
              }}
            >
              {employee.present_days}
            </td>

            <td
              style={{
                ...newCell,
                color:"#ef4444",
                fontWeight:"600"
              }}
            >
              {employee.absent_days}
            </td>

            <td
              style={{
                ...newCell,
                color:"#f59e0b",
                fontWeight:"600"
              }}
            >
              {employee.paid_leave_days}
            </td>
            <td style={newCell}>
  {Number(employee.present_days)
    +
    Number(employee.absent_days)
    +
    Number(employee.paid_leave_days)}
</td>
            <td
              style={{
                ...newCell,
                color:"#4ade80",
                fontWeight:"700"
              }}
            >
              {employee.attendance_percentage}%
            </td>

          </tr>

      ))}

    </tbody>
  </table>
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
  width: '100%',
  background: '#1e293b',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)',
  borderCollapse: 'collapse',
  marginTop: '20px',
  color: '#f8fafc'
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
  padding: "18px",
  textAlign: "left",
  color: "#cbd5e1",
  borderBottom: "1px solid #334155",
  fontSize: "15px",
  fontWeight: "600",
  background: "#0f172a"
};

const newCell = {
  padding: "20px 16px",
  borderBottom: "1px solid #334155",
  color: "#f8fafc",
  fontSize: "15px"
};
export default Attendance