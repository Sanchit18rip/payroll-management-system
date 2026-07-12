import {
  useState,
  useEffect
} from "react";

function EmployeeProfile() {
const [employees, setEmployees] =
  useState([]);

const [selectedEmployee,
  setSelectedEmployee] =
  useState("");
  const [employeeData,
  setEmployeeData] =
  useState(null);

const [
  performanceData,
  setPerformanceData
] = useState([]);

const [
  payrollData,
  setPayrollData
] = useState(null);

const [
  leaveData,
  setLeaveData
] = useState(null);
const [
  documentData,
  setDocumentData
] = useState([]);
const [
  incrementHistory,
  setIncrementHistory
] = useState([]);

const [
  showConfirmModal,
  setShowConfirmModal
] = useState(false);

const handleCardHover = (e) => {
  e.currentTarget.style.transform =
    "translateY(-6px)";
  e.currentTarget.style.boxShadow =
    "0 20px 40px rgba(59,130,246,.25)";
};

const handleCardLeave = (e) => {
  e.currentTarget.style.transform =
    "translateY(0)";
  e.currentTarget.style.boxShadow =
    "0 8px 25px rgba(0,0,0,.25)";
};

useEffect(() => {

  if (!selectedEmployee)
    return;

  fetch(
    "http://https://payroll-management-system-owo2.onrender.com/api/hr-documents"
  )
    .then(res => res.json())
    .then(data => {

      const employeeDocuments =
        data.filter(
          doc =>
            doc.employee_id ==
            selectedEmployee
        );

      setDocumentData(
        employeeDocuments
      );

    });

}, [selectedEmployee]);
useEffect(() => {

  if (!selectedEmployee)
    return;

  fetch(
    "http://https://payroll-management-system-owo2.onrender.com/api/increment-history"
  )
    .then(res => res.json())
    .then(data => {

      const employeeHistory =
        data.filter(
          item =>
            item.employee_id ==
            selectedEmployee
        );

      setIncrementHistory(
        employeeHistory
      );

    })
    .catch(err =>
      console.log(err)
    );

}, [selectedEmployee]);
useEffect(() => {
   fetch(
    "http://https://payroll-management-system-owo2.onrender.com/api/employees"
  )
    .then(res => res.json())
    .then(data =>
      setEmployees(data)
    )
    .catch(err =>
      console.log(err)
    );

}, []);
useEffect(() => {

  if (!selectedEmployee)
    return;

  fetch(
    `http://https://payroll-management-system-owo2.onrender.com/api/employees/${selectedEmployee}`
  )
    .then(res => res.json())
    .then(data =>
      setPayrollData(data)
    );

}, [selectedEmployee]);

useEffect(() => {

  if (!selectedEmployee)
    return;

  fetch(
    `http://https://payroll-management-system-owo2.onrender.com/api/leave-balance/${selectedEmployee}`
  )
    .then(res => res.json())
    .then(data =>
      setLeaveData(data)
    )
    .catch(err =>
      console.log(err));

}, [selectedEmployee]);

useEffect(() => {

  if (!selectedEmployee)
    return;

  fetch(
    `http://https://payroll-management-system-owo2.onrender.com/api/performance-reviews`
  )
    .then(res => res.json())
    .then(data => {

      const employeeReviews =
        data.filter(
          review =>
            review.employee_id ==
            selectedEmployee
        );

      setPerformanceData(
        employeeReviews
      );

    });

}, [selectedEmployee]);
    useEffect(() => {

  if (!selectedEmployee)
    return;

  fetch(
    `http://https://payroll-management-system-owo2.onrender.com/api/employees/${selectedEmployee}`
  )
    .then(res => res.json())
    .then(data => {

    console.log("Selected Employee:", data);

    console.log("Probation End Date:", data.probation_end_date);

    console.log("Type:", typeof data.probation_end_date);

    setEmployeeData(data);

})
    .catch(err =>
      console.log(err));

}, [selectedEmployee]);
const confirmEmployee = () => {

  fetch(
    `http://https://payroll-management-system-owo2.onrender.com/api/confirm-employee/${selectedEmployee}`,
    {
      method: "PUT"
    }
  )
    .then(res => res.json())
    .then(data => {

      alert(data.message);

      return fetch(
        `http://https://payroll-management-system-owo2.onrender.com/api/employees/${selectedEmployee}`
      );

    })
    .then(res => res.json())
    .then(data => {

      setEmployeeData(data);

      return fetch(
        `http://https://payroll-management-system-owo2.onrender.com/api/leave-balance/${selectedEmployee}`
      );

    })
    .then(res => res.json())
    .then(data => {

      setLeaveData(data);

    })
    .catch(err =>
      console.log(err)
    );

};
  return (

    <div
  style={{
    padding:"35px",
    background:
      "linear-gradient(180deg,#020617,#0f172a)",
    minHeight:"100vh"
  }}
>

      <div
  style={{
    background:
      "linear-gradient(135deg,#1e3a8a,#2563eb)",
    borderRadius:"25px",
    padding:"35px",
    marginBottom:"30px",
    color:"#fff",
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    boxShadow:
      "0 15px 40px rgba(37,99,235,.35)"
  }}
>

  <div>

    <h1
      style={{
        margin:0,
        fontSize:"34px"
      }}
    >
      👤 Employee Profile
    </h1>

    <p
style={{
marginTop:"10px",
opacity:.85,
fontSize:"16px"
}}
>

{
employeeData

?

`${employeeData.designation}
 • ${employeeData.department}`

:

"Select an employee to view complete HR profile."

}

</p>

  </div>

  <select
    value={selectedEmployee}
    onChange={(e)=>
      setSelectedEmployee(
        e.target.value
      )
    }
    style={{
      width:"300px",
      padding:"14px",
      borderRadius:"12px",
      border:"none",
      fontSize:"15px",
      background:"#fff",
      color:"#111827",
      fontWeight:"600"
    }}
  >

    <option value="">
      Select Employee
    </option>

    {
      employees.map(employee=>(

        <option
          key={employee.id}
          value={employee.id}
        >
          {employee.name}
        </option>

      ))
    }

  </select>

</div>
<div style={dashboardGrid}>
<div
  style={{
    ...cardStyle,
    
    ...fullWidthCard
  }}
  onMouseEnter={handleCardHover}
  onMouseLeave={handleCardLeave}
>
  <h3
  style={{
    ...cardTitleStyle,
    display:"flex",
    alignItems:"center",
    justifyContent:"space-between",
    fontSize:"24px",
    marginBottom:"30px"
  }}
>

  <span>
    👤 Employee Details
  </span>

  <span
    style={{
      background:"#1d4ed8",
      color:"#fff",
      padding:"6px 14px",
      borderRadius:"999px",
      fontSize:"13px",
      fontWeight:"600"
    }}
  >
    Employee Info
  </span>

</h3>

  {
    employeeData && (

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px 30px",
    marginTop: "20px"
  }}
>

  <div style={infoRow}>
    <span style={labelStyle}>Employee Code</span>
    <span style={valueStyle}>{employeeData.employee_code}</span>
  </div>

  <div style={infoRow}>
    <span style={labelStyle}>Department</span>
    <span style={valueStyle}>{employeeData.department}</span>
  </div>

  <div style={infoRow}>
    <span style={labelStyle}>Designation</span>
    <span style={valueStyle}>{employeeData.designation}</span>
  </div>

  <div style={infoRow}>
    <span style={labelStyle}>Employee Type</span>
    <span style={valueStyle}>{employeeData.employee_type}</span>
  </div>
  <div style={infoRow}>
  <span style={labelStyle}>
    Employment Status
  </span>

  <span
    style={{
      color:
        employeeData.employment_status === "Permanent"
          ? "#22c55e"
          : "#f59e0b",
      fontWeight: "700"
    }}
  >
    {employeeData.employment_status}
  </span>
</div>

<div style={infoRow}>
  <span style={labelStyle}>
    Probation End
  </span>

  <span style={valueStyle}>
    {employeeData.probation_end_date
      ? employeeData.probation_end_date.split("T")[0]
      : "-"}
  </span>
</div>
  <div style={infoRow}>
    <span style={labelStyle}>Email</span>
    <span style={valueStyle}>{employeeData.email}</span>
  </div>

  <div style={infoRow}>
    <span style={labelStyle}>Phone</span>
    <span style={valueStyle}>{employeeData.phone}</span>
  </div>

  <div style={infoRow}>
    <span style={labelStyle}>Joining Date</span>
    <span style={valueStyle}>{employeeData.joining_date}</span>
  </div>

  <div style={infoRow}>
    <span style={labelStyle}>Confirmation Date</span>
    <span style={valueStyle}>{employeeData.confirmation_date}</span>
  </div>
  {
employeeData.employment_status ===
"Probation"

&&

(

<div
style={{
marginTop:"30px",
display:"flex",
justifyContent:"center"
}}
>

<button
onClick={() =>
  setShowConfirmModal(true)
}
style={{
background:"#16a34a",
color:"#fff",
border:"none",
padding:"14px 28px",
borderRadius:"12px",
cursor:"pointer",
fontWeight:"700",
fontSize:"15px",
boxShadow:
"0 8px 25px rgba(34,197,94,.35)"
}}
>

✔ Confirm Employee

</button>

</div>

)

}

</div>

      

    )
  }

</div>

  <div
  style={{
    ...cardStyle,
    
    ...fullWidthCard
  }}
  onMouseEnter={handleCardHover}
  onMouseLeave={handleCardLeave}
>

  <h3
  style={{
    ...cardTitleStyle,
    display:"flex",
    alignItems:"center",
    gap:"10px",
    fontSize:"24px"
  }}
>
    📈 Performance Details
  </h3>

  {
performanceData.length > 0 ? (

<>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"25px"
}}
>

<div>

<div
style={{
fontSize:"48px",
fontWeight:"700",
color:"#22c55e"
}}
>
{performanceData[0].rating}/5
</div>

<div
style={{
color:"#94a3b8"
}}
>
Overall Rating
</div>

</div>

<div
style={{
background:"#14532d",
padding:"10px 18px",
borderRadius:"999px",
color:"#22c55e",
fontWeight:"700"
}}
>
Excellent
</div>

</div>

<div style={{marginBottom:"20px"}}>

<div
style={{
display:"flex",
justifyContent:"space-between",
marginBottom:"8px"
}}
>

<span>KPI Score</span>

<span>{performanceData[0].kpi_score}%</span>

</div>

<div
style={{
height:"10px",
background:"#334155",
borderRadius:"999px",
overflow:"hidden"
}}
>

<div
style={{
height:"100%",
width:`${performanceData[0].kpi_score}%`,
background:"#3b82f6"
}}
/>

</div>

</div>

<div
style={{
background:"#0f172a",
padding:"18px",
borderRadius:"14px"
}}
>

<div
style={{
fontWeight:"600",
marginBottom:"8px"
}}
>
Manager Remarks
</div>

<div
style={{
color:"#cbd5e1"
}}
>
{performanceData[0].manager_remarks}
</div>

</div>

</>

)

:

<p>No Performance Reviews</p>

}
</div>
  <div
  style={{
    ...cardStyle,
    
    ...fullWidthCard
  }}
  onMouseEnter={handleCardHover}
  onMouseLeave={handleCardLeave}
>

  <h3
  style={{
    ...cardTitleStyle,
    display:"flex",
    alignItems:"center",
    gap:"10px",
    fontSize:"24px"
  }}
>
    💰 Payroll Summary
  </h3>
  {
payrollData && (

<>

<div
style={{
background:"#0f172a",
padding:"20px",
borderRadius:"18px",
marginBottom:"20px",
textAlign:"center",
border:"1px solid #334155"
}}
>

<div
style={{
fontSize:"34px",
fontWeight:"700",
color:"#22c55e"
}}
>

₹{
Number(
payrollData.salary
).toLocaleString()
}

</div>

<div
style={{
marginTop:"8px",
color:"#94a3b8"
}}
>

Current Salary

</div>

</div>

<div style={metricGrid}>

<div style={metricCard}>

<div style={metricValue}>
₹{Number(payrollData.hra).toLocaleString()}
</div>

<div style={metricLabel}>
HRA
</div>

</div>

<div style={metricCard}>

<div style={metricValue}>
₹{Number(payrollData.ta).toLocaleString()}
</div>

<div style={metricLabel}>
TA
</div>

</div>

<div style={metricCard}>

<div style={metricValue}>
₹{Number(payrollData.pf).toLocaleString()}
</div>

<div style={metricLabel}>
PF
</div>

</div>

<div style={metricCard}>

<div style={metricValue}>
₹{Number(payrollData.bonus || 0).toLocaleString()}
</div>

<div style={metricLabel}>
Bonus
</div>

</div>

</div>

</>

)
}
  </div>

  <div
  style={{
    ...cardStyle,
    
    ...fullWidthCard
  }}
  onMouseEnter={handleCardHover}
  onMouseLeave={handleCardLeave}
>

  <h3
  style={{
    ...cardTitleStyle,
    display:"flex",
    alignItems:"center",
    gap:"10px",
    fontSize:"24px"
  }}
>
    🏖️ Leave Summary
  </h3>

  {
leaveData ? (

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"18px"
}}
>

<div style={summaryCard}>
<div style={summaryNumber}>
{leaveData.available_leaves}
</div>
<div style={summaryText}>
Available
</div>
</div>

<div style={summaryCard}>
<div style={summaryNumber}>
{leaveData.total_leaves_earned}
</div>
<div style={summaryText}>
Earned
</div>
</div>

</div>

)

:

<p>No Leave Data</p>

}

</div>

<div
  style={{
    ...cardStyle,
    
    ...fullWidthCard
  }}
  onMouseEnter={handleCardHover}
  onMouseLeave={handleCardLeave}
>
  <h3
  style={{
    ...cardTitleStyle,
    display:"flex",
    alignItems:"center",
    gap:"10px",
    fontSize:"24px"
  }}
>
    📄 Document Status
  </h3>

  {
    documentData.length > 0
    ? (

      documentData.map(doc => (

<div
key={doc.id}
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"16px",
background:"#0f172a",
borderRadius:"14px",
marginBottom:"12px"
}}
>

<div>

<div
style={{
fontWeight:"600"
}}
>
{doc.document_type}
</div>

<div
style={{
fontSize:"13px",
color:"#94a3b8"
}}
>
HR Document
</div>

</div>

{
doc.status==="Uploaded"

?

<span style={successBadge}>
Uploaded
</span>

:

<span style={dangerBadge}>
Pending
</span>

}

</div>

))

    )
    : (

      <p>
        No Documents Found
      </p>

    )
  }

</div>

<div
  style={{
    ...cardStyle,
    
    ...fullWidthCard
  }}
  onMouseEnter={handleCardHover}
  onMouseLeave={handleCardLeave}
>
  <h3
  style={{
    ...cardTitleStyle,
    display:"flex",
    alignItems:"center",
    gap:"10px",
    fontSize:"24px"
  }}
>
    📈 Increment History
  </h3>

  {
    incrementHistory.length > 0
    ? (

      <table
style={{
width:"100%",
borderCollapse:"collapse"
}}
>

<thead>

<tr>

<th>Date</th>

<th>Old</th>

<th>%</th>

<th>Amount</th>

<th>New</th>

</tr>

</thead>

<tbody>

{

incrementHistory.map(item=>(

<tr
key={item.id}
style={{
borderTop:"1px solid #334155"
}}
>

<td style={tableTd}>
{new Date(item.effective_date).toLocaleDateString()}
</td>

<td style={tableTd}>
₹{Number(item.old_salary).toLocaleString()}
</td>

<td style={tableTd}>
{item.increment_percent}%
</td>

<td style={tableTd}>
₹{Number(item.increment_amount).toLocaleString()}
</td>

<td
style={{
...tableTd,
color:"#22c55e",
fontWeight:"700"
}}
>
₹{Number(item.new_salary).toLocaleString()}
</td>

</tr>

))

}

</tbody>

</table>

    )
    : (

      <p>
        No Increment History
      </p>

    )
  }

</div>

</div>
{
showConfirmModal && (

<div style={modalOverlay}>

<div style={modalBox}>

<h2>
Confirm Employee
</h2>

<p>

Are you sure you want to
confirm this employee as
<b> Permanent</b>?

<br /><br />

This action will:

<br />

• Change Employment Status

<br />

• Set Confirmation Date

<br />

• Credit Initial Leave Balance

<br />

• Enable Paid Leave

</p>

<div
style={{
display:"flex",
justifyContent:"flex-end",
gap:"12px",
marginTop:"25px"
}}
>

<button
style={cancelButton}
onClick={()=>
setShowConfirmModal(false)
}
>

Cancel

</button>

<button
style={confirmButton}
onClick={()=>{

confirmEmployee();

setShowConfirmModal(false);

}}
>

Confirm

</button>

</div>

</div>

</div>

)

}
    </div>

  );

}
const dashboardGrid = {
  display: "grid",
  gridTemplateColumns:
"repeat(auto-fit,minmax(420px,1fr))",
  gap: "25px",
  marginTop: "25px"
};

const fullWidthCard = {
  gridColumn: "1 / -1"
};

const cardStyle = {
  background:"#1e293b",
  borderRadius:"22px",
  padding:"28px",
  border:"1px solid #334155",
  color:"#f8fafc",
  boxShadow:"0 8px 25px rgba(0,0,0,.25)",
  transition:
"transform .25s ease, box-shadow .25s ease",
  cursor:"default"
};

const cardTitleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  marginBottom: "20px",
  color: "#ffffff",
  borderBottom: "2px solid #3b82f6",
  paddingBottom: "12px"
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #334155"
};

const labelStyle = {
  color: "#94a3b8",
  fontWeight: "600"
};

const valueStyle = {
  color: "#f8fafc",
  fontWeight: "700"
};
const metricGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2,1fr)",
  gap: "15px",
  marginTop: "20px"
};

const metricCard = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "14px",
  padding: "16px",
  textAlign: "center"
};

const metricValue = {
  color: "#38bdf8",
  fontSize: "22px",
  fontWeight: "700"
};

const metricLabel = {
  color: "#94a3b8",
  marginTop: "8px",
  fontSize: "14px"
};
const summaryCard={
background:"#0f172a",
padding:"24px",
borderRadius:"16px",
textAlign:"center",
border:"1px solid #334155"
};

const summaryNumber={
fontSize:"34px",
fontWeight:"700",
color:"#3b82f6"
};

const summaryText={
marginTop:"8px",
color:"#94a3b8"
};

const successBadge={
background:"#14532d",
color:"#22c55e",
padding:"6px 14px",
borderRadius:"999px",
fontWeight:"600",
fontSize:"13px"
};

const dangerBadge={
background:"#7f1d1d",
color:"#f87171",
padding:"6px 14px",
borderRadius:"999px",
fontWeight:"600",
fontSize:"13px"
};

const tableTd={
padding:"16px",
textAlign:"center"
};

const modalOverlay={

position:"fixed",

top:0,
left:0,

width:"100%",
height:"100%",

background:"rgba(0,0,0,.55)",

display:"flex",

justifyContent:"center",

alignItems:"center",

zIndex:9999

};

const modalBox={

background:"#1e293b",

padding:"30px",

borderRadius:"20px",

width:"430px",

color:"#f8fafc",

border:"1px solid #334155",

boxShadow:
"0 10px 35px rgba(0,0,0,.45)"

};

const cancelButton={

background:"#2563eb",

color:"#fff",

border:"none",

padding:"12px 24px",

borderRadius:"10px",

cursor:"pointer",

fontWeight:"600"

};

const confirmButton={

background:"#16a34a",

color:"#fff",

border:"none",

padding:"12px 24px",

borderRadius:"10px",

cursor:"pointer",

fontWeight:"700"

};
export default EmployeeProfile;