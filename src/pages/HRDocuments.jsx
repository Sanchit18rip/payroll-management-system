import { useEffect, useMemo, useState } from "react";
import { apiFetch, API_BASE } from "../api";

const DOCUMENT_TYPES = [
  "Offer Letter",
  "Appointment Letter",
  "Confirmation Letter",
  "Increment Letter",
  "Promotion Letter",
  "Warning Letter",
  "Experience Letter",
  "Relieving Letter",
  "Certificate of Completion",
];

const DEFAULT_TEMPLATES = {
  "Offer Letter": {
    subject: "Offer Letter",
    body: `Date: {{letter_date}}

To,
{{employee_name}}

Subject: Appointment for the position of "{{designation}}"

Dear {{employee_name}},

A warm welcome to the House of Talent Corner, a leading Human Resources Consultancy headquartered in Mumbai. We are pleased to inform you that you have been selected to work with Talent Corner HR Services Pvt. Ltd.

We are pleased to offer you the position of "{{designation}}" in the {{department}} department. Your employment will begin on {{joining_date}}, and your monthly compensation or stipend will be Rs. {{salary}}.

Working hours are 09:30 a.m. to 06:30 p.m. from Monday to Friday and 09:30 a.m. to 05:30 p.m. on Saturday. The 2nd and 4th Saturdays will be off.

Please confirm your acceptance of this offer. We look forward to working with you.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
  "Appointment Letter": {
    subject: "Appointment Letter",
    body: `Date: {{letter_date}}

To,
{{employee_name}}

Subject: Appointment for the post of "{{designation}}"

Dear {{employee_name}},

A warm welcome to the House of Talent Corner, a leading Human Resources Consultancy headquartered in Mumbai. We are pleased to appoint you as "{{designation}}" in the {{department}} department with effect from {{joining_date}}.

Salary and Compensation: Your gross remuneration on appointment will be Rs. {{salary}} per month. Tax deduction and other statutory deductions will be made at source. You will receive the variable amount based on your performance.

The Standard Company Employment Policy and the terms and conditions of your appointment apply. We congratulate you on your appointment and wish you a long and successful career with us.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
  "Confirmation Letter": {
    subject: "Confirmation Letter",
    body: `Date: {{letter_date}}

To,
{{employee_name}}

Subject: Confirmation of Employment

Dear {{employee_name}},

We are pleased to confirm your employment with Talent Corner HR Services Pvt. Ltd. as "{{designation}}" in the {{department}} department.

Your employment is confirmed with effect from {{letter_date}}. The other terms and conditions of your appointment will remain unchanged.

We value your contribution to the organization and look forward to your continued growth and success with us.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
  "Increment Letter": {
    subject: "Salary Increment Letter",
    body: `Date: {{letter_date}}

To,
{{employee_name}}

Subject: Salary Increment Letter

Dear {{employee_name}},

Congratulations!

Consequent to the review of your performance, we are delighted to inform you that your salary has been revised with effect from {{letter_date}}. Your revised monthly compensation is Rs. {{salary}}.

The other terms and conditions of your Appointment Letter will remain unchanged. We hope your performance will continue to grow and contribute to the success of the organization.

Congratulations once again on this achievement, and we wish you continued success in the years ahead.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
  "Promotion Letter": {
    subject: "Letter of Promotion",
    body: `Date: {{letter_date}}

To,
{{employee_name}}

Subject: Promotion to the post of "{{designation}}"

Dear {{employee_name}},

Congratulations!

We are pleased and honoured to inform you that you have been promoted to "{{designation}}" in Talent Corner HR Services Pvt. Ltd. with effect from {{letter_date}}.

This is a position you have earned through merit and your contribution to the organization. We have complete faith in your abilities to execute the responsibilities of this role. The Standard Company Employment Policy remains as written in your Appointment Letter, and your revised compensation is Rs. {{salary}}.

Congratulations once again on this achievement. We wish you every success in the years ahead.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
  "Warning Letter": {
    subject: "Warning Letter",
    body: `Date: {{letter_date}}

To,
{{employee_name}}

Subject: Warning Letter

Dear {{employee_name}},

This letter serves as a formal warning regarding the matter discussed with you. You are required to address this issue immediately and to ensure that it is not repeated.

Please treat this communication seriously. Further instances may lead to action in accordance with the Standard Company Employment Policy.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
  "Experience Letter": {
    subject: "Experience Letter",
    body: `Date: {{letter_date}}

To Whomsoever It May Concern

This is to certify that {{employee_name}} was employed with Talent Corner HR Services Pvt. Ltd. as "{{designation}}" in the {{department}} department from {{joining_date}} to {{letter_date}}.

During this tenure, {{employee_name}} consistently demonstrated a strong work ethic and efficiency, and proved to be a valuable asset to the company. {{employee_name}} was highly motivated, duty-bound, and a dedicated team member. Their positive attitude and collaborative spirit fostered a strong work environment.

We are grateful for {{employee_name}}'s contributions to our company and wish them all the best in their future endeavours. We have no doubt they will continue to achieve great success.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
  "Relieving Letter": {
    subject: "Relieving Letter",
    body: `Date: {{letter_date}}

To,
{{employee_name}}

Subject: Relieving Letter

Dear {{employee_name}},

With reference to your resignation, we wish to inform you that it has been accepted and you are being relieved from the services of Talent Corner HR Services Pvt. Ltd. from the position of "{{designation}}" with effect from {{letter_date}}.

During your tenure from {{joining_date}} to {{letter_date}}, your contributions to the organization have been highly appreciated.

We hereby confirm that {{employee_name}} has no outstanding dues and has cleared all financial and contractual obligations with the company.

We wish you the very best of luck in your future endeavours.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
  "Certificate of Completion": {
    subject: "Certificate of Completion",
    body: `Certificate of Completion

This is to certify that {{employee_name}} has successfully completed an internship with Talent Corner HR Services Pvt. Ltd. as "{{designation}}" from {{joining_date}} to {{letter_date}}. During this period, {{employee_name}} was engaged in various projects and tasks assigned by the company.

Through hard work, dedication and enthusiasm, {{employee_name}} made significant contributions to the company. Their exemplary work ethic, punctuality and professional conduct were highly valued by the company.

{{employee_name}} demonstrated a high level of competence and an eagerness to learn throughout the internship. We are proud to have had them as part of the team and wish them all the best.

Cordially,
For Talent Corner HR Services Pvt. Ltd.
HR Department`,
  },
};

/* ───────────────────────────────────────────────────
   Light theme styles for the HR documents page.
   light is its complete counterpart.
   ─────────────────────────────────────────────────── */
function getStyles() {
  return {
    page: {
      minHeight: "100vh",
      padding: "30px",
      background: "#f8fafc",
      color: "#1e293b",
      boxSizing: "border-box",
    },

    eyebrow: {
      color: "#0891b2",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "1.5px",
      marginBottom: "7px",
    },

    title: {
      margin: 0,
      fontSize: "30px",
      letterSpacing: "-0.5px",
      color: "#0f172a",
      fontWeight: "750",
      textShadow: "none",
    },

    subtitle: {
      color: "#64748b",
      margin: "8px 0 0",
    },

    statCard: {
      position: "relative",
      overflow: "hidden",
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "18px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      boxShadow: "0 1px 3px rgba(0,0,0,.06)",
    },

    statIcon: {
      width: "44px",
      height: "44px",
      display: "grid",
      placeItems: "center",
      borderRadius: "13px",
      background: "#f0fdfa",
      fontSize: "21px",
    },

    statLabel: {
      color: "#64748b",
      fontSize: "13px",
      marginBottom: "4px",
    },

    statValue: {
      fontSize: "25px",
      fontWeight: "750",
      color: "#0f172a",
    },

    section: {
      position: "relative",
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "24px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,.06)",
    },

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },

    sectionTitle: {
      margin: 0,
      fontSize: "20px",
      letterSpacing: ".2px",
      color: "#0f172a",
    },

    sectionDesc: {
      margin: "6px 0 0",
      color: "#64748b",
      fontSize: "13px",
    },

    baseInput: {
      width: "100%",
      padding: "12px 13px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      background: "#ffffff",
      color: "#1e293b",
      outline: "none",
      boxSizing: "border-box",
    },

    searchInput: {
      minWidth: "260px",
    },

    employeeGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))",
      gap: "14px",
    },

    employeeCard: {
      display: "flex",
      alignItems: "center",
      gap: "13px",
      padding: "16px",
      background: "#f9fafb",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
    },

    avatar: {
      width: "43px",
      height: "43px",
      minWidth: "43px",
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(135deg, #0891b2, #0284c7)",
      color: "#ffffff",
      fontWeight: "750",
    },

    employeeName: {
      margin: "0 0 4px",
      fontSize: "15px",
      color: "#0f172a",
    },

    employeeMeta: {
      margin: "3px 0",
      color: "#64748b",
      fontSize: "12px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    templateGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
      gap: "12px",
    },

    templateCard: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "15px",
      background: "#f9fafb",
      border: "1px solid #e2e8f0",
      borderRadius: "15px",
    },

    templateIcon: {
      fontSize: "21px",
    },

    templateTitle: {
      margin: 0,
      fontSize: "14px",
      color: "#0f172a",
    },

    templatePreview: {
      margin: "5px 0 0",
      color: "#94a3b8",
      fontSize: "12px",
    },

    variablesBox: {
      marginTop: "18px",
      padding: "15px",
      borderRadius: "14px",
      background: "#f1f5f9",
      border: "1px solid #e2e8f0",
    },

    variableList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "7px",
      marginTop: "10px",
    },

    variableChip: {
      padding: "5px 8px",
      borderRadius: "7px",
      background: "#e0f2fe",
      color: "#0369a1",
      fontSize: "12px",
      fontWeight: "600",
    },

    hintText: {
      color: "#64748b",
      fontSize: "12px",
      lineHeight: 1.5,
      margin: "10px 0 0",
    },

    th: {
      padding: "13px",
      borderBottom: "1px solid #e2e8f0",
      color: "#64748b",
      fontSize: "12px",
      textAlign: "left",
      whiteSpace: "nowrap",
    },

    td: {
      padding: "14px 13px",
      borderBottom: "1px solid #e2e8f0",
      fontSize: "13px",
      color: "#1e293b",
    },

    input: {
      marginBottom: "16px",
    },

    editor: {
      minHeight: "280px",
      resize: "vertical",
      lineHeight: 1.6,
      fontFamily: "inherit",
      marginBottom: "5px",
    },

    primaryBtn: {
      padding: "11px 16px",
      border: "none",
      borderRadius: "10px",
      background: "linear-gradient(135deg, #0891b2, #0284c7)",
      color: "#ffffff",
      cursor: "pointer",
      fontWeight: "650",
      whiteSpace: "nowrap",
    },

    smallPrimaryBtn: {
      padding: "9px 11px",
      fontSize: "12px",
    },

    secondaryBtn: {
      padding: "10px 14px",
      border: "1px solid #d1d5db",
      borderRadius: "10px",
      background: "#ffffff",
      color: "#475569",
      cursor: "pointer",
      fontWeight: "600",
      whiteSpace: "nowrap",
    },

    dangerBtn: {
      padding: "7px 10px",
      border: "none",
      borderRadius: "8px",
      background: "#ef4444",
      color: "#ffffff",
      cursor: "pointer",
      fontSize: "12px",
    },

    alertError: {
      padding: "12px 15px",
      marginBottom: "18px",
      borderRadius: "12px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
    },

    alertSuccess: {
      padding: "12px 15px",
      marginBottom: "18px",
      borderRadius: "12px",
      background: "#f0fdf4",
      border: "1px solid #bbf7d0",
      color: "#16a34a",
    },

    emptyState: {
      padding: "35px",
      textAlign: "center",
      color: "#94a3b8",
      background: "#f9fafb",
      borderRadius: "14px",
    },

    recipientBox: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      gap: "12px",
      padding: "14px",
      marginBottom: "18px",
      background: "#f1f5f9",
      border: "1px solid #e2e8f0",
      borderRadius: "13px",
    },

    fieldCaption: {
      display: "block",
      color: "#94a3b8",
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: "1px",
      marginBottom: "5px",
    },

    label: {
      display: "block",
      color: "#334155",
      fontSize: "13px",
      fontWeight: "650",
      marginBottom: "8px",
    },

    strongText: {
      color: "#0f172a",
    },

    modalBackdrop: {
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "rgba(15,23,42,.45)",
      backdropFilter: "blur(6px)",
    },

    modal: {
      width: "100%",
      maxHeight: "90vh",
      overflowY: "auto",
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "20px",
      boxShadow: "0 25px 70px rgba(0,0,0,.15)",
    },

    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 22px",
      borderBottom: "1px solid #e2e8f0",
    },

    modalTitle: {
      margin: 0,
      fontSize: "20px",
      color: "#0f172a",
    },

    closeBtn: {
      width: "34px",
      height: "34px",
      border: "1px solid #d1d5db",
      borderRadius: "9px",
      background: "#f9fafb",
      color: "#64748b",
      fontSize: "22px",
      lineHeight: 1,
      cursor: "pointer",
    },

    modalContent: {
      padding: "22px",
    },

    modalActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "20px",
    },
  };
}

/* ── Badge colours (light theme) ── */
function badgeColors(normalized) {
  const isSent = ["sent", "uploaded", "delivered"].includes(normalized);
  const isPending = ["pending", "draft"].includes(normalized);
  return {
    background: isSent ? "#dcfce7" : isPending ? "#fef3c7" : "#fee2e2",
    color: isSent ? "#16a34a" : isPending ? "#d97706" : "#dc2626",
  };
}

/* ════════════════════════════════════════════════════ */

function HRDocuments() {
  const s = getStyles();

  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [showSendModal, setShowSendModal] = useState(false);

  const [subject, setSubject] = useState("");
  const [letterBody, setLetterBody] = useState("");

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateType, setTemplateType] = useState("Offer Letter");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getEmployeeName = (employee) =>
    employee?.name ||
    employee?.full_name ||
    employee?.employee_name ||
    [employee?.first_name, employee?.last_name].filter(Boolean).join(" ") ||
    "Employee";

  const getEmployeeEmail = (employee) =>
    employee?.email ||
    employee?.work_email ||
    employee?.company_email ||
    "";

  const getEmployeeValue = (employee, keys, fallback = "") => {
    for (const key of keys) {
      if (
        employee?.[key] !== undefined &&
        employee?.[key] !== null &&
        employee?.[key] !== ""
      ) {
        return employee[key];
      }
    }
    return fallback;
  };

  const replaceVariables = (text, employee) => {
    const values = {
      employee_name: getEmployeeName(employee),
      name: getEmployeeName(employee),
      email: getEmployeeEmail(employee),
      employee_code: getEmployeeValue(
        employee,
        ["employee_code", "employeeCode", "code"],
        ""
      ),
      designation: getEmployeeValue(
        employee,
        ["designation", "position", "job_title", "jobTitle"],
        ""
      ),
      department: getEmployeeValue(
        employee,
        ["department", "department_name"],
        ""
      ),
      joining_date: getEmployeeValue(
        employee,
        ["joining_date", "joiningDate", "date_of_joining"],
        ""
      ),
      letter_date: new Date().toLocaleDateString("en-GB"),
      salary: getEmployeeValue(
        employee,
        ["salary", "basic_salary", "monthly_salary"],
        ""
      ),
    };

    return text.replace(
      /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
      (match, key) =>
        values[key] !== undefined && values[key] !== ""
          ? String(values[key])
          : match
    );
  };

  const loadEmployees = async () => {
    const response = await apiFetch(`${API_BASE}/api/employees`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Unable to load employees");
    }

    setEmployees(Array.isArray(data) ? data : data?.employees || []);
  };

  const loadDocuments = async () => {
    const response = await apiFetch(`${API_BASE}/api/hr-documents`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Unable to load HR documents");
    }

    setDocuments(Array.isArray(data) ? data : data?.documents || []);
  };

  const loadTemplates = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/hr-documents/templates`);
      if (!response.ok) return;

      const data = await response.json();

      if (Array.isArray(data)) {
        const mapped = { ...DEFAULT_TEMPLATES };
        data.forEach((template) => {
          if (template.document_type) {
            mapped[template.document_type] = {
              subject: template.subject || template.document_type,
              body: template.body || "",
            };
          }
        });
        setTemplates(mapped);
      } else if (data?.templates) {
        setTemplates({
          ...DEFAULT_TEMPLATES,
          ...data.templates,
        });
      }
    } catch {
      // Templates are still usable through the local defaults.
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadEmployees(),
        loadDocuments(),
        loadTemplates(),
      ]);
    } catch (err) {
      console.error("HR Documents loading failed:", err);
      setError(err.message || "Unable to load HR Documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openSendModal = (employee) => {
    setSelectedEmployee(employee);
    setSelectedDocumentType("");
    setSubject("");
    setLetterBody("");
    setError("");
    setSuccess("");
    setShowSendModal(true);
  };

  const applyTemplate = (type, employee = selectedEmployee) => {
    const template = templates[type] || DEFAULT_TEMPLATES[type];

    setSelectedDocumentType(type);
    setSubject(replaceVariables(template?.subject || type, employee));
    setLetterBody(replaceVariables(template?.body || "", employee));
  };

  const handleDocumentTypeChange = (type) => {
    applyTemplate(type);
  };

  const sendLetter = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee.");
      return;
    }

    const email = getEmployeeEmail(selectedEmployee);

    if (!email) {
      setError("This employee does not have an email address.");
      return;
    }

    if (!selectedDocumentType) {
      setError("Please select a letter type.");
      return;
    }

    if (!subject.trim() || !letterBody.trim()) {
      setError("Subject and letter content are required.");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(`${API_BASE}/api/hr-documents/send`, {
        method: "POST",
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          document_type: selectedDocumentType,
          recipient_email: email,
          subject: subject.trim(),
          content: letterBody,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to send the letter."
        );
      }

      setSuccess(
        `Letter sent successfully to ${email}.`
      );

      await loadDocuments();

      setTimeout(() => {
        setShowSendModal(false);
        setSuccess("");
      }, 1200);
    } catch (err) {
      console.error("Send letter failed:", err);
      setError(
        err.message ||
          "Unable to send the letter. Please check the backend email route."
      );
    } finally {
      setSending(false);
    }
  };

  const openTemplateEditor = (type = "Offer Letter") => {
    const template = templates[type] || DEFAULT_TEMPLATES[type];

    setTemplateType(type);
    setTemplateSubject(template?.subject || "");
    setTemplateBody(template?.body || "");
    setError("");
    setShowTemplateModal(true);
  };

  const saveTemplate = async () => {
    if (!templateType || !templateSubject.trim() || !templateBody.trim()) {
      setError("Template type, subject and body are required.");
      return;
    }

    setSavingTemplate(true);
    setError("");

    const updatedTemplate = {
      subject: templateSubject.trim(),
      body: templateBody,
    };

    setTemplates((current) => ({
      ...current,
      [templateType]: updatedTemplate,
    }));

    try {
      const response = await apiFetch(
        `${API_BASE}/api/hr-documents/templates`,
        {
          method: "POST",
          body: JSON.stringify({
            document_type: templateType,
            subject: updatedTemplate.subject,
            body: updatedTemplate.body,
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(
          result?.message ||
            "Template was saved locally, but the server could not save it."
        );
      }

      setSuccess("Template saved successfully.");
      setShowTemplateModal(false);
    } catch (err) {
      console.error("Save template failed:", err);
      setError(err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this HR document record?")) return;

    try {
      const response = await apiFetch(
        `${API_BASE}/api/hr-documents/${id}`,
        { method: "DELETE" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to delete document."
        );
      }

      setDocuments((current) =>
        current.filter((doc) => doc.id !== id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete document.");
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      if (!query) return true;

      const name = getEmployeeName(employee).toLowerCase();
      const email = getEmployeeEmail(employee).toLowerCase();
      const code = String(
        getEmployeeValue(employee, ["employee_code", "employeeCode", "code"], "")
      ).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        code.includes(query)
      );
    });
  }, [employees, searchTerm]);

  const normalizeStatus = (value) => {
    const v = String(value || "").toLowerCase();
    if (["sent", "uploaded", "delivered"].includes(v)) return "Sent";
    if (["pending", "draft", "not uploaded"].includes(v)) return "Pending";
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : "Pending";
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const name = String(
        doc.name || doc.employee_name || ""
      ).toLowerCase();

      const matchesSearch = name.includes(
        searchTerm.trim().toLowerCase()
      );

      const matchesStatus =
        statusFilter === "All" ||
        normalizeStatus(doc.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  const sentDocuments = documents.filter(
    (doc) => normalizeStatus(doc.status) === "Sent"
  ).length;

  const pendingDocuments = documents.filter(
    (doc) => normalizeStatus(doc.status) === "Pending"
  ).length;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  /* ── Merged input style (base + per-use) ── */
  const makeInput = (extra) => ({ ...s.baseInput, ...extra });
  const inputS = makeInput(s.input);
  const editorS = makeInput(s.editor);
  const searchS = makeInput(s.searchInput);
  const primaryBtn = (extra) => ({ ...s.primaryBtn, ...extra });
  const secondaryBtn = (extra) => ({ ...s.secondaryBtn, ...extra });

  return (
    <div style={s.page}>
      <div style={headerRow}>
        <div>
          <div style={s.eyebrow}>HR COMMUNICATION</div>
          <h1 style={s.title}>HR Documents & Letters</h1>
          <p style={s.subtitle}>
            Send personalised HR letters directly to employees.
          </p>
        </div>

        <button
          style={s.primaryBtn}
          onClick={() => openTemplateEditor()}
        >
          ✎ Manage Templates
        </button>
      </div>

      {error && (
        <div style={s.alertError} role="alert">
          ⚠ {error}
        </div>
      )}

      {success && (
        <div style={s.alertSuccess} role="status">
          ✓ {success}
        </div>
      )}

      <div style={statsGrid}>
        <StatCard
          label="Employees"
          value={employees.length}
          icon="👥"
          s={s}
        />
        <StatCard
          label="Letters Sent"
          value={sentDocuments}
          icon="✉️"
          s={s}
        />
        <StatCard
          label="Pending / Draft"
          value={pendingDocuments}
          icon="⏳"
          s={s}
        />
        <StatCard
          label="Templates"
          value={Object.keys(templates).length}
          icon="📄"
          s={s}
        />
      </div>

      <section style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={s.sectionTitle}>Employees</h2>
            <p style={s.sectionDesc}>
              Select an employee to prepare and send a letter.
            </p>
          </div>

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email or employee code..."
            style={searchS}
          />
        </div>

        {loading ? (
          <div style={s.emptyState}>Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div style={s.emptyState}>No employees found.</div>
        ) : (
          <div style={s.employeeGrid}>
            {filteredEmployees.map((employee) => {
              const name = getEmployeeName(employee);
              const email = getEmployeeEmail(employee);

              return (
                <div key={employee.id} style={s.employeeCard}>
                  <div style={s.avatar}>
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={s.employeeName}>{name}</h3>
                    <p style={s.employeeMeta}>
                      {email || "No email address"}
                    </p>
                    <p style={s.employeeMeta}>
                      {getEmployeeValue(
                        employee,
                        ["designation", "position", "job_title"],
                        "Designation not set"
                      )}
                    </p>
                  </div>

                  <button
                    style={primaryBtn(s.smallPrimaryBtn)}
                    onClick={() => openSendModal(employee)}
                    disabled={!email}
                    title={
                      email
                        ? "Send a letter"
                        : "Employee has no email address"
                    }
                  >
                    ✉ Send Letter
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={s.sectionTitle}>Letter Templates</h2>
            <p style={s.sectionDesc}>
              Edit the standard format used when sending letters.
            </p>
          </div>
        </div>

        <div style={s.templateGrid}>
          {DOCUMENT_TYPES.map((type) => (
            <div key={type} style={s.templateCard}>
              <div style={s.templateIcon}>📄</div>
              <div style={{ flex: 1 }}>
                <h3 style={s.templateTitle}>{type}</h3>
                <p style={s.templatePreview}>
                  {templates[type]?.subject || type}
                </p>
              </div>

              <button
                style={secondaryBtn()}
                onClick={() => openTemplateEditor(type)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        <div style={s.variablesBox}>
          <strong style={s.strongText}>Available placeholders</strong>
          <div style={s.variableList}>
            {[
              "{{employee_name}}",
              "{{employee_code}}",
              "{{designation}}",
              "{{department}}",
              "{{email}}",
              "{{joining_date}}",
              "{{letter_date}}",
              "{{salary}}",
            ].map((variable) => (
              <code key={variable} style={s.variableChip}>
                {variable}
              </code>
            ))}
          </div>
          <p style={s.hintText}>
            Placeholders are automatically replaced when an employee is
            selected. You can still manually edit the final letter before
            sending.
          </p>
        </div>
      </section>

      <section style={s.section}>
        <div style={s.sectionHeader}>
          <div>
            <h2 style={s.sectionTitle}>Sent Documents</h2>
            <p style={s.sectionDesc}>
              Records of letters sent or prepared for each employee.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputS, width: "150px" }}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Sent">Sent</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div style={s.emptyState}>Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <div style={s.emptyState}>
            {documents.length === 0
              ? "No HR documents yet. Send a letter to get started."
              : "No documents match the current filter."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={s.th}>Employee</th>
                  <th style={s.th}>Document</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Date</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td style={s.td}>
                      <strong style={s.strongText}>
                        {doc.name || doc.employee_name || "Employee"}
                      </strong>
                    </td>
                    <td style={s.td}>{doc.document_type || "Letter"}</td>
                    <td style={s.td}>
                      <StatusBadge status={normalizeStatus(doc.status)} />
                    </td>
                    <td style={s.td}>
                      {formatDate(doc.upload_date || doc.created_at || doc.sent_at)}
                    </td>
                    <td style={{ ...s.td, textAlign: "right" }}>
                      <button
                        style={s.dangerBtn}
                        onClick={() => deleteDocument(doc.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showSendModal && selectedEmployee && (
        <Modal
          title="Send HR Letter"
          onClose={() => {
            if (!sending) setShowSendModal(false);
          }}
          wide
          s={s}
        >
          <div style={s.recipientBox}>
            <div>
              <span style={s.fieldCaption}>EMPLOYEE</span>
              <strong style={s.strongText}>
                {getEmployeeName(selectedEmployee)}
              </strong>
            </div>

            <div>
              <span style={s.fieldCaption}>EMAIL</span>
              <strong style={s.strongText}>
                {getEmployeeEmail(selectedEmployee)}
              </strong>
            </div>
          </div>

          <label style={s.label}>Letter Type</label>

          <select
            value={selectedDocumentType}
            onChange={(e) => handleDocumentTypeChange(e.target.value)}
            style={inputS}
          >
            <option value="">Select a letter</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label style={s.label}>Subject</label>

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            style={inputS}
          />

          <label style={s.label}>Letter Content</label>

          <textarea
            value={letterBody}
            onChange={(e) => setLetterBody(e.target.value)}
            placeholder="Select a letter template or write your letter..."
            style={editorS}
          />

          <p style={s.hintText}>
            You can edit the automatically filled details before sending.
          </p>

          <div style={s.modalActions}>
            <button
              style={secondaryBtn()}
              onClick={() => setShowSendModal(false)}
              disabled={sending}
            >
              Cancel
            </button>

            <button
              style={s.primaryBtn}
              onClick={sendLetter}
              disabled={sending}
            >
              {sending ? "Sending..." : "✉ Send Letter"}
            </button>
          </div>
        </Modal>
      )}

      {showTemplateModal && (
        <Modal
          title="Manage Letter Template"
          onClose={() => {
            if (!savingTemplate) setShowTemplateModal(false);
          }}
          wide
          s={s}
        >
          <label style={s.label}>Letter Type</label>

          <select
            value={templateType}
            onChange={(e) => {
              const type = e.target.value;
              const template =
                templates[type] || DEFAULT_TEMPLATES[type];

              setTemplateType(type);
              setTemplateSubject(template?.subject || type);
              setTemplateBody(template?.body || "");
            }}
            style={inputS}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label style={s.label}>Email Subject</label>

          <input
            value={templateSubject}
            onChange={(e) => setTemplateSubject(e.target.value)}
            style={inputS}
          />

          <label style={s.label}>Template Content</label>

          <textarea
            value={templateBody}
            onChange={(e) => setTemplateBody(e.target.value)}
            style={editorS}
          />

          <div style={s.variablesBox}>
            <strong style={s.strongText}>Placeholders</strong>
            <p style={s.hintText}>Use these in your template:</p>

            <div style={s.variableList}>
              {[
                "{{employee_name}}",
                "{{employee_code}}",
                "{{designation}}",
                "{{department}}",
                "{{email}}",
                "{{joining_date}}",
                "{{letter_date}}",
                "{{salary}}",
              ].map((variable) => (
                <code key={variable} style={s.variableChip}>
                  {variable}
                </code>
              ))}
            </div>
          </div>

          <div style={s.modalActions}>
            <button
              style={secondaryBtn()}
              onClick={() => setShowTemplateModal(false)}
              disabled={savingTemplate}
            >
              Cancel
            </button>

            <button
              style={s.primaryBtn}
              onClick={saveTemplate}
              disabled={savingTemplate}
            >
              {savingTemplate ? "Saving..." : "Save Template"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, icon, s }) {
  return (
    <div style={s.statCard}>
      <div style={s.statIcon}>{icon}</div>
      <div>
        <div style={s.statLabel}>{label}</div>
        <div style={s.statValue}>{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status).toLowerCase();
  const colors = badgeColors(normalized);

  return (
    <span style={{ display: "inline-block", padding: "5px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", ...colors }}>
      {status}
    </span>
  );
}

function Modal({ title, children, onClose, wide = false, s }) {
  return (
    <div style={s.modalBackdrop} onMouseDown={onClose}>
      <div
        style={{
          ...s.modal,
          maxWidth: wide ? "850px" : "600px",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>{title}</h2>

          <button
            type="button"
            style={s.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={s.modalContent}>{children}</div>
      </div>
    </div>
  );
}

/* ── Static layout styles (no color, same for both themes) ── */

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "28px",
  flexWrap: "wrap",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: "16px",
  marginBottom: "24px",
};

export default HRDocuments;
