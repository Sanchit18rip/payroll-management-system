import { useState, useEffect } from "react";
function HRDocuments() {

  const [employees, setEmployees] =
    useState([]);

  const [documents, setDocuments] =
    useState([]);

  const [employeeId, setEmployeeId] =
    useState("");

  const [documentType,
    setDocumentType] =
    useState("");
  const [searchTerm,
setSearchTerm] =
useState("");
  const [statusFilter,
setStatusFilter] =
useState("All");
  useEffect(() => {

    fetch(
      "http://https://payroll-management-system-owo2.onrender.com/api/employees"
    )
      .then(res => res.json())
      .then(data =>
        setEmployees(data)
      );

    loadDocuments();

  }, []);
  const documentTypes = [

  "Offer Letter",

  "Appointment Letter",

  "Confirmation Letter",

  "Increment Letter",

  "Promotion Letter",

  "Warning Letter",

  "Experience Letter",

  "Relieving Letter"

];
  const loadDocuments =
    async () => {

      const response =
        await fetch(
          "http://https://payroll-management-system-owo2.onrender.com/api/hr-documents"
        );

      const data =
        await response.json();

      setDocuments(data);

    };
  const addDocument =
async () => {

  if (
    !employeeId ||
    !documentType
  ) {

    alert(
      "Select employee and document type"
    );

    return;

  }

  try {

    const response =await fetch(

      "http://https://payroll-management-system-owo2.onrender.com/api/hr-documents",

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body:
        JSON.stringify({

          employee_id:
            employeeId,

          document_type:
            documentType

        })

      }

    );
    const result =
await response.json();

if (
  !response.ok
) {

  alert(
    result.message
  );

  return;

}

    setEmployeeId("");

    setDocumentType("");

    loadDocuments();

  }

  catch (err) {

    console.log(err);

  }

};
const deleteDocument =
async (id) => {

  try {

    await fetch(

      `http://https://payroll-management-system-owo2.onrender.com/api/hr-documents/${id}`,

      {
        method:"DELETE"
      }

    );

    setDocuments(

      documents.filter(

        doc =>
          doc.id !== id

      )

    );

  }

  catch(err) {

    console.log(err);

  }

};
const filteredDocuments =
documents.filter(
doc => {

const matchesSearch =

doc.name
?.toLowerCase()
.includes(
searchTerm
.toLowerCase()
);

const matchesStatus =

statusFilter ===
"All"

||

doc.status ===
statusFilter;

return (
matchesSearch &&
matchesStatus
);

}
);
const toggleStatus =
async (
  id,
  currentStatus
) => {

  try {

    const newStatus =

      currentStatus ===
      "Uploaded"

      ? "Not Uploaded"

      : "Uploaded";

    await fetch(

      `http://https://payroll-management-system-owo2.onrender.com/api/hr-documents/${id}`,

      {

        method:"PUT",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:
        JSON.stringify({

          status:
          newStatus

        })

      }

    );

    loadDocuments();

  }

  catch(err){

    console.log(err);

  }

};
const totalDocuments =
documents.length;

const uploadedDocuments =
documents.filter(

doc =>

doc.status ===
"Uploaded"

).length;

const pendingDocuments =
documents.filter(

doc =>

doc.status ===
"Not Uploaded"

).length;

const completionPercentage =

totalDocuments > 0

?

(
uploadedDocuments
/
totalDocuments
* 100
).toFixed(1)

: 0;
const employeeCompletion =
employees.map(
employee => {

const employeeDocs =

documents.filter(
doc =>
doc.employee_id ===
employee.id
);

const uploaded =

employeeDocs.filter(
doc =>
doc.status ===
"Uploaded"
).length;

const total =
employeeDocs.length;

const percentage =

total > 0

?

(
uploaded /
total *
100
).toFixed(0)

: 0;

return {

name:
employee.name,

uploaded,

total,

percentage

};

}
);
  return (

    <div
      style={{
        padding: "30px",
        background: "#0f172a",
        minHeight: "100vh"
      }}
    >

      
<h1
style={{
color:"#f8fafc",
marginBottom:"25px"
}}
>
📄 HR Documents
</h1>
<div style={dashboardGrid}>

<div style={cardStyle}>

<h3>
Total Documents
</h3>

<h1>
{totalDocuments}
</h1>

</div>

<div style={cardStyle}>

<h3>
Uploaded
</h3>

<h1>
{uploadedDocuments}
</h1>

</div>

<div style={cardStyle}>

<h3>
Pending
</h3>

<h1>
{pendingDocuments}
</h1>

</div>

<div style={cardStyle}>

<h3>
Completion
</h3>

<h1>
{completionPercentage}%
</h1>

</div>

</div>
<div style={formContainer}>

<select
value={employeeId}
onChange={(e)=>
setEmployeeId(
e.target.value
)
}
style={inputStyle}
>

<option value="">
Select Employee
</option>

{
employees.map(
employee => (

<option
key={
employee.id
}
value={
employee.id
}
>
{
employee.name
}
</option>

)
)
}

</select>

<select
value={documentType}
onChange={(e)=>
setDocumentType(
e.target.value
)
}
style={inputStyle}
>

<option value="">
Select Document
</option>

{
documentTypes.map(
doc => (

<option
key={doc}
value={doc}
>
{doc}
</option>

)
)
}

</select>

<button
onClick={addDocument}
style={addButton}
>
Add Document
</button>

</div>
<div style={tableContainer}>

<h2
style={{
color:"#f8fafc"
}}
>
Documents
</h2>
<div
  style={{
    display:"flex",
    gap:"15px",
    marginBottom:"20px"
  }}
>

<input
  type="text"
  placeholder="Search Employee..."
  value={searchTerm}
  onChange={(e)=>
    setSearchTerm(
      e.target.value
    )
  }
  style={inputStyle}
/>

<select
  value={statusFilter}
  onChange={(e)=>
    setStatusFilter(
      e.target.value
    )
  }
  style={inputStyle}
>

  <option value="All">
    All
  </option>

  <option value="Uploaded">
    Uploaded
  </option>

  <option value="Not Uploaded">
    Not Uploaded
  </option>

</select>

</div>
<table style={tableStyle}>

<thead>

<tr>

<th style={headerStyle}>
Employee
</th>

<th style={headerStyle}>
Document Type
</th>

<th style={headerStyle}>
Status
</th>

<th style={headerStyle}>
Upload Date
</th>

<th style={headerStyle}>
Action
</th>

</tr>

</thead>

<tbody>

{
filteredDocuments.map(
doc => (

<tr key={doc.id}>

<td style={tdStyle}>
{doc.name}
</td>

<td style={tdStyle}>
{doc.document_type}
</td>

<td style={tdStyle}>

<span
style={{
padding:"6px 12px",
borderRadius:"20px",
background:
doc.status === "Uploaded"
? "#14532d"
: "#7f1d1d",
color:"#fff"
}}
>
{doc.status}
</span>

</td>

<td style={tdStyle}>
{doc.upload_date || "-"}
</td>

<td style={tdStyle}>

<button
onClick={() =>
deleteDocument(
doc.id
)
}
style={deleteButton}
>
Delete
</button>
<button

onClick={() =>
toggleStatus(
doc.id,
doc.status
)
}

style={

doc.status ===
"Uploaded"

? uploadedButton

: pendingButton

}

>

{

doc.status ===
"Uploaded"

? "Mark Pending"

: "Mark Uploaded"

}

</button>

</td>

</tr>

)
)
}

</tbody>

</table>

</div>
<div
style={{
marginTop:"25px",
background:"#1e293b",
padding:"25px",
borderRadius:"20px",
border:"1px solid #334155"
}}
>

<h2
style={{
color:"#f8fafc"
}}
>
📊 Employee Document Completion
</h2>

<table
style={tableStyle}
>

<thead>

<tr>

<th style={headerStyle}>
Employee
</th>

<th style={headerStyle}>
Uploaded
</th>

<th style={headerStyle}>
Total
</th>

<th style={headerStyle}>
Completion
</th>

</tr>

</thead>

<tbody>

{
employeeCompletion.map(
employee => (

<tr
key={employee.name}
>

<td style={tdStyle}>
{employee.name}
</td>

<td style={tdStyle}>
{employee.uploaded}
</td>

<td style={tdStyle}>
{employee.total}
</td>

<td style={tdStyle}>

<div
style={{
display:"flex",
alignItems:"center",
gap:"10px"
}}
>

<div
style={{
width:"120px",
height:"10px",
background:"#334155",
borderRadius:"20px",
overflow:"hidden"
}}
>

<div
style={{
width:
`${employee.percentage}%`,
height:"100%",
background:
employee.percentage >= 75
? "#22c55e"
: employee.percentage >= 50
? "#f59e0b"
: "#ef4444"
}}
/>

</div>

<span>

{
employee.percentage
}%

</span>

</div>

</td>

</tr>

)
)
}

</tbody>

</table>

</div>

    </div>

  );

}
const formContainer = {
  background:"#1e293b",
  padding:"25px",
  borderRadius:"20px",
  border:"1px solid #334155",
  display:"grid",
  gap:"15px",
  marginBottom:"25px"
}

const inputStyle = {
  padding:"12px",
  borderRadius:"10px",
  border:"1px solid #334155",
  background:"#0f172a",
  color:"#f8fafc"
}

const addButton = {
  padding:"12px",
  border:"none",
  borderRadius:"10px",
  background:"#2563eb",
  color:"#fff",
  cursor:"pointer"
}

const tableContainer = {
  background:"#1e293b",
  padding:"25px",
  borderRadius:"20px",
  border:"1px solid #334155"
}

const tableStyle = {
  width:"100%",
  borderCollapse:"collapse",
  color:"#f8fafc"
}

const headerStyle = {
  padding:"14px",
  borderBottom:
  "1px solid #334155",
  textAlign:"left"
}

const tdStyle = {
  padding:"14px",
  borderBottom:
  "1px solid #334155"
}
const deleteButton = {
  background:"#ef4444",
  color:"#fff",
  border:"none",
  padding:"8px 12px",
  borderRadius:"8px",
  cursor:"pointer"
}
const uploadedButton = {

  background:"#f59e0b",

  color:"#fff",

  border:"none",

  padding:"8px 12px",

  borderRadius:"8px",

  cursor:"pointer",

  marginLeft:"8px"

};

const pendingButton = {

  background:"#22c55e",

  color:"#fff",

  border:"none",

  padding:"8px 12px",

  borderRadius:"8px",

  cursor:"pointer",

  marginLeft:"8px"

};
const dashboardGrid = {

display:"grid",

gridTemplateColumns:
"repeat(auto-fit,minmax(220px,1fr))",

gap:"20px",

marginBottom:"25px"

};

const cardStyle = {

background:"#1e293b",

padding:"20px",

borderRadius:"20px",

border:"1px solid #334155",

color:"#f8fafc",

textAlign:"center"

};
export default HRDocuments;