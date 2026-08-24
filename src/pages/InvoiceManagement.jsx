import { useState, useEffect } from "react";
import { apiFetch, API_BASE } from "../api";
import toast from "react-hot-toast";
import { Download, Plus, Edit, Trash2, X, Search } from "lucide-react";

const formatCurrency = (num) => {
    if (num == null) return "0";
    return Number(num).toLocaleString("en-IN");
};

const emptyInvoice = {
    invoice_number: "", client_name: "", salary_cost: "", service_charge: "",
    total_amount: "", billing_month: "", due_date: "", status: "Pending",
    employee_count: "", employer_statutory: "", subtotal: "",
    gst_type: "Intra-State (CGST+SGST)", cgst: "", sgst: "", igst: "",
    lifecycle_state: "Pending",
    franchise_name: "", team_leader: "", company_address: "", company_city: "",
    pin_code: "", state: "", contact_person: "", contact_number: "", contact_email: "",
    gst_number: "", industry: "", sub_industry: "",
    service_charge_percent: "", credit_period: "", replacement_period: "",
    candidate_name: "", candidate_phone: "", candidate_email: "",
    post_of_candidate: "", year_of_exp: "", source_of_resume: "",
    date_of_joining: "", annual_salary_offered: "", name_of_bd: "",
    bill_number: "", bill_date: "",
    our_share: "", franchisee_share: "", franchisee_gst: "",
    month_of_bill: "", financial_year: "", amount_received: "",
    date_received: "", paid_on_date: "", amount_due: "", tds: "",
    credit_date: "", credit_note_no: "", soa_no: "", debit_correction: "",
    gst_paid_status: "", tally_updated: "", remarks: ""
};

const InvoiceManagement = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...emptyInvoice });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE}/api/invoices?`;
            if (filterYear) url += `financial_year=${encodeURIComponent(filterYear)}&`;
            if (filterStatus) url += `status=${encodeURIComponent(filterStatus)}&`;
            if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
            const res = await apiFetch(url);
            const data = await res.json();
            setInvoices(data);
        } catch (err) {
            console.error("Error fetching invoices:", err);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, [filterYear, filterStatus]);

    const handleSearch = () => { fetchInvoices(); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Auto-calculate totals when key fields change
        if (["salary_cost", "service_charge", "employer_statutory", "cgst", "sgst", "igst"].includes(name)) {
            setForm(prev => {
                const updated = { ...prev, [name]: value };
                const sc = Number(updated.service_charge) || 0;
                const ec = Number(updated.employer_statutory) || 0;
                const cgst = Number(updated.cgst) || 0;
                const sgst = Number(updated.sgst) || 0;
                const igst = Number(updated.igst) || 0;
                updated.total_gst = cgst + sgst + igst;
                updated.subtotal = sc;
                updated.total_amount = sc + cgst + sgst + igst + ec;
                return updated;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId ? `${API_BASE}/api/invoices/${editingId}` : `${API_BASE}/api/invoices`;
            const res = await apiFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(editingId ? "Invoice updated!" : "Invoice created!");
            setShowForm(false);
            setEditingId(null);
            setForm({ ...emptyInvoice });
            fetchInvoices();
        } catch (err) {
            toast.error(err.message || "Failed to save invoice");
        }
    };

    const handleEdit = (inv) => {
        setEditingId(inv.id);
        setForm({ ...emptyInvoice, ...inv });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;
        try {
            const res = await apiFetch(`${API_BASE}/api/invoices/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Invoice deleted!");
            fetchInvoices();
        } catch (err) {
            toast.error(err.message || "Failed to delete invoice");
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...emptyInvoice });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "paid": return { bg: "rgba(34,197,94,.15)", color: "#22c55e" };
            case "pending": return { bg: "rgba(234,179,8,.15)", color: "#eab308" };
            case "overdue": return { bg: "rgba(239,68,68,.15)", color: "#ef4444" };
            default: return { bg: "rgba(148,163,184,.15)", color: "#94a3b8" };
        }
    };

    const stats = {
        total: invoices.length,
        totalAmount: invoices.reduce((s, i) => s + (Number(i.total_amount) || 0), 0),
        paid: invoices.filter(i => i.status === "Paid" || i.lifecycle_state === "Paid").length,
        pending: invoices.filter(i => i.status === "Pending" || i.lifecycle_state === "Pending").length,
        ourShare: invoices.reduce((s, i) => s + (Number(i.our_share) || 0), 0),
    };

    const financialYears = [...new Set(invoices.map(i => i.financial_year).filter(Boolean))].sort().reverse();

    const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "#f8fafc", fontSize: "13px", outline: "none", boxSizing: "border-box" };
    const labelStyle = { display: "block", marginBottom: "4px", color: "#94a3b8", fontSize: "11px", fontWeight: "600", letterSpacing: ".3px" };

    if (loading) {
        return (<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>);
    }

    return (
        <div style={{ width: "100%" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Invoice Management</h2>
                    <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}>Manage recruitment invoices and billing</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyInvoice }); }}
                    style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(34,197,94,.3)", background: "linear-gradient(135deg,rgba(34,197,94,.2),rgba(16,185,129,.2))", color: "#22c55e", cursor: "pointer", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Plus size={16} /> Add Invoice
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Total Invoices", value: stats.total, color: "#37FFD7" },
                    { label: "Total Amount", value: `Rs.${formatCurrency(stats.totalAmount)}`, color: "#37FFD7" },
                    { label: "Paid", value: stats.paid, color: "#22c55e" },
                    { label: "Pending", value: stats.pending, color: "#eab308" },
                    { label: "Our Share", value: `Rs.${formatCurrency(stats.ourShare)}`, color: "#37FFD7" },
                ].map((stat, i) => (
                    <div key={i} style={{ padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
                        <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "600", letterSpacing: ".5px", textTransform: "uppercase" }}>{stat.label}</div>
                        <div style={{ color: stat.color, fontSize: "22px", fontWeight: "800", marginTop: "6px" }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input type="text" placeholder="Search by client, candidate, invoice number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        style={{ ...inputStyle, paddingLeft: "36px" }} />
                </div>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "150px" }}>
                    <option value="">All Years</option>
                    {financialYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "130px" }}>
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                </select>
            </div>

            {/* Invoice Form Modal */}
            {showForm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: "40px 20px" }}
                    onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}>
                    <div style={{ background: "#0f172a", borderRadius: "20px", border: "1px solid rgba(255,255,255,.08)", padding: "32px", width: "100%", maxWidth: "900px", maxHeight: "85vh", overflowY: "auto", overflowX: "hidden" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>{editingId ? "Edit Invoice" : "Add New Invoice"}</h3>
                            <button onClick={handleCancel} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Section: Bill Details */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ color: "#37FFD7", fontSize: "13px", fontWeight: "700", marginBottom: "12px", letterSpacing: ".5px" }}>BILL DETAILS</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                                    <div><label style={labelStyle}>Invoice Number</label><input name="invoice_number" value={form.invoice_number} onChange={handleChange} style={inputStyle} required /></div>
                                    <div><label style={labelStyle}>Bill Date</label><input name="bill_date" type="date" value={form.bill_date?.split("T")[0] || ""} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Due Date</label><input name="due_date" type="date" value={form.due_date?.split("T")[0] || ""} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Billing Month</label><input name="billing_month" value={form.billing_month} onChange={handleChange} style={inputStyle} placeholder="e.g. March 2026" /></div>
                                    <div><label style={labelStyle}>Financial Year</label><input name="financial_year" value={form.financial_year} onChange={handleChange} style={inputStyle} placeholder="e.g. 2025-2026" /></div>
                                    <div><label style={labelStyle}>Status</label>
                                        <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                                            <option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Overdue">Overdue</option>
                                        </select>
                                    </div>
                                    <div><label style={labelStyle}>Lifecycle State</label>
                                        <select name="lifecycle_state" value={form.lifecycle_state} onChange={handleChange} style={inputStyle}>
                                            <option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Client Details */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ color: "#37FFD7", fontSize: "13px", fontWeight: "700", marginBottom: "12px", letterSpacing: ".5px" }}>CLIENT DETAILS</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                                    <div><label style={labelStyle}>Client Name</label><input name="client_name" value={form.client_name} onChange={handleChange} style={inputStyle} required /></div>
                                    <div><label style={labelStyle}>Contact Person</label><input name="contact_person" value={form.contact_person} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Contact Number</label><input name="contact_number" value={form.contact_number} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Contact Email</label><input name="contact_email" value={form.contact_email} onChange={handleChange} style={inputStyle} /></div>
                                    <div style={{ gridColumn: "span 2" }}><label style={labelStyle}>Company Address</label><input name="company_address" value={form.company_address} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>City</label><input name="company_city" value={form.company_city} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Pin Code</label><input name="pin_code" value={form.pin_code} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>State</label><input name="state" value={form.state} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>GST Number</label><input name="gst_number" value={form.gst_number} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Industry</label><input name="industry" value={form.industry} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Sub Industry</label><input name="sub_industry" value={form.sub_industry} onChange={handleChange} style={inputStyle} /></div>
                                </div>
                            </div>

                            {/* Section: Candidate Details */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ color: "#37FFD7", fontSize: "13px", fontWeight: "700", marginBottom: "12px", letterSpacing: ".5px" }}>CANDIDATE DETAILS</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                                    <div><label style={labelStyle}>Candidate Name</label><input name="candidate_name" value={form.candidate_name} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Candidate Phone</label><input name="candidate_phone" value={form.candidate_phone} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Candidate Email</label><input name="candidate_email" value={form.candidate_email} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Position</label><input name="post_of_candidate" value={form.post_of_candidate} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Experience</label><input name="year_of_exp" value={form.year_of_exp} onChange={handleChange} style={inputStyle} placeholder="e.g. 0-3" /></div>
                                    <div><label style={labelStyle}>Source of Resume</label><input name="source_of_resume" value={form.source_of_resume} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Date of Joining</label><input name="date_of_joining" type="date" value={form.date_of_joining?.split("T")[0] || ""} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Annual Salary Offered</label><input name="annual_salary_offered" value={form.annual_salary_offered} onChange={handleChange} style={inputStyle} /></div>
                                </div>
                            </div>

                            {/* Section: Franchise & BD */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ color: "#37FFD7", fontSize: "13px", fontWeight: "700", marginBottom: "12px", letterSpacing: ".5px" }}>FRANCHISE & BUSINESS DEVELOPMENT</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                                    <div><label style={labelStyle}>Franchise Name</label><input name="franchise_name" value={form.franchise_name} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Team Leader</label><input name="team_leader" value={form.team_leader} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>BD Person</label><input name="name_of_bd" value={form.name_of_bd} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Employee Count</label><input name="employee_count" type="number" value={form.employee_count} onChange={handleChange} style={inputStyle} /></div>
                                </div>
                            </div>

                            {/* Section: Financial */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ color: "#37FFD7", fontSize: "13px", fontWeight: "700", marginBottom: "12px", letterSpacing: ".5px" }}>FINANCIAL DETAILS</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                                    <div><label style={labelStyle}>Service Charge (%)</label><input name="service_charge_percent" value={form.service_charge_percent} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Service Charge (Amount)</label><input name="service_charge" type="number" value={form.service_charge} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Salary Cost</label><input name="salary_cost" type="number" value={form.salary_cost} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Employer Statutory</label><input name="employer_statutory" type="number" value={form.employer_statutory} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>CGST</label><input name="cgst" type="number" value={form.cgst} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>SGST</label><input name="sgst" type="number" value={form.sgst} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>IGST</label><input name="igst" type="number" value={form.igst} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>GST Type</label>
                                        <select name="gst_type" value={form.gst_type} onChange={handleChange} style={inputStyle}>
                                            <option value="Intra-State (CGST+SGST)">Intra-State (CGST+SGST)</option>
                                            <option value="Inter-State (IGST)">Inter-State (IGST)</option>
                                        </select>
                                    </div>
                                    <div><label style={labelStyle}>Subtotal</label><input name="subtotal" type="number" value={form.subtotal} onChange={handleChange} style={inputStyle} readOnly /></div>
                                    <div><label style={labelStyle}>Total Amount</label><input name="total_amount" type="number" value={form.total_amount} onChange={handleChange} style={{ ...inputStyle, fontWeight: "700", color: "#37FFD7" }} readOnly /></div>
                                    <div><label style={labelStyle}>Credit Period (Days)</label><input name="credit_period" value={form.credit_period} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Replacement Period (Days)</label><input name="replacement_period" value={form.replacement_period} onChange={handleChange} style={inputStyle} /></div>
                                </div>
                            </div>

                            {/* Section: Payment & Revenue */}
                            <div style={{ marginBottom: "20px" }}>
                                <div style={{ color: "#37FFD7", fontSize: "13px", fontWeight: "700", marginBottom: "12px", letterSpacing: ".5px" }}>PAYMENT & REVENUE SPLIT</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                                    <div><label style={labelStyle}>Our Share</label><input name="our_share" type="number" value={form.our_share} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Franchisee Share</label><input name="franchisee_share" type="number" value={form.franchisee_share} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Franchisee GST</label><input name="franchisee_gst" type="number" value={form.franchisee_gst} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>TDS</label><input name="tds" type="number" value={form.tds} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Amount Received</label><input name="amount_received" type="number" value={form.amount_received} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Amount Due</label><input name="amount_due" type="number" value={form.amount_due} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Date Received</label><input name="date_received" type="date" value={form.date_received?.split("T")[0] || ""} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Paid On Date</label><input name="paid_on_date" type="date" value={form.paid_on_date?.split("T")[0] || ""} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Credit Date</label><input name="credit_date" type="date" value={form.credit_date?.split("T")[0] || ""} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Credit Note No</label><input name="credit_note_no" value={form.credit_note_no} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>SOA Number</label><input name="soa_no" value={form.soa_no} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>Debit Correction</label><input name="debit_correction" type="number" value={form.debit_correction} onChange={handleChange} style={inputStyle} /></div>
                                    <div><label style={labelStyle}>GST Paid Status</label>
                                        <select name="gst_paid_status" value={form.gst_paid_status} onChange={handleChange} style={inputStyle}>
                                            <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option><option value="Unpaid">Unpaid</option>
                                        </select>
                                    </div>
                                    <div><label style={labelStyle}>Tally Updated</label>
                                        <select name="tally_updated" value={form.tally_updated} onChange={handleChange} style={inputStyle}>
                                            <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option>
                                        </select>
                                    </div>
                                    <div><label style={labelStyle}>Remarks</label><input name="remarks" value={form.remarks} onChange={handleChange} style={inputStyle} /></div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                                <button type="button" onClick={handleCancel} style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.05)", color: "#94a3b8", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
                                <button type="submit" style={{ padding: "12px 32px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#22c55e,#10b981)", color: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>{editingId ? "Update Invoice" : "Create Invoice"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invoice Table */}
            <div style={{ borderRadius: "20px", border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)", overflow: "hidden" }}>
                <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "70vh" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["Invoice #", "Client", "Candidate", "Total Amount", "Our Share", "Status", "Due Date", "Financial Year", "Actions"].map(h => (
                                    <th key={h} style={{ padding: "14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap", background: "rgba(255,255,255,.02)", letterSpacing: ".3px", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr><td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "14px" }}>No invoices found. Click "Add Invoice" to create one.</td></tr>
                            ) : invoices.map(inv => {
                                const sc = getStatusColor(inv.status || inv.lifecycle_state);
                                return (
                                    <tr key={inv.id} style={{ transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(55,255,215,.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#f8fafc", fontWeight: "600", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{inv.invoice_number || "N/A"}</td>
                                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#cbd5e1", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{inv.client_name || "N/A"}</td>
                                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#cbd5e1", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{inv.candidate_name || "-"}</td>
                                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#37FFD7", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,.04)" }}>Rs.{formatCurrency(inv.total_amount)}</td>
                                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#37FFD7", borderBottom: "1px solid rgba(255,255,255,.04)" }}>Rs.{formatCurrency(inv.our_share)}</td>
                                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                                            <span style={{ padding: "4px 12px", borderRadius: "8px", background: sc.bg, color: sc.color, fontSize: "11px", fontWeight: "700" }}>{inv.status || inv.lifecycle_state || "N/A"}</span>
                                        </td>
                                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#cbd5e1", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB") : "N/A"}</td>
                                        <td style={{ padding: "12px 14px", fontSize: "13px", color: "#cbd5e1", borderBottom: "1px solid rgba(255,255,255,.04)" }}>{inv.financial_year || "N/A"}</td>
                                        <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button onClick={() => handleEdit(inv)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(55,255,215,.3)", background: "rgba(55,255,215,.1)", color: "#37FFD7", cursor: "pointer" }}><Edit size={14} /></button>
                                                <button onClick={() => handleDelete(inv.id)} style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.1)", color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceManagement;
