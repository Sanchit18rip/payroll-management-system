import { useState, useEffect } from "react";
import { apiFetch, API_BASE } from "../api";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

const formatNumberWithCommas = (number) => {
    if (number == null) return "N/A";
    return Math.round(Number(number)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getDaysInMonth = (monthIndex, financialYear) => {
    const [startYear] = financialYear.split("-").map(Number);
    const actualYear = monthIndex < 9 ? startYear : startYear + 1;
    const monthInYear = (monthIndex + 3) % 12;
    return new Date(actualYear, monthInYear + 1, 0).getDate();
};

const monthsList = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

const StatutoryCompliance = () => {
    const [financialYear, setFinancialYear] = useState("");
    const [availableYears, setAvailableYears] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedReport, setSelectedReport] = useState("PF");
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [yearsRes, empRes] = await Promise.all([
                    apiFetch(`${API_BASE}/api/payroll/financial-years`),
                    apiFetch(`${API_BASE}/api/employees`),
                ]);
                const years = await yearsRes.json();
                const emps = await empRes.json();
                setAvailableYears(years.length ? years : ["2024-2025", "2025-2026"]);
                setEmployees(emps);
                if (years.length) setFinancialYear(years[0]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateSalary = (employee, monthIndex) => {
        const fgs = employee.gross_salary || employee.salary || 0;
        const basic = employee.basic_da || Math.round(fgs * 0.5);
        const dim = getDaysInMonth(monthIndex, financialYear);
        const eb = Math.round((basic / dim) * dim);
        const hra = employee.hra_enabled ? Math.round(basic * 0.5) : 0;
        const eh = Math.round((hra / dim) * dim);
        const conv = employee.conveyance_enabled ? (employee.conveyance_allowance || 1200) : 0;
        const ec = Math.round((conv / dim) * dim);
        const med = employee.medical_enabled ? (employee.medical_allowance || 1000) : 0;
        const em = Math.round((med / dim) * dim);
        const other = employee.other_expense_enabled ? Math.round(fgs - basic - hra - conv - med) : 0;
        const eo = Math.round((other / dim) * dim);
        const eg = Math.round(eb + eh + ec + em + eo);
        const pfW = Math.round(eg - eh);
        const pf = (employee.employee_pf_enabled && employee.employer_pf_enabled && pfW < 15000) ? Math.round(pfW * 0.12) : (employee.employee_pf_enabled && employee.employer_pf_enabled ? 1800 : 0);
        const pt = employee.professional_tax_enabled ? ((eg > 25000) ? 200 : 0) : 0;
        const esicEnabled = employee.esic_enabled ?? false;
        const esic = (esicEnabled && eg < 21000) ? Math.round(eg * 0.0075) : 0;
        const lwfEnabled = employee.lwf_enabled ?? false;
        const lwf = (lwfEnabled && [2, 8].includes(monthIndex)) ? 25 : 0;
        const gratuity = employee.gratuity_enabled ? Math.round(eb * 0.0481) : 0;
        const employerLwf = [2, 8].includes(monthIndex) ? 75 : 0;
        const employerEsic = (esicEnabled && eg < 21000) ? Math.round(eg * 0.0325) : 0;
        const ctc = Math.round(eg + pf + employerEsic + gratuity + employerLwf);
        return { pf, esic, pt, lwf, gratuity, ctc };
    };

    const generateReportData = (reportType) => {
        return employees.map(emp => {
            const row = { "Employee Name": emp.full_name || emp.name };
            let annual = 0;
            monthsList.forEach((month, idx) => {
                if (selectedMonth === null || monthsList[idx] === selectedMonth) {
                    const salary = calculateSalary(emp, idx);
                    const val = salary[reportType.toLowerCase()] || 0;
                    row[month] = formatNumberWithCommas(val);
                    if (selectedMonth === null) annual += val;
                }
            });
            if (selectedMonth === null) row["Annual Total"] = formatNumberWithCommas(Math.round(annual));
            return row;
        });
    };

    const downloadExcel = (reportType) => {
        const data = generateReportData(reportType);
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, reportType);
        XLSX.writeFile(wb, `${reportType}_Report_${financialYear}${selectedMonth ? `_${selectedMonth}` : ""}.xlsx`);
    };

    if (loading) {
        return (<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>);
    }

    const selectStyle = { padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: "#f8fafc", fontSize: "13px", fontWeight: "600", outline: "none", cursor: "pointer", width: "100%" };
    const thStyle = { padding: "16px 14px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap", background: "rgba(255,255,255,.02)", letterSpacing: ".3px", textTransform: "uppercase", position: "sticky", top: 0 };
    const tdStyle = { padding: "14px", fontSize: "13px", color: "#cbd5e1", borderBottom: "1px solid rgba(255,255,255,.04)", whiteSpace: "nowrap" };

    const reportOptions = [
        { id: "PF", label: "Provident Fund" },
        { id: "ESIC", label: "ESIC" },
        { id: "PT", label: "Professional Tax" },
        { id: "LWF", label: "Labour Welfare Fund" },
        { id: "CTC", label: "CTC" },
        { id: "Gratuity", label: "Gratuity" },
    ];

    return (
        <div style={{ width: "100%" }}>
            {/* Controls */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
                <div style={{ flex: "1", minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", letterSpacing: ".3px" }}>Financial Year</label>
                    <select value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} style={selectStyle}>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div style={{ flex: "1", minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", letterSpacing: ".3px" }}>Month</label>
                    <select value={selectedMonth || ""} onChange={(e) => setSelectedMonth(e.target.value || null)} style={selectStyle}>
                        <option value="">All Months</option>
                        {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div style={{ flex: "1", minWidth: "200px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", letterSpacing: ".3px" }}>Report Type</label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {reportOptions.map(opt => (
                            <button key={opt.id} onClick={() => setSelectedReport(opt.id)} style={{
                                padding: "10px 18px", borderRadius: "10px",
                                border: selectedReport === opt.id ? "1px solid rgba(55,255,215,.35)" : "1px solid rgba(255,255,255,.08)",
                                background: selectedReport === opt.id ? "linear-gradient(135deg,rgba(6,182,212,.2),rgba(37,99,235,.2))" : "rgba(255,255,255,.03)",
                                color: selectedReport === opt.id ? "#37FFD7" : "#94a3b8",
                                cursor: "pointer", fontWeight: "600", fontSize: "12px", letterSpacing: ".2px", transition: "all .25s ease",
                            }}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Download Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                <button onClick={() => downloadExcel(selectedReport)} style={{
                    padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(55,255,215,.25)",
                    background: "rgba(255,255,255,.05)", color: "#fff", backdropFilter: "blur(14px)",
                    cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", transition: ".3s",
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.border = "1px solid rgba(55,255,215,.4)"; e.currentTarget.style.boxShadow = "0 0 22px rgba(55,255,215,.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,.08)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                    <Download size={16} /> Download as Excel
                </button>
            </div>

            {/* Table */}
            {selectedReport && (
                <div style={{ borderRadius: "20px", border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", overflow: "hidden" }}>
                    <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Employee Name</th>
                                    {selectedMonth === null
                                        ? monthsList.map(m => <th key={m} style={thStyle}>{m}</th>)
                                        : <th style={thStyle}>{selectedMonth}</th>}
                                    {selectedMonth === null && <th style={{ ...thStyle, color: "#37FFD7" }}>Annual Total</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => {
                                    const key = selectedReport.toLowerCase();
                                    return (
                                        <tr key={emp.id} style={{ transition: "background .2s" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(55,255,215,.04)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                            <td style={{ ...tdStyle, fontWeight: "700", color: "#f8fafc" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#37FFD7,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#08111d", fontWeight: "700", fontSize: "13px", boxShadow: "0 0 14px rgba(55,255,215,.25)", flexShrink: 0 }}>
                                                        {(emp.full_name || emp.name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{emp.full_name || emp.name}</span>
                                                </div>
                                            </td>
                                            {selectedMonth === null
                                                ? monthsList.map((_, idx) => {
                                                    const val = calculateSalary(emp, idx)[key] || 0;
                                                    return <td key={idx} style={tdStyle}>{formatNumberWithCommas(val)}</td>;
                                                })
                                                : monthsList.map((m, idx) => {
                                                    if (m === selectedMonth) {
                                                        const val = calculateSalary(emp, idx)[key] || 0;
                                                        return <td key={idx} style={tdStyle}>{formatNumberWithCommas(val)}</td>;
                                                    }
                                                    return null;
                                                })}
                                            {selectedMonth === null && (
                                                <td style={{ ...tdStyle, fontWeight: "800", color: "#37FFD7", textShadow: "0 0 10px rgba(55,255,215,.30)" }}>
                                                    {formatNumberWithCommas(Math.round(monthsList.reduce((sum, _, idx) => sum + (calculateSalary(emp, idx)[key] || 0), 0)))}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatutoryCompliance;
