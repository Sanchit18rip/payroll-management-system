import { useState, useEffect } from 'react'
import StatCard from "../components/Dashboard/StatCard";
import Papa from 'papaparse'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import CustomDropdown from "../components/CustomDropdown";
import toast from "react-hot-toast";
import GlassScrollArea from "../components/GlassScrollArea";
import { apiFetch, API_BASE } from "../api";

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
const [gender, setGender] = useState('')
const [dateOfBirth, setDateOfBirth] = useState('')
const [uanNumber, setUanNumber] = useState('')
const [pfAccountNumber, setPfAccountNumber] = useState('')
const [esiRegistrationNumber, setEsiRegistrationNumber] = useState('')
const [bankAccountNumber, setBankAccountNumber] = useState('')
const [bankName, setBankName] = useState('')
const [ifscCode, setIfscCode] = useState('')
const [panNumber, setPanNumber] = useState('')
const [workStartDate, setWorkStartDate] = useState('')
const [workEndDate, setWorkEndDate] = useState('')
  const [editingId, setEditingId] = useState(null);
  const EMPLOYEE_CSV_HEADERS = [
  "employee_code",
  "name",
  "email",
  "phone",
  "designation",
  "employee_type",
  "employment_status",
  "internship_duration",
  "joining_date",
  "confirmation_date",
  "last_job_details",
  "previous_experience",
  "department",
  "salary",
  "bonus",
  "deduction"
];

const exportCSV = () => {
  if (!employees.length) {
    alert("There are no employees to export.");
    return;
  }

  const exportRows = employees.map((employee) => ({
    employee_code: employee.employee_code ?? "",
    name: employee.name ?? "",
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    designation: employee.designation ?? "",
    employee_type: employee.employee_type ?? "",
    employment_status: employee.employment_status ?? "",
    internship_duration: employee.internship_duration ?? "",
    joining_date: employee.joining_date ?? "",
    confirmation_date: employee.confirmation_date ?? "",
    last_job_details: employee.last_job_details ?? "",
    previous_experience: employee.previous_experience ?? "",
    department: employee.department ?? "",
    salary: employee.salary ?? "",
    bonus: employee.bonus ?? 0,
    deduction: employee.deduction ?? 0
  }));

  const csv = Papa.unparse({
    fields: EMPLOYEE_CSV_HEADERS,
    data: exportRows.map((row) =>
      EMPLOYEE_CSV_HEADERS.map((header) => row[header])
    )
  });

  const blob = new Blob(
    [csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download =
    `employees-${new Date().toISOString().split("T")[0]}.csv`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
const importCSV = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const resetInput = () => {
    event.target.value = "";
  };

  if (!file.name.toLowerCase().endsWith(".csv")) {
    alert(
      "❌ Invalid File\n\nPlease select a CSV file."
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

        const actualHeaders = results.meta.fields || [];

        // --------------------------------
        // HEADER VALIDATION
        // --------------------------------

        const missingHeaders =
          EMPLOYEE_CSV_HEADERS.filter(
            (header) =>
              !actualHeaders.includes(header)
          );

        if (missingHeaders.length > 0) {
          alert(
            `❌ Invalid CSV Format\n\n` +
            `The selected file does not match the Employee table format.\n\n` +
            `Missing columns:\n` +
            missingHeaders.join(", ") +
            `\n\nPlease export an Employee CSV from this system and use that format.`
          );

          resetInput();
          return;
        }

        // --------------------------------
        // EMPTY FILE CHECK
        // --------------------------------

        if (rows.length === 0) {
          alert(
            "❌ Empty CSV\n\n" +
            "The selected file contains no employee records."
          );

          resetInput();
          return;
        }

        // --------------------------------
        // ROW VALIDATION
        // --------------------------------

        const invalidRows = [];

        rows.forEach((employee, index) => {
          const rowNumber = index + 2;

          if (!employee.employee_code?.trim()) {
            invalidRows.push(
              `Row ${rowNumber}: Employee Code is missing`
            );
          }

          if (!employee.name?.trim()) {
            invalidRows.push(
              `Row ${rowNumber}: Employee Name is missing`
            );
          }

          if (!employee.department?.trim()) {
            invalidRows.push(
              `Row ${rowNumber}: Department is missing`
            );
          }

          if (
            employee.salary === "" ||
            employee.salary === null ||
            Number.isNaN(Number(employee.salary))
          ) {
            invalidRows.push(
              `Row ${rowNumber}: Salary is invalid`
            );
          }

          if (
            employee.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
              employee.email.trim()
            )
          ) {
            invalidRows.push(
              `Row ${rowNumber}: Email format is invalid`
            );
          }
        });

        // --------------------------------
        // STOP ENTIRE IMPORT IF INVALID
        // --------------------------------

        if (invalidRows.length > 0) {
          alert(
            `❌ Import Cancelled\n\n` +
            `The CSV contains invalid data.\n\n` +
            invalidRows.slice(0, 10).join("\n") +
            (invalidRows.length > 10
              ? `\n\n...and ${
                  invalidRows.length - 10
                } more errors.`
              : "") +
            `\n\nNo records were imported.`
          );

          resetInput();
          return;
        }

        // --------------------------------
        // CONFIRM VALID FILE
        // --------------------------------

        const confirmed = window.confirm(
          `✅ CSV verified successfully.\n\n` +
          `${rows.length} employee record(s) are ready to import.\n\n` +
          `Continue?`
        );

        if (!confirmed) {
          resetInput();
          return;
        }

        // --------------------------------
        // IMPORT
        // --------------------------------

        for (const employee of rows) {
          const response = await apiFetch(
            `${API_BASE}/api/employees/import`,
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json"
              },

              body: JSON.stringify({
                employee_code:
                  employee.employee_code.trim(),

                name:
                  employee.name.trim(),

                email:
                  employee.email?.trim() || null,

                phone:
                  employee.phone?.trim() || null,

                designation:
                  employee.designation?.trim() || null,

                employee_type:
                  employee.employee_type?.trim() || "Direct",

                employment_status:
                  employee.employment_status?.trim() || "Intern",

                internship_duration:
                  employee.internship_duration?.trim() || null,

                joining_date:
                  employee.joining_date?.trim() || null,

                confirmation_date:
                  employee.confirmation_date?.trim() || null,

                last_job_details:
                  employee.last_job_details?.trim() || null,

                previous_experience:
                  employee.previous_experience?.trim() || null,

                department:
                  employee.department.trim(),

                salary:
                  Number(employee.salary),

                bonus:
                  Number(employee.bonus || 0),

                deduction:
                  Number(employee.deduction || 0)
              })
            }
          );

          if (!response.ok) {
            throw new Error(
              `Import failed for ${employee.name}`
            );
          }
        }

        await fetchEmployees();

        alert(
          `✅ Import Successful\n\n` +
          `${rows.length} employee record(s) imported successfully.`
        );
      }

      catch (error) {
        console.error(error);

        alert(
          `❌ Import Failed\n\n` +
          `${error.message}\n\n` +
          `No further records were processed.`
        );
      }

      finally {
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
  useEffect(() => {
  fetchEmployees().catch((err) => {
    console.error(err);
    toast.error("Unable to load employees.");
  });

}, []);
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    const response = await apiFetch(`${API_BASE}/api/employees`);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Unable to load employees.");
    }

    if (!Array.isArray(data)) {
      throw new Error("The employee API returned an invalid response.");
    }

    // The API returns records in oldest-first order.  Showing newest records
    // first means a newly added employee is immediately visible on page one.
    setEmployees([...data].sort((a, b) => Number(b.id) - Number(a.id)));
  };

  const addEmployee = async () => {
  
    if (

  !employeeCode.trim() ||

  !name.trim() ||

  !department.trim() ||

  !salary

) {

      toast.error("Please fill all required fields.");
      return

    }

    if (employeeCode.trim().length > 20) {
      toast.error("Employee code must be 20 characters or fewer.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await apiFetch(`${API_BASE}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          employee_code: employeeCode.trim(),

          name: name.trim(),

          email,

          phone,

          designation,

          employee_type: employeeType,

          employment_status: employmentStatus,

          internship_duration:
            employmentStatus === "Intern" ? internshipDuration : null,

          joining_date: joiningDate
            ? joiningDate.toISOString().split("T")[0]
            : null,

          confirmation_date: confirmationDate || null,

          last_job_details: lastJobDetails,

          previous_experience: previousExperience,

          department: department.trim(),

          salary: Number(salary),

          bonus: 0,

          deduction: 0,

          gender: gender || null,
          date_of_birth: dateOfBirth || null,
          uan_number: uanNumber || null,
          pf_account_number: pfAccountNumber || null,
          esi_registration_number: esiRegistrationNumber || null,
          bank_account_number: bankAccountNumber || null,
          bank_name: bankName || null,
          ifsc_code: ifscCode || null,
          pan_number: panNumber || null,
          work_start_date: workStartDate || null,
          work_end_date: workEndDate || null
        })
      });

      const data = await response.json().catch(() => null);

      // apiFetch() only rejects on network failures.  Without this check, a
      // validation or database error still reached the success toast.
      if (!response.ok) {
        throw new Error(data?.message || "Unable to add the employee.");
      }

      setEmployeeCode('')
      setName('')

      setEmail('')
      setPhone('')

      setDesignation('')

      setEmployeeType('Direct')

      setEmploymentStatus('Intern')

      setInternshipDuration('3 Months')
      setJoiningDate(null);
      setConfirmationDate('')

      setLastJobDetails('')
      setPreviousExperience('')

      setDepartment('')
      setSalary('')
      setGender('');
      setDateOfBirth('');
      setUanNumber('');
      setPfAccountNumber('');
      setEsiRegistrationNumber('');
      setBankAccountNumber('');
      setBankName('');
      setIfscCode('');
      setPanNumber('');
      setWorkStartDate('');
      setWorkEndDate('');
      setShowEmployeeModal(false);
      setCurrentPage(1);
      toast.success("Employee added successfully!");

      // Reload only after the POST is confirmed.  The sorted result places
      // the new employee on the currently visible first page.
      try {
        await fetchEmployees();
      } catch (refreshError) {
        console.error(refreshError);
        toast.error("Employee was added, but the list could not be refreshed.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }

  }

  const deleteEmployee = () => {

  apiFetch(
    `${API_BASE}/api/employees/${employeeToDelete}`,
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

setGender(employee.gender || '');
setDateOfBirth(employee.date_of_birth || '');
setUanNumber(employee.uan_number || '');
setPfAccountNumber(employee.pf_account_number || '');
setEsiRegistrationNumber(employee.esi_registration_number || '');
setBankAccountNumber(employee.bank_account_number || '');
setBankName(employee.bank_name || '');
setIfscCode(employee.ifsc_code || '');
setPanNumber(employee.pan_number || '');
setWorkStartDate(employee.work_start_date || '');
setWorkEndDate(employee.work_end_date || '');

setShowEmployeeModal(true);

};
const updateEmployee = () => {

  apiFetch(`${API_BASE}/api/employees/${editingId}`, {
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
      salary,
      gender: gender || null,
      date_of_birth: dateOfBirth || null,
      uan_number: uanNumber || null,
      pf_account_number: pfAccountNumber || null,
      esi_registration_number: esiRegistrationNumber || null,
      bank_account_number: bankAccountNumber || null,
      bank_name: bankName || null,
      ifsc_code: ifscCode || null,
      pan_number: panNumber || null,
      work_start_date: workStartDate || null,
      work_end_date: workEndDate || null
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
    setGender("");
    setDateOfBirth("");
    setUanNumber("");
    setPfAccountNumber("");
    setEsiRegistrationNumber("");
    setBankAccountNumber("");
    setBankName("");
    setIfscCode("");
    setPanNumber("");
    setWorkStartDate("");
    setWorkEndDate("");
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
        color: "var(--text-primary, #f8fafc)",
      }}
    >
      👥 Employee Management
    </h1>

    <p
      style={{
        marginTop: "10px",
        color: "var(--text-secondary, rgba(255,255,255,.6))",
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
  maxLength={20}
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
<h3 style={sectionTitle}>
  💼 Personal & Bank Details
</h3>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
  <div>
    <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>Gender</label>
    <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
      <option value="">Select</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
  </div>
  <div>
    <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>Date of Birth</label>
    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={inputStyle} />
  </div>
</div>
<h3 style={sectionTitle}>
  🏦 Bank & PF Details
</h3>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
  <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} style={inputStyle} />
  <input type="text" placeholder="Bank Account Number" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} style={inputStyle} />
  <input type="text" placeholder="IFSC Code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} style={inputStyle} />
  <input type="text" placeholder="PAN Number" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} style={inputStyle} />
  <input type="text" placeholder="UAN Number" value={uanNumber} onChange={(e) => setUanNumber(e.target.value)} style={inputStyle} />
  <input type="text" placeholder="PF Account Number" value={pfAccountNumber} onChange={(e) => setPfAccountNumber(e.target.value)} style={inputStyle} />
  <input type="text" placeholder="ESI Registration Number" value={esiRegistrationNumber} onChange={(e) => setEsiRegistrationNumber(e.target.value)} style={inputStyle} />
</div>
<h3 style={sectionTitle}>
  📅 Work Period
</h3>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
  <div>
    <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>Work Start Date</label>
    <input type="date" value={workStartDate} onChange={(e) => setWorkStartDate(e.target.value)} style={inputStyle} />
  </div>
  <div>
    <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>Work End Date</label>
    <input type="date" value={workEndDate} onChange={(e) => setWorkEndDate(e.target.value)} style={inputStyle} />
  </div>
</div>
        </div>
        <button
  onClick={
    editingId
      ? updateEmployee
      : addEmployee
  }
  disabled={isSubmitting}
  style={{
  width: "100%",

  background:
    "linear-gradient(135deg,#37FFD7,#0EA5E9)",

  color: "#08111d",

  border: "none",

  padding: "16px",

  borderRadius: "16px",

  cursor: isSubmitting ? "not-allowed" : "pointer",

  opacity: isSubmitting ? 0.7 : 1,

  fontSize: "16px",

  fontWeight: "700",

  boxShadow:
    "0 12px 30px rgba(55,255,215,.35)",

  transition: "all .25s ease",
}}
>
  {
    isSubmitting
      ? "Saving..."
      : editingId
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
