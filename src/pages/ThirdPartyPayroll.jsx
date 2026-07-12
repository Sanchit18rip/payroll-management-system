import {
  useState,
  useEffect
} from 'react'
function ThirdPartyPayroll() {
  const [clients, setClients] =
  useState([])

const [employees, setEmployees] =
  useState([])
const [searchTerm, setSearchTerm] =
  useState("")

useEffect(() => {

  fetch(
    'https://payroll-management-system-owo2.onrender.com/api/clients'
  )
    .then(res => res.json())
    .then(data =>
      setClients(data)
    )
    .catch(err =>
      console.log(err)
    )

  fetch(
    'https://payroll-management-system-owo2.onrender.com/api/outsourced-employees'
  )
    .then(res => res.json())
    .then(data =>
      setEmployees(data)
    )
    .catch(err =>
      console.log(err)
    )

}, [])
const payrollData = employees.map(employee => {

  const client =
    clients.find(
      c =>
        c.id === employee.client_id
    )

  const basic =
    Number(employee.salary)

  const hra =
    basic * 0.40

  const ta =
    basic * 0.10

  const ma =
    basic * 0.05

  const gross =
    basic +
    hra +
    ta +
    ma

  const pf =
    basic * 0.12

  const serviceFee =
    gross *
    (
      Number(
        client?.service_fee_percent || 0
      ) / 100
    )

  const totalBilling =
    gross +
    serviceFee

  return {

    id: employee.id,

    company_name:
      client?.company_name ||
      "No Company",

    employee_name:
      employee.name,

    basic,

    hra,

    ta,

    ma,

    gross,

    pf,

    serviceFee,

    totalBilling

  }

})
const filteredPayroll =
  payrollData.filter(employee =>
    employee.employee_name
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  )
 return (

  <div
    style={{
      padding: "30px",
      maxWidth: "1400px",
      margin: "0 auto",
      minHeight: "100vh",
      background: "#0f172a"
    }}
  >

    <h1
      style={{
        fontSize: "42px",
        fontWeight: "700",
        color: "#f8fafc",
        marginBottom: "8px"
      }}
    >
      Third Party Payroll
    </h1>

    <p
      style={{
        color: "#94a3b8",
        marginBottom: "30px"
      }}
    >
      Calculate client billing and service fees.
    </p>

    <div style={summaryContainer}>

      <div style={summaryCard}>
        <h3 style={summaryTitle}>
          Total Gross Payroll
        </h3>

        <h1 style={summaryValue}>
          ₹{

  payrollData.reduce(
  (total, employee) =>
    total +
    employee.gross,
  0
)

    .toLocaleString()

}
        </h1>
      </div>

      <div style={summaryCard}>
        <h3 style={summaryTitle}>
          Service Fees
        </h3>

        <h1
          style={{
            ...summaryValue,
            color: "#22c55e"
          }}
        >
          ₹{

  payrollData.reduce(
  (total, employee) =>
    total +
    employee.serviceFee,
  0
)

    .toLocaleString()

}
        </h1>
      </div>

      <div style={summaryCard}>
        <h3 style={summaryTitle}>
          Total Billing
        </h3>

        <h1
          style={{
            ...summaryValue,
            color: "#2563eb"
          }}
        >
          ₹{

  payrollData.reduce(
  (total, employee) =>
    total +
    employee.totalBilling,
  0
)

    .toLocaleString()

}
        </h1>
      </div>
      <div style={summaryCard}>

  <h3 style={summaryTitle}>
    Employees
  </h3>

  <h1
    style={{
      ...summaryValue,
      color:"#f59e0b"
    }}
  >
    {payrollData.length}
  </h1>

</div>

    </div>

    <div style={tableContainer}>

      <div
  style={{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:"20px"
  }}
>

  <h2 style={tableTitle}>
    Third Party Payroll
  </h2>

  <input
    type="text"
    placeholder="🔍 Search Employee..."
    value={searchTerm}
    onChange={(e)=>
      setSearchTerm(
        e.target.value
      )
    }
    style={{
      width:"280px",
      padding:"12px",
      borderRadius:"10px",
      border:"1px solid #334155",
      background:"#0f172a",
      color:"#f8fafc",
      outline:"none"
    }}
  />

</div>

      <div
  style={{
    overflowX:"auto"
  }}
>
  <table style={tableStyle}>

        <thead>

          <tr style={headerRow}>

            <th style={headerStyle}>
  Company Name
</th>

<th style={headerStyle}>
  Employee Name
</th>

<th style={headerStyle}>
  Basic
</th>

<th style={headerStyle}>
  HRA
</th>

<th style={headerStyle}>
  TA
</th>

<th style={headerStyle}>
  MA
</th>

<th style={headerStyle}>
  Gross
</th>

<th style={headerStyle}>
  PF
</th>

<th style={headerStyle}>
  Service Fee
</th>

<th style={headerStyle}>
  Total Billing
</th>
          </tr>

        </thead>

        <tbody>

  {

    filteredPayroll.map(

  employee => (

        <tr key={employee.id}>

  <td style={tdStyle}>
    {employee.company_name}
  </td>

  <td style={tdStyle}>
    {employee.employee_name}
  </td>

  <td style={tdStyle}>
    ₹{Math.round(employee.basic)}
  </td>

  <td style={tdStyle}>
    ₹{Math.round(employee.hra)}
  </td>

  <td style={tdStyle}>
    ₹{Math.round(employee.ta)}
  </td>

  <td style={tdStyle}>
    ₹{Math.round(employee.ma)}
  </td>

  <td
    style={{
      ...tdStyle,
      color: "#22c55e",
      fontWeight: "700"
    }}
  >
    ₹{Math.round(employee.gross)}
  </td>

  <td
    style={{
      ...tdStyle,
      color: "#ef4444"
    }}
  >
    ₹{Math.round(employee.pf)}
  </td>

  <td style={tdStyle}>
    ₹{Math.round(employee.serviceFee)}
  </td>

  <td
    style={{
      ...tdStyle,
      color: "#2563eb",
      fontWeight: "700"
    }}
  >
    ₹{Math.round(employee.totalBilling)}
  </td>

</tr>
      )

    )

  }

</tbody>

      </table>
    </div>
    </div>

  </div>

);
}
const summaryContainer = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  marginBottom: "30px"
};
const summaryCard = {
  background: "#1e293b",
  padding: "28px",
  borderRadius: "20px",
  border: "1px solid #334155",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.35)"
};
const summaryTitle = {
  color: "#94a3b8",
  fontSize: "14px",
  textTransform: "uppercase",
  marginBottom: "12px"
};
const summaryValue = {
  color: "#f8fafc",
  fontSize: "36px",
  fontWeight: "700",
  margin: 0
};
const tableContainer = {
  background: "#1e293b",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid #334155",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.35)"
};
const tableTitle = {
  color: "#f8fafc",
  marginTop: 0,
  marginBottom: "20px"
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  color: "#f8fafc"
};
const headerRow = {
  background: "#0f172a"
};
const headerStyle = {
  padding:"16px",
  textAlign:"center",
  color: "#cbd5e1",
  borderBottom:
    "1px solid #334155"
};
const tdStyle = {
  padding: "16px",
  borderBottom:
    "1px solid #334155",
  textAlign: "center",
  verticalAlign: "top"
}
export default ThirdPartyPayroll;