import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import StatCard from "../components/Dashboard/StatCard";
import PayrollDrawer from "../components/PayrollDrawer";
import GlassScrollArea from "../components/GlassScrollArea";
import { Download } from "lucide-react";
import Papa from 'papaparse'
// Single source of truth for the backend URL. Change this in one place
// instead of hardcoding the host in every fetch call.
const API_BASE = "https://payroll-management-system-three.vercel.app"

function Payroll() {

  const [payroll, setPayroll] = useState([])
  const [editingEmployee, setEditingEmployee] =
  useState(null)
const [showPayrollDrawer, setShowPayrollDrawer] = useState(false); 
const [importingPayroll, setImportingPayroll] = useState(false);
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
  const PAYROLL_CSV_HEADERS = [
  "Employee Name",
  "Salary",
  "Bonus",
  "Deduction",
  "Present",
  "Absent",
  "Paid Leave",
  "Payable Salary"
];
const exportPayroll = () => {

  if (!payroll.length) {
    alert("There is no payroll data to export.");
    return;
  }

  const rows = payroll.map((employee) => [
    employee.name ?? "",
    employee.salary ?? "",
    employee.bonus ?? 0,
    employee.deduction ?? 0,
    employee.present_days ?? 0,
    employee.absent_days ?? 0,
    employee.paid_leave_days ?? 0,
    employee.payable_salary ?? 0
  ]);

  const csvContent = Papa.unparse({
    fields: PAYROLL_CSV_HEADERS,
    data: rows
  });

  const blob = new Blob(
    [csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download =
    `payroll-${new Date().toISOString().split("T")[0]}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
const importPayrollCSV = (event) => {

  const file = event.target.files?.[0];

  if (!file) return;

  const resetInput = () => {
    event.target.value = "";
  };

  if (
    !file.name
      .toLowerCase()
      .endsWith(".csv")
  ) {

    alert(
      "❌ Invalid File\n\n" +
      "Please select a CSV file."
    );

    resetInput();

    return;
  }

  Papa.parse(file, {

    header: true,

    skipEmptyLines: true,

    complete: async (results) => {

      try {

        const rows = results.data || [];

        const actualHeaders =
          results.meta.fields || [];

        // ==============================
        // HEADER VALIDATION
        // ==============================

        const missingHeaders =
          PAYROLL_CSV_HEADERS.filter(
            (header) =>
              !actualHeaders.includes(header)
          );

        if (missingHeaders.length > 0) {

          alert(
            "❌ Invalid Payroll CSV Format\n\n" +
            "The selected file does not match " +
            "the Payroll table format.\n\n" +
            "Missing columns:\n" +
            missingHeaders.join(", ") +
            "\n\n" +
            "Please export a Payroll CSV from " +
            "this system and use that format."
          );

          resetInput();

          return;
        }

        // ==============================
        // EMPTY FILE
        // ==============================

        if (rows.length === 0) {

          alert(
            "❌ Empty CSV\n\n" +
            "The selected file contains no " +
            "payroll records."
          );

          resetInput();

          return;
        }

        // ==============================
        // ROW VALIDATION
        // ==============================

        const invalidRows = [];

        rows.forEach((employee, index) => {

          const rowNumber = index + 2;

          if (!employee["Employee Name"]?.trim()) {

            invalidRows.push(
              `Row ${rowNumber}: Employee Name is missing`
            );

          }

          if (
            employee["Salary"] === "" ||
            employee["Salary"] === null ||
            Number.isNaN(
              Number(employee["Salary"])
            )
          ) {

            invalidRows.push(
              `Row ${rowNumber}: Salary is invalid`
            );

          }

          if (
            employee["Bonus"] !== "" &&
            Number.isNaN(
              Number(employee["Bonus"])
            )
          ) {

            invalidRows.push(
              `Row ${rowNumber}: Bonus is invalid`
            );

          }

          if (
            employee["Deduction"] !== "" &&
            Number.isNaN(
              Number(employee["Deduction"])
            )
          ) {

            invalidRows.push(
              `Row ${rowNumber}: Deduction is invalid`
            );

          }

        });

        // ==============================
        // CANCEL ENTIRE IMPORT
        // ==============================

        if (invalidRows.length > 0) {

          alert(
            "❌ Import Cancelled\n\n" +
            "The Payroll CSV contains invalid data.\n\n" +
            invalidRows
              .slice(0, 10)
              .join("\n") +
            (
              invalidRows.length > 10
                ? `\n\n...and ${
                    invalidRows.length - 10
                  } more errors.`
                : ""
            ) +
            "\n\nNo payroll records were imported."
          );

          resetInput();

          return;
        }

        // ==============================
        // CONFIRM
        // ==============================

        const confirmed =
          window.confirm(
            "✅ Payroll CSV verified successfully.\n\n" +
            `${rows.length} payroll record(s) are ready to import.\n\n` +
            "Continue?"
          );

        if (!confirmed) {

          resetInput();

          return;
        }

        setImportingPayroll(true);

        // ==============================
        // IMPORT
        // ==============================

        for (const row of rows) {

          const employeeName =
            row["Employee Name"].trim();

          const employee =
            payroll.find(
              (item) =>
                item.name?.trim().toLowerCase() ===
                employeeName.toLowerCase()
            );

          if (!employee) {

            throw new Error(
              `Employee "${employeeName}" was not found in the current payroll records.`
            );

          }

          const response = await fetch(
            `${API_BASE}/api/payroll/${employee.id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                bonus:
                  Number(row["Bonus"] || 0),

                deduction:
                  Number(row["Deduction"] || 0)
              })
            }
          );

          if (!response.ok) {

            throw new Error(
              `Failed to import payroll for ${employeeName}.`
            );

          }

        }

        // ==============================
        // REFRESH PAYROLL
        // ==============================

        const refreshed =
          await fetch(
            `${API_BASE}/api/payroll`
          );

        if (!refreshed.ok) {

          throw new Error(
            "Payroll was updated, but the refreshed payroll data could not be loaded."
          );

        }

        const updatedPayroll =
          await refreshed.json();

        setPayroll(updatedPayroll);

        alert(
          "✅ Payroll Import Successful\n\n" +
          `${rows.length} payroll record(s) imported successfully.`
        );

      }

      catch (error) {

        console.error(
          "Payroll import error:",
          error
        );

        alert(
          "❌ Payroll Import Failed\n\n" +
          error.message
        );

      }

      finally {

        setImportingPayroll(false);

        resetInput();

      }

    },

    error: () => {

      alert(
        "❌ Could not read CSV\n\n" +
        "Please check that the file is a valid CSV."
      );

      resetInput();

    }

  });

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
    padding: "30px",
    width: "100%",
    minHeight: "100vh",
  }}
>

     <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px",
  }}
>
  <div>
    <h1
      style={{
        fontSize: "52px",
        fontWeight: "800",
        color: "#f8fafc",
        margin: 0,
      }}
    >
      💰 Payroll Management
    </h1>

    <p
      style={{
        color: "#94a3b8",
        marginTop: "10px",
        fontSize: "17px",
      }}
    >
      Manage employee salaries, bonuses, deductions and payroll.
    </p>
  </div>

  <input
  id="payroll-csv-import"
  type="file"
  accept=".csv"
  hidden
  onChange={importPayrollCSV}
/>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }}
>
  <input
    id="payroll-csv-import"
    type="file"
    accept=".csv"
    hidden
    onChange={importPayrollCSV}
  />

  <button
    onClick={() =>
      document
        .getElementById("payroll-csv-import")
        .click()
    }
    style={glassButton}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.border =
        "1px solid rgba(55,255,215,.35)";
      e.currentTarget.style.boxShadow =
        "0 0 22px rgba(55,255,215,.18)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.border =
        "1px solid rgba(255,255,255,.08)";
      e.currentTarget.style.boxShadow =
        "0 12px 30px rgba(0,0,0,.25)";
    }}
  >
    <span
      style={{
        fontSize: "14px",
        fontWeight: 600,
        letterSpacing: ".2px",
      }}
    >
      Import CSV
    </span>
  </button>

  <button
    onClick={exportPayroll}
    style={glassButton}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.border =
        "1px solid rgba(55,255,215,.35)";
      e.currentTarget.style.boxShadow =
        "0 0 22px rgba(55,255,215,.18)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.border =
        "1px solid rgba(255,255,255,.08)";
      e.currentTarget.style.boxShadow =
        "0 12px 30px rgba(0,0,0,.25)";
    }}
  >
    <span
      style={{
        fontSize: "14px",
        fontWeight: 600,
        letterSpacing: ".2px",
      }}
    >
      Export CSV
    </span>
  </button>
</div>
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
        alignItems: "flex-end",
        marginBottom: "24px",
        gap: "20px",
    }}
>
        <div>

    <h2
        style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: "700",
            color: "#f8fafc",
        }}
    >
        Employee Payroll
    </h2>

    <p
        style={{
            marginTop: "8px",
            color: "#94a3b8",
            fontSize: "15px",
        }}
    >
        {employeeCount} Employees
    </p>

</div>

        <div
style={{
display:"flex",
alignItems:"center",
gap:"16px",
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


</div>
    </div>

    <GlassScrollArea
  height={650}
  style={{
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,.08)",
    background:
      "linear-gradient(180deg, rgba(17,24,39,.72), rgba(15,23,42,.72))",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    boxShadow: "0 15px 40px rgba(0,0,0,.28)",
  }}
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
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "45px",
    marginBottom: "24px",
  }}
>
  <div>
    <h2
      style={{
        margin: 0,
        fontSize: "30px",
        fontWeight: "700",
        color: "#f8fafc",
      }}
    >
      Increment History
    </h2>

    <p
      style={{
        marginTop: "8px",
        color: "#94a3b8",
        fontSize: "15px",
      }}
    >
      Salary revision records
    </p>
  </div>
</div>
<GlassScrollArea
  height={420}
  style={{
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,.08)",
    background:
      "linear-gradient(180deg, rgba(17,24,39,.72), rgba(15,23,42,.72))",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    boxShadow: "0 15px 40px rgba(0,0,0,.28)",
  }}
>
  <table style={tableStyle}>
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
e.currentTarget.style.boxShadow =
"0 8px 22px rgba(0,0,0,.18)";
}}

onMouseLeave={(e)=>{

e.currentTarget.style.background=
"transparent";
e.currentTarget.style.boxShadow =
"none";
}}

>

              <td
  style={{
    padding: "18px 16px",
    borderBottom: "1px solid rgba(255,255,255,.06)",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
    }}
  >
    <div
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        background:
          "linear-gradient(135deg,#37FFD7,#0EA5E9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#08111d",
        fontWeight: "700",
        fontSize: "15px",
        boxShadow:
          "0 0 16px rgba(55,255,215,.30)",
      }}
    >
      {(item.employee_name || "?")
        .charAt(0)
        .toUpperCase()}
    </div>

    <span
      style={{
        color: "#f8fafc",
        fontWeight: "600",
      }}
    >
      {item.employee_name || "-"}
    </span>
  </div>
</td>

<td style={tdStyle}>
<div
style={{

display:"inline-block",

padding:"7px 14px",

borderRadius:"999px",

background:"rgba(255,255,255,.05)",

color:"#94a3b8",

fontWeight:"600",

}}
>

₹{Number(item.old_salary).toLocaleString()}

</div>

</td> 

              <td style={tdStyle}>

<div
style={{

display:"inline-block",

padding:"7px 14px",

borderRadius:"999px",

background:"rgba(34,197,94,.12)",

border:"1px solid rgba(34,197,94,.25)",

color:"#22c55e",

fontWeight:"700",

}}
>

+{item.increment_percent}%

</div>

</td>

              <td
                style={{
                  ...tdStyle,
                  color:"#22c55e"
                }}
              >
                <div
style={{

display:"inline-block",

padding:"7px 14px",

borderRadius:"999px",

background:
"rgba(55,255,215,.10)",

border:"1px solid rgba(34,197,94,.25)",

color:"#22c55e",

fontWeight:"700",

}}
>
                ₹{
                  Number(
                    item.increment_amount
                  ).toLocaleString()
                }
              </div>
              </td>

              <td
                style={{
  ...tdStyle,
  color: "#37FFD7",
  fontWeight: "800",
  textShadow:
    "0 0 10px rgba(55,255,215,.30)",
}}
              >
                ₹{
                  Number(
                    item.new_salary
                  ).toLocaleString()
                }
              </td>

              <td
  style={{
    ...tdStyle,
    color: "#cbd5e1",
    fontWeight: "500",
  }}
>
<div
style={{

display:"inline-block",

padding:"6px 14px",

borderRadius:"999px",

background:"rgba(255,255,255,.04)",

color:"#cbd5e1",

}}
>


                {new Date(
  item.effective_date
).toLocaleDateString()}
</div>
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
  width: "560px",

  maxHeight: "82vh",

  overflowY: "auto",

  background:
    "linear-gradient(180deg,#172033,#101827)",

  color: "#fff",

  borderRadius: "24px",

  padding: "30px",

  border:
    "1px solid rgba(55,255,215,.12)",

  backdropFilter: "blur(20px)",

  boxShadow:
    "0 0 45px rgba(0,212,255,.10)",
}}
    >
      <div
style={{
marginBottom:"25px"
}}
>

<div
style={{
fontSize:"12px",
letterSpacing:"2px",
fontWeight:"700",
color:"#37FFD7",
}}
>

PAYROLL CONFIGURATION

</div>

<h2
style={{
margin:"8px 0",
fontSize:"32px",
fontWeight:"800",
}}
>

Payroll Settings

</h2>

<p
style={{
margin:0,
color:"#94a3b8",
}}
>

Configure employee salary components.

</p>

</div>

      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "24px",
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.06)",
  }}
>
  <div
    style={{
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg,#37FFD7,#0EA5E9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "#08111d",
      fontWeight: "700",
      fontSize: "18px",
    }}
  >
    {selectedEmployee?.name?.charAt(0).toUpperCase()}
  </div>

  <div>
    <div
      style={{
        fontSize: "18px",
        fontWeight: "700",
      }}
    >
      {selectedEmployee?.name}
    </div>

    <div
      style={{
        fontSize: "13px",
        color: "#94a3b8",
      }}
    >
      Employee Payroll Configuration
    </div>
  </div>
</div>

      <div style={{ marginTop: "20px" }}>
  {payrollOptions.map((option) => (
  <div
    key={option.key}
    style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  padding: "18px 20px",

  marginBottom: "14px",

  borderRadius: "18px",

  background: "rgba(255,255,255,.03)",

  border: "1px solid rgba(255,255,255,.06)",

  transition: "all .25s ease",
}}
onMouseEnter={(e) => {
  e.currentTarget.style.background =
    "rgba(55,255,215,.05)";
  e.currentTarget.style.border =
    "1px solid rgba(55,255,215,.18)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.background =
    "rgba(255,255,255,.03)";
  e.currentTarget.style.border =
    "1px solid rgba(255,255,255,.06)";
}}
  >
    <span style={{ fontWeight: "500" }}>{option.label}</span>

<div
  style={{
    display: "flex",
    gap: "10px",
  }}
>

<button
    onClick={() =>
        setPayrollSettings({
            ...payrollSettings,
            [option.key]: true,
        })
    }

    style={{
        ...toggleButton,

        background: payrollSettings[option.key]
            ? "linear-gradient(135deg,#06b6d4,#2563eb)"
            : "rgba(255,255,255,.04)",

        color: payrollSettings[option.key]
            ? "#fff"
            : "#94a3b8",
    }}
>
    YES
</button>

<button
    onClick={() =>
        setPayrollSettings({
            ...payrollSettings,
            [option.key]: false,
        })
    }

    style={{
        ...toggleButton,

        background: !payrollSettings[option.key]
            ? "linear-gradient(135deg,#ef4444,#dc2626)"
            : "rgba(255,255,255,.04)",

        color: !payrollSettings[option.key]
            ? "#fff"
            : "#94a3b8",
    }}
>
    NO
</button>

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
  ...glassButton,

  minWidth: "120px",

  color: "#cbd5e1",
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
  ...glassButton,

  minWidth: "160px",

  background:
    "linear-gradient(135deg,#06b6d4,#2563eb)",

  border:
    "1px solid rgba(55,255,215,.18)",

  color: "#fff",

  boxShadow:
    "0 0 24px rgba(55,255,215,.18)",
}}
>
  Save Changes
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

  transition: "all .25s ease",

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
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const searchInput={

width: "420px",

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
  zIndex: 10,

  background: "rgba(15,23,42,.95)",

  backdropFilter: "blur(18px)",

  color: "#cbd5e1",

  fontWeight: "700",

  fontSize: "13px",

  textTransform: "uppercase",

  letterSpacing: "1px",

  padding: "18px",

  borderBottom: "1px solid rgba(255,255,255,.08)",

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
const glassButton = {
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

  transition: "all .25s ease",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  gap: "8px",

  boxShadow:
    "0 12px 30px rgba(0,0,0,.25)"
};
const toggleButton = {

width: "74px",

height: "36px",

border: "1px solid rgba(255,255,255,.08)",

borderRadius: "12px",

cursor: "pointer",

fontWeight: "700",

fontSize: "13px",

transition: ".25s",

backdropFilter: "blur(12px)",

color: "#fff",

};
export default Payroll