import {
  Search,
  Plus,
  FileText
} from "lucide-react";

import Button from "../Button";

import "./DashboardHeader.css";

export default function DashboardHeader({

  greeting,

  date,

  onTerms

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

    border: "1px solid rgba(255,255,255,.08)",

    background:
      "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",

    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",

    color: "#f8fafc",

    fontWeight: 600,

    cursor: "pointer",

    transition: "all .25s ease",

    boxShadow:
      "0 10px 30px rgba(0,0,0,.22)"
  }}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow =
      "0 16px 35px rgba(55,255,215,.18)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 10px 30px rgba(0,0,0,.22)";
  }}
>
  📄 View Terms & Conditions
</button>

    </div>

  );

}