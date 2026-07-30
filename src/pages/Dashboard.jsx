import { useState, useEffect } from 'react'
import Card from "../components/ui/Card";
import { motion } from "framer-motion";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import TermsModal from "../components/Dashboard/TermsModal";
import StatCard from "../components/Dashboard/StatCard";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [greeting, setGreeting] = useState("");
  const [employees, setEmployees] = useState([])
const [payroll, setPayroll] = useState([])
const [attendance, setAttendance] = useState([])
const [monthlySummary, setMonthlySummary] =useState([])
const [leaveBalances, setLeaveBalances] =
  useState([])
const [showTerms, setShowTerms] = useState(false);
const [
  recentActivities,
  setRecentActivities
] = useState([])
const [todayDate, setTodayDate] =
  useState(
    new Date()
      .toLocaleDateString('en-CA')
  )  
const loadDashboardData = () => {

  fetch(
    "https://payroll-management-system-three.vercel.app/api/employees"
  )
    .then(res => res.json())
    .then(data => setEmployees(data))

  fetch(
    "https://payroll-management-system-three.vercel.app/api/payroll"
  )
    .then(res => res.json())
    .then(data => setPayroll(data))

  fetch(
    "https://payroll-management-system-three.vercel.app/api/monthly-attendance-summary"
  )
    .then(res => res.json())
    .then(data => setMonthlySummary(data))

  fetch(
    `https://payroll-management-system-three.vercel.app/api/attendance/${todayDate}`
  )
    .then(res => res.json())
    .then(data => setAttendance(data))
  fetch(
  "https://payroll-management-system-three.vercel.app/api/leave-balance"
)
  .then(res => res.json())
  .then(data => setLeaveBalances(data))
  fetch(
  "https://payroll-management-system-three.vercel.app/api/recent-activities"
)
  .then(res => res.json())
  .then(data =>
    setRecentActivities(data)
  )
}
useEffect(() => {

  const interval =
    setInterval(() => {

      const currentDate =
        new Date()
          .toLocaleDateString(
            'en-CA'
          )

      if (
        currentDate !== todayDate
      ) {

        setTodayDate(
          currentDate
        )

      }

    }, 60000)

  return () =>
    clearInterval(interval)

}, [todayDate])
useEffect(() => {

  loadDashboardData()

  const interval =
    setInterval(
      loadDashboardData,
      5000
    )

  return () =>
    clearInterval(interval)

}, [todayDate])


useEffect(() => {

  fetch(
    `https://payroll-management-system-three.vercel.app/api/attendance/${todayDate}`
  )
    .then(res => res.json())
    .then(data => setAttendance(data))
    .catch(err => console.log(err))

}, [])
const totalEmployees =
  employees.length

const monthlyPayroll =
  payroll.reduce(
    (total, employee) =>
      total +
      Number(employee.salary),
    0
  )

const attendanceRate =
  monthlySummary.length > 0
    ? (
        monthlySummary.reduce(
          (total, employee) =>
            total +
            Number(
              employee.attendance_percentage
            ),
          0
        ) / monthlySummary.length
      ).toFixed(1)
    : 0

const totalLeavesEarned =
  leaveBalances.reduce(
    (total, employee) =>
      total +
      Number(
        employee.total_leaves_earned
      ),
    0
  )

const totalLeavesRemaining =
  leaveBalances.reduce(
    (total, employee) =>
      total +
      Number(
        employee.available_leaves
      ),
    0
  )

const leavesUsed =
  totalLeavesEarned -
  totalLeavesRemaining

const leaveUtilization =
  totalLeavesEarned > 0
    ? (
        (
          leavesUsed /
          totalLeavesEarned
        ) * 100
      ).toFixed(1)
    : 0

const attendanceData = [
  {
    name: "Present",
    value: attendance.filter(
      employee => employee.status === "Present"
    ).length
  },

  {
    name: "Leave",
    value: attendance.filter(
      employee => employee.status === "Paid Leave"
    ).length
  },

  {
    name: "Absent",
    value: attendance.filter(
      employee => employee.status === "Absent"
    ).length
  }
];

const payrollData =
  payroll.map(employee => ({
    employee: employee.name,
    payroll: Number(employee.salary)
  }))

  const COLORS = [
  "#37FFD7",
  "#FFB84D",
  "#FF4D8D",
  "#8B5CF6"
];

const activityStyles = {

  attendance: {

    background: '#dcfce7',

    color: '#16a34a'

  },

  employee: {

    background: '#dbeafe',

    color: '#2563eb'

  },

  payroll: {

    background: '#fef3c7',

    color: '#d97706'

  },

  deletion: {

    background: '#fee2e2',

    color: '#dc2626'

  },

  update: {

    background: '#ffedd5',

    color: '#ea580c'

  },

  leave: {

    background: '#ede9fe',

    color: '#7c3aed'

  }

}

  return (

    

    <motion.div

initial={{
opacity:0
}}

animate={{
opacity:1
}}

transition={{
duration:.8
}}


  style={{
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    background: "transparent"
  }}
>
<TermsModal

  open={showTerms}

  onClose={() => setShowTerms(false)}

/>
    <DashboardHeader

  greeting="Good Morning"

  date={new Date().toDateString()}

  onTerms={() => setShowTerms(true)}
  

/>


      {/* SUMMARY CARDS */}

      <div style={cardContainer}>

 <StatCard
  title="Total Employees"
  value={totalEmployees}
  color="#3b82f6"
  delay={0.2}
  icon="employees"
/>

<StatCard
  title="Monthly Payroll"
  value={`₹${monthlyPayroll.toLocaleString()}`}
  color="#22c55e"
  delay={0.35}
  icon="payroll"
/>

<StatCard
  title="Attendance"
  value={`${attendanceRate}%`}
  color="#06b6d4"
  delay={0.5}
  icon="attendance"
/>

<StatCard
  title="Leave Utilization"
  value={`${leaveUtilization}%`}
  subtitle={`${leavesUsed} of ${totalLeavesEarned} leaves used`}
  color="#a855f7"
  delay={0.65}
  icon="leave"
/>
</div>

      {/* CHARTS */}

      <div style={chartContainer}>

        {/* ATTENDANCE PIE CHART */}

        <motion.div
  style={chartCard}
  initial={{
    opacity: 0,
    y: 35,
    scale: 0.96
  }}
  animate={{
    opacity: 1,
    y: 0,
    scale: 1
  }}
  transition={{
    duration: 0.7,
    ease: "easeOut"
  }}
  whileHover={{
    y: -8,
    scale: 1.015,
    transition: {
      duration: 0.25
    }
  }}
>

          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px"
  }}
>
  <div>
    <h2
      style={{
        color: "#f8fafc",
        margin: 0,
        fontSize: "28px",
        fontWeight: 700
      }}
    >
      Attendance Overview
    </h2>

    <p
      style={{
        marginTop: "6px",
        color: "rgba(255,255,255,.55)",
        fontSize: "14px"
      }}
    >
      Employee attendance for this month
    </p>
  </div>

  <div
    style={{
      padding: "8px 16px",
      borderRadius: "999px",

      background: "rgba(255,255,255,.05)",

      border: "1px solid rgba(255,255,255,.08)",

      color: "#37FFD7",

      fontWeight: 600,

      fontSize: "13px"
    }}
  >
    {
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}
  </div>
</div>

          <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}
>
<div
  style={{
    position: "absolute",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(55,255,215,.18), transparent 70%)",
    filter: "blur(45px)",
    left: "50%",
    top: "52%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    animation: "pulseGlow 6s ease-in-out infinite"
  }}
/>
  <PieChart
    width={330}
    height={260}
  >
  
  

            <Pie
              data={attendanceData}
              dataKey="value"
              innerRadius={55}
outerRadius={90}
paddingAngle={3}
cornerRadius={8}
            >

              {
                attendanceData.map(
                  (entry, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[index]
                      }
                    />

                  )
                )
              }

            </Pie>

            <Tooltip
  contentStyle={{
    background: "rgba(20,25,35,.92)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "14px",
    color: "#fff"
  }}
/>

          </PieChart>
          <div
    style={{
        display:"grid",
        gridTemplateColumns:"repeat(2,1fr)",
        gap:"12px",
        marginTop:"18px"
    }}
>

    {attendanceData.map((item,index)=>(

        <div
            key={index}
            style={{
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center",

                padding:"14px",

                borderRadius:"16px",

                background:"rgba(255,255,255,.04)",

                border:"1px solid rgba(255,255,255,.05)"
            }}
        >

            <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flex: 1
    }}
>

                <div
                    style={{
                        width:10,
                        height:10,
                        borderRadius:"50%",
                        background:COLORS[index]
                    }}
                />

                <span
                    style={{
                        color:"#cbd5e1",
                        fontSize:"14px"
                    }}
                >
                    {item.name}
                </span>

            </div>

            <strong
    style={{
        color: COLORS[index],
        minWidth: "40px",
        textAlign: "right",
        fontSize: "16px",
        fontWeight: 700
    }}
>
                {item.value}
            </strong>

        </div>

    ))}

</div>
          </div>

        </motion.div>

        {/* PAYROLL BAR CHART */}

        <motion.div
  className="chart-card"
  style={chartCard}
  initial={{
    opacity: 0,
    y: 35,
    scale: .96
  }}
  animate={{
    opacity: 1,
    y: 0,
    scale: 1
  }}
  transition={{
    duration: .7,
    delay: .2
  }}
  whileHover={{
    y: -8,
    scale: 1.015
  }}
>

          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px"
  }}
>
  <div>
    <h2
      style={{
        color: "#f8fafc",
        margin: 0,
        fontSize: "28px",
        fontWeight: 700
      }}
    >
      Payroll Distribution
    </h2>

    <p
      style={{
        marginTop: "6px",
        color: "rgba(255,255,255,.55)",
        fontSize: "14px"
      }}
    >
      Salary payable this month
    </p>
  </div>

  <div
    style={{
      padding: "8px 16px",
      borderRadius: "999px",
      background: "rgba(255,255,255,.05)",
      border: "1px solid rgba(255,255,255,.08)",
      color: "#60A5FA",
      fontWeight: 600,
      fontSize: "13px"
    }}
  >
    {new Date().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    })}
  </div>
</div>
          <ResponsiveContainer
    width="100%"
    height={320}
>
    <BarChart
        data={payrollData}
        margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 10
        }}
    >
    <defs>
  <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#60A5FA"/>
    <stop offset="100%" stopColor="#2563EB"/>
  </linearGradient>
</defs>

            <CartesianGrid
    stroke="rgba(255,255,255,.06)"
    strokeDasharray="5 5"
/>

           <XAxis
    dataKey="employee"
    tick={{
        fill:"rgba(255,255,255,.55)",
        fontSize:11
    }}
    axisLine={false}
    tickLine={false}
/>

              <YAxis
    tick={{
        fill: "rgba(255,255,255,.55)",
        fontSize: 12
    }}
    axisLine={false}
    tickLine={false}
    tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
/>

            <Tooltip
    cursor={{
        fill: "rgba(255,255,255,.03)"
    }}
    formatter={(value) => [
        `₹${Number(value).toLocaleString("en-IN")}`,
        "Salary"
    ]}
    contentStyle={{
        background: "rgba(15,23,42,.92)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "16px",
        color: "#fff"
    }}
/>

            

           <Bar
    dataKey="payroll"
    fill="url(#payrollGradient)"
    radius={[12,12,0,0]}
/>

          </BarChart>
          </ResponsiveContainer>
          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "22px"
  }}
>
  <div
    style={{
      flex: 1,
      padding: "14px",
      borderRadius: "16px",
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.06)"
    }}
  >
    <div
      style={{
        color: "rgba(255,255,255,.55)",
        fontSize: "12px"
      }}
    >
      Total Payroll
    </div>

    <div
      style={{
        marginTop: "6px",
        fontSize: "22px",
        fontWeight: 700,
        color: "#60A5FA"
      }}
    >
      ₹{monthlyPayroll.toLocaleString()}
    </div>
  </div>

  <div
    style={{
      flex: 1,
      padding: "14px",
      borderRadius: "16px",
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.06)"
    }}
  >
    <div
      style={{
        color: "rgba(255,255,255,.55)",
        fontSize: "12px"
      }}
    >
      Employees
    </div>

    <div
      style={{
        marginTop: "6px",
        fontSize: "22px",
        fontWeight: 700,
        color: "#37FFD7"
      }}
    >
      {totalEmployees}
    </div>
  </div>
</div>

        </motion.div>

      </div>

      {/* RECENT ACTIVITIES */}

      <motion.div
    className="chart-card"
    style={activityCard}
    initial={{
        opacity:0,
        y:35
    }}
    animate={{
        opacity:1,
        y:0
    }}
    transition={{
        duration:.8,
        delay:.35
    }}
    whileHover={{
        y:-5
    }}
>
<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"24px"
}}
>

<div>

<h2
style={{
fontSize:"30px",
fontWeight:700,
margin:0,
color:"#f8fafc"
}}
>
Recent Activities
</h2>

<p
style={{
marginTop:"6px",
color:"rgba(255,255,255,.55)",
fontSize:"14px"
}}
>
Latest workforce updates
</p>

</div>

<div
style={{
padding:"8px 16px",
borderRadius:"999px",
background:"rgba(255,255,255,.05)",
border:"1px solid rgba(255,255,255,.08)",
color:"#37FFD7",
fontWeight:600,
fontSize:"13px"
}}
>
Live Feed
</div>

</div>

        <div>

  {recentActivities.length > 0 ? (

  recentActivities.map((employee) => (

    <div
      key={employee.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '12px',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        boxShadow:
          '0 2px 8px rgba(0,0,0,0.05)',

        background: "rgba(255,255,255,.04)",

border: "1px solid rgba(255,255,255,.06)",

backdropFilter: "blur(18px)",

WebkitBackdropFilter: "blur(18px)",
      }}

      onMouseEnter={(e)=>{

    e.currentTarget.style.transform =
        "translateY(-4px)";

    e.currentTarget.style.boxShadow =
        "0 12px 28px rgba(0,0,0,.35)";
}}

onMouseLeave={(e)=>{

    e.currentTarget.style.transform =
        "translateY(0)";

    e.currentTarget.style.boxShadow =
        "none";
}}
    >

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >

        <div
          style={{
    width: "48px",
    height: "48px",
    borderRadius: "16px",

    background: "rgba(255,255,255,.08)",

    border: "1px solid rgba(255,255,255,.08)",

    boxShadow: "0 0 20px rgba(55,255,215,.18)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    color: "#37FFD7",

    fontWeight: 700,

    fontSize: "18px",

    flexShrink: 0
}}
        >

          {employee.employee_name
            ? employee.employee_name[0]
                .toUpperCase()
            : '🔔'}

        </div>

        <div>

          <div
            style={{
    fontWeight: 700,
    fontSize: "16px",
    color: "#f8fafc",
    letterSpacing: ".3px"
}}
          >
            {employee.employee_name ||
              'System'}
          </div>

          <div
            style={{
    fontSize: "13px",
    color: "rgba(255,255,255,.65)",
    lineHeight: "1.6"
}}
          >

            <strong>
              {employee.employee_name}
            </strong>{' '}

            {employee.description
              ?.replace(
                employee.employee_name,
                ''
              )}

          </div>

          <div
            style={{
    fontSize: "12px",
    color: "rgba(255,255,255,.40)",
    marginTop: "6px",
    letterSpacing: ".4px"
}}
          >

            {new Date(

              employee.created_at ||
              employee.updated_at

            ).toLocaleTimeString(

              'en-IN',

              {
                hour: '2-digit',
                minute: '2-digit'
              }

            )}

          </div>

        </div>

      </div>

      <span
        style={{
    padding: "7px 14px",

    borderRadius: "999px",

    background: "rgba(255,255,255,.06)",

    border: "1px solid rgba(255,255,255,.08)",

    color: "#37FFD7",

    fontSize: "12px",

    fontWeight: 600,

    textTransform: "capitalize",

    letterSpacing: ".5px",

    minWidth: "90px",

    textAlign: "center"
}}
      >

        {employee.activity_type}

      </span>

    </div>

  ))

) : (

   <div
    style={{
      textAlign: 'center',
      padding: '40px 0',
      color: '#cbd5e1'
    }}
  >

    <div
      style={{
        fontSize: '40px',
        marginBottom: '10px'
      }}
    >
      📭
    </div>

    <div
      style={{
        fontWeight: '600',
        marginBottom: '4px'
      }}
    >
      No activities today
    </div>

    <div
      style={{
        fontSize: '14px'
      }}
    >
      New activities will appear here.
    </div>

  </div>

)}

</div>

      </motion.div>

    </motion.div>
    

  )

}
/* STYLES */

const cardContainer = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '24px',
  marginBottom: '35px',
  alignItems: 'stretch'
}
const card = {
  background: '#1e293b',
  borderRadius: '20px',
  padding: '28px',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)',
  transition: 'all 0.3s ease'
}
const chartContainer = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '24px',
  marginBottom: '35px'
}
const chartCard = {
  position: "relative",
  overflow: "hidden",

  background:
    "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",

  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",

  border: "1px solid rgba(255,255,255,.08)",

  borderRadius: "24px",

  padding: "26px",

  color: "#fff",

  boxShadow:
    "0 20px 45px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)"
}
const activityCard = {
  position: "relative",
  overflow: "hidden",

  background:
    "linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",

  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",

  border: "1px solid rgba(255,255,255,.08)",

  borderRadius: "24px",

  padding: "28px",

  color: "#fff",

  boxShadow:
    "0 20px 45px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)"
}
export default Dashboard