import { useState, useRef, useEffect } from "react";

const DEPARTMENTS = [
  "All Departments",
  "CS",
  "IT",
  "Law",
  "Finance",
  "HR",
  "Sales",
  "Marketing",
  "Operations",
  "Admin",
  "Engineering",
  "Design",
  "Content",
  "Web Development",
  "Data Science",
  "Customer Support",
  "Legal",
  "Accounts",
  "Quality Assurance",
  "Business Development",
  "Public Relations",
  "Training",
  "Procurement",
  "Logistics",
  "Security",
  "Research",
];

function SearchableDropdown({ value, onChange, width = 200, placeholder = "Search department..." }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = value === "All" ? "All Departments" : value || "All Departments";

  const filtered = DEPARTMENTS.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (dept) => {
    onChange(dept === "All Departments" ? "All" : dept);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} style={{ position: "relative", width, flexShrink: 0 }}>
      {/* Selected value button */}
      <button
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        style={{
          padding: "10px 36px 10px 14px",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.04)",
          color: "#f8fafc",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          position: "relative",
          outline: "none",
          transition: "border-color 0.15s ease",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(55,255,215,.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,.12)";
        }}
      >
        {displayValue}
        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748b",
            fontSize: 11,
            transition: "transform 0.15s ease",
            transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "rgba(17,24,39,.96)",
            border: "1px solid rgba(55,255,215,.2)",
            borderRadius: 12,
            boxShadow: "0 15px 40px rgba(0,0,0,.5)",
            zIndex: 100,
            overflow: "hidden",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Search input */}
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid rgba(55,255,215,.15)",
                background: "rgba(255,255,255,.05)",
                color: "#f8fafc",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0) {
                  handleSelect(filtered[0]);
                }
                if (e.key === "Escape") {
                  setOpen(false);
                  setSearch("");
                }
              }}
            />
          </div>

          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: "auto", padding: "4px 0" }}>
            {filtered.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", padding: 14 }}>
                No departments found
              </p>
            ) : (
              filtered.map((dept) => {
                const isSelected = (value === "All" && dept === "All Departments") || value === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => handleSelect(dept)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "10px 14px",
                      background: isSelected
                        ? "rgba(55,255,215,.1)"
                        : "transparent",
                      border: "none",
                      color: isSelected ? "#37FFD7" : "#f8fafc",
                      fontSize: "13px",
                      fontWeight: isSelected ? "700" : "500",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(55,255,215,.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {dept}
                    {isSelected && <span style={{ color: "#37FFD7" }}>✓</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableDropdown;
