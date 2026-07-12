import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
function Employees() {

 const [employees, setEmployees] = useState([])
 const [showDeleteModal, setShowDeleteModal] =
  useState(false);
 const [joiningDate, setJoiningDate] = useState(null);
const [showCalendar, setShowCalendar] = useState(false);

const [employeeToDelete, setEmployeeToDelete] =
  useState(null);

  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [salary, setSalary] = useState('')
  const [employeeCode, setEmployeeCode] =
  useState('')
  const [email, setEmail] =
useState('')

const [phone, setPhone] =
useState('')

const [designation, setDesignation] =
useState('')

const [employeeType, setEmployeeType] =
useState('Direct')

const [employmentStatus, setEmploymentStatus] =
useState('Intern')
const [
  internshipDuration,
  setInternshipDuration
] = useState("3 Months");


const [confirmationDate, setConfirmationDate] =
useState('')

const [lastJobDetails, setLastJobDetails] =
useState('')

const [previousExperience, setPreviousExperience] =
useState('')
  const [editingId, setEditingId] = useState(null);
  const exportCSV = () => {

  const headers = [

  "employee_code",

  "name",

  "department",

  "salary",

  "bonus",

  "deduction"

];

  const rows = employees.map(

    employee => [

      employee.employee_code,

employee.name,

employee.department,

employee.salary,

employee.bonus,

employee.deduction
    ]

  );

  const csvContent = [

    headers.join(","),

    ...rows.map(

      row => row.join(",")

    )

  ].join("\n");

  const blob = new Blob(

    [csvContent],

    {

      type: "text/csv"

    }

  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "employees.csv";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

};
const importCSV = (event) => {

  const file = event.target.files[0]

  if (!file) return

  Papa.parse(file, {

    header: true,

    skipEmptyLines: true,

    complete: async (results) => {

      try {

        await Promise.all(

  results.data.map(

    employee =>

      fetch(

        'https://payroll-management-system-owo2.onrender.com/api/employees/import',

        {

          method: 'POST',

          headers: {

            'Content-Type': 'application/json'

          },

          body: JSON.stringify({

  employee_code: employee.employee_code,
name: employee.name,
email: employee.email,
phone: employee.phone,
designation: employee.designation,
employee_type: employee.employee_type,
employment_status: employee.employment_status,
joining_date: employee.joining_date || null,
confirmation_date: employee.confirmation_date || null,
last_job_details: employee.last_job_details,
previous_experience: employee.previous_experience,
department: employee.department,
salary: employee.salary,
bonus: 0,
deduction: 0

})
        }

      )

  )

);

        await fetchEmployees();

alert(
  'Employees imported successfully'
);
      }

      catch (err) {

        console.log(err)

      }

    }

  })

}
  useEffect(() => {

  fetchEmployees();

}, []);

  const fetchEmployees = async () => {

  try {

    const response = await fetch(

      "https://payroll-management-system-owo2.onrender.com/api/employees"

    );

    const data =
      await response.json();

    setEmployees(data);

  }

  catch (err) {

    console.log(err);

  }

};
  const addEmployee = () => {

    if (

  !employeeCode ||

  !name ||

  !department ||

  !salary

) {

      alert('Please fill all fields')
      return

    }

    fetch("https://payroll-management-system-owo2.onrender.com/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({

  employee_code:
    employeeCode,

  name,

  email,

  phone,

  designation,

  employee_type:
    employeeType,

  employment_status:
    employmentStatus,

  joining_date:
  joiningDate
    ? joiningDate.toISOString().split("T")[0]
    : null,

confirmation_date:
  confirmationDate
    ? confirmationDate
    : null,

  last_job_details:
    lastJobDetails,

  previous_experience:
    previousExperience,

  department,

  salary,

  bonus: 0,

  deduction: 0

})
  })
  .then(res => res.json())
  .then(() => {

    setEmployeeCode('')
setName('')

setEmail('')
setPhone('')

setDesignation('')

setEmployeeType('Direct')

setEmploymentStatus('Intern')

setJoiningDate(null);
setConfirmationDate('')

setLastJobDetails('')
setPreviousExperience('')

setDepartment('')
setSalary('')

    return fetch("https://payroll-management-system-owo2.onrender.com/api/employees")

  })
  .then(res => res.json())
  .then(data => setEmployees(data))
  .catch(err => console.log(err))

}

  const deleteEmployee = () => {

  fetch(
    `https://payroll-management-system-owo2.onrender.com/api/employees/${employeeToDelete}`,
    {
      method: "DELETE"
    }
  )
    .then(res => res.json())
    .then(() => {

      setShowDeleteModal(false);

      setEmployeeToDelete(null);

      fetchEmployees();

    })
    .catch(err => console.log(err));

};
const editEmployee = (

  employee

) => {

  setEditingId(

    employee.id

  );

  setEmployeeCode(

    employee.employee_code || ''

  );

  setName(

    employee.name

  );

  setEmail(
  employee.email || ''
)

setPhone(
  employee.phone || ''
)

setDesignation(
  employee.designation || ''
)

setEmployeeType(
  employee.employee_type ||
  'Direct'
)

setEmploymentStatus(
  employee.employment_status ||
  'Intern'
)

setInternshipDuration(
  employee.internship_duration || ""
);

setJoiningDate(
  employee.joining_date
    ? new Date(employee.joining_date)
    : null
);

setConfirmationDate(
  employee.confirmation_date || ''
)

setLastJobDetails(
  employee.last_job_details ||
  ''
)

setPreviousExperience(
  employee.previous_experience ||
  ''
)

  setDepartment(

    employee.department

  );

  setSalary(

    employee.salary

  );

};
const updateEmployee = () => {

  fetch(`https://payroll-management-system-owo2.onrender.com/api/employees/${editingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      employee_code: employeeCode,
      name,
      email,
      phone,
      designation,
      employee_type: employeeType,
      employment_status: employmentStatus,
      internship_duration: internshipDuration,
      joining_date: joiningDate
  ? joiningDate.toISOString().split("T")[0]
  : null,
      confirmation_date:
  confirmationDate
    ? confirmationDate
    : null,
      last_job_details: lastJobDetails,
      previous_experience: previousExperience,
      department,
      salary
    })
  })
  .then(res => res.json())
  .then(() => {

    fetchEmployees();

    setEditingId(null);

    setEmployeeCode("");
    setName("");
    setEmail("");
    setPhone("");
    setDesignation("");
    setEmployeeType("Direct");
    setEmploymentStatus("Intern");
    setInternshipDuration("3 Months");
    setJoiningDate(null);
    setConfirmationDate(null);
    setLastJobDetails("");
    setPreviousExperience("");
    setDepartment("");
    setSalary("");

  })
  .catch(err => console.log(err));

};

  return (

    <div>

      <>
  <h1
    style={{
      fontSize: '42px',
      fontWeight: '700',
      color: '#f8fafc',
      marginBottom: '8px'
    }}
  >
    Employee Management
  </h1>
  <div
  style={{
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  }}
>

  <button
    onClick={exportCSV}
    style={{
      padding: '12px 20px',
      background: '#16a34a',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600'
    }}
  >
    📥 Export CSV
  </button>

  <label
    style={{
      padding: '12px 20px',
      background: '#2563eb',
      color: '#ffffff',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600'
    }}
  >
    📤 Import CSV

    <input
      type="file"
      accept=".csv"
      hidden
      onChange={importCSV}
    />

  </label>

</div>

  <p
    style={{
      color: '#94a3b8',
      marginBottom: '30px'
    }}
  >
    Manage employee records, salaries and personal details
  </p>
</>

      <div style={formContainer}>
      <input
  type="text"
  placeholder="Employee Code"
  value={employeeCode}
  onChange={(e) =>
    setEmployeeCode(
      e.target.value
    )
  }
  style={inputStyle}
/>
        <input
          type="text"
          placeholder="Employee Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e)=>
    setEmail(e.target.value)
  }
  style={inputStyle}
/>

<input
  type="text"
  placeholder="Phone Number"
  value={phone}
  onChange={(e)=>
    setPhone(e.target.value)
  }
  style={inputStyle}
/>

<input
  type="text"
  placeholder="Designation"
  value={designation}
  onChange={(e)=>
    setDesignation(e.target.value)
  }
  style={inputStyle}
/>
<select
  value={employeeType}
  onChange={(e)=>
    setEmployeeType(
      e.target.value
    )
  }
  style={inputStyle}
>
  <option value="Direct">
    Direct Employee
  </option>

  <option value="Third Party">
    Third Party Employee
  </option>
</select>
        <input
  type="text"
  placeholder="Department"
  value={department}
  onChange={(e) => setDepartment(e.target.value)}
  style={inputStyle}
/>

<select
  value={employmentStatus}
  onChange={(e) =>
    setEmploymentStatus(e.target.value)
  }
  style={inputStyle}
>
  <option value="Probation">
    Probation
  </option>

  <option value="Intern">
    Intern
  </option>
</select>

{
  employmentStatus === "Intern" && (

    <select
      value={internshipDuration}
      onChange={(e) =>
        setInternshipDuration(e.target.value)
      }
      style={inputStyle}
    >
      <option value="3 Months">
        Internship - 3 Months
      </option>

      <option value="6 Months">
        Internship - 6 Months
      </option>
    </select>

  )
}

<div
  style={{
    position: "relative",
    width: "100%",
    marginBottom: "16px"
  }}
>

<div
  style={{
    position: "relative",
    width: "100%",
    marginBottom: "16px"
  }}
>

  <input
    type="text"
    readOnly
    value={
      joiningDate
        ? joiningDate.toLocaleDateString("en-GB")
        : ""
    }
    placeholder="Joining Date"
    style={{
      ...inputStyle,
      paddingRight: "50px"
    }}
  />

  <FaCalendarAlt
    onClick={() =>
      setShowCalendar(!showCalendar)
    }
    style={{
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#94a3b8",
      fontSize: "18px"
    }}
  />

  {
    showCalendar && (

      <div
        style={{
          position: "absolute",
          top: "60px",
          right: 0,
          zIndex: 9999
        }}
      >

        <DatePicker
          inline
          selected={joiningDate}
          onChange={(date) => {

            setJoiningDate(date);

            setShowCalendar(false);

          }}
        />

      </div>

    )
  }

</div>
</div>

<input
  type="text"
  placeholder="Last Job Details"
  value={lastJobDetails}
  onChange={(e)=>
    setLastJobDetails(
      e.target.value
    )
  }
  style={inputStyle}
/>

<input
  type="text"
  placeholder="Previous Experience"
  value={previousExperience}
  onChange={(e)=>
    setPreviousExperience(
      e.target.value
    )
  }
  style={inputStyle}
/>
        <input
          type="number"
          placeholder="Basic Salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          style={inputStyle}
        />

        <button
  onClick={
    editingId
      ? updateEmployee
      : addEmployee
  }
  style={{
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  padding: "14px 24px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  boxShadow:
    "0 4px 20px rgba(37,99,235,0.3)"
}}
>
  {
    editingId
      ? "Update Employee"
      : "Add Employee"
  }
</button>

      </div>

      <div
  style={{
    overflowX: "auto"
  }}
>
  <table style={tableStyle}>

        <thead>

          <tr
  style={{
    background: '#0f172a'
  }}
>
  <th style={headerStyle}>
  Employee Code
</th>

<th style={headerStyle}>
  Name
</th>

<th style={headerStyle}>
  Designation
</th>

<th style={headerStyle}>
  Department
</th>

<th style={headerStyle}>
  Type
</th>

<th style={headerStyle}>
  Status
</th>
<th style={headerStyle}>
  Joining Date
</th>

<th style={headerStyle}>
  Experience
</th>
<th style={headerStyle}>
  Email
</th>

<th style={headerStyle}>
  Phone
</th>

<th style={headerStyle}>
  Salary
</th>

<th style={headerStyle}>
  Action
</th>
</tr>

        </thead>

        <tbody>

          {employees.map((employee) => (

            <tr key={employee.id}>

              <td>
  {employee.employee_code}
</td>

              <td>{employee.name}</td>

<td>
  {employee.designation}
</td>

<td>
  {employee.department}
</td>

<td>
  {employee.employee_type}
</td>

<td>
  {employee.employment_status}
</td>
<td>
  {employee.joining_date
    ? employee.joining_date
        .split("T")[0]
    : "-"}
</td>

<td>
  {employee.previous_experience || "-"}
</td>

<td>
  {employee.email}
</td>

<td>
  {employee.phone}
</td>

<td>
  ₹{employee.salary}
</td>
              <td>
                <button
  onClick={() => editEmployee(employee)}
  style={{
  background: "#f59e0b",
  color: "#ffffff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  marginRight: "10px",
  fontWeight: "600"
}}
>
  Edit
</button>

<button
  style={{
  background: "#CC0000",
  color: "#ffffff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
}}
  onClick={() => {

    setEmployeeToDelete(
      employee.id
    );

    setShowDeleteModal(true);

  }}
>
  Delete
</button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>
    </div>
    

    {
  showDeleteModal && (

    <div style={modalOverlay}>

      <div style={modalBox}>

        <h2>
          Delete Employee
        </h2>

        <p>
          Are you sure you want to
          delete this employee?

          <br /><br />

          This action cannot be
          undone.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
          }}
        >

          <button
  style={{
    background: "#2563EB",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  }}
  onClick={() => {

    setShowDeleteModal(
      false
    );

    setEmployeeToDelete(
      null
    );

  }}
>
  Cancel
</button>

          <button
  style={{
    background: "#CC0000",
    color: "#ffffff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  }}
  onClick={deleteEmployee}
>
  Delete
</button>

        </div>

      </div>

    </div>

  )
}
    </div>

  )
}

const formContainer = {
  background: '#1e293b',
  padding: '24px',
  borderRadius: '20px',
  marginBottom: '24px',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)'
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  marginBottom: '16px',
  borderRadius: '12px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '15px',
  outline: 'none'
}
const buttonStyle = {
  padding: '12px 20px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer'
}

const deleteButton = {
  padding: '8px 14px',
  background: 'red',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
}

const tableStyle = {
  width: '100%',
  background: '#1e293b',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)',
  color: '#f8fafc',
  borderCollapse: 'collapse'
}
const modalOverlay = {

  position: "fixed",

  top: 0,
  left: 0,

  width: "100%",
  height: "100%",

  background:
    "rgba(0,0,0,0.5)",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  zIndex: 1000

};

const modalBox = {
  background: "#1e293b",

  color: "#f8fafc",

  padding: "30px",

  borderRadius: "20px",

  width: "420px",

  border: "1px solid #334155",

  boxShadow:
    "0 8px 32px rgba(0,0,0,0.4)"
};
const headerStyle = {
  padding: '18px',
  textAlign: 'center',
  color: '#cbd5e1',
  borderBottom:
    '1px solid #334155',
  fontWeight: '600'
}
const tdStyle = {
  padding: "16px",
  textAlign: "center",
  borderBottom:
    "1px solid #334155"
}
export default Employees