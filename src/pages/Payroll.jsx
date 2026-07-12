import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'

function Payroll() {

  const [payroll, setPayroll] = useState([])
  const [editingEmployee, setEditingEmployee] =
  useState(null)

const [editBonus, setEditBonus] =
  useState("")

const [editDeduction, setEditDeduction] =
  useState("")
const [searchTerm, setSearchTerm] =
  useState("")
const [
  incrementHistory,
  setIncrementHistory
] = useState([]);
  useEffect(() => {

    fetch("https://payroll-management-system-owo2.onrender.com/api/payroll")
      .then(res => res.json())
      .then(data => setPayroll(data))
      .catch(err => console.log(err))
    fetch(
  "https://payroll-management-system-owo2.onrender.com/api/increment-history"
)
  .then(res => res.json())
  .then(data =>
    setIncrementHistory(data)
  )
  .catch(err =>
    console.log(err)
  );
  }, [])
  const openEditModal = (employee) => {

  setEditingEmployee(employee)

  setEditBonus(employee.bonus)

  setEditDeduction(employee.deduction)

}
const savePayrollChanges = () => {

  fetch(
    `https://payroll-management-system-owo2.onrender.com/api/payroll/${editingEmployee.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        bonus: editBonus,
        deduction: editDeduction
      })
    }
  )
    .then(() =>
      fetch(
        "https://payroll-management-system-owo2.onrender.com/api/payroll"
      )
    )
    .then(res => res.json())
    .then(data => {

      setPayroll(data)

      setEditingEmployee(null)

    })
    .catch(err => console.log(err))

}
const totalPayroll = payroll.reduce(
  (total, employee) =>
    total + Number(employee.payable_salary),
  0
)

const highestSalary =
  payroll.length > 0
    ? Math.max(
        ...payroll.map(employee =>
          Number(employee.payable_salary)
        )
      )
    : 0

const averagePayroll =
  payroll.length > 0
    ? (
        totalPayroll / payroll.length
      ).toFixed(2)
    : 0
const filteredPayroll =
  payroll.filter((employee) =>
    employee.name
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  )
const employeeCount =
  payroll.length

  const generatePayslip = (employee) => {

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text("Payroll Payslip", 20, 20)

    doc.setFontSize(12)

    doc.text(
      `Employee Name: ${employee.name}`,
      20,
      40
    )

    doc.text(
      `Salary: ₹${employee.salary}`,
      20,
      55
    )

    doc.text(
      `Present Days: ${employee.present_days}`,
      20,
      70
    )

    doc.text(
      `Absent Days: ${employee.absent_days}`,
      20,
      85
    )

    doc.text(
      `Paid Leave Days: ${employee.paid_leave_days}`,
      20,
      100
    )

    doc.text(
      `Payable Salary: ₹${employee.payable_salary}`,
      20,
      115
    )

    doc.save(
      `${employee.name}-Payslip.pdf`
    )

  }
  const exportPayroll = () => {

  const headers = [
    "Employee Name",
    "Salary",
    "Bonus",
    "Deduction",
    "Payable Salary"
  ];

  const rows = payroll.map(employee => [

    employee.name,

    employee.salary,

    employee.bonus,

    employee.deduction,

    employee.payable_salary

  ]);
  const filteredPayroll =
  payroll.filter(employee =>
    employee.name
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  )

  const csvContent = [

    headers,

    ...rows

  ]
    .map(row => row.join(","))

    .join("\n");

  const blob = new Blob(

    [csvContent],

    { type: "text/csv" }

  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download =
    `payroll-${new Date().toISOString().split("T")[0]}.csv`;

  link.click();

  URL.revokeObjectURL(url);

};
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
      color: '#f8fafc',
      marginBottom: '8px'
    }}
  >
    Payroll Management
  </h1>
  <button
  onClick={exportPayroll}
  style={{
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    marginBottom: "20px"
  }}
>
  Export Payroll CSV
</button>

  <p
    style={{
      color: '#94a3b8',
      fontSize: '16px',
      marginBottom: '30px'
    }}
  >
    Manage salaries, bonuses, deductions and employee payroll records
  </p>
</>
<div style={cardsContainer}>

  <div style={dashboardCard}>

  <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px"
  }}
>
  <div
    style={{
      width: "55px",
      height: "55px",
      borderRadius: "14px",
      background: "#2563eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px"
    }}
  >
    💰
  </div>
</div>

<h3
  style={{
    textAlign: "center",
    color: "#f8fafc",
    margin: 0
  }}
>
  Total Payroll
</h3>

<p
  style={{
    textAlign: "center",
    color: "#94a3b8",
    marginTop: "8px",
    marginBottom: "18px"
  }}
>
  Current Payroll
</p>

<p
  style={{
    fontSize: "32px",
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    margin: 0
  }}
>
  ₹{totalPayroll.toLocaleString()}
</p>

</div>

  <div style={dashboardCard}>
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px"
  }}
>
  <div
    style={{
      width: "55px",
      height: "55px",
      borderRadius: "14px",
      background: "#2563eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px"
    }}
  >
    🏆
  </div>
</div>

<h3
  style={{
    textAlign: "center",
    color: "#f8fafc",
    margin: 0
  }}
>
  Highest Salary
</h3>

<p
  style={{
    textAlign: "center",
    color: "#94a3b8",
    marginTop: "8px",
    marginBottom: "18px"
  }}
>
  Highest Paid Employee
</p>

<p
  style={{
    fontSize: "32px",
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    margin: 0
  }}
>
  ₹{highestSalary.toLocaleString()}
</p>
  </div>

  <div style={dashboardCard}>
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px"
  }}
>
  <div
    style={{
      width: "55px",
      height: "55px",
      borderRadius: "14px",
      background: "#2563eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px"
    }}
  >
    👥
  </div>
</div>

<h3
  style={{
    textAlign: "center",
    color: "#f8fafc",
    margin: 0
  }}
>
  Employees Paid
</h3>

<p
  style={{
    textAlign: "center",
    color: "#94a3b8",
    marginTop: "8px",
    marginBottom: "18px"
  }}
>
  Processed
</p>

<p
  style={{
    fontSize: "32px",
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    margin: 0
  }}
>
  {employeeCount}
</p>
  </div>

  <div style={dashboardCard}>
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px"
  }}
>
  <div
    style={{
      width: "55px",
      height: "55px",
      borderRadius: "14px",
      background: "#2563eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px"
    }}
  >
    📊
  </div>
</div>

<h3
  style={{
    textAlign: "center",
    color: "#f8fafc",
    margin: 0
  }}
>
  Average Payroll
</h3>

<p
  style={{
    textAlign: "center",
    color: "#94a3b8",
    marginTop: "8px",
    marginBottom: "18px"
  }}
>
  Per Employee
</p>

<p
  style={{
    fontSize: "32px",
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    margin: 0
  }}
>
  ₹{Number(averagePayroll).toLocaleString()}
</p>
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
    marginBottom: "30px"
  }}
>

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
        Employee Payroll
      </h3>

      <p
        style={{
          color: "#94a3b8",
          marginTop: "6px"
        }}
      >
        {employeeCount} Employees
      </p>

    </div>

    <input
      type="text"
      placeholder="🔍 Search Employee..."
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(
          e.target.value
        )
      }
      style={searchInput}
    />

  </div>

  
<div
  style={{
    overflowX: "auto",
    width: "100%"
  }}
>

<table style={tableStyle}>
        <thead>

          <tr>
            <th style={headerStyle}>
  Employee
</th>

<th style={headerStyle}>
  Basic
</th>
<th style={headerStyle}>HRA</th>
<th style={headerStyle}>TA</th>
<th style={headerStyle}>MA</th>
<th style={headerStyle}>Gross</th>
<th style={headerStyle}>PF</th>
<th style={headerStyle}>Bonus</th>
<th style={headerStyle}>Deduction</th>
<th style={headerStyle}>Present</th>
<th style={headerStyle}>Absent</th>
<th style={headerStyle}>Paid Leave</th>
<th style={headerStyle}>Payable Salary</th>
<th style={headerStyle}>Payslip</th>
<th style={headerStyle}>
  Action
</th>
          </tr>

        </thead>

        <tbody>

          {filteredPayroll.map((employee) => (

            <tr
  key={employee.id}
  style={rowStyle}
>

              <td
  style={{
    whiteSpace: "nowrap",
    padding: "16px"
  }}
>
  {employee.name}
</td>

              <td style={{padding:"16px"}}>
  ₹{Number(employee.salary).toLocaleString()}
</td>

<td style={{padding:"16px"}}>
  ₹{Number(employee.hra).toLocaleString()}
</td>

<td style={{padding:"16px"}}>
  ₹{Number(employee.ta).toLocaleString()}
</td>

<td style={{padding:"16px"}}>
  ₹{Number(employee.ma).toLocaleString()}
</td>

<td
  style={{
    padding:"16px",
    color:"#22c55e",
    fontWeight:"700"
  }}
>
  ₹{Number(employee.gross_salary).toLocaleString()}
</td>

<td
  style={{
    padding:"16px",
    color:"#ef4444",
    fontWeight:"700"
  }}
>
  ₹{Number(employee.pf).toLocaleString()}
</td>

<td
  style={{
    padding:"16px",
    color:"#22c55e"
  }}
>
  ₹{Number(employee.bonus).toLocaleString()}
</td>

<td
  style={{
    padding:"16px",
    color:"#ef4444"
  }}
>
  ₹{Number(employee.deduction).toLocaleString()}
</td>

<td>
  {employee.present_days}
</td>
              <td>
                {employee.absent_days}
              </td>

              <td>
                {employee.paid_leave_days}
              </td>

              <td
  style={{
    color: '#2563eb',
    fontWeight: '700',
    fontSize: '16px',
    padding: '16px',
    whiteSpace: "nowrap"
  }}
>
                ₹{parseInt(employee.payable_salary)}
              </td>

              <td>

                <button
                  onClick={() =>
                    generatePayslip(employee)
                  }
                  style={pdfButton}
                >
                  PDF
                </button>

              </td>
              <td>

  <button
    onClick={() =>
      openEditModal(employee)
    }
    style={editButton}
  >
    Edit
  </button>

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
    marginBottom:"30px"
  }}
>
  <h2
    style={{
      color:"#f8fafc",
      marginBottom:"20px"
    }}
  >
    📈 Increment History
  </h2>

  <table style={incrementTableStyle}>

    <thead>

      <tr>

        <th style={headerStyle}>
          Employee
        </th>

        <th style={headerStyle}>
          Old Salary
        </th>

        <th style={headerStyle}>
          Increment %
        </th>

        <th style={headerStyle}>
          Increment Amount
        </th>

        <th style={headerStyle}>
          New Salary
        </th>

        <th style={headerStyle}>
          Date
        </th>

      </tr>

    </thead>

    <tbody>

      {
        incrementHistory.map(
          item => (

            <tr key={item.id}>

              <td style={tdStyle}>
                {item.employee_name || "-"}
              </td>

              <td style={tdStyle}>
                ₹{
                  Number(
                    item.old_salary
                  ).toLocaleString()
                }
              </td>

              <td style={tdStyle}>
                {item.increment_percent || 0}%
              </td>

              <td
                style={{
                  ...tdStyle,
                  color:"#22c55e"
                }}
              >
                ₹{
                  Number(
                    item.increment_amount
                  ).toLocaleString()
                }
              </td>

              <td
                style={{
                  ...tdStyle,
                  color:"#38bdf8",
                  fontWeight:"700"
                }}
              >
                ₹{
                  Number(
                    item.new_salary
                  ).toLocaleString()
                }
              </td>

              <td style={tdStyle}>
                {new Date(
  item.effective_date
).toLocaleDateString()}
              </td>

            </tr>

          )
        )
      }

    </tbody>

  </table>

</div>
          {editingEmployee && (

  <div style={modalOverlay}>

    <div style={modalBox}>

      <h2
  style={{
    marginBottom: '25px',
    color: '#f8fafc',
    fontSize: '28px'
  }}
>
  Edit Payroll
</h2>

      <label>
        Bonus
      </label>

      <input
        type="number"
        value={editBonus}
        onChange={(e) =>
          setEditBonus(e.target.value)
        }
        style={modalInput}
      />

      <label>
        Deduction
      </label>

      <input
        type="number"
        value={editDeduction}
        onChange={(e) =>
          setEditDeduction(e.target.value)
        }
        style={modalInput}
      />

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px'
        }}
      >

        <button
          onClick={savePayrollChanges}
          style={saveButton}
        >
          Save
        </button>

        <button
          onClick={() =>
            setEditingEmployee(null)
          }
          style={cancelButton}
        >
          Cancel
        </button>

      </div>

    </div>

  </div>

)}
    </div>

  )

}

const headerStyle = {
  background: '#0f172a',
  color: '#cbd5e1',
  padding: '18px',
  textAlign: 'center',
  fontWeight: '600',
  fontSize: '15px',
  borderBottom: '1px solid #334155'
}
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: 'center',
  color: "#f8fafc",
  minWidth: "1500px"
}

const rowStyle = {
  textAlign: 'center',
  borderBottom: '1px solid #334155'
}

const pdfButton = {
  padding: '10px 16px',
  background: '#22c55e',
  color: 'white',
  textAlign: 'center',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600'
}
const editButton = {
  padding: '10px 16px',
  background: '#2563eb',
  color: 'white',
  textAlign: 'center',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600'
}
const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const modalBox = {
  background: '#1e293b',
  color: '#f8fafc',
  padding: '35px',
  borderRadius: '20px',
  width: '500px',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.45)'
}
const modalInput = {
  width: '100%',
  padding: '12px',
  marginTop: '8px',
  marginBottom: '15px',
  border: '1px solid #475569',
  borderRadius: '10px',
  background: '#0f172a',
  color: '#f8fafc',
  outline: 'none'
}

const saveButton = {
  padding: '12px 18px',
  background: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600'
}
const cancelButton = {
  padding: '12px 18px',
  background: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '600'
}
const cardsContainer = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
}

const dashboardCard = {
  background:
    "linear-gradient(135deg,#1e293b,#0f172a)",
  borderRadius: "20px",
  padding: "30px",
  border: "1px solid #334155",
  boxShadow:
    "0 10px 35px rgba(0,0,0,0.35)",
  textAlign: "center",
  transition: "0.2s"
}
const searchInput = {
  width: "300px",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#f8fafc",
  outline: "none"
}
const tdStyle = {
  padding: "16px"
}
const incrementTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "center",
  color: "#f8fafc"
}
export default Payroll