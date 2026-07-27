import { useState, useEffect } from "react";

function OutsourcedEmployees() {

  const [employees, setEmployees] =
    useState([]);

  const [clients, setClients] =
    useState([]);

  const [clientId, setClientId] =
    useState("");

  const [name, setName] =
    useState("");

  const [designation, setDesignation] =
    useState("");

  const [salary, setSalary] =
    useState("");
  const [

  employeeToDelete,

  setEmployeeToDelete

] = useState(null);
   const fetchEmployees = () => {

  fetch(
    "https://payroll-management-system-three.vercel.app/api/outsourced-employees"
  )

    .then(res => res.json())

    .then(data =>
      setEmployees(data)
    )

    .catch(err =>
      console.log(err)
    );

};

const fetchClients = () => {

  fetch(
    "https://payroll-management-system-three.vercel.app/api/clients"
  )

    .then(res => res.json())

    .then(data =>
      setClients(data)
    )

    .catch(err =>
      console.log(err)
    );

};
const addEmployee = () => {

  if (

    !clientId ||

    !name ||

    !designation ||

    !salary

  ) {

    alert(
      "Please fill all fields"
    )

    return

  }

  fetch(

    "https://payroll-management-system-three.vercel.app/api/outsourced-employees",

    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json"

      },

      body: JSON.stringify({

        client_id:
          clientId,

        name,

        designation,

        salary

      })

    }

  )

    .then(res => res.json())

    .then(() => {

      setClientId("")

      setName("")

      setDesignation("")

      setSalary("")

      fetchEmployees()

    })

    .catch(err =>
      console.log(err)
    )

}
useEffect(() => {

  fetchEmployees();

  fetchClients();

}, []);
const deleteEmployee = () => {

  fetch(

    `https://payroll-management-system-three.vercel.app/api/outsourced-employees/${employeeToDelete}`,

    {

      method: "DELETE"

    }

  )

    .then(res => res.json())

    .then(() => {

      fetchEmployees();

      setEmployeeToDelete(
        null
      );

    })

    .catch(err =>
      console.log(err)
    );

};
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
      Outsourced Employees
    </h1>

    <p
      style={{
        color: "#94a3b8",
        marginBottom: "30px"
      }}
    >
      Manage employees belonging to client companies.
    </p>

    <div style={formContainer}>

  <select
    value={clientId}
    onChange={(e) =>
      setClientId(e.target.value)
    }
    style={inputStyle}
  >
    <option value="">
      Select Client Company
    </option>

    {clients.map((client) => (

      <option
        key={client.id}
        value={client.id}
      >
        {client.company_name}
      </option>

    ))}

  </select>

  <input
    type="text"
    placeholder="Employee Name"
    value={name}
    onChange={(e) =>
      setName(e.target.value)
    }
    style={inputStyle}
  />

  <input
    type="text"
    placeholder="Designation"
    value={designation}
    onChange={(e) =>
      setDesignation(e.target.value)
    }
    style={inputStyle}
  />

  <input
    type="number"
    placeholder="Salary"
    value={salary}
    onChange={(e) =>
      setSalary(e.target.value)
    }
    style={inputStyle}
  />

  <button
  style={buttonStyle}
  onClick={addEmployee}
>
  Add Outsourced Employee
</button>

</div>

    

    <div style={tableContainer}>

  <h2 style={tableTitle}>
    Outsourced Workforce
  </h2>

  <table style={tableStyle}>

    <thead>

      <tr style={headerRow}>

        <th style={headerStyle}>
          Employee
        </th>

        <th style={headerStyle}>
          Client
        </th>

        <th style={headerStyle}>
          Designation
        </th>

        <th style={headerStyle}>
          Salary
        </th>
        <th style={headerStyle}>
  Actions
</th>

      </tr>

    </thead>

    <tbody>

      {employees.map((employee) => (

        <tr key={employee.id}>

          <td style={tdStyle}>
            {employee.name}
          </td>

          <td style={tdStyle}>
            {employee.company_name}
          </td>

          <td style={tdStyle}>
            {employee.designation}
          </td>

          <td style={tdStyle}>
            ₹{Number(
              employee.salary
            ).toLocaleString()}
          </td>
          <td style={tdStyle}>

  <button

    style={deleteButton}

    onClick={() =>

      setEmployeeToDelete(
        employee.id
      )

    }

  >

    Delete

  </button>

</td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

    
      {employeeToDelete && (

  <div className="modal-overlay">

    <div className="logout-modal">

      <h3>

        Delete Employee

      </h3>

      <p>

        Are you sure you want
        to remove this outsourced
        employee?

      </p>

      <div className="modal-actions">

        <button

          className="cancel-btn"

          onClick={() =>

            setEmployeeToDelete(
              null
            )

          }

        >

          Cancel

        </button>

        <button

          className="confirm-btn"

          onClick={deleteEmployee}

        >

          Delete

        </button>

      </div>

    </div>

  </div>

)}
  </div>

);

}
const formContainer = {
  background: "#1e293b",
  padding: "28px",
  borderRadius: "20px",
  border: "1px solid #334155",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.35)",
  marginBottom: "30px"
};
const inputStyle = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #475569",
  background: "#0f172a",
  color: "#f8fafc",
  fontSize: "15px",
  boxSizing: "border-box",
  marginBottom: "16px"
};
const buttonStyle = {
  padding: "14px 24px",
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "600",
  boxShadow:
    "0 4px 20px rgba(37,99,235,0.3)"
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
  padding: "16px",
  textAlign: "left",
  color: "#cbd5e1",
  borderBottom:
    "1px solid #334155"
};
const tdStyle = {
  padding: "16px",
  borderBottom:
    "1px solid #334155"
};
const deleteButton = {

  padding: "10px 18px",

  background: "#dc2626",

  color: "#ffffff",

  border: "none",

  borderRadius: "10px",

  cursor: "pointer",

  fontWeight: "600"

};

export default OutsourcedEmployees;