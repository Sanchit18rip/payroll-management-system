import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import StatCard from "../components/Dashboard/StatCard";
import PayrollDrawer from "../components/PayrollDrawer";
import GlassScrollArea from "../components/GlassScrollArea";
// Single source of truth for the backend URL. Change this in one place
// instead of hardcoding the host in every fetch call.
const API_BASE = "https://payroll-management-system-three.vercel.app"

function Payroll() {

  const [payroll, setPayroll] = useState([])
  const [editingEmployee, setEditingEmployee] =
  useState(null)
const [showPayrollDrawer, setShowPayrollDrawer] = useState(false); 

const [editBonus, setEditBonus] =
  useState("")
const [payrollSettings, setPayrollSettings] = useState({
  hra: true,
  conveyance: true,
  medical: true,
  employeePF: true,
  employerPF: true,
  professionalTax: true,
  tds: true,
  gratuity: true,
  incentive: true,
  otherExpense: true,
});  

const [employeePayrollSettings, setEmployeePayrollSettings] = useState({});
const [showPayrollModal, setShowPayrollModal] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState(null);

const [editDeduction, setEditDeduction] =
  useState("")
const [searchTerm, setSearchTerm] =
  useState("")
const [
  incrementHistory,
  setIncrementHistory
] = useState([]);
  useEffect(() => {

    fetch(`${API_BASE}/api/payroll`)
      .then(res => res.json())
      .then(data => setPayroll(data))
      .catch(err => console.log(err))
    fetch(
  `${API_BASE}/api/increment-history`
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
    `${API_BASE}/api/payroll/${editingEmployee.id}`,
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
        `${API_BASE}/api/payroll`
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
console.log(payroll);
const filteredPayroll = Array.isArray(payroll)
  ? payroll.filter((employee) =>
      (employee?.name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  : [];
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
const handleEdit = async (employee) => {
  setSelectedEmployee(employee);

  try {
    const response = await fetch(
      `${API_BASE}/api/employees/${employee.id}`
    );

    const data = await response.json();

    setPayrollSettings({
      hra: data.hra_enabled,
      conveyance: data.conveyance_enabled,
      medical: data.medical_enabled,
      employeePF: data.employee_pf_enabled,
      employerPF: data.employer_pf_enabled,
      professionalTax: data.professional_tax_enabled,
      tds: data.tds_enabled,
      gratuity: data.gratuity_enabled,
      incentive: data.incentive_enabled,
      otherExpense: data.other_expense_enabled,
    });

    setShowPayrollModal(true);
  } catch (err) {
    console.error(err);
    alert("Failed to load payroll settings.");
  }
};
const payrollOptions = [
  { label: "HRA", key: "hra" },
  { label: "Conveyance Allowance", key: "conveyance" },
  { label: "Medical Allowance", key: "medical" },
  { label: "Employee PF", key: "employeePF" },
  { label: "Employer PF", key: "employerPF" },
  { label: "Professional Tax", key: "professionalTax" },
  { label: "TDS", key: "tds" },
  { label: "Gratuity", key: "gratuity" },
  { label: "Incentive", key: "incentive" },
  { label: "Other Expense", key: "otherExpense" },
];
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

     <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "35px",
  }}
>
  <div>
    <h1
      style={{
        margin: 0,
        fontSize: "42px",
        fontWeight: 800,
        color: "#f8fafc",
      }}
    >
      💰 Payroll Management
    </h1>

    <p
      style={{
        marginTop: "10px",
        color: "rgba(255,255,255,.60)",
        fontSize: "16px",
      }}
    >
      Manage salaries, bonuses, deductions, increments and employee payroll.
    </p>
  </div>

  <button
    onClick={exportPayroll}
    style={{
      padding: "12px 22px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,.08)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      color: "#f8fafc",
      fontWeight: 600,
      cursor: "pointer",
      transition: ".25s",
      boxShadow:
        "0 12px 30px rgba(0,0,0,.25)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform =
        "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform =
        "translateY(0)";
    }}
  >
    📤 Export CSV
  </button>
</div>
<div style={cardContainer}>

  <StatCard
    title="Total Payroll"
    value={`₹${totalPayroll.toLocaleString()}`}
    color="#22c55e"
    delay={0.15}
    icon="payroll"
  />

  <StatCard
    title="Highest Salary"
    value={`₹${highestSalary.toLocaleString()}`}
    subtitle="Highest Paid Employee"
    color="#3b82f6"
    delay={0.3}
    icon="payroll"
  />

  <StatCard
    title="Employees Paid"
    value={employeeCount}
    subtitle="Processed"
    color="#06b6d4"
    delay={0.45}
    icon="employees"
  />

  <StatCard
    title="Average Payroll"
    value={`₹${Number(averagePayroll).toLocaleString()}`}
    subtitle="Per Employee"
    color="#a855f7"
    delay={0.6}
    icon="payroll"
  />

</div>
<>
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
                Employee Payroll
            </h2>

            <p
                style={{
                    marginTop: "8px",
                    color: "#94a3b8",
                }}
            >
                {employeeCount} Employees
            </p>

        </div>

        <div
style={{
display:"flex",
alignItems:"center",
gap:"14px"
}}
>

<input
type="text"
placeholder="Search employee..."

value={searchTerm}

onChange={(e)=>
setSearchTerm(e.target.value)
}

style={searchInput}
/>

<button

onClick={exportPayroll}

style={toolbarButton}

>

Export CSV

</button>

</div>
    </div>

    <GlassScrollArea
        height={600}
    >

        <table style={tableStyle}>
        <thead>

<tr style={tableHeaderRow}>

<th style={tableHeader}>Employee</th>

<th style={tableHeader}>Gross Salary</th>

<th style={tableHeader}>Basic + DA</th>

<th style={tableHeader}>HRA</th>

<th style={tableHeader}>Conveyance</th>

<th style={tableHeader}>Medical</th>

<th style={tableHeader}>Other Allowance</th>

<th style={tableHeader}>PF</th>

<th style={tableHeader}>Present</th>

<th style={tableHeader}>Absent</th>

<th style={tableHeader}>Paid Leave</th>

<th style={tableHeader}>Total Days</th>

<th style={tableHeader}>Bonus</th>

<th style={tableHeader}>Deduction</th>

<th style={tableHeader}>Payable</th>

<th style={tableHeader}>Settings</th>

<th style={tableHeader}>Payslip</th>

</tr>

</thead>

        <tbody>

          {filteredPayroll.map((employee) => (

            <tr
  key={employee.id}
  style={rowStyle}
  onMouseEnter={(e) => {

    e.currentTarget.style.background =
      "rgba(55,255,215,.05)";

    e.currentTarget.style.transform =
      "translateY(-2px)";

  }}
  onMouseLeave={(e) => {

    e.currentTarget.style.background =
      "transparent";

    e.currentTarget.style.transform =
      "translateY(0)";

  }}
>

              <td
  style={{
    padding: "18px 16px",
    borderBottom:
      "1px solid rgba(255,255,255,.06)",
  }}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:"14px",
}}
>

<div
style={{
width:"42px",
height:"42px",
borderRadius:"50%",
display:"flex",
justifyContent:"center",
alignItems:"center",

fontWeight:"700",

fontSize:"16px",

background:
"linear-gradient(135deg,#37FFD7,#0EA5E9)",

color:"#08111d",

boxShadow:
"0 0 18px rgba(55,255,215,.35)",
}}
>
{employee.name.charAt(0).toUpperCase()}
</div>

<div
style={{
display:"flex",
flexDirection:"column",
alignItems:"flex-start",
}}
>

<button
onClick={async()=>{
try{

const response=
await fetch(
`${API_BASE}/api/payroll/${employee.id}`
);

const data=
await response.json();

setSelectedEmployee(data);

setShowPayrollDrawer(true);

}catch(err){

console.error(err);

}

}}

style={{

background:"none",

border:"none",

padding:0,

fontSize:"15px",

fontWeight:"700",

color:"#f8fafc",

cursor:"pointer",

textAlign:"left",

}}

>

{employee.name}

</button>

<span
style={{
fontSize:"12px",
color:"#64748b",
}}
>
Employee
</span>

</div>

</div>

</td>
              <td
  style={{
    padding: "18px",
    color: "#38bdf8",
    fontWeight: "700",

    borderBottom:
      "1px solid rgba(255,255,255,.06)",
  }}
>
  ₹{Number(employee.salary).toLocaleString()}
</td>

<td style={{ padding: "16px" }}>
  ₹{Number(employee.basic_da).toLocaleString()}
</td>

<td style={{ padding: "16px" }}>
  ₹{Number(employee.hra).toLocaleString()}
</td>

<td style={{ padding: "16px" }}>
  ₹{Number(employee.conveyance_allowance).toLocaleString()}
</td>

<td style={{ padding: "16px" }}>
  ₹{Number(employee.medical_allowance).toLocaleString()}
</td>

<td style={{ padding: "16px" }}>
  ₹{Number(employee.other_allowance).toLocaleString()}
</td>

<td style={{ padding: "16px" }}>
  ₹{Number(employee.pf).toLocaleString()}
</td>

<td>{employee.present_days}</td>

<td>{employee.absent_days}</td>

<td>{employee.paid_leave_days}</td>

<td>{employee.total_days}</td>

<td
  style={{
    padding: "16px",
    color: "#22c55e"
  }}
>
  ₹{Number(employee.bonus).toLocaleString()}
</td>

<td
  style={{
    padding: "16px",
    color: "#ef4444"
  }}
>
₹{Number(employee.total_deduction).toLocaleString()}</td>



             <td
  style={{
    color: "#37FFD7",
    fontWeight: "800",
    padding: "18px",

    textShadow:
      "0 0 10px rgba(55,255,215,.35)",

    borderBottom:
      "1px solid rgba(255,255,255,.06)",
  }}
>
  ₹{Number(employee.payable_salary).toLocaleString(undefined,{
    maximumFractionDigits:2
  })}
</td>
              <td>
  <button
    onClick={() => handleEdit(employee)}

    style={actionButton}

    onMouseEnter={(e)=>{

        e.currentTarget.style.transform=
        "translateY(-2px)";

    }}

    onMouseLeave={(e)=>{

        e.currentTarget.style.transform=
        "translateY(0)";

    }}
>

⚙️

</button>
</td>

              <td>

                <button
style={pdfActionButton}

onMouseEnter={(e)=>{

e.currentTarget.style.transform=
"translateY(-2px)";

}}

onMouseLeave={(e)=>{

e.currentTarget.style.transform=
"translateY(0)";

}}

>

📄

</button>

              </td>
              <td>

  

</td>

            </tr>

          ))}

        </tbody>

      </table>

    </GlassScrollArea>

</>
      
<>
  <h2
    style={{
      color:"#f8fafc",
      marginBottom:"20px"
    }}
  >
    📈 Increment History
  </h2>
<GlassScrollArea
    height={420}
>
  <table style={incrementTableStyle}>

    <thead>

<tr style={tableHeaderRow}>

        <th style={tableHeader}>
          Employee
        </th>

        <th style={tableHeader}>
          Old Salary
        </th>

        <th style={tableHeader}>
          Increment %
        </th>

        <th style={tableHeader}>
          Increment Amount
        </th>

        <th style={tableHeader}>
          New Salary
        </th>

        <th style={tableHeader}>
          Date
        </th>

      </tr>

    </thead>

    <tbody>

      {
        incrementHistory.map(
          item => (

            <tr
key={item.id}

style={rowStyle}

onMouseEnter={(e)=>{

e.currentTarget.style.background=
"rgba(55,255,215,.05)";

}}

onMouseLeave={(e)=>{

e.currentTarget.style.background=
"transparent";

}}

>

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

</GlassScrollArea>
</>
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
{showPayrollModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        width: "500px",
        background: "#1f2937",
        color: "#fff",
        borderRadius: "12px",
        padding: "25px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Payroll Settings</h2>

      <p>
        Employee: <strong>{selectedEmployee?.name}</strong>
      </p>

      <div style={{ marginTop: "20px" }}>
  {payrollOptions.map((option) => (
  <div
    key={option.key}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
      paddingBottom: "10px",
      borderBottom: "1px solid #374151",
    }}
  >
    <span style={{ fontWeight: "500" }}>{option.label}</span>

    <div style={{ display: "flex", gap: "20px" }}>
      <label>
        <input
          type="radio"
          name={option.key}
          checked={payrollSettings[option.key]}
          onChange={() =>
            setPayrollSettings({
              ...payrollSettings,
              [option.key]: true,
            })
          }
        />
        {" "}Yes
      </label>

      <label>
        <input
          type="radio"
          name={option.key}
          checked={!payrollSettings[option.key]}
          onChange={() =>
            setPayrollSettings({
              ...payrollSettings,
              [option.key]: false,
            })
          }
        />
        {" "}No
      </label>
    </div>
  </div>
))}
</div>
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "25px"
  }}
>
  <button
    onClick={() => setShowPayrollModal(false)}
    style={{
      padding: "10px 18px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer"
    }}
  >
    Cancel
  </button>

<button
  onClick={async () => {
  try {
    const response = await fetch(
  `${API_BASE}/api/employees/${selectedEmployee.id}/payroll-settings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payrollSettings),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save settings");
    }

    // Refresh payroll data
    const payrollResponse = await fetch(
      `${API_BASE}/api/payroll`
    );

    const payrollData = await payrollResponse.json();

    setPayroll(payrollData);

    setShowPayrollModal(false);

    alert("Payroll settings saved successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to save payroll settings.");
  }
}}
  style={{
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer"
  }}
>
  Save
</button>
</div>
    </div>
  </div>
)}
{showPayrollDrawer && selectedEmployee && (
  <PayrollDrawer
    employee={selectedEmployee}
    generatePayslip={generatePayslip}
    onClose={() => {
      setShowPayrollDrawer(false);
      setSelectedEmployee(null);
    }}
  />
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

    width:"100%",

    minWidth:"1700px",

    borderCollapse:"separate",

    borderSpacing:"0",

    color:"#f8fafc",

    textAlign:"center",

}

const rowStyle = {

  transition: ".25s",

  cursor: "pointer",

};
const actionButton={

width:"42px",

height:"42px",

borderRadius:"12px",

border:"1px solid rgba(55,255,215,.18)",

background:
"rgba(255,255,255,.05)",

color:"#37FFD7",

fontSize:"18px",

cursor:"pointer",

transition:".25s",

}
const pdfActionButton={

width:"42px",

height:"42px",

borderRadius:"12px",

border:"1px solid rgba(59,130,246,.20)",

background:
"rgba(255,255,255,.05)",

color:"#38bdf8",

fontSize:"18px",

cursor:"pointer",

transition:".25s",

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
const cardContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "24px",
  marginBottom: "35px",
};

const searchInput={

width:"340px",

height:"48px",

padding:"0 18px",

borderRadius:"14px",

border:
"1px solid rgba(255,255,255,.08)",

background:
"rgba(255,255,255,.04)",

backdropFilter:"blur(18px)",

color:"#fff",

fontSize:"14px",

outline:"none",

transition:".25s",

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
const tableHeaderRow = {

    position:"sticky",

    top:0,

    zIndex:5,

}
const tableHeader = {

  position: "sticky",

  top: 0,

  zIndex: 20,

  background:
    "rgba(12,18,31,.96)",

  backdropFilter: "blur(22px)",

  WebkitBackdropFilter: "blur(22px)",

  color: "#e2e8f0",

  fontSize: "13px",

  fontWeight: "700",

  textTransform: "uppercase",

  letterSpacing: "1.2px",

  padding: "18px",

  borderBottom:
    "1px solid rgba(55,255,215,.15)",

  whiteSpace: "nowrap",

};
const toolbarButton={

height:"48px",

padding:"0 22px",

borderRadius:"14px",

border:"1px solid rgba(55,255,215,.18)",

background:
"rgba(255,255,255,.04)",

backdropFilter:"blur(18px)",

color:"#37FFD7",

fontWeight:"700",

cursor:"pointer",

transition:".25s",

}
export default Payroll