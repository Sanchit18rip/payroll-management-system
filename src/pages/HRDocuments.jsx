import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";

const API = "https://payroll-management-system-five-brown.vercel.app/api";

const DOCUMENT_TYPES = [
  "Offer Letter",
  "Appointment Letter",
  "Confirmation Letter",
  "Increment Letter",
  "Promotion Letter",
  "Warning Letter",
  "Experience Letter",
  "Relieving Letter",
];

const DEFAULT_TEMPLATES = {
  "Offer Letter": {
    subject: "Offer Letter",
    body: `Dear {{employee_name}},

We are pleased to offer you the position of {{designation}} at our organization.

Your joining date is {{joining_date}}.

We look forward to having you as part of our team.

Regards,
HR Department`,
  },
  "Appointment Letter": {
    subject: "Appointment Letter",
    body: `Dear {{employee_name}},

We are pleased to confirm your appointment as {{designation}} in the {{department}} department.

Your date of joining is {{joining_date}}.

Regards,
HR Department`,
  },
  "Confirmation Letter": {
    subject: "Confirmation Letter",
    body: `Dear {{employee_name}},

We are pleased to confirm your employment with the organization.

Designation: {{designation}}
Department: {{department}}

Regards,
HR Department`,
  },
  "Increment Letter": {
    subject: "Salary Increment Letter",
    body: `Dear {{employee_name}},

We are pleased to inform you that your compensation has been revised.

Your revised salary is {{salary}}.

Regards,
HR Department`,
  },
  "Promotion Letter": {
    subject: "Promotion Letter",
    body: `Dear {{employee_name}},

We are pleased to inform you that you have been promoted.

Your current designation is {{designation}}.

Congratulations on your achievement.

Regards,
HR Department`,
  },
  "Warning Letter": {
    subject: "Warning Letter",
    body: `Dear {{employee_name}},

This letter serves as a formal warning regarding the matter discussed with you.

Please ensure that the issue is addressed promptly.

Regards,
HR Department`,
  },
  "Experience Letter": {
    subject: "Experience Letter",
    body: `Dear {{employee_name}},

This is to certify that {{employee_name}} has been associated with our organization as {{designation}} in the {{department}} department.

We wish you success in your future endeavors.

Regards,
HR Department`,
  },
  "Relieving Letter": {
    subject: "Relieving Letter",
    body: `Dear {{employee_name}},

This is to confirm that you have been relieved from your duties with the organization.

We thank you for your contribution and wish you success in your future endeavors.

Regards,
HR Department`,
  },
};

function HRDocuments() {
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
    const response = await apiFetch(`${API}/employees`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Unable to load employees");
    }

    setEmployees(Array.isArray(data) ? data : data?.employees || []);
  };

  const loadDocuments = async () => {
    const response = await apiFetch(`${API}/hr-documents`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Unable to load HR documents");
    }

    setDocuments(Array.isArray(data) ? data : data?.documents || []);
  };

  const loadTemplates = async () => {
    try {
      const response = await apiFetch(`${API}/hr-documents/templates`);
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
      const response = await apiFetch(`${API}/hr-documents/send`, {
  method: "POST",
  body: JSON.stringify({
    employeeEmail: email,
    employeeName: getEmployeeName(selectedEmployee),
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
        `${API}/hr-documents/templates`,
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
        `${API}/hr-documents/${id}`,
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

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const name = String(
        doc.name || doc.employee_name || ""
      ).toLowerCase();

      const matchesSearch = name.includes(
        searchTerm.trim().toLowerCase()
      );

      const status = doc.status || "Sent";

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  const sentDocuments = documents.filter(
    (doc) => (doc.status || "").toLowerCase() === "sent"
  ).length;

  const pendingDocuments = documents.filter(
    (doc) =>
      ["pending", "not uploaded", "draft"].includes(
        String(doc.status || "").toLowerCase()
      )
  ).length;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <div style={eyebrow}>HR COMMUNICATION</div>
          <h1 style={titleStyle}>HR Documents & Letters</h1>
          <p style={subtitleStyle}>
            Send personalised HR letters directly to employees.
          </p>
        </div>

        <button
          style={primaryButton}
          onClick={() => openTemplateEditor()}
        >
          ✎ Manage Templates
        </button>
      </div>

      {error && (
        <div style={alertError} role="alert">
          ⚠ {error}
        </div>
      )}

      {success && (
        <div style={alertSuccess} role="status">
          ✓ {success}
        </div>
      )}

      <div style={statsGrid}>
        <StatCard
          label="Employees"
          value={employees.length}
          icon="👥"
        />
        <StatCard
          label="Letters Sent"
          value={sentDocuments}
          icon="✉️"
        />
        <StatCard
          label="Pending / Draft"
          value={pendingDocuments}
          icon="⏳"
        />
        <StatCard
          label="Templates"
          value={Object.keys(templates).length}
          icon="📄"
        />
      </div>

      <section style={sectionStyle}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>Employees</h2>
            <p style={sectionDescription}>
              Select an employee to prepare and send a letter.
            </p>
          </div>

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email or employee code..."
            style={searchInput}
          />
        </div>

        {loading ? (
          <div style={emptyState}>Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div style={emptyState}>
            No employees found.
          </div>
        ) : (
          <div style={employeeGrid}>
            {filteredEmployees.map((employee) => {
              const name = getEmployeeName(employee);
              const email = getEmployeeEmail(employee);

              return (
                <div
                  key={employee.id}
                  style={employeeCard}
                >
                  <div style={avatar}>
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={employeeName}>{name}</h3>

                    <p style={employeeMeta}>
                      {email || "No email address"}
                    </p>

                    <p style={employeeMeta}>
                      {getEmployeeValue(
                        employee,
                        ["designation", "position", "job_title"],
                        "Designation not set"
                      )}
                    </p>
                  </div>

                  <button
                    style={smallPrimaryButton}
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

      <section style={sectionStyle}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>Letter Templates</h2>
            <p style={sectionDescription}>
              Edit the standard format used when sending letters.
            </p>
          </div>
        </div>

        <div style={templateGrid}>
          {DOCUMENT_TYPES.map((type) => (
            <div key={type} style={templateCard}>
              <div style={templateIcon}>📄</div>
              <div style={{ flex: 1 }}>
                <h3 style={templateTitle}>{type}</h3>
                <p style={templatePreview}>
                  {templates[type]?.subject || type}
                </p>
              </div>

              <button
                style={secondaryButton}
                onClick={() => openTemplateEditor(type)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        <div style={variablesBox}>
          <strong>Available placeholders</strong>
          <div style={variableList}>
            {[
              "{{employee_name}}",
              "{{employee_code}}",
              "{{designation}}",
              "{{department}}",
              "{{email}}",
              "{{joining_date}}",
              "{{salary}}",
            ].map((variable) => (
              <code key={variable} style={variableChip}>
                {variable}
              </code>
            ))}
          </div>
          <p style={hintText}>
            Placeholders are automatically replaced when an employee is
            selected. You can still manually edit the final letter before
            sending.
          </p>
        </div>
      </section>



      {showSendModal && selectedEmployee && (
        <Modal
          title="Send HR Letter"
          onClose={() => {
            if (!sending) setShowSendModal(false);
          }}
          wide
        >
          <div style={recipientBox}>
            <div>
              <span style={fieldCaption}>EMPLOYEE</span>
              <strong>{getEmployeeName(selectedEmployee)}</strong>
            </div>

            <div>
              <span style={fieldCaption}>EMAIL</span>
              <strong>
                {getEmployeeEmail(selectedEmployee)}
              </strong>
            </div>
          </div>

          <label style={labelStyle}>
            Letter Type
          </label>

          <select
            value={selectedDocumentType}
            onChange={(e) =>
              handleDocumentTypeChange(e.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              Select a letter
            </option>

            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label style={labelStyle}>
            Subject
          </label>

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            style={inputStyle}
          />

          <label style={labelStyle}>
            Letter Content
          </label>

          <textarea
            value={letterBody}
            onChange={(e) =>
              setLetterBody(e.target.value)
            }
            placeholder="Select a letter template or write your letter..."
            style={editorStyle}
          />

          <p style={hintText}>
            You can edit the automatically filled details before
            sending.
          </p>

          <div style={modalActions}>
            <button
              style={secondaryButton}
              onClick={() => setShowSendModal(false)}
              disabled={sending}
            >
              Cancel
            </button>

            <button
              style={primaryButton}
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
        >
          <label style={labelStyle}>
            Letter Type
          </label>

          <select
            value={templateType}
            onChange={(e) => {
              const type = e.target.value;
              const template =
                templates[type] || DEFAULT_TEMPLATES[type];

              setTemplateType(type);
              setTemplateSubject(
                template?.subject || type
              );
              setTemplateBody(template?.body || "");
            }}
            style={inputStyle}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label style={labelStyle}>
            Email Subject
          </label>

          <input
            value={templateSubject}
            onChange={(e) =>
              setTemplateSubject(e.target.value)
            }
            style={inputStyle}
          />

          <label style={labelStyle}>
            Template Content
          </label>

          <textarea
            value={templateBody}
            onChange={(e) =>
              setTemplateBody(e.target.value)
            }
            style={editorStyle}
          />

          <div style={variablesBox}>
            <strong>Placeholders</strong>
            <p style={hintText}>
              Use these in your template:
            </p>

            <div style={variableList}>
              {[
                "{{employee_name}}",
                "{{employee_code}}",
                "{{designation}}",
                "{{department}}",
                "{{email}}",
                "{{joining_date}}",
                "{{salary}}",
              ].map((variable) => (
                <code key={variable} style={variableChip}>
                  {variable}
                </code>
              ))}
            </div>
          </div>

          <div style={modalActions}>
            <button
              style={secondaryButton}
              onClick={() => setShowTemplateModal(false)}
              disabled={savingTemplate}
            >
              Cancel
            </button>

            <button
              style={primaryButton}
              onClick={saveTemplate}
              disabled={savingTemplate}
            >
              {savingTemplate
                ? "Saving..."
                : "Save Template"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={statCard}>
      <div style={statIcon}>{icon}</div>
      <div>
        <div style={statLabel}>{label}</div>
        <div style={statValue}>{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status).toLowerCase();

  const success = ["sent", "uploaded", "delivered"].includes(
    normalized
  );

  const warning = ["pending", "draft"].includes(normalized);

  return (
    <span
      style={{
        ...statusBadge,
        background: success
          ? "rgba(34,197,94,.15)"
          : warning
            ? "rgba(245,158,11,.15)"
            : "rgba(239,68,68,.15)",
        color: success
          ? "#86efac"
          : warning
            ? "#fcd34d"
            : "#fca5a5",
      }}
    >
      {status}
    </span>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div style={modalBackdrop} onMouseDown={onClose}>
      <div
        style={{
          ...modal,
          maxWidth: wide ? "850px" : "600px",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={modalHeader}>
          <h2 style={modalTitle}>{title}</h2>

          <button
            type="button"
            style={closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={modalContent}>{children}</div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "30px",
  background: "radial-gradient(circle at 85% 5%, rgba(55,255,215,.08), transparent 28%), radial-gradient(circle at 10% 90%, rgba(0,229,255,.06), transparent 30%), #070b12",
  color: "#e6f7ff",
  boxSizing: "border-box",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "28px",
  flexWrap: "wrap",
};

const eyebrow = {
  color: "#37FFD7",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  marginBottom: "7px",
};

const titleStyle = {
  margin: 0,
  fontSize: "30px",
  letterSpacing: "-0.5px",
  textShadow: "0 0 24px rgba(55,255,215,.16)",
  fontWeight: "750",
};

const subtitleStyle = {
  color: "#7f9aaa",
  margin: "8px 0 0",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const statCard = {
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(145deg, rgba(15,27,39,.96), rgba(8,17,29,.98))",
  border: "1px solid rgba(55,255,215,.18)",
  borderRadius: "18px",
  padding: "20px",
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const statIcon = {
  width: "44px",
  height: "44px",
  display: "grid",
  placeItems: "center",
  borderRadius: "13px",
  background: "#08111d",
  fontSize: "21px",
};

const statLabel = {
  color: "#7f9aaa",
  fontSize: "13px",
  marginBottom: "4px",
};

const statValue = {
  fontSize: "25px",
  fontWeight: "750",
};

const sectionStyle = {
  position: "relative",
  background: "linear-gradient(145deg, rgba(15,27,39,.96), rgba(8,17,29,.98))",
  border: "1px solid rgba(55,255,215,.18)",
  borderRadius: "20px",
  padding: "24px",
  marginBottom: "24px",
  overflow: "hidden",
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const sectionTitle = {
  margin: 0,
  fontSize: "20px",
  letterSpacing: ".2px",
};

const sectionDescription = {
  margin: "6px 0 0",
  color: "#7f9aaa",
  fontSize: "13px",
};

const baseInput = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: "10px",
  border: "1px solid rgba(55,255,215,.22)",
  background: "radial-gradient(circle at 85% 5%, rgba(55,255,215,.08), transparent 28%), radial-gradient(circle at 10% 90%, rgba(0,229,255,.06), transparent 30%), #070b12",
  color: "#e6f7ff",
  outline: "none",
  boxSizing: "border-box",
};

const searchInput = {
  ...baseInput,
  minWidth: "260px",
};

const filterSelect = {
  ...baseInput,
  minWidth: "170px",
};

const employeeGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))",
  gap: "14px",
};

const employeeCard = {
  display: "flex",
  alignItems: "center",
  gap: "13px",
  padding: "16px",
  background: "#08111d",
  border: "1px solid rgba(55,255,215,.14)",
  borderRadius: "16px",
};

const avatar = {
  width: "43px",
  height: "43px",
  minWidth: "43px",
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #37FFD7, #00B8FF)",
  color: "#061017",
  fontWeight: "750",
};

const employeeName = {
  margin: "0 0 4px",
  fontSize: "15px",
};

const employeeMeta = {
  margin: "3px 0",
  color: "#7f9aaa",
  fontSize: "12px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const templateGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: "12px",
};

const templateCard = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "15px",
  background: "#08111d",
  border: "1px solid rgba(55,255,215,.14)",
  borderRadius: "15px",
};

const templateIcon = {
  fontSize: "21px",
};

const templateTitle = {
  margin: 0,
  fontSize: "14px",
};

const templatePreview = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: "12px",
};

const variablesBox = {
  marginTop: "18px",
  padding: "15px",
  borderRadius: "14px",
  background: "#08111d",
  border: "1px solid rgba(55,255,215,.14)",
};

const variableList = {
  display: "flex",
  flexWrap: "wrap",
  gap: "7px",
  marginTop: "10px",
};

const variableChip = {
  padding: "5px 8px",
  borderRadius: "7px",
  background: "#1e293b",
  color: "#93c5fd",
  fontSize: "12px",
};

const hintText = {
  color: "#7f9aaa",
  fontSize: "12px",
  lineHeight: 1.5,
  margin: "10px 0 0",
};

const tableWrapper = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "760px",
};

const thStyle = {
  padding: "13px",
  borderBottom: "1px solid #334155",
  color: "#7f9aaa",
  fontSize: "12px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px 13px",
  borderBottom: "1px solid #334155",
  fontSize: "13px",
};



const inputStyle = {
  ...baseInput,
  marginBottom: "16px",
};

const editorStyle = {
  ...baseInput,
  minHeight: "280px",
  resize: "vertical",
  lineHeight: 1.6,
  fontFamily: "inherit",
  marginBottom: "5px",
};

const primaryButton = {
  padding: "11px 16px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #37FFD7, #00B8FF)",
  color: "#061017",
  cursor: "pointer",
  fontWeight: "650",
  whiteSpace: "nowrap",
};

const smallPrimaryButton = {
  ...primaryButton,
  padding: "9px 11px",
  fontSize: "12px",
};

const secondaryButton = {
  padding: "10px 14px",
  border: "1px solid rgba(55,255,215,.22)",
  borderRadius: "10px",
  background: "#08111d",
  color: "#b9d8e5",
  cursor: "pointer",
  fontWeight: "600",
  whiteSpace: "nowrap",
};

const dangerButton = {
  padding: "7px 10px",
  border: "none",
  borderRadius: "8px",
  background: "#ef4444",
  color: "#061017",
  cursor: "pointer",
  fontSize: "12px",
};

const statusBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "700",
};

const alertError = {
  padding: "12px 15px",
  marginBottom: "18px",
  borderRadius: "12px",
  background: "rgba(239,68,68,.1)",
  border: "1px solid rgba(239,68,68,.3)",
  color: "#fca5a5",
};

const alertSuccess = {
  padding: "12px 15px",
  marginBottom: "18px",
  borderRadius: "12px",
  background: "rgba(34,197,94,.1)",
  border: "1px solid rgba(34,197,94,.3)",
  color: "#86efac",
};

const emptyState = {
  padding: "35px",
  textAlign: "center",
  color: "#7f9aaa",
  background: "#08111d",
  borderRadius: "14px",
};

const recipientBox = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "12px",
  padding: "14px",
  marginBottom: "18px",
  background: "#08111d",
  border: "1px solid rgba(55,255,215,.14)",
  borderRadius: "13px",
};

const fieldCaption = {
  display: "block",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "1px",
  marginBottom: "5px",
};

const labelStyle = {
  display: "block",
  color: "#b9d8e5",
  fontSize: "13px",
  fontWeight: "650",
  marginBottom: "8px",
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  background: "rgba(2,6,12,.86)",
  backdropFilter: "blur(8px)",
};

const modal = {
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#1e293b",
  border: "1px solid rgba(55,255,215,.22)",
  borderRadius: "20px",
  boxShadow: "0 25px 70px rgba(0,0,0,.65), 0 0 45px rgba(55,255,215,.08)",
};

const modalHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 22px",
  borderBottom: "1px solid #334155",
};

const modalTitle = {
  margin: 0,
  fontSize: "20px",
};

const closeButton = {
  width: "34px",
  height: "34px",
  border: "1px solid rgba(55,255,215,.22)",
  borderRadius: "9px",
  background: "#08111d",
  color: "#b9d8e5",
  fontSize: "22px",
  lineHeight: 1,
  cursor: "pointer",
};

const modalContent = {
  padding: "22px",
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "20px",
};

export default HRDocuments;