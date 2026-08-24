import { useState, useEffect, useRef, memo } from "react";
import { apiFetch, API_BASE } from "../api";
import { jsPDF } from "jspdf";
import { Download, Calendar, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import SearchableDropdown from "../components/SearchableDropdown";

const formatNumberWithCommas = (number) => {
    if (number === "N/A" || number == null) return "N/A";
    return Math.round(Number(number)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const numberToWordsIndian = (num) => {
    if (num === 0) return "Zero";
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convert = (n) => {
        if (n === 0) return "";
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return `${tens[Math.floor(n / 10)]} ${units[n % 10]}`.trim();
        return `${units[Math.floor(n / 100)]} Hundred ${convert(n % 100)}`.trim();
    };

    let crore = Math.floor(num / 10000000);
    let lakh = Math.floor((num % 10000000) / 100000);
    let thousand = Math.floor((num % 100000) / 1000);
    let hundred = Math.floor((num % 1000));

    let result = [];
    if (crore > 0) result.push(`${convert(crore)} Crore`);
    if (lakh > 0) result.push(`${convert(lakh)} Lakh`);
    if (thousand > 0) result.push(`${convert(thousand)} Thousand`);
    if (hundred > 0) result.push(convert(hundred));

    return result.join(" ").trim() || "Zero";
};

const getMonthName = (monthIndex) => {
    const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
    return months[monthIndex];
};

const formatDateRange = (monthIndex, financialYear) => {
    const [startYear] = financialYear.split("-").map(Number);
    const actualYear = monthIndex < 9 ? startYear : startYear + 1;
    const month = (monthIndex + 3) % 12;
    const startDate = new Date(actualYear, month, 1);
    const endDate = new Date(actualYear, month + 1, 0);
    const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${fmt(startDate)} to ${fmt(endDate)}`;
};

const getDaysInMonth = (monthIndex, financialYear) => {
    const [startYear] = financialYear.split("-").map(Number);
    const actualYear = monthIndex < 9 ? startYear : startYear + 1;
    const monthInYear = (monthIndex + 3) % 12;
    return new Date(actualYear, monthInYear + 1, 0).getDate();
};

const PaySlip = () => {
    const [financialYears, setFinancialYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [payrollData, setPayrollData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showMonthOptions, setShowMonthOptions] = useState(false);
    const monthDropdownRef = useRef(null);
    const [deptFilter, setDeptFilter] = useState("All");
    const filteredEmployees = deptFilter === "All" ? employees : employees.filter(e => e.department === deptFilter);

    useEffect(() => {
        const handleOutside = (e) => {
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
                setShowMonthOptions(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

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
                setFinancialYears(years.length ? years : ["2024-2025", "2025-2026"]);
                setEmployees(emps);
                if (years.length && !selectedYear) setSelectedYear(years[0]);
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedYear) return;
        setLoading(true);
        apiFetch(`${API_BASE}/api/payroll/all?financialYear=${encodeURIComponent(selectedYear)}`)
            .then(res => res.json())
            .then(records => {
                const pMap = {};
                records.forEach(r => {
                    if (!pMap[r.EmployeeID]) pMap[r.EmployeeID] = {};
                    pMap[r.EmployeeID][r.Month] = {
                        fixedGrossSalary: r.FixedGrossSalary || 0,
                        leavesTaken: r.LeavesTaken || 0,
                        paidLeaves: r.PaidLeaves || 0,
                        basicDA: r.BasicDA || 0,
                        advance: r.Advance || 0,
                        revenueGenerated: r.RevenueGenerated || 0,
                    };
                });
                employees.forEach(emp => {
                    if (!pMap[emp.id]) pMap[emp.id] = {};
                    for (let m = 0; m < 12; m++) {
                        if (!pMap[emp.id][m]) {
                            pMap[emp.id][m] = {
                                fixedGrossSalary: emp.gross_salary || emp.salary || 0,
                                basicDA: emp.basic_da || Math.round((emp.gross_salary || emp.salary || 0) * 0.5),
                                leavesTaken: 0, paidLeaves: 0,
                                advance: emp.advance || 0, revenueGenerated: emp.revenue_generated || 0,
                            };
                        }
                    }
                });
                setPayrollData(pMap);
            })
            .catch(err => console.error("Error:", err))
            .finally(() => setLoading(false));
    }, [selectedYear, employees]);

    const calculateSalary = (employee, monthIndex) => {
        const data = payrollData[employee.id]?.[monthIndex];
        if (!data) return null;

        const fixedGrossSalary = data.fixedGrossSalary || employee.gross_salary || employee.salary || 0;
        const leavesTaken = data.leavesTaken || 0;
        const paidLeaves = data.paidLeaves || 0;
        const daysInMonth = getDaysInMonth(monthIndex, selectedYear);
        const paidDays = daysInMonth - (leavesTaken - paidLeaves > 0 ? leavesTaken - paidLeaves : 0);

        const basicSalary = data.basicDA || Math.round(fixedGrossSalary * 0.5);
        const earnBasic = Math.round((basicSalary / daysInMonth) * paidDays);
        const hra = (employee.hra || employee.hra_enabled) ? Math.round(basicSalary * 0.5) : 0;
        const earnHRA = Math.round((hra / daysInMonth) * paidDays);
        const conv = (employee.conveyance_allowance || employee.conveyance_enabled) ? 1200 : 0;
        const earnConv = Math.round((conv / daysInMonth) * paidDays);
        const med = (employee.medical_allowance || employee.medical_enabled) ? 1000 : 0;
        const earnMed = Math.round((med / daysInMonth) * paidDays);
        const other = (employee.other_expense_enabled || employee.other_expenses) ? Math.round(fixedGrossSalary - basicSalary - hra - conv - med) : 0;
        const earnOther = Math.round((other / daysInMonth) * paidDays);
        const earnGross = Math.round(earnBasic + earnHRA + earnConv + earnMed + earnOther);
        const pfWages = Math.round(earnGross - earnHRA);
        const pfEnabled = employee.employee_pf_enabled ?? employee.epfEmployee ?? true;
        const empPfEnabled = employee.employer_pf_enabled ?? employee.epfEmployer ?? true;
        const pf = (pfEnabled && empPfEnabled && pfWages < 15000) ? Math.round(pfWages * 0.12) : (pfEnabled && empPfEnabled ? 1800 : 0);
        const pt = (employee.professional_tax_enabled ?? employee.professionalTax ?? true) ? ((earnGross > 25000) ? 200 : 0) : 0;
        const esicEnabled = employee.esic_enabled ?? false;
        const esic = (esicEnabled && earnGross < 21000) ? Math.round(earnGross * 0.0075) : 0;
        const lwfEnabled = employee.lwf_enabled ?? false;
        const lwf = (lwfEnabled && [2, 8].includes(monthIndex)) ? 25 : 0;
        const tds = (employee.tds_enabled ?? employee.tdsSalary) ? Math.round(earnGross * 0.10) : 0;
        const totalDed = Math.round(pf + esic + pt + lwf + tds);
        const netPayable = Math.round(earnGross - totalDed);
        const gratuity = (employee.gratuity_enabled ?? employee.gratuityProvision ?? true) ? Math.round(earnBasic * 0.0481) : 0;
        const empPf = (pfEnabled && empPfEnabled) ? pf : 0;
        const empEsic = (esicEnabled && earnGross < 21000) ? Math.round(earnGross * 0.0325) : 0;
        const empLwf = (lwfEnabled && [2, 8].includes(monthIndex)) ? 75 : 0;
        const ctc = Math.round(earnGross + empPf + empEsic + empLwf + gratuity);

        return { fixedGrossSalary: Math.round(fixedGrossSalary), basicSalary, earnBasic, hra, earnHRA, conv, earnConv, med, earnMed, other, earnOther, earnGross, pfWages, pf, esic, pt, lwf, tds, totalDed, netPayable, gratuity, empPf, empEsic, empLwf, ctc, paidDays };
    };

    const generatePayslipPDF = (employee, salary, period, monthName) => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pw = doc.internal.pageSize.getWidth();
        const m = 15;
        let y = 15;

        const fc = (num) => {
            if (num == null) return "0.00";
            const s = Number(num).toFixed(2).toString();
            const [ip, fp] = s.split(".");
            const last3 = ip.length > 3 ? ip.slice(ip.length - 3) : ip;
            const rest = ip.slice(0, ip.length - 3);
            const fmt = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            return `${rest ? fmt + "," : ""}${last3}.${fp}`;
        };

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Pay Slip", pw / 2, y, { align: "center" });
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(period, pw / 2, y, { align: "center" });
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text((employee.full_name || employee.name || "N/A").toUpperCase(), pw / 2, y, { align: "center" });
        y += 12;

        const c1 = m, c2 = pw / 2 + 10;
        doc.setFontSize(9);
        const dL = [
            { l: "Employee ID", v: employee.employee_code || employee.id },
            { l: "Department", v: employee.department || "N/A" },
            { l: "Designation", v: employee.designation || "N/A" },
            { l: "Joining Date", v: employee.joining_date ? new Date(employee.joining_date).toLocaleDateString("en-GB") : "N/A" },
            { l: "UAN Number", v: employee.uan_number || "N/A" },
        ];
        const dR = [
            { l: "PAN", v: employee.pan_number || "N/A" },
            { l: "Bank", v: employee.bank_name || "N/A" },
            { l: "Account", v: employee.bank_account_number || "N/A" },
            { l: "IFSC", v: employee.ifsc_code || "N/A" },
            { l: "ESI No.", v: employee.esi_registration_number || "N/A" },
        ];
        for (let i = 0; i < Math.max(dL.length, dR.length); i++) {
            if (dL[i]) { doc.setFont("helvetica", "normal"); doc.text(`${dL[i].l}:`, c1, y); doc.setFont("helvetica", "bold"); doc.text(String(dL[i].v), c1 + 38, y); }
            if (dR[i]) { doc.setFont("helvetica", "normal"); doc.text(`${dR[i].l}:`, c2, y); doc.setFont("helvetica", "bold"); doc.text(String(dR[i].v), c2 + 38, y); }
            y += 5;
        }
        y += 5;

        const earnings = [
            { label: "Basic Salary", value: salary.earnBasic },
            { label: "HRA", value: salary.earnHRA },
            { label: "Conveyance", value: salary.earnConv },
            { label: "Medical Allowance", value: salary.earnMed },
            { label: "Other Allowance", value: salary.earnOther },
        ];
        const deductions = [
            { label: "Provident Fund", value: salary.pf },
            { label: "ESIC", value: salary.esic },
            { label: "Professional Tax", value: salary.pt },
            { label: "LWF", value: salary.lwf },
            { label: "TDS", value: salary.tds },
        ];
        const totE = earnings.reduce((s, i) => s + (i.value || 0), 0);
        const totD = deductions.reduce((s, i) => s + (i.value || 0), 0);
        const net = totE - totD;

        doc.setLineWidth(0.4); doc.line(m, y, pw - m, y); y += 6;
        const eX = m + 2, eAX = m + 90, dX = m + 100, dAX = pw - m - 2;
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text("Earnings", eX, y); doc.text("Amount", eAX, y, { align: "right" });
        doc.text("Deductions", dX, y); doc.text("Amount", dAX, y, { align: "right" });
        y += 6;
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        for (let i = 0; i < Math.max(earnings.length, deductions.length); i++) {
            if (i < earnings.length && earnings[i].value !== 0) { doc.text(earnings[i].label, eX, y); doc.text(fc(earnings[i].value), eAX, y, { align: "right" }); }
            if (i < deductions.length && deductions[i].value !== 0) { doc.text(deductions[i].label, dX, y); doc.text(fc(deductions[i].value), dAX, y, { align: "right" }); }
            y += 6;
        }
        y += 2;
        doc.setLineWidth(0.4); doc.line(m, y, eAX, y); doc.line(dX - 2, y, dAX + 2, y); y += 6;
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text("Total Earnings", eX, y); doc.text(fc(totE), eAX, y, { align: "right" });
        doc.text("Total Deductions", dX, y); doc.text(fc(totD), dAX, y, { align: "right" });
        y += 8;
        doc.setLineWidth(0.4); doc.line(m, y, pw - m, y); y += 6;
        doc.setFontSize(11); doc.text("Net Amount", m, y); doc.text(fc(net), dAX, y, { align: "right" });
        y += 10;
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        const words = `Amount (in words): INR ${numberToWordsIndian(Math.round(net))} Only`;
        doc.text(doc.splitTextToSize(words, pw - m * 2), m, y);
        const fY = doc.internal.pageSize.getHeight() - 20;
        doc.text("Authorised Signatory", pw - m, fY, { align: "right" });

        const safeName = (employee.full_name || employee.name || "Employee").replace(/[^a-zA-Z0-9]/g, "_");
        doc.save(`Payslip_${safeName}_${monthName || 'FullYear'}_${selectedYear}.pdf`);
    };

    const downloadPayslip = async (employee, monthsList, isFullYear) => {
        try {
            if (isFullYear) {
                let total = { earnBasic: 0, earnHRA: 0, earnConv: 0, earnMed: 0, earnOther: 0, pf: 0, esic: 0, pt: 0, lwf: 0, tds: 0, pfWages: 0, empPf: 0, empEsic: 0, empLwf: 0, gratuity: 0 };
                for (let m = 0; m < 12; m++) {
                    const s = calculateSalary(employee, m);
                    if (s) Object.keys(total).forEach(k => total[k] += s[k] || 0);
                }
                const [sy] = selectedYear.split("-").map(Number);
                generatePayslipPDF(employee, total, `Apr ${sy} to Mar ${sy + 1}`, 'FullYear');
                toast.success("Full year payslip downloaded!");
            } else {
                if (monthsList.length === 0) {
                    toast.error("Please select at least one month.");
                    return;
                }
                let downloaded = 0;
                for (const m of monthsList) {
                    const s = calculateSalary(employee, m);
                    if (s) {
                        generatePayslipPDF(employee, s, formatDateRange(m, selectedYear), getMonthName(m));
                        downloaded++;
                        if (monthsList.length > 1 && downloaded < monthsList.length) {
                            await new Promise(r => setTimeout(r, 500));
                        }
                    }
                }
                if (downloaded > 0) {
                    toast.success(`${downloaded} payslip(s) downloaded!`);
                } else {
                    toast.error("No salary data found for selected month(s). Please process payroll first.");
                }
            }
        } catch (err) {
            console.error("Download error:", err);
            toast.error("Failed to generate payslip. Please try again.");
        }
    };

    const handleMonthChange = (e) => {
        const v = parseInt(e.target.value);
        setSelectedMonths(prev => e.target.checked ? [...prev, v].sort((a, b) => a - b) : prev.filter(m => m !== v));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Shared styles
    const glassBtn = {
        padding: "14px 28px",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.05)",
        color: "#fff",
        backdropFilter: "blur(14px)",
        cursor: "pointer",
        transition: ".35s",
        fontSize: "13px",
        fontWeight: "600",
    };
    const selectStyle = {
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.04)",
        color: "#f8fafc",
        fontSize: "13px",
        fontWeight: "600",
        outline: "none",
        cursor: "pointer",
    };
    const thStyle = { padding: "16px 14px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap", background: "rgba(255,255,255,.02)" };
    const tdStyle = { padding: "16px 14px", fontSize: "13px", color: "#f8fafc", borderBottom: "1px solid rgba(255,255,255,.04)", whiteSpace: "nowrap" };

    return (
        <div style={{ width: "100%" }}>
            {/* Controls */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px", alignItems: "flex-end" }}>
                <div style={{ flex: "1", minWidth: "220px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", letterSpacing: ".3px" }}>
                        <Calendar size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                        Financial Year
                    </label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ ...selectStyle, width: "100%" }}>
                        {financialYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div style={{ flex: "1", minWidth: "220px" }} ref={monthDropdownRef}>
                    <label style={{ display: "block", marginBottom: "8px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", letterSpacing: ".3px" }}>
                        <Calendar size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                        Select Months
                    </label>
                    <div style={{ position: "relative" }}>
                        <button
                            type="button"
                            onClick={() => setShowMonthOptions(!showMonthOptions)}
                            style={{ ...selectStyle, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                            {selectedMonths.length > 0 ? selectedMonths.map(i => getMonthName(i)).join(", ") : "Select months..."}
                            <ChevronDown size={16} style={{ opacity: 0.5 }} />
                        </button>
                        {showMonthOptions && (
                            <div
                                style={{
                                    position: "absolute", zIndex: 10, width: "100%", marginTop: "4px",
                                    background: "rgba(17,24,39,.95)", border: "1px solid rgba(255,255,255,.08)",
                                    borderRadius: "12px", boxShadow: "0 15px 40px rgba(0,0,0,.4)", maxHeight: "240px", overflowY: "auto",
                                    backdropFilter: "blur(20px)",
                                }}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <label key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", color: "#f8fafc", fontSize: "13px", cursor: "pointer", transition: "background .2s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(55,255,215,.06)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <input type="checkbox" value={i} checked={selectedMonths.includes(i)} onChange={handleMonthChange} style={{ accentColor: "#06b6d4", width: "16px", height: "16px" }} />
                                        {getMonthName(i)}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <SearchableDropdown value={deptFilter} onChange={setDeptFilter} width={200} />
                <div style={{ color: "#37FFD7", fontSize: "13px", fontWeight: "700", letterSpacing: ".3px", paddingBottom: "4px" }}>
                    {filteredEmployees.length} Employees
                </div>
            </div>

            {/* Table */}
            {employees.length > 0 && (
                <div
                    style={{
                        borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,.06)",
                        background: "rgba(255,255,255,.02)",
                        overflow: "hidden",
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Employee ID</th>
                                <th style={thStyle}>Employee Name</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Download Full Year</th>
                                <th style={{ ...thStyle, textAlign: "center" }}>Download Selected Months</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((emp, index) => (
                                <tr
                                    key={index}
                                    style={{ transition: "background .2s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(55,255,215,.04)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={tdStyle}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{
                                                width: "38px", height: "38px", borderRadius: "50%",
                                                background: "linear-gradient(135deg,#37FFD7,#0EA5E9)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "#08111d", fontWeight: "700", fontSize: "14px",
                                                boxShadow: "0 0 16px rgba(55,255,215,.30)",
                                                flexShrink: 0,
                                            }}>
                                                {(emp.full_name || emp.name || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: "600" }}>{emp.id}</span>
                                        </div>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: "700" }}>{emp.full_name || emp.name || "Unknown"}</td>
                                    <td style={{ ...tdStyle, textAlign: "center" }}>
                                        <button
                                            onClick={() => downloadPayslip(emp, [], true)}
                                            style={{
                                                ...glassBtn,
                                                background: "linear-gradient(135deg,rgba(37,99,235,.3),rgba(6,182,212,.3))",
                                                border: "1px solid rgba(55,255,215,.2)",
                                                padding: "10px 20px",
                                                fontSize: "12px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(55,255,215,.2)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                        >
                                            <Download size={14} /> Full Year
                                        </button>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: "center" }}>
                                        <button
                                            onClick={() => downloadPayslip(emp, selectedMonths, false)}
                                            disabled={selectedMonths.length === 0}
                                            style={{
                                                ...glassBtn,
                                                background: selectedMonths.length > 0
                                                    ? "linear-gradient(135deg,rgba(34,197,94,.25),rgba(16,185,129,.25))"
                                                    : "rgba(255,255,255,.02)",
                                                border: selectedMonths.length > 0
                                                    ? "1px solid rgba(34,197,94,.3)"
                                                    : "1px solid rgba(255,255,255,.05)",
                                                color: selectedMonths.length > 0 ? "#f8fafc" : "#475569",
                                                cursor: selectedMonths.length > 0 ? "pointer" : "not-allowed",
                                                padding: "10px 20px",
                                                fontSize: "12px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                opacity: selectedMonths.length > 0 ? 1 : 0.5,
                                            }}
                                            onMouseEnter={e => { if (selectedMonths.length > 0) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(34,197,94,.15)"; }}}
                                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                        >
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
