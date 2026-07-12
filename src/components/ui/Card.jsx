function Card({ children }) {
  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "20px",
        padding: "24px",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {children}
    </div>
  );
}

export default Card;