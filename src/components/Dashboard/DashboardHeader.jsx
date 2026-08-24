import {
  Search,
  Plus,
  FileText
} from "lucide-react";

import Button from "../Button";
import { useTheme } from "../../context/ThemeContext";

import "./DashboardHeader.css";

export default function DashboardHeader({

  greeting,

  date,  onTerms

}) {
  const { isDark } = useTheme();
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
    border: isDark ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(0,0,0,0.1)",
    background: isDark
      ? "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))"
      : "rgba(255,255,255,0.85)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    color: isDark ? "#f8fafc" : "#0f172a",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .25s ease",
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,.22)"
      : "0 2px 8px rgba(0,0,0,0.06)"
  }}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow =
      isDark ? "0 16px 35px rgba(55,255,215,.18)" : "0 4px 16px rgba(59,130,246,0.12)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      isDark ? "0 10px 30px rgba(0,0,0,.22)" : "0 2px 8px rgba(0,0,0,0.06)";
  }}
>
  📄 View Terms & Conditions
</button>

    </div>

  );

}