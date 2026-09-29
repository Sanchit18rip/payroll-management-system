function Card({ children }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "20px",
        padding: "24px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}

export default Card;