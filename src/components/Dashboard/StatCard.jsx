import { motion } from "framer-motion";
import GlassCard from "../GlassCard";
import {
  Users,
  Wallet,
  CalendarCheck,
  Plane
} from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  color = "#3b82f6",
  delay = 0,
  icon
}) 
{
  const icons = {
  employees: Users,
  payroll: Wallet,
  attendance: CalendarCheck,
  leave: Plane,
};

const Icon = icons[icon];  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay
      }}
    >
    <GlassCard
  className="glass-hover stat-card"
  style={{
    "--accent": color
  }}
>
        <div
  className="stat-icon"

  style={{

    "--accent": color,

    width:60,

    height:60,

    borderRadius:"18px",

    display:"flex",

    alignItems:"center",

    justifyContent:"center",

    marginBottom:"16px"

  }}
>
  {Icon && <Icon size={26} color={color} />}
</div>
        <h3
  className="stat-title"
  style={{
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "12px",
    userSelect: "none"
  }}
>
          {title}
        </h3>

        <h1
 style={{
    fontSize:"46px",

    margin:0,

    color,

    fontWeight:800,

    letterSpacing:"-2px",

    lineHeight:1,

    textShadow:`0 0 24px ${color}55`
}}
> 
          {value}
        </h1>

        {subtitle && (
          <p
    className="stat-subtitle"
    style={{
        marginTop:"12px",
        fontSize:"13px",
        fontWeight:500
    }}
>
            {subtitle}
          </p>
        )}

      </GlassCard>
    </motion.div>
  );
}