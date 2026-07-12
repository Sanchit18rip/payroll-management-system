import { useState, useEffect } from 'react' 

function Leave() {
    const [employeeId, setEmployeeId] = useState('') 
    const [leaveType, setLeaveType] = useState('Casual Leave') 
    const [startDate, setStartDate] = useState('') 
    const [endDate, setEndDate] = useState('')     
    const [reason, setReason] = useState('')
    const [leaves, setLeaves] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [halfDaySession, setHalfDaySession] =
useState("");
    const [availableLeaves, setAvailableLeaves] = useState(0)
    const [takenLeaves, setTakenLeaves] = useState(0)
    const [employees, setEmployees] = useState([])
    const [employmentStatus, setEmploymentStatus] =
  useState("");
    const fetchLeaves = () => {
  if (
leaveType === "Half Day" &&
!halfDaySession
) {

alert(
"Please select Half Day Session."
);

return;

}
  fetch(
    "https://payroll-management-system-owo2.onrender.com/api/leaves"
  )
    .then(res => res.json())
    .then(data => setLeaves(data))
    .catch(err => console.log(err))

}

    const fetchEmployeeBalance = (id) => {

    if (!id) {

        setAvailableLeaves(0)
        setTakenLeaves(0)

        return

    }

    fetch(
        "https://payroll-management-system-owo2.onrender.com/api/leave-balance"
    )

        .then(res => res.json())

        .then(data => {

            const employee =
                data.find(
                    emp =>
                        Number(
                            emp.employee_id
                        ) === Number(id)
                )

            if (employee) {

                setAvailableLeaves(
                    employee.available_leaves
                )

                setTakenLeaves(
                    employee.total_leaves_earned -
                    employee.available_leaves
                )
                fetch(
  `https://payroll-management-system-owo2.onrender.com/api/employees/${id}`
)
  .then(res => res.json())
  .then(data =>
    setEmploymentStatus(
      data.employment_status
    )
  )
  .catch(err =>
    console.log(err)
  );

            }

            else {

                setAvailableLeaves(0)

                setTakenLeaves(0)

            }

        })

        .catch(err =>
            console.log(err)
        )

}
    useEffect(() => {
        fetchLeaves()
    }, [])

    const handleEmployeeIdChange = (id) => {
        setEmployeeId(id)
        fetchEmployeeBalance(id)
    }

    const applyLeave = () => {

    if (
        !employeeId ||
        !leaveType ||
        !startDate ||
        !endDate ||
        !reason
    ) {

        alert(
            'Please fill all the details and dates!'
        )

        return

    }

    if (availableLeaves <= 0) {

        alert(
            'Insufficient leave balance!'
        )

        return

    }

    fetch(
        "https://payroll-management-system-owo2.onrender.com/api/leaves",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

employee_id: employeeId,
leave_type: leaveType,
half_day_session: halfDaySession,
start_date: startDate,
end_date: endDate,
reason

})
        }
    )

        .then(res => res.json())

        .then(() => {

            alert(
                "Leave Applied Successfully!"
            )

            setStartDate('')
            setEndDate('')
            setReason('')

            fetchLeaves()

            fetchEmployeeBalance(
                employeeId
            )

        })

        .catch(err => {

            console.log(err)

            alert(
                "Something went wrong"
            )

        })

}

    const updateStatus = (
    id,
    newStatus
) => {

    fetch(
        `https://payroll-management-system-owo2.onrender.com/api/leaves/${id}`,
        {

            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                status: newStatus
            })

        }
    )

        .then(res => res.json())

        .then(() => {

            alert(
                `Application ${newStatus}!`
            )

            fetchLeaves()

            if (employeeId) {

                fetchEmployeeBalance(
                    employeeId
                )

            }

        })

        .catch(err => {

            console.log(err)

        })

}
useEffect(() => {

    fetchLeaves()

    fetch(
        "https://payroll-management-system-owo2.onrender.com/api/employees"
    )
        .then(res => res.json())
        .then(data => setEmployees(data))
        .catch(err => console.log(err))

}, [])
    return (
        <div
  style={{
    padding: '30px',
    fontFamily: 'sans-serif',
    background: '#0f172a',
    minHeight: '100vh'
  }}
>
<h1
style={{
margin:0,
fontSize:"34px",
fontWeight:"700",
color:"#f8fafc"
}}
>
Leave Management
</h1>            <p style={{ color: '#94a3b8', margin: '0 0 25px 0', fontSize: '15px' }}>Review and manage employee leave requests.</p>
            
           
            {/* Applications Table */}
            <div style={tableCard}>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      paddingBottom: "15px",
      borderBottom: "1px solid #334155"
    }}
  >

    <h2
      style={{
        margin: 0,
        color: "#f8fafc",
        fontSize: "24px",
        fontWeight: "700"
      }}
    >
      Leave Requests
    </h2>

    <input
      type="text"
      placeholder="Search Employee..."
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(e.target.value)
      }
      style={searchInput}
    />

  </div>

  <div
    style={{
      overflowX: "auto"
    }}
  >

    <table style={tableStyle}>
                <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                        <th style={thStyle}>Employee</th>
                        <th style={thStyle}>Leave Type</th>
                        <th style={thStyle}>Duration</th>
                        <th style={thStyle}>Reason</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.map((leave, index) => (
                        <tr

key={leave.id}

style={{

borderBottom:"1px solid #334155",

background:

index % 2 === 0

? "#1e293b"

: "#172033"

}}

>
                            <td style={tdStyle}>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }}
  >

    <div
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: "#2563eb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontWeight: "700",
        fontSize: "16px"
      }}
    >
      {leave.employee_name?.charAt(0).toUpperCase()}
    </div>

    <div>

      <div
        style={{
          color: "#f8fafc",
          fontWeight: "700"
        }}
      >
        {leave.employee_name}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "12px"
        }}
      >
        Employee
      </div>

    </div>

  </div>

</td>
                            <td style={tdStyle}>

<span
style={{

background:

leave.leave_type === "Vacation Leave"

? "#16a34a"

: leave.leave_type === "Sick Leave"

? "#dc2626"

: leave.leave_type === "Half Day"

? "#ca8a04"

: "#2563eb",

color:"#fff",

padding:"7px 14px",

borderRadius:"50px",

fontSize:"12px",

fontWeight:"700"

}}
>

{leave.leave_type}

</span>

</td>
                            <td style={tdStyle}>
                                {leave.start_date && leave.end_date ? `${leave.start_date} to ${leave.end_date}` : 'N/A'}
                            </td>
                            <td style={tdStyle}>{leave.reason}</td>
                            <td style={tdStyle}>
                                <span
style={{

background:

leave.status === "Approved"

? "#dcfce7"

: leave.status === "Rejected"

? "#fee2e2"

: "#fef3c7",

color:

leave.status === "Approved"

? "#15803d"

: leave.status === "Rejected"

? "#b91c1c"

: "#b45309",

padding:"7px 15px",

borderRadius:"50px",

fontWeight:"700",

fontSize:"12px"

}}
>

{leave.status}

</span>
                            </td>
                            <td style={tdStyle}>

{leave.status === "Pending" ? (

<div
style={{
display:"flex",
gap:"8px",
justifyContent:"center",
flexWrap:"wrap"
}}
>

<button
onClick={() =>
updateStatus(
leave.id,
"Approved"
)
}
style={approveButton}
>
Approve
</button>

<button
onClick={() =>
updateStatus(
leave.id,
"Rejected"
)
}
style={rejectButton}
>
Reject
</button>

</div>

) : leave.status === "Approved" ? (

<button
disabled
style={{
...approveButton,
opacity:0.7,
cursor:"not-allowed"
}}
>
✓ Approved
</button>

) : (

<button
disabled
style={{
...rejectButton,
opacity:0.7,
cursor:"not-allowed"
}}
>
✕ Rejected
</button>

)}

</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
        </div>
    )
}


const balanceGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }
const balanceCard = {
  background: '#1e293b',

  border: '1px solid #334155',

  padding: '24px',

  borderRadius: '20px',

  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)'
}
const cardHeader = { fontSize: '14px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }
const cardValue = { fontSize: '26px', fontWeight: 'bold', marginBottom: '4px' }
const cardSub = { fontSize: '12px', color: '#94a3b8' }
const mainLayout = { display: 'flex', gap: '30px', flexWrap: 'wrap' }
const leftColumn = { flex: '1 1 500px' }
const rightColumn = { flex: '1 1 350px' }
const formContainer = {
  background: '#1e293b',

  border: '1px solid #334155',

  padding: '28px',

  borderRadius: '20px',

  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)'
}
const labelStyle = { display: 'block', marginBottom: '6px', color: '#475569', fontSize: '14px', fontWeight: '500' }
const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  marginBottom: '18px',
  borderRadius: '10px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '15px',
  boxSizing: 'border-box'
}
const textareaStyle = {
  width: '100%',
  padding: '12px 14px',
  marginBottom: '18px',
  borderRadius: '10px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  height: '100px',
  fontSize: '15px',
  boxSizing: 'border-box',
  resize: 'none'
}
const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '15px',
  boxShadow:
    '0 4px 20px rgba(37,99,235,0.3)'
}
const approveButton = {

  padding: "10px 18px",

  background: "#16a34a",

  color: "#fff",

  border: "none",

  borderRadius: "10px",

  cursor: "pointer",

  fontWeight: "700",

  transition: ".2s"

}
const rejectButton = {

  padding: "10px 18px",

  background: "#dc2626",

  color: "#fff",

  border: "none",

  borderRadius: "10px",

  cursor: "pointer",

  fontWeight: "700",

  transition: ".2s"

}
const calendarCard = {
  background: '#1e293b',

  border: '1px solid #334155',

  padding: '24px',

  borderRadius: '20px',

  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)'
}
const calendarHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }
const navBtn = { background: '#f1f5f9', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }
const calendarGrid = { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }
const dayName = { fontWeight: 'bold', fontSize: '12px', color: '#64748b', paddingBottom: '5px' }
const dayCell = { padding: '10px 0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }
const legendContainer = { display: 'flex', gap: '15px', marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }
const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  color: "#f8fafc"
}
const thStyle = {
  padding: "18px 20px",
  color: "#94a3b8",
  background: "#0f172a",
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: ".5px",
  borderBottom: "1px solid #334155",
  textAlign: "left"
}
const tdStyle = {
  padding: "18px 20px",
  color: "#f8fafc",
  fontSize: "14px",
  verticalAlign: "middle"
}
const tableCard = {
  background: "#1e293b",
  borderRadius: "20px",
  border: "1px solid #334155",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  padding: "20px",
  marginTop: "30px"
}
const searchInput = {
  width: "300px",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#f8fafc",
  outline: "none",
  fontSize: "14px"
}
export default Leave