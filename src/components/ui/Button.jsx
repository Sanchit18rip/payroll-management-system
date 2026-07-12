function Button({
  children,
  color = "#2563eb",
  ...props
}) {
  return (
    <button
      {...props}
      style={{
        background: color,
        color: "white",
        border: "none",
        padding: "12px 20px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "600",
      }}
    >
      {children}
    </button>
  );
}

export default Button;