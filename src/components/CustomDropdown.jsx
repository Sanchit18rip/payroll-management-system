import { useState, useRef, useEffect } from "react";
import "./CustomDropdown.css";

function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div
      className="custom-dropdown"
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`dropdown-trigger ${
          open ? "active" : ""
        }`}
        onClick={() => setOpen(!open)}
      >
        <span>
          {value || placeholder}
        </span>

        <span
  className={`arrow ${
    open ? "rotate" : ""
  }`}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</span>
      </button>

      {open && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div
              key={option}
              className={`dropdown-item ${
                value === option
                  ? "selected"
                  : ""
              }`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <span>{option}</span>

              {value === option && (
                <span className="check">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;