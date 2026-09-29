import { useState, useEffect } from 'react'
import { motion } from "framer-motion";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import TermsModal from "../components/Dashboard/TermsModal";
import StatCard from "../components/Dashboard/StatCard";
import NotificationBell from "../components/NotificationBell";
import { apiFetch, API_BASE } from "../api";
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
  ResponsiveContainer
} from "recharts";

const getRecentPayrollMonths = (count = 6) => {
  const today = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (count - 1 - index), 1);

    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: date.toLocaleDateString("en-US", { month: "short" }),
      fullLabel: date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  });
};

function Dashboard() {
  const [employees, setEmployees] = useState([])
const [payroll, setPayroll] = useState([])
const [monthlyPayrollTrend, setMonthlyPayrollTrend] = useState([])
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
const loadDashboardData = async () => {

  try {
    const months = getRecentPayrollMonths();
    const [responses, payrollTrend] = await Promise.all([
      Promise.all([
        apiFetch(`${API_BASE}/api/employees`),
        apiFetch(`${API_BASE}/api/payroll`),
        apiFetch(`${API_BASE}/api/monthly-attendance-summary`),
        apiFetch(`${API_BASE}/api/attendance/${todayDate}`),
        apiFetch(`${API_BASE}/api/leave-balance`),
        apiFetch(`${API_BASE}/api/recent-activities`)
      ]),
      Promise.all(
        months.map(async ({ month, year, label, fullLabel }) => {
          const response = await apiFetch(
            `${API_BASE}/api/payroll/monthly?month=${month}&year=${year}`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data?.message || "Unable to load monthly payroll.");
          }

          const employeesForMonth = Array.isArray(data) ? data : [];

          return {
            month: label,
            fullMonth: fullLabel,
            payroll: employeesForMonth.reduce(
              (total, employee) =>
                total + Number(employee.payable_salary ?? employee.salary ?? 0),
              0
            ),
            employees: employeesForMonth.length,
          };
        })
      ).catch((error) => {
        // Keep the rest of the dashboard available if the optional trend
        // endpoint is temporarily unavailable.
        console.error("Monthly payroll trend load error:", error);
        return [];
      })
    ]);

    const [empRes, payRes, sumRes, attRes, lbRes, actRes] = responses;

    const [empData, payData, sumData, attData, lbData, actData] = await Promise.all([
      empRes.json(), payRes.json(), sumRes.json(), attRes.json(), lbRes.json(), actRes.json()
    ]);

    if (Array.isArray(empData)) setEmployees(empData);
    if (Array.isArray(payData)) setPayroll(payData);
    if (Array.isArray(sumData)) setMonthlySummary(sumData);
    if (Array.isArray(attData)) setAttendance(attData);
    if (Array.isArray(lbData)) setLeaveBalances(lbData);
    if (Array.isArray(actData)) setRecentActivities(actData);
    setMonthlyPayrollTrend(payrollTrend);
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
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
      30000
    )

  return () =>
    clearInterval(interval)

}, [todayDate])


useEffect(() => {

  apiFetch(`${API_BASE}/api/attendance/${todayDate}`)
    .then(res => res.json())
    .then(data => { if (Array.isArray(data)) setAttendance(data); })
    .catch(err => console.error(err))

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

const latestPayrollMonth =
  monthlyPayrollTrend[monthlyPayrollTrend.length - 1];

  const COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6"
];

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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <DashboardHeader

  greeting="Good Morning"

  date={new Date().toDateString()}

  onTerms={() => setShowTerms(true)}
  

/>
      <NotificationBell role="hr" />
    </div>


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
        color: "var(--text-primary, #0f172a)",
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
        color: "var(--text-secondary, #475569)",
        fontSize: "14px"
      }}
    >
      Employee attendance for this month
    </p>
  </div>

  <div
    style={{
      padding: "8px 16px",
      borderRadius: "999px",        background: "var(--bg-hover, #f8fafc)",        border: "1px solid var(--border-card, #e2e8f0)",        color: "var(--text-accent, #2563eb)",

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
      "radial-gradient(circle, rgba(37,99,235,.12), transparent 70%)",
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
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    color: "#0f172a"
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

                borderRadius:"16px",        background: "var(--bg-hover, #f8fafc)",        border: "1px solid var(--border-card, #e2e8f0)"
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
                        color:"var(--text-secondary, #475569)",
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
        color: "var(--text-primary, #0f172a)",
        margin: 0,
        fontSize: "28px",
        fontWeight: 700
      }}
    >
      Monthly Payroll
    </h2>

    <p
      style={{
        marginTop: "6px",
        color: "var(--text-secondary, #475569)",
        fontSize: "14px"
      }}
    >
      Total payroll payable across the company
    </p>
  </div>

  <div
    style={{      padding: "8px 16px",
      borderRadius: "999px",
      background: "var(--bg-hover, #f8fafc)",        border: "1px solid var(--border-card, #e2e8f0)",
      color: "var(--accent-blue, #60A5FA)",
      fontWeight: 600,
      fontSize: "13px"
    }}
  >
    Last 6 Months
  </div>
</div>
          <ResponsiveContainer
    width="100%"
    height={320}
>
    <BarChart
        data={monthlyPayrollTrend}
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
    stroke="#e2e8f0"
    strokeDasharray="5 5"
/>

           <XAxis
    dataKey="month"
    tick={{
        fill:"#475569",
        fontSize:11
    }}
    axisLine={false}
    tickLine={false}
/>

              <YAxis
    tick={{
        fill: "#475569",
        fontSize: 12
    }}
    axisLine={false}
    tickLine={false}
    tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
/>

            <Tooltip
    cursor={{
        fill: "rgba(37,99,235,.04)"
    }}
    labelFormatter={(_, entries) =>
      entries?.[0]?.payload?.fullMonth || "Monthly payroll"
    }
    formatter={(value) => [
        `₹${Number(value).toLocaleString("en-IN")}`,
        "Total Payroll"
    ]}
    contentStyle={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        color: "#0f172a"
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
      background: "#ffffff",
      border: "1px solid #e2e8f0"
    }}
  >
    <div
      style={{
        color: "var(--text-secondary, #475569)",
        fontSize: "12px"
      }}
    >
      Latest Month Payroll
    </div>

    <div
      style={{
        marginTop: "6px",
        fontSize: "22px",
        fontWeight: 700,
        color: "#60A5FA"
      }}
    >
      ₹{Number(latestPayrollMonth?.payroll ?? 0).toLocaleString("en-IN")}
    </div>
  </div>

  <div
    style={{
      flex: 1,
      padding: "14px",
      borderRadius: "16px",
      background: "#ffffff",
      border: "1px solid #e2e8f0"
    }}
  >
    <div
      style={{
        color: "var(--text-secondary, #475569)",
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
        color: "#059669"
      }}
    >
      {latestPayrollMonth?.employees ?? totalEmployees}
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
color:"var(--text-primary, #0f172a)"
}}
>
Recent Activities
</h2>

<p
style={{
marginTop:"6px",
color:"var(--text-secondary, rgba(255,255,255,.55))",
fontSize:"14px"
}}
>
Latest workforce updates
</p>

</div>

<div
style={{      padding:"8px 16px",
borderRadius:"999px",
background:"var(--bg-hover, #f8fafc)",
border:"1px solid var(--border-card, #e2e8f0)",        color: "var(--text-accent, #2563eb)",
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

        background: "#ffffff",

border: "1px solid #e2e8f0",

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
    borderRadius: "16px",        background: "var(--bg-hover, #f8fafc)",

    border: "1px solid var(--border-card, #e2e8f0)",

    boxShadow: "0 1px 3px rgba(0,0,0,.08)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    color: "#2563eb",

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
    color: "var(--text-primary, #0f172a)",
    letterSpacing: ".3px"
}}
          >
            {employee.employee_name ||
              'System'}
          </div>

          <div
            style={{
    fontSize: "13px",        color: "var(--text-secondary, #64748b)",
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
    fontSize: "12px",        color: "var(--text-muted, #94a3b8)",
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

    borderRadius: "999px",        background: "var(--bg-hover, #f8fafc)",

    border: "1px solid var(--border-card, #e2e8f0)",

    color: "var(--text-accent, #2563eb)",

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
      color: 'var(--text-muted, #94a3b8)'
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
  background: 'var(--bg-card, #ffffff)',
  border: 'var(--border-card, 1px solid #e2e8f0)',
  borderRadius: "24px",
  padding: "26px",
  color: 'var(--text-primary, #0f172a)',
  boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,.08))'
}
const activityCard = {
  position: "relative",
  overflow: "hidden",
  background: 'var(--bg-card, #ffffff)',
  border: 'var(--border-card, 1px solid #e2e8f0)',
  borderRadius: "24px",
  padding: "28px",
  color: 'var(--text-primary, #0f172a)',
  boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,.08))'
}
export default Dashboard
