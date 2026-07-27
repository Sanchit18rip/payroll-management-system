import "./Badge.css";

export default function Badge({ text, color = "green" }) {
  return (
    <span className={`badge badge-${color}`}>
      {text}
    </span>
  );
}