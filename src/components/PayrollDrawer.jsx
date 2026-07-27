import { useEffect } from "react";

function PayrollDrawer({
  employee,
  onClose,
  generatePayslip
}) {

  useEffect(() => {

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };

  }, [onClose]);

  if (!employee) return null;

  return (
    <>
      {/* Background */}

      <div
        onClick={onClose}
        style={overlayStyle}
      />

      {/* Drawer */}

      <div style={drawerStyle}>

        {/* Header */}

        <div style={headerStyle}>

          <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "20px"
  }}
>

  <div
    style={{
      width: "75px",
      height: "75px",
      borderRadius: "50%",
      background: "linear-gradient(135deg,#2563eb,#7c3aed)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "32px",
      fontWeight: "700",
      color: "#fff"
    }}
  >
    {employee.name.charAt(0)}
  </div>

  <div>

    <h2
      style={{
        margin: 0,
        color: "#fff"
      }}
    >
      {employee.name}
    </h2>

    <p
      style={{
        color: "#94a3b8",
        marginTop: "6px"
      }}
    >
      {employee.designation}
    </p>

    <div
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "10px",
        flexWrap: "wrap"
      }}
    >

      <span style={badgeBlue}>
        {employee.employee_code}
      </span>

      <span style={badgeGreen}>
        {employee.department}
      </span>

      <span style={badgePurple}>
        {employee.employment_status}
      </span>

    </div>

  </div>

</div>

          <button
            onClick={onClose}
            style={closeButton}
          >
            ✕
          </button>

        </div>
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
    marginBottom: "30px"
  }}
>

  <SummaryCard
    title="Gross Salary"
    value={`₹${Number(employee.salary).toLocaleString()}`}
    color="#2563eb"
  />

  <SummaryCard
    title="Net Salary"
    value={`₹${Number(employee.net_pay).toLocaleString()}`}
    color="#16a34a"
  />

  <SummaryCard
    title="Monthly CTC"
    value={`₹${Number(employee.monthly_ctc).toLocaleString()}`}
    color="#7c3aed"
  />

  <SummaryCard
    title="Payable Salary"
    value={`₹${Number(employee.payable_salary).toLocaleString()}`}
    color="#ea580c"
  />

</div>
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "22px",
    marginTop: "25px"
  }}
>

        {/* Employee Info */}

        <div style={cardStyle}>

  <h3 style={sectionTitle}>
    👤 Employee Information
  </h3>

  <InfoRow
    label="Employee Name"
    value={employee.name || "-"}
  />

  <InfoRow
    label="Employee ID"
    value={employee.id || "-"}
  />

  <InfoRow
    label="Employee Code"
    value={employee.employee_code || "-"}
  />

  <InfoRow
    label="Department"
    value={employee.department || "-"}
  />

  <InfoRow
    label="Designation"
    value={employee.designation || "-"}
  />

  <InfoRow
    label="Branch"
    value={employee.branch || "-"}
  />

  <InfoRow
    label="Joining Date"
    value={
      employee.joining_date
        ? new Date(employee.joining_date).toLocaleDateString()
        : "-"
    }
  />

</div>
{/* Attendance */}

<div style={cardStyle}>

  <h3 style={sectionTitle}>
    📅 Attendance
  </h3>

  <InfoRow
  label="Present Days"
  value={employee.present_days || 0}
/>

<InfoRow
  label="Absent Days"
  value={employee.absent_days || 0}
/>

<InfoRow
  label="Paid Leave"
  value={employee.paid_leave_days || 0}
/>

<InfoRow
  label="Total Days"
  value={employee.total_days || 0}
/>

</div>
        {/* Earnings */}

{/* Earnings */}

<div style={cardStyle}>

<h3 style={sectionTitle}>
💰 Salary Breakdown
</h3>

<InfoRow
label="Gross Salary"
value={`₹${Number(employee.salary).toLocaleString()}`}
/>

<InfoRow
label="Basic + DA"
value={`₹${Number(employee.basic_da).toLocaleString()}`}
/>

<InfoRow
label="HRA"
value={`₹${Number(employee.hra).toLocaleString()}`}
/>

<InfoRow
label="Conveyance"
value={`₹${Number(employee.conveyance_allowance).toLocaleString()}`}
/>

<InfoRow
label="Medical"
value={`₹${Number(employee.medical_allowance).toLocaleString()}`}
/>

<InfoRow
label="Other Allowance"
value={`₹${Number(employee.other_allowance).toLocaleString()}`}
/>

<InfoRow
label="Bonus"
value={`₹${Number(employee.bonus).toLocaleString()}`}
/>

</div>
{/* Deductions */}

<div style={cardStyle}>

<h3 style={sectionTitle}>
🧾 Deductions
</h3>

<InfoRow
label="Provident Fund"
value={`₹${Number(employee.pf).toLocaleString()}`}
/>

<InfoRow
label="Professional Tax"
value={`₹${Number(employee.professional_tax || 0).toLocaleString()}`}
/>

<InfoRow
label="TDS"
value={`₹${Number(employee.tds || 0).toLocaleString()}`}
/>

<InfoRow
label="ESIC"
value={`₹${Number(employee.esic || 0).toLocaleString()}`}
/>

<InfoRow
label="LWF"
value={`₹${Number(employee.lwf || 0).toLocaleString()}`}
/>

<InfoRow
label="Advance"
value={`₹${Number(employee.advance || 0).toLocaleString()}`}
/>

<InfoRow
label="Total Deduction"
value={`₹${Number(employee.total_deduction).toLocaleString()}`}
/>

</div>

<div style={cardStyle}>

  <h3 style={sectionTitle}>
    📈 CTC Summary
  </h3>

  <InfoRow
    label="Monthly CTC"
    value={`₹${Number(employee.monthly_ctc || 0).toLocaleString()}`}
  />

  <InfoRow
    label="Annual CTC"
    value={`₹${Number(employee.annual_ctc || 0).toLocaleString()}`}
  />

</div>

{/* Net Salary */}

{/* Salary Summary */}
<div style={cardStyle}>

  <h3 style={sectionTitle}>
    💳 Payment Information
  </h3>

  <InfoRow
    label="Payment Status"
    value={
      <span
        style={{
          background: "#16a34a",
          color: "#fff",
          padding: "5px 14px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "13px"
        }}
      >
        Paid
      </span>
    }
  />

  <InfoRow
    label="Payment Date"
    value={employee.payment_date || "-"}
  />

  <InfoRow
    label="Transaction ID"
    value={employee.transaction_id || "-"}
  />

  <InfoRow
    label="Payment Method"
    value={employee.payment_method || "Bank Transfer"}
  />

</div>
<div
  style={{
    gridColumn: "1 / -1",
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    borderRadius: "20px",
    padding: "30px",
    color: "#fff",
    boxShadow: "0 15px 35px rgba(37,99,235,.35)"
  }}
>

  <h2
  style={{
    margin: "0 0 25px",
    textAlign: "center",
    fontSize: "28px"
  }}
>
  💵 Salary Summary
</h2>

<InfoRow
  white
  noBorder
  label="Gross Salary"
  value={`₹${Number(employee.salary).toLocaleString()}`}
/>

<InfoRow
  white
  noBorder
  label="Total Deduction"
  value={`₹${Number(employee.total_deduction).toLocaleString()}`}
/>

<InfoRow
  white
  noBorder
  label="Bonus"
  value={`₹${Number(employee.bonus || 0).toLocaleString()}`}
/>

<hr
  style={{
    border: "none",
    borderTop: "1px solid rgba(255,255,255,.25)",
    margin: "22px 0"
  }}
/>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
>
  <span
    style={{
      fontSize: "24px",
      fontWeight: "700",
      color: "#ffffff"
    }}
  >
    Payable Salary
  </span>

  <span
    style={{
      fontSize: "34px",
      fontWeight: "800",
      color: "#bbf7d0"
    }}
  >
    ₹{Number(employee.payable_salary).toLocaleString()}
  </span>
</div>

</div>



{/* Generate Payslip */}



      </div>
      <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: "30px",
    marginBottom: "10px"
  }}
>

  <button
    onClick={() => generatePayslip(employee)}
    style={{
   background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#ffffff",
  border: "none",
  padding: "12px 24px",
  width: "220px",
  height: "48px",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 8px 20px rgba(37,99,235,.30)"
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
  e.currentTarget.style.boxShadow =
    "0 12px 28px rgba(37,99,235,.45)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow =
    "0 8px 20px rgba(37,99,235,.30)";
}}
  >
    📄 Generate Payslip
  </button>

</div>
      </div>
    </>
  );
}
function SummaryCard({ title, value, color }) {

  return (

    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "18px",
        padding: "22px",
        transition: "all .35s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden"
      }}

      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
        e.currentTarget.style.boxShadow = `0 20px 40px ${color}40`;
        e.currentTarget.style.borderColor = color;
      }}

      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#334155";
      }}

    >

      <div
        style={{
          width: "55px",
          height: "6px",
          background: color,
          borderRadius: "10px",
          marginBottom: "18px"
        }}
      />

      <div
        style={{
          color: "#94a3b8",
          fontSize: "14px"
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#fff",
          fontWeight: "700",
          fontSize: "30px",
          marginTop: "12px"
        }}
      >
        {value}
      </div>

    </div>

  );

}
function InfoRow({
  label,
  value,
  white = false,
  noBorder = false
}) {

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: noBorder
          ? "none"
          : "1px solid #334155"
      }}
    >

      <span
        style={{
          color: white
            ? "#ffffff"
            : "#94a3b8"
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "#ffffff",
          fontWeight: "600"
        }}
      >
        {value}
      </span>

    </div>

  );

}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  backdropFilter: "blur(4px)",
  zIndex: 9998
};

const drawerStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "1100px",
  maxWidth: "95vw",
  height: "85vh",
  background: "#0f172a",
  borderRadius: "22px",
  overflowY: "auto",
  padding: "35px",
  zIndex: 9999,
  boxShadow: "0 25px 60px rgba(0,0,0,.45)"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
  borderBottom: "1px solid #334155",
  paddingBottom: "20px"
};

const closeButton = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  border: "none",
  background:"linear-gradient(135deg,#ef4444,#dc2626)",
  color: "#fff",
  cursor: "pointer",
  fontSize: "18px"
};

const cardStyle = {
  background: "#1e293b",
  borderRadius: "18px",
  padding: "20px",
  marginBottom: "22px",
  border: "1px solid #334155",
  boxShadow: "0 6px 20px rgba(0,0,0,.25)",
  transition: "all .25s ease"
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: "18px",
  color: "#fff"
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #334155"
};

const badgeBlue = {
  background: "#2563eb",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: "30px",
  fontSize: "13px",
  fontWeight: "600"
};

const badgeGreen = {
  background: "#16a34a",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: "30px",
  fontSize: "13px",
  fontWeight: "600"
};

const badgePurple = {
  background: "#7c3aed",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: "30px",
  fontSize: "13px",
  fontWeight: "600"
};

export default PayrollDrawer;