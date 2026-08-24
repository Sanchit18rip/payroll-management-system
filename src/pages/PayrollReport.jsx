import { useState, lazy, Suspense } from "react";
import { FileText, ClipboardList, Table2, Receipt } from "lucide-react";

const StatutoryCompliance = lazy(() => import("./StatutoryCompliance"));
const PaySheet = lazy(() => import("./PaySheet"));
const PaySlip = lazy(() => import("./PaySlip"));

function PayrollReport() {
    const [selectedReport, setSelectedReport] = useState("paySlip");

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
    );

    const tabs = [
        { id: "statutory", label: "Statutory Compliance", icon: ClipboardList },
        { id: "paySheet", label: "Pay Sheet", icon: Table2 },
        { id: "paySlip", label: "Pay Slip", icon: Receipt },
    ];

    const ActiveIcon = tabs.find(t => t.id === selectedReport)?.icon || FileText;

    return (
        <div
            style={{
                padding: "30px",
                width: "100%",
                minHeight: "100vh",
            }}
        >
            {/* Hero Section */}
            <div style={{ marginBottom: "35px" }}>
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 18px",
                        borderRadius: "999px",
                        background: "rgba(55,255,215,.08)",
                        border: "1px solid rgba(55,255,215,.18)",
                        color: "#4dd8ff",
                        fontSize: "12px",
                        fontWeight: "700",
                        letterSpacing: "2px",
                        marginBottom: "16px",
                    }}
                >
                    <FileText size={14} />
                    REPORTS & ANALYTICS
                </div>
                <h1
                    style={{
                        fontSize: "52px",
                        fontWeight: "800",
                        color: "#f8fafc",
                        margin: 0,
                        lineHeight: 1.1,
                    }}
                >
                    📋 Payroll Reports
                </h1>
                <p
                    style={{
                        color: "#94a3b8",
                        marginTop: "12px",
                        fontSize: "17px",
                        maxWidth: "550px",
                        lineHeight: 1.8,
                    }}
                >
                    Generate pay slips, view pay sheets and statutory compliance reports for your organization.
                </p>
            </div>

            {/* Tab Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "30px", flexWrap: "wrap" }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = selectedReport === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedReport(tab.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "14px 28px",
                                borderRadius: "14px",
                                border: isActive ? "1px solid rgba(55,255,215,.35)" : "1px solid rgba(255,255,255,.08)",
                                background: isActive
                                    ? "linear-gradient(135deg, rgba(6,182,212,.25), rgba(37,99,235,.25))"
                                    : "rgba(255,255,255,.03)",
                                color: isActive ? "#37FFD7" : "#94a3b8",
                                cursor: "pointer",
                                fontWeight: "700",
                                fontSize: "14px",
                                letterSpacing: ".3px",
                                transition: "all .3s ease",
                                backdropFilter: "blur(14px)",
                                WebkitBackdropFilter: "blur(14px)",
                                boxShadow: isActive ? "0 0 22px rgba(55,255,215,.12)" : "0 12px 30px rgba(0,0,0,.18)",
                                transform: isActive ? "translateY(-2px)" : "none",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.border = "1px solid rgba(55,255,215,.20)";
                                    e.currentTarget.style.boxShadow = "0 0 18px rgba(55,255,215,.08)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.border = "1px solid rgba(255,255,255,.08)";
                                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,.18)";
                                }
                            }}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Card */}
            <div
                style={{
                    borderRadius: "24px",
                    border: "1px solid rgba(255,255,255,.08)",
                    background: "linear-gradient(180deg, rgba(17,24,39,.72), rgba(15,23,42,.72))",
                    backdropFilter: "blur(22px)",
                    WebkitBackdropFilter: "blur(22px)",
                    boxShadow: "0 15px 40px rgba(0,0,0,.28)",
                    padding: "30px",
                    minHeight: "400px",
                }}
            >
                <Suspense fallback={<LoadingSpinner />}>
                    {selectedReport === "statutory" && <StatutoryCompliance />}
                    {selectedReport === "paySheet" && <PaySheet />}
                    {selectedReport === "paySlip" && <PaySlip />}
                </Suspense>
            </div>
        </div>
    );
}

export default PayrollReport;
