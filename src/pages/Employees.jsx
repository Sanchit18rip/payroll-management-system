import { useState, useEffect } from 'react'
import StatCard from "../components/Dashboard/StatCard";
import Papa from 'papaparse'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import CustomDropdown from "../components/CustomDropdown";
import toast from "react-hot-toast";
import GlassScrollArea from "../components/GlassScrollArea";
function Employees() {

 const [employees, setEmployees] = useState([])
 const [showDeleteModal, setShowDeleteModal] =
  useState(false);
 const [currentPage, setCurrentPage] = useState(1);
 const [isSubmitting, setIsSubmitting] = useState(false);
const employeesPerPage = 10;
 const [joiningDate, setJoiningDate] = useState(null);
const [showCalendar, setShowCalendar] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [employeeToDelete, setEmployeeToDelete] =
  useState(null);
const [showEmployeeModal, setShowEmployeeModal] =
  useState(false);
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [salary, setSalary] = useState('')
  const [employeeCode, setEmployeeCode] =
  useState('')
  const [email, setEmail] =
useState('')
const [statusFilter, setStatusFilter] = useState("All Status");
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

const [departmentFilter, setDepartmentFilter] = useState("All Departments");

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

        'https://payroll-management-system-three.vercel.app/api/employees/import',

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

toast.success("Employees imported successfully!");
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
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {

  try {

    const response = await fetch(

      "https://payroll-management-system-three.vercel.app/api/employees"

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

      toast.error("Please fill all required fields.");
      return

    }

    fetch("https://payroll-management-system-three.vercel.app/api/employees", {
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
  toast.success("Employee added successfully!");
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
setShowEmployeeModal(false);
    return fetch("https://payroll-management-system-three.vercel.app/api/employees")

  })
  .then(res => res.json())
  .then(data => setEmployees(data))
  .catch((err) => {
  console.error(err);
  toast.error("Something went wrong. Please try again.");
});

}

  const deleteEmployee = () => {

  fetch(
    `https://payroll-management-system-three.vercel.app/api/employees/${employeeToDelete}`,
    {
      method: "DELETE"
    }
  )
    .then(res => res.json())
    .then(() => {
      toast.success("Employee deleted successfully!");
      setShowDeleteModal(false);

      setEmployeeToDelete(null);

      fetchEmployees();

    })
    .catch((err) => {
  console.error(err);
  toast.error("Something went wrong. Please try again.");
});;

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

setShowEmployeeModal(true);

};
const updateEmployee = () => {

  fetch(`https://payroll-management-system-three.vercel.app/api/employees/${editingId}`, {
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
    toast.success("Employee updated successfully!");
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
    setShowEmployeeModal(false);
  })
  .catch((err) => {
  console.error(err);
  toast.error("Something went wrong. Please try again.");
});;

};
const totalEmployees = employees.length;

const directEmployees = employees.filter(
  (employee) => employee.employee_type === "Direct"
).length;

const thirdPartyEmployees = employees.filter(
  (employee) => employee.employee_type === "Third Party"
).length;

const internEmployees = employees.filter(
  (employee) => employee.employment_status === "Intern"
).length;
const filteredEmployees = employees.filter((employee) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    (employee.name || "").toLowerCase().includes(search) ||
    (employee.employee_code || "").toLowerCase().includes(search) ||
    (employee.department || "").toLowerCase().includes(search) ||
    (employee.designation || "").toLowerCase().includes(search);

  const matchesDepartment =
    departmentFilter === "All Departments" ||
    employee.department === departmentFilter;

  const matchesStatus =
    statusFilter === "All Status" ||
    employee.employment_status === statusFilter;

  return (
    matchesSearch &&
    matchesDepartment &&
    matchesStatus
  );
});
const indexOfLastEmployee = currentPage * employeesPerPage;

const indexOfFirstEmployee =
  indexOfLastEmployee - employeesPerPage;

const currentEmployees =
  filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

const totalPages = Math.ceil(
  filteredEmployees.length / employeesPerPage
);

  return (
  
    <div>

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
      👥 Employee Management
    </h1>

    <p
      style={{
        marginTop: "10px",
        color: "rgba(255,255,255,.6)",
        fontSize: "16px",
      }}
    >
      Manage employee records, payroll & workforce.
    </p>
  </div>
      
  <div
    style={{
      display: "flex",
      gap: "12px",
    }}
  >
    <label style={glassButton}>
      📤 Import CSV

      <input
        type="file"
        accept=".csv"
        hidden
        onChange={importCSV}
      />
    </label>

    <button
      onClick={exportCSV}
      style={glassButton}
    >
      📥 Export CSV
    </button>
  </div>
</div>
<div style={cardContainer}>

  <StatCard
    title="Employees"
    value={totalEmployees}
    color="#3b82f6"
    delay={0.15}
    icon="employees"
  />

  <StatCard
    title="Direct"
    value={directEmployees}
    color="#22c55e"
    delay={0.3}
    icon="employees"
  />

  <StatCard
    title="Third Party"
    value={thirdPartyEmployees}
    color="#06b6d4"
    delay={0.45}
    icon="employees"
  />

  <StatCard
    title="Interns"
    value={internEmployees}
    color="#a855f7"
    delay={0.6}
    icon="employees"
  />

</div>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "25px",
  }}
>
  <div
    style={{
      display: "flex",
      gap: "12px",
      flex: 1,
    }}
  >
    <input
  placeholder="🔍 Search employees..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={searchStyle}
/>

    <CustomDropdown
  value={departmentFilter}
  onChange={setDepartmentFilter}
  options={[
    "All Departments",
    "IT",
    "HR",
    "Finance",
    "Sales",
    "Marketing",
    "Operations",
  ]}
/>

    <CustomDropdown
  value={statusFilter}
  onChange={setStatusFilter}
  options={[
    "All Status",
    "Intern",
    "Probation",
    "Permanent",
  ]}
/>
  </div>

  <button
    onClick={() => setShowEmployeeModal(true)}
    style={addEmployeeButton}
  >
    + Add Employee
  </button>
</div>
      {showEmployeeModal && (

<div style={modalOverlay}>

<div style={employeeModal}>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  }}
>
  <h2
    style={{
      margin: 0,
      color: "#f8fafc",
      fontSize: "28px",
    }}
  >
    {editingId ? "✏️ Edit Employee" : "👤 Add Employee"}
  </h2>

  <button
    onClick={() => {
      setShowEmployeeModal(false);
      setEditingId(null);
    }}
    style={{
      background: "transparent",
      border: "none",
      color: "#fff",
      fontSize: "28px",
      cursor: "pointer",
    }}
  >
    ✕
  </button>
</div>

<div style={formContainer}>
<div style={formGrid}>
<h3 style={sectionTitle}>
  👤 Personal Information
</h3>
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
<h3 style={sectionTitle}>
  💼 Employment Details
</h3>
<input
  type="text"
  placeholder="Designation"
  value={designation}
  onChange={(e)=>
    setDesignation(e.target.value)
  }
  style={inputStyle}
/>
<CustomDropdown
  value={employeeType}
  onChange={setEmployeeType}
  placeholder="Employee Type"
  options={[
    "Direct",
    "Third Party",
  ]}
/>
        <input
  type="text"
  placeholder="Department"
  value={department}
  onChange={(e) => setDepartment(e.target.value)}
  style={inputStyle}
/>

<CustomDropdown
  value={employmentStatus}
  onChange={setEmploymentStatus}
  placeholder="Employment Status"
  options={[
    "Probation",
    "Intern",
  ]}
/>
{
  employmentStatus === "Intern" && (

    <CustomDropdown
  value={internshipDuration}
  onChange={setInternshipDuration}
  placeholder="Internship Duration"
  options={[
    "3 Months",
    "6 Months",
  ]}
/>

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
<h3 style={sectionTitle}>
  💰 Salary Details
</h3>
        <input
          type="number"
          placeholder="Basic Salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          style={inputStyle}
        />
        </div>
        <button
  onClick={
    editingId
      ? updateEmployee
      : addEmployee
  }
  style={{
  width: "100%",

  background:
    "linear-gradient(135deg,#37FFD7,#0EA5E9)",

  color: "#08111d",

  border: "none",

  padding: "16px",

  borderRadius: "16px",

  cursor: "pointer",

  fontSize: "16px",

  fontWeight: "700",

  boxShadow:
    "0 12px 30px rgba(55,255,215,.35)",

  transition: "all .25s ease",
}}
>
  {
    editingId
      ? "Update Employee"
      : "Add Employee"
  }
</button>

      </div>

</div>

</div>

)}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    padding: "0 10px",
    color: "#cbd5e1",
  }}
>
  <span>
    Showing{" "}
    {filteredEmployees.length === 0
      ? 0
      : indexOfFirstEmployee + 1}
    {" - "}
    {Math.min(
      indexOfLastEmployee,
      filteredEmployees.length
    )}
    {" of "}
    {filteredEmployees.length}
    {" employees"}
  </span>

  <div
    style={{
      display: "flex",
      gap: "10px",
    }}
  >
    <button
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage(currentPage - 1)
      }
      style={paginationButton}
    >
      ◀ Previous
    </button>

    <span
      style={{
  minWidth: "80px",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  padding: "10px 18px",

  borderRadius: "12px",

  background:
    "rgba(55,255,215,.08)",

  border:
    "1px solid rgba(55,255,215,.20)",

  color: "#37FFD7",

  fontWeight: "700",

  boxShadow:
    "0 4px 12px rgba(55,255,215,.12)",
}}
    >
      {currentPage} / {totalPages || 1}
    </span>

    <button
      disabled={
        currentPage === totalPages ||
        totalPages === 0
      }
      onClick={() =>
        setCurrentPage(currentPage + 1)
      }
      style={paginationButton}
    >
      Next ▶
    </button>
  </div>
</div>
      <GlassScrollArea
    style={{
        marginTop: "24px",
        maxHeight: "650px",
        borderRadius: "24px",
        background:
            "linear-gradient(180deg,#1e293b,#172033)",
        border:
            "1px solid rgba(255,255,255,.08)",
        boxShadow:
            "0 18px 40px rgba(0,0,0,.35)",
    }}
>
  <table style={tableStyle}>

        <thead>
  <tr>
    <th style={{ ...headerStyle, width: "140px" }}>
  Employee Code
</th>

<th style={{ ...headerStyle, width: "260px" }}>
  Name
</th>

<th style={{ ...headerStyle, width: "180px" }}>
  Designation
</th>

<th style={{ ...headerStyle, width: "140px" }}>
  Department
</th>

<th style={{ ...headerStyle, width: "140px" }}>
  Type
</th>

<th style={{ ...headerStyle, width: "150px" }}>
  Status
</th>

<th style={{ ...headerStyle, width: "150px" }}>
  Joining Date
</th>

<th style={{ ...headerStyle, width: "180px" }}>
  Experience
</th>

<th style={{ ...headerStyle, width: "260px" }}>
  Email
</th>

<th style={{ ...headerStyle, width: "170px" }}>
  Phone
</th>

<th style={{ ...headerStyle, width: "150px" }}>
  Salary
</th>

<th style={{ ...headerStyle, width: "140px" }}>
  Action
</th>
  </tr>
</thead>

        <tbody>

          {currentEmployees.map((employee, index) => (

            <tr
  key={employee.id}
 style={{
  transition: "all .25s ease",

  background:
    index % 2 === 0
      ? "rgba(255,255,255,.015)"
      : "transparent",
}}
  onMouseEnter={(e) => {
  e.currentTarget.style.background =
  "rgba(55,255,215,.06)";

  e.currentTarget.style.boxShadow =
  `
    inset 4px 0 #37FFD7,
    0 0 18px rgba(55,255,215,.08)
  `;
}}
  onMouseLeave={(e) => {
  e.currentTarget.style.background =
    "transparent";

  e.currentTarget.style.boxShadow =
    "none";
}}
>

              <td style={tdStyle}>
  {employee.employee_code}
</td>

              <td
  style={{
    ...tdStyle,
    textAlign: "left",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background:
  "linear-gradient(135deg,#22D3EE,#2563EB)",
        color: "#08111d",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "700",
        fontSize:"18px",
        boxShadow:"0 6px 15px rgba(34,211,238,.25)",
      }}
    >
      {employee.name.charAt(0).toUpperCase()}
    </div>

    <span>{employee.name}</span>
  </div>
</td>

<td style={tdStyle}>
  {employee.designation}
</td>
<td style={tdStyle}>
  {employee.department}
</td>

<td style={tdStyle}>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <span
    style={{
      padding: "8px 14px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "600",
      color:
        employee.employee_type === "Direct"
          ? "#22c55e"
          : "#06b6d4",
      background:
        employee.employee_type === "Direct"
          ? "rgba(34,197,94,.15)"
          : "rgba(6,182,212,.15)",
      border:
        employee.employee_type === "Direct"
          ? "1px solid rgba(34,197,94,.35)"
          : "1px solid rgba(6,182,212,.35)",
    }}
  >
    {employee.employee_type}
  </span>
  </div>
</td>

<td style={tdStyle}>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <span
    style={{
      padding: "8px 14px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "600",

      color:
        employee.employment_status === "Intern"
          ? "#a855f7"
          : "#f59e0b",

      background:
        employee.employment_status === "Intern"
          ? "rgba(168,85,247,.15)"
          : "rgba(245,158,11,.15)",

      border:
        employee.employment_status === "Intern"
          ? "1px solid rgba(168,85,247,.35)"
          : "1px solid rgba(245,158,11,.35)",
    }}
  >
    {employee.employment_status}
  </span>
  </div>
</td>
<td style={tdStyle}>
  {employee.joining_date
    ? employee.joining_date
        .split("T")[0]
    : "-"}
</td>

<td style={tdStyle}>
  {employee.previous_experience || "-"}
</td>

<td style={tdStyle}>
  {employee.email}
</td>

<td style={tdStyle}>
  {employee.phone}
</td>

<td
  style={{
    ...tdStyle,

    color: "#37FFD7",

    fontWeight: "700",

    fontSize: "15px",

    letterSpacing: ".5px",
  }}
>
  ₹{employee.salary}
</td>
              <td style={tdStyle}>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
    }}
  >
                <button
  onClick={() => editEmployee(employee)}
  title="Edit Employee"
  style={{
    width: "42px",
    height: "42px",

    borderRadius: "12px",

    border: "1px solid rgba(255,255,255,.08)",

    background:
      "linear-gradient(145deg,#f59e0b,#d97706)",

    color: "#fff",

    cursor: "pointer",

    fontSize: "18px",

    transition: ".25s",

    marginRight: "10px",
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
  ✏️
</button>

<button
  title="Delete Employee"
  style={{
    width: "42px",
    height: "42px",

    borderRadius: "12px",

    border: "1px solid rgba(255,255,255,.08)",

    background:
      "linear-gradient(145deg,#ef4444,#dc2626)",

    color: "#fff",

    cursor: "pointer",

    fontSize: "18px",

    transition: ".25s",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "translateY(-2px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "translateY(0)";
  }}
  onClick={() => {
    setEmployeeToDelete(employee.id);
    setShowDeleteModal(true);
  }}
>
  🗑️
</button>
</div>
              </td>

            </tr>

          ))}

        </tbody>

      </table>
      
    </GlassScrollArea>
    

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
  width: "100%",
  minWidth: "1800px",

  tableLayout: "fixed",

  background: "transparent",

  color: "#f8fafc",

  borderCollapse: "separate",

  borderSpacing: 0,
};
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
  position: "sticky",
  top: 0,
  zIndex: 100,

  background:
    "linear-gradient(180deg,#111827,#0f172a)",

  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",

  color: "#f8fafc",

  fontWeight: "700",

  fontSize: "14px",

  textTransform: "uppercase",

  letterSpacing: "1px",

  padding: "18px",

  textAlign: "center",

  borderBottom:
    "1px solid rgba(255,255,255,.08)",
  boxShadow:
  "0 6px 15px rgba(0,0,0,.18)",
};
const tdStyle = {
  padding: "18px 16px",

  textAlign: "center",

  verticalAlign: "middle",

  borderBottom:
    "1px solid rgba(255,255,255,.06)",
};
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
const cardContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "24px",
  marginBottom: "35px",
};
const searchStyle = {
  flex: 1,

  padding: "14px 18px",

  borderRadius: "16px",

  border: "1px solid rgba(255,255,255,.08)",

  background:
    "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",

  color: "#f8fafc",

  fontSize: "15px",

  outline: "none",

  backdropFilter: "blur(18px)",
};
const filterStyle = {
  padding: "14px 18px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,.08)",

  background:
    "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",

  color: "#f8fafc",

  minWidth: "190px",

  outline: "none",

  cursor: "pointer",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",

  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='white' viewBox='0 0 16 16'%3E%3Cpath d='M1.5 5.5l6 6 6-6'/%3E%3C/svg%3E")`,

  backgroundRepeat: "no-repeat",

  backgroundPosition: "right 15px center",

  paddingRight: "45px",
};
const addEmployeeButton = {
  padding: "14px 24px",

  borderRadius: "16px",

  border: "none",

  background:
    "linear-gradient(135deg,#37FFD7,#0EA5E9)",

  color: "#08111d",

  fontWeight: 700,

  fontSize: "15px",

  cursor: "pointer",

  boxShadow:
    "0 12px 30px rgba(55,255,215,.35)",

  transition: "all .25s ease",
};
const employeeModal = {
  width: "90%",
  maxWidth: "900px",
  maxHeight: "90vh",

  overflowY: "auto",

  padding: "30px",

  borderRadius: "24px",

  background:
    "linear-gradient(145deg, rgba(17,24,39,.95), rgba(30,41,59,.95))",

  border: "1px solid rgba(255,255,255,.08)",

  backdropFilter: "blur(22px)",

  WebkitBackdropFilter: "blur(22px)",

  boxShadow:
    "0 25px 70px rgba(0,0,0,.55)",
};
const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "18px",
  marginBottom: "24px",
};
const sectionTitle = {
  gridColumn: "1 / -1",

  margin: "10px 0 5px",

  fontSize: "18px",

  fontWeight: "700",

  color: "#37FFD7",

  paddingBottom: "10px",

  borderBottom: "1px solid rgba(255,255,255,.08)",
};
const paginationButton = {
  padding: "10px 18px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,.08)",
  background:
    "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
  color: "#f8fafc",
  cursor: "pointer",
  fontWeight: "600",
  transition: "all .25s ease",
};
const Spinner = () => (
  <div
    style={{
      width: "18px",
      height: "18px",
      border: "2px solid rgba(255,255,255,.25)",
      borderTop: "2px solid #37FFD7",
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
    }}
  />
);
export default Employees