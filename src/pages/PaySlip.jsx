import { useState, useEffect, useRef, memo } from "react";
import { apiFetch, API_BASE } from "../api";
import { generatePayslipPDF } from "../utils/payslipPdf";
import { ChevronDown, Calendar, Download } from "lucide-react";
import toast from "react-hot-toast";
import SearchableDropdown from "../components/SearchableDropdown";
import { getFallbackFinancialYears, pickDefaultFinancialYear } from "../utils/financialYear";
import { textColor as txColor } from "../styles/adminTheme";

/* PDF generation (fc, numberToWordsIndian, loadImage, generatePayslipPDF)
   lives in ../utils/payslipPdf.js — shared with the employee payslip page. */

const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const getMonthName = (i) => MONTHS[i];

const formatDateRange = (monthIndex, fy) => {
  const [startYear] = fy.split("-").map(Number);
  const actualYear = monthIndex < 9 ? startYear : startYear + 1;
  const calMonth = (monthIndex + 3) % 12;
  const start = new Date(actualYear, calMonth, 1);
  const end = new Date(actualYear, calMonth + 1, 0);
  const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(start)} to ${fmt(end)}`;
};

/* ═══════════════════════ COMPONENT ═══════════════════════ */
const PaySlip = () => {
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [payrollEmployees, setPayrollEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMonthOptions, setShowMonthOptions] = useState(false);
  const monthDropdownRef = useRef(null);
  const [deptFilter, setDeptFilter] = useState("All");

  const filteredEmployees =
    deptFilter === "All" ? payrollEmployees : payrollEmployees.filter((e) => e.department === deptFilter);

  useEffect(() => {
    const h = (e) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) setShowMonthOptions(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [yearsRes, payrollRes] = await Promise.all([
          apiFetch(`${API_BASE}/api/payroll/financial-years`),
          apiFetch(`${API_BASE}/api/payroll`),
        ]);
        if (cancelled) return;
        const years = await yearsRes.json();
        const pData = await payrollRes.json();
        const fyList = years.length ? years : getFallbackFinancialYears();
        setFinancialYears(fyList);
        setPayrollEmployees(pData);
        if (!selectedYear) setSelectedYear(pickDefaultFinancialYear(fyList));
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load payroll data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ─── salary calculator — matches backend PayrollFormula EXACTLY ─── */
  const calculateSalary = (emp, monthIndex) => {
    if (!emp) return null;

    // Monthly gross salary (same as backend: COALESCE(gross_salary, salary))
    const gross = Number(emp.gross_salary || emp.salary || 0);
    if (gross === 0) return null;

    // Basic+DA = 50% of gross (same as PayrollFormula.basicDA)
    const basicDA = Number(emp.basic_da) || Math.round(gross * 0.5);

    // Earnings — full month values, NO pro-rating (matches PayrollFormula)
    const earnBasic = basicDA;
    const hraFull = emp.hra_enabled ? Math.round(basicDA * 0.5) : 0;
    const earnHRA = hraFull;
    const convFull = emp.conveyance_enabled ? 1200 : 0;
    const earnConv = convFull;
    const medFull = emp.medical_enabled ? 1000 : 0;
    const earnMed = medFull;
    const otherFull = emp.other_expense_enabled ? Math.max(0, gross - basicDA - hraFull - convFull - medFull) : 0;
    const earnOther = otherFull;
    const earnGross = earnBasic + earnHRA + earnConv + earnMed + earnOther;

    // Employee Deductions — matches PayrollFormula exactly
    // PF: 12% of basicDA, capped at ₹1,800
    const pf = emp.employee_pf_enabled ? Math.min(Math.round(basicDA * 0.12), 1800) : 0;
    // ESIC: 0.75% of gross if gross < 21,000
    const esic = emp.esic_enabled ? (gross < 21000 ? Math.round(gross * 0.0075) : 0) : 0;
    // Professional Tax: Male = ₹200 always; Female = ₹200 if gross >= 25,000
    const isMale = (emp.gender || '').toLowerCase() === 'male';
    const pt = isMale ? 200 : (gross > 25000 ? 200 : 0);
    // LWF: ₹25 in June (index 2) and December (index 8) only
    const lwf = emp.lwf_enabled && [2, 8].includes(monthIndex) ? 25 : 0;
    // TDS: 10% of gross if enabled
    const tds = emp.tds_enabled ? Math.round(gross * 0.10) : 0;

    const totalDed = pf + esic + pt + lwf + tds;
    // Net = earned gross - deductions (NOT fixed gross, so slip stays consistent)
    const netPayable = earnGross - totalDed;

    // Gratuity: basicDA * 0.0481 (monthly provision)
    const gratuity = emp.gratuity_enabled ? Math.round(basicDA * 0.0481) : 0;

    return {
      fixedGrossSalary: gross, basicDA, earnBasic, earnHRA, earnConv, earnMed, earnOther,
      earnGross, pf, esic, pt, lwf, tds, totalDed, netPayable, gratuity,
      hraFull, convFull, medFull, otherFull,
    };
  };

  /* PDF generation is delegated to the shared util (../utils/payslipPdf.js) —
     matches Deepti's payslip format EXACTLY. */

  /* ─── download handler ─── */
  const downloadPayslip = async (emp, monthsList, isFullYear) => {
    try {
      if (isFullYear) {
        // Full year: show 12 months summary
        const [sy] = selectedYear.split("-").map(Number);
        let total = null;
        let count = 0;
        for (let m = 0; m < 12; m++) {
          const s = calculateSalary(emp, m);
          if (s) {
            if (!total) total = { ...s };
            else Object.keys(total).forEach((k) => { if (typeof total[k] === "number") total[k] += s[k] || 0; });
            count++;
          }
        }
        if (!total || count === 0) {
          toast.error("No salary data found. Please ensure salary is configured.");
          return;
        }
        await generatePayslipPDF(emp, total, `Apr ${sy} to Mar ${sy + 1}`, "FullYear", selectedYear);
        toast.success("Full year payslip downloaded!");
      } else {
        if (monthsList.length === 0) { toast.error("Please select at least one month."); return; }
        let downloaded = 0;
        for (const m of monthsList) {
          const s = calculateSalary(emp, m);
          if (s) {
            await generatePayslipPDF(emp, s, formatDateRange(m, selectedYear), getMonthName(m), selectedYear);
            downloaded++;
            if (monthsList.length > 1 && downloaded < monthsList.length) await new Promise((r) => setTimeout(r, 500));
          }
        }
        downloaded > 0 ? toast.success(`${downloaded} payslip(s) downloaded!`) : toast.error("No salary data found. Please process payroll first.");
      }
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to generate payslip.");
    }
  };

  const handleMonthChange = (e) => {
    const v = parseInt(e.target.value);
    setSelectedMonths((prev) => (e.target.checked ? [...prev, v].sort((a, b) => a - b) : prev.filter((m) => m !== v)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  const btn = { padding: "10px 20px", borderRadius: "14px", border: "1px solid #d1d5db", background: "#fff", color: txColor("primary"), cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "8px", transition: ".3s" };
  const sel = { padding: "12px 16px", borderRadius: "12px", border: "1px solid #d1d5db", background: "#fff", color: txColor("primary"), fontSize: "13px", fontWeight: "600", outline: "none", cursor: "pointer" };
  const th = { padding: "16px 14px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: txColor("secondary"), borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", background: "#f8fafc" };
  const td = { padding: "16px 14px", fontSize: "13px", color: txColor("primary"), borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
        <div style={{ flex: "1", minWidth: "220px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: txColor("secondary"), fontSize: "13px", fontWeight: "600" }}>
            <Calendar size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} /> Financial Year
          </label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ ...sel, width: "100%" }}>
            {financialYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={{ flex: "1", minWidth: "220px" }} ref={monthDropdownRef}>
          <label style={{ display: "block", marginBottom: "8px", color: txColor("secondary"), fontSize: "13px", fontWeight: "600" }}>
            <Calendar size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} /> Select Months
          </label>
          <div style={{ position: "relative" }}>
            <button type="button" onClick={() => setShowMonthOptions(!showMonthOptions)} style={{ ...sel, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {selectedMonths.length > 0 ? selectedMonths.map((i) => getMonthName(i)).join(", ") : "Select months..."}
              <ChevronDown size={16} style={{ opacity: 0.5 }} />
            </button>
            {showMonthOptions && (
              <div style={{ position: "absolute", zIndex: 10, width: "100%", marginTop: "4px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,.1)", maxHeight: "240px", overflowY: "auto" }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", color: txColor("primary"), fontSize: "13px", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(8,145,178,.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <input type="checkbox" value={i} checked={selectedMonths.includes(i)} onChange={handleMonthChange} style={{ accentColor: "#06b6d4", width: "16px", height: "16px" }} />
                    {getMonthName(i)}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <SearchableDropdown value={deptFilter} onChange={setDeptFilter} width={200} />
        <div style={{ color: "#0891b2", fontSize: "13px", fontWeight: "700", paddingBottom: "4px" }}>{filteredEmployees.length} Employees</div>
      </div>

      {filteredEmployees.length > 0 && (
        <div style={{ borderRadius: "20px", border: "1px solid #e2e8f0", background: "#fff", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Employee ID</th>
                <th style={th}>Employee Name</th>
                <th style={{ ...th, textAlign: "center" }}>Download Full Year</th>
                <th style={{ ...th, textAlign: "center" }}>Download Selected Months</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, i) => (
                <tr key={emp.id || i} style={{ transition: "background .2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(8,145,178,.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#0891b2,#0284c7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                        {(emp.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: txColor("primary") }}>{emp.employee_code || emp.id}</span>
                    </div>
                  </td>
                  <td style={{ ...td, fontWeight: 700 }}>{emp.name || "Unknown"}</td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <button onClick={() => downloadPayslip(emp, [], true)}
                      style={{ ...btn, background: "linear-gradient(135deg,rgba(2,132,199,.12),rgba(8,145,178,.12))", border: "1px solid rgba(8,145,178,.2)", color: "#0891b2" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
                      <Download size={14} /> Full Year
                    </button>
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <button onClick={() => downloadPayslip(emp, selectedMonths, false)} disabled={selectedMonths.length === 0}
                      style={{ ...btn, background: selectedMonths.length > 0 ? "linear-gradient(135deg,rgba(22,163,74,.1),rgba(16,185,129,.1))" : "rgba(0,0,0,.02)", border: selectedMonths.length > 0 ? "1px solid rgba(34,197,94,.3)" : "1px solid #e2e8f0", color: selectedMonths.length > 0 ? "#16a34a" : "#94a3b8", cursor: selectedMonths.length > 0 ? "pointer" : "not-allowed", opacity: selectedMonths.length > 0 ? 1 : 0.5 }}
                      onMouseEnter={(e) => { if (selectedMonths.length > 0) e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
                      <Download size={14} /> Selected Months
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default memo(PaySlip);
