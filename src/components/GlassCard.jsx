import { useRef } from "react";
import "./GlassCard.css";

export default function GlassCard({
  children,
  className = "",
  hover = true,
  style = {}
}) {

  const cardRef = useRef(null);

  const handleMouseMove = (e) => {

    const rect = cardRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`glass-card ${hover ? "glass-hover" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}