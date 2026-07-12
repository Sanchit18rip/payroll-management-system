import { useState, useEffect } from 'react'


function Performance() {
  const [employees, setEmployees] =
useState([])

const [employeeId, setEmployeeId] =
useState('')

const [reviewDate, setReviewDate] =
useState('')

const [kpiScore, setKpiScore] =
useState('')

const [managerRemarks,
setManagerRemarks] =
useState('')
  const [rating, setRating] = useState('')
  const [performances, setPerformances] = useState([])
  const [searchTerm, setSearchTerm] =
useState("")
const [showEditModal,
setShowEditModal] =
useState(false)
const [showDeleteModal,
setShowDeleteModal] =
useState(false)

const [reviewToDelete,
setReviewToDelete] =
useState(null)
const [selectedReview,
setSelectedReview] =
useState(null)
  const loadPerformances = async () => {

  try {

    const response =
      await fetch(

        "https://payroll-management-system-owo2.onrender.com/api/performance-reviews"

      )

    const data =
      await response.json()

    setPerformances(data)

  }

  catch (err) {

    console.log(err)

  }

}

  useEffect(() => {
    loadPerformances()

fetch(
  "https://payroll-management-system-owo2.onrender.com/api/employees"
)
.then(res => res.json())
.then(data =>
  setEmployees(data)
)
  }, [])

  const addPerformance =
async () => {

  if (

    !employeeId ||

    !reviewDate ||

    !rating ||

    !kpiScore

  ) {

    alert(
      "Fill all fields"
    )

    return

  }

  try {

    const response =
      await fetch(

        "https://payroll-management-system-owo2.onrender.com/api/performance-reviews",

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

            review_date:
              reviewDate,

            rating:
              Number(rating),

            kpi_score:
              Number(kpiScore),

            manager_remarks:
              managerRemarks

          })

        }

      )

    const result =
      await response.json()

    alert(
      result.message
    )

    loadPerformances()
    setEmployeeId("")
setReviewDate("")
setRating("")
setKpiScore("")
setManagerRemarks("")

  }

  catch (err) {

    console.log(err)

  }

}



  const getRatingStyle = (currentRating) => {
    if (currentRating === 'Excellent') {
      return { background: '#dcfce7', color: '#15803d' }
    } else if (currentRating === 'Good') {
      return { background: '#fef3c7', color: '#b45309' }
    } else {
      return { background: '#fee2e2', color: '#b91c1c' }
    }
  }
  const totalReviews =
  performances.length

const averageRating =
  performances.length > 0
    ? (
        performances.reduce(
          (total, item) =>
            total +
            Number(item.rating),
          0
        ) /
        performances.length
      ).toFixed(1)
    : 0

const totalIncrement =
  performances.reduce(
    (total, item) =>
      total +
      Number(
        item.increment_amount || 0
      ),
    0
  )

const topPerformer =
  performances.length > 0
    ? performances.reduce(
        (best, current) =>
          Number(current.rating) >
          Number(best.rating)
            ? current
            : best
      )
    : null
const filteredReviews =
  performances.filter(
    review =>

      review.name
        ?.toLowerCase()
        .includes(
          searchTerm
            .toLowerCase()
        )
  )
  const updateReview =
async () => {

try {

await fetch(

`https://payroll-management-system-owo2.onrender.com/api/performance-reviews/${selectedReview.id}`,

{

method:"PUT",

headers:{

"Content-Type":
"application/json"

},

body:JSON.stringify({

rating:
selectedReview.rating,

kpi_score:
selectedReview.kpi_score,

manager_remarks:
selectedReview.manager_remarks

})

}

)

setShowEditModal(false)

loadPerformances()

}

catch(err){

console.log(err)

}

}
const deleteReview =
async () => {

  try {

    await fetch(

      `https://payroll-management-system-owo2.onrender.com/api/performance-reviews/${reviewToDelete}`,

      {
        method: "DELETE"
      }

    )

    setPerformances(

      performances.filter(

        review =>

          review.id !==
          reviewToDelete

      )

    )

    setShowDeleteModal(
      false
    )

    setReviewToDelete(
      null
    )

  }

  catch (err) {

    console.log(err)

  }

}
const applyIncrement =
async (reviewId) => {

  try {

    const response =
      await fetch(

        `https://payroll-management-system-owo2.onrender.com/api/apply-increment/${reviewId}`,

        {
          method: "PUT"
        }

      );

    const result =
      await response.json();

    alert(
      result.message
    );
    loadPerformances()
  }

  catch (err) {

    console.log(err);

  }

};
  return (
    <div
  style={{
    padding: '30px',
    background: '#0f172a',
    minHeight: '100vh'
  }}
>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#f8fafc', margin: '0 0 4px 0' }}>
          Performance Management
        </h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Track, evaluate, and record workforce capabilities and reviews.
        </p>
      </div>
      <div style={cardsContainer}>
  
  <div style={dashboardCard}>
    <h1>
      {totalReviews}
    </h1>
    <p>
      Total Reviews
    </p>
  </div>

  <div style={dashboardCard}>
    <h1>
      {averageRating}
    </h1>
    <p>
      Average Rating
    </p>
  </div>

  <div style={dashboardCard}>
    <h1>
      ₹{
        Math.round(
          totalIncrement
        ).toLocaleString()
      }
    </h1>
    <p>
      Recommended Increment
    </p>
  </div>

  <div style={dashboardCard}>
    <h1>
      {
        topPerformer
          ?.name || "-"
      }
    </h1>
    <p>
      Top Performer
    </p>
  </div>

</div>
      <div style={formContainer}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
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
  value={rating}
  onChange={(e) => setRating(e.target.value)}
  style={inputStyle}
>
  <option value="">Select Rating</option>
  <option value="5">5</option>
  <option value="4.5">4.5</option>
  <option value="4">4</option>
  <option value="3.5">3.5</option>
  <option value="3">3</option>
  <option value="2">2</option>
  <option value="1">1</option>
</select>

<input
  type="date"
  value={reviewDate}
  onChange={(e) => setReviewDate(e.target.value)}
  style={inputStyle}
/>

<input
  type="number"
  placeholder="KPI Score"
  value={kpiScore}
  onChange={(e) => setKpiScore(e.target.value)}
  style={inputStyle}
/>
        </div>

        <textarea
  placeholder="Manager Feedback"
  value={managerRemarks}
  onChange={(e) =>
    setManagerRemarks(e.target.value)
  }
  style={textareaStyle}
/>
        <div style={{ textAlign: 'right' }}>
          <button onClick={addPerformance} style={buttonStyle}>
            Submit Evaluation
          </button>
        </div>
      </div>

      <div style={tableCard}>

<div
  style={{
    overflowX: "auto"
  }}
>
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #334155"
  }}
>

  <h2
    style={{
      color:"#f8fafc",
      margin:0
    }}
  >
    Performance Review History
  </h2>

  <input
    type="text"
    placeholder="Search Employee..."
    value={searchTerm}
    onChange={(e)=>
      setSearchTerm(
        e.target.value
      )
    }
    style={searchInput}
  />

</div>
        <table style={tableStyle}>
          <thead>
            <tr style={theadRow}>
  <th style={thStyle}>Employee Name</th>
  <th style={thStyle}>Rating</th>
  <th style={thStyle}>KPI</th>
  <th style={thStyle}>Increment %</th>
  <th style={thStyle}>Increment Amount</th>
  <th style={thStyle}>Review Date</th>
  <th style={thStyle}>Remarks</th>
  <th style={thStyle}>Action</th>
</tr>
          </thead>
          <tbody>
            {performances.length > 0 ? (
              filteredReviews.map((item) => (
                <tr
  key={item.id}
  style={{
    ...rowStyle,
    background:
      performances.indexOf(item) % 2 === 0
        ? "#1e293b"
        : "#172033"
  }}
>
                  <td style={tdStyle}>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px"
    }}
  >
    <div
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "700"
      }}
    >
      {item.name?.charAt(0)}
    </div>

    <div>
      <div
        style={{
          color: "#fff",
          fontWeight: "700"
        }}
      >
        {item.name}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "12px"
        }}
      >
        Employee
      </div>
    </div>
  </div>
</td>

<td style={tdStyle}>
  <span
    style={{
      background:
        item.rating >= 4.5
          ? "#16a34a"
          : item.rating >= 4
          ? "#ca8a04"
          : "#dc2626",

      color: "#fff",
      padding: "7px 14px",
      borderRadius: "50px",
      fontWeight: "700",
      display: "inline-block"
    }}
  >
    ⭐ {item.rating}
  </span>
</td>

<td style={tdStyle}>
  {item.kpi_score}
</td>

<td style={tdStyle}>
  {item.increment_percentage}%
</td>

<td
  style={{
    ...tdStyle,
    color:"#22c55e",
    fontWeight:"700"
  }}
>
  ₹{
    Math.round(
      item.increment_amount
    )
  }
</td>

<td style={tdStyle}>
  {item.review_date}
</td>

<td style={tdStyle}>
  {item.manager_remarks}
</td>
<td style={tdStyle}>

  <div
    style={{
      display:"flex",
flexWrap:"wrap",
gap:"8px",
justifyContent:"center"
    }}
  >

    <button
      onClick={() => {

        setSelectedReview(
          item
        )

        setShowEditModal(
          true
        )

      }}
      style={editButton}
    >
      Edit
    </button>

    <button
      onClick={() => {

  setReviewToDelete(
    item.id
  )

  setShowDeleteModal(
    true
  )

}}
      style={deleteButton}
    >
      Delete
    </button>
    <button
  disabled={
    item.increment_applied
  }
  onClick={() =>
    applyIncrement(
      item.id
    )
  }
  style={{

    ...applyButton,

    opacity:
      item.increment_applied
        ? 0.5
        : 1,

    cursor:
      item.increment_applied
        ? "not-allowed"
        : "pointer"

  }}
>

{
  item.increment_applied
    ? "Applied"
    : "Apply"
}

</button>

  </div>

</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '30px 0' }}>
                  No performance records found. Database table ready.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {
showEditModal && (

<div style={modalOverlay}>

<div style={modalBox}>

<h2>
Edit Review
</h2>

<label>
Rating
</label>

<input
type="number"
step="0.5"
value={
selectedReview?.rating || ""
}
onChange={(e)=>

setSelectedReview({

...selectedReview,

rating:e.target.value

})

}
style={modalInput}
/>

<label>
KPI Score
</label>

<input
type="number"
value={
selectedReview?.kpi_score || ""
}
onChange={(e)=>

setSelectedReview({

...selectedReview,

kpi_score:e.target.value

})

}
style={modalInput}
/>

<label>
Remarks
</label>

<textarea
value={
selectedReview?.manager_remarks || ""
}
onChange={(e)=>

setSelectedReview({

...selectedReview,

manager_remarks:
e.target.value

})

}
style={modalInput}
/>

<div
style={{
display:"flex",
flexWrap:"wrap",
gap:"8px",
justifyContent:"center"
}}
>

<button
onClick={updateReview}
style={saveButton}
>
Save
</button>

<button
onClick={()=>
setShowEditModal(false)
}
style={cancelButton}
>
Cancel
</button>

</div>

</div>

</div>

)
}
{
showDeleteModal && (

<div style={modalOverlay}>

<div style={modalBox}>

<h2>
Delete Review
</h2>

<p>
Are you sure you want
to delete this review?
</p>

<div
style={{
display:"flex",
flexWrap:"wrap",
gap:"8px",
justifyContent:"center"
}}
>

<button
onClick={deleteReview}
style={saveButton}
>
Yes Delete
</button>

<button
onClick={() => {

setShowDeleteModal(
false
)

setReviewToDelete(
null
)

}}
style={cancelButton}
>
Cancel
</button>

</div>

</div>

</div>

)
}
    </div>
    </div>
  )

}
const formContainer = {
  background: '#1e293b',
  border: '1px solid #334155',
  padding: '28px',
  borderRadius: '20px',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)'
}
const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  marginBottom: '18px',
  borderRadius: '10px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '15px',
  boxSizing: 'border-box'
}

const textareaStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  height: '120px',
  fontSize: '15px',
  boxSizing: 'border-box',
  resize: 'none'
}

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '15px',
  marginTop: '20px',
  boxShadow:
    '0 4px 20px rgba(37,99,235,0.3)'
}
const tableCard = {
  background: "#1e293b",
  borderRadius: "20px",
  border: "1px solid #334155",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  overflow: "hidden",
  padding: "20px",
  marginTop: "30px"
}

const tableStyle = {
  width: '100%',
  background: '#1e293b',
  borderCollapse: 'collapse',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)',
  color: '#f8fafc'
}

const theadRow = {
  background: "#0f172a",
  borderBottom: "1px solid #334155"
}

const thStyle = {
  padding: "18px",
  color: "#94a3b8",
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
}

const rowStyle = {
  borderBottom: '1px solid #334155',
  transition: "all .25s ease"
}
const tdStyle = {
  padding: '16px',
  fontSize: '14px',
  color: '#f8fafc'
}

const badgeBase = {
  padding: '6px 12px',
  borderRadius: '50px',
  fontSize: '12px',
  fontWeight: '600',
  display: 'inline-block'
}
const headerStyle = {
  padding: '16px',
  background: '#0f172a',
  color: '#cbd5e1',
  borderBottom: '1px solid #334155',
  fontWeight: '600'
}
const cardsContainer = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(250px,1fr))",
  gap: "20px",
  marginBottom: "30px"
}

const dashboardCard = {
  background:
    "linear-gradient(135deg,#1e293b,#0f172a)",
  borderRadius: "20px",
  padding: "30px",
  textAlign: "center",
  border:
    "1px solid #334155",
  color: "#f8fafc",
  boxShadow:
    "0 10px 35px rgba(0,0,0,0.35)"
}
const searchInput = {
  width: "300px",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#f8fafc",
  outline: "none",
  fontSize: "14px",
  transition: "0.2s ease"
}
const editButton = {
  padding: "10px 16px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
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
  alignItems: "center"
}

const modalBox = {
  background: "#1e293b",
  padding: "30px",
  borderRadius: "20px",
  width: "500px",
  color: "#f8fafc"
}

const modalInput = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#f8fafc"
}

const saveButton = {
  padding: "12px 18px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "10px"
}

const cancelButton = {
  padding: "12px 18px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "10px"
}
const deleteButton = {
  padding: "10px 16px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
}
const applyButton = {
  padding: "10px 16px",
  background: "#22c55e",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
}
export default Performance