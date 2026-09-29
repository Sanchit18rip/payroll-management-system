
import "./DashboardHeader.css";

export default function DashboardHeader({

  greeting,

  date,  onTerms

}) {
  return (

    <div className="dashboard-header">

      <div>

        <h1>

          {greeting} 👋

        </h1>

        <p>

          Payroll Overview

        </p>

        <span>

          {date}

        </span>

      </div>
    <button
  onClick={onTerms}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    color: "#0f172a",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .25s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"}}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow =
      "0 4px 16px rgba(59,130,246,0.12)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 2px 8px rgba(0,0,0,0.06)";
  }}
>
  📄 View Terms & Conditions
</button>

    </div>

  );

}