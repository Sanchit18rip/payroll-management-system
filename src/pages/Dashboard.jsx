import { useState, useEffect } from 'react'
import Card from "../components/ui/Card";
import { motion } from "framer-motion";
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
  Legend
} from 'recharts'

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
    "http://https://payroll-management-system-owo2.onrender.com/api/employees"
  )
    .then(res => res.json())
    .then(data => setEmployees(data))

  fetch(
    "http://https://payroll-management-system-owo2.onrender.com/api/payroll"
  )
    .then(res => res.json())
    .then(data => setPayroll(data))

  fetch(
    "http://https://payroll-management-system-owo2.onrender.com/api/monthly-attendance-summary"
  )
    .then(res => res.json())
    .then(data => setMonthlySummary(data))

  fetch(
    `http://https://payroll-management-system-owo2.onrender.com/api/attendance/${todayDate}`
  )
    .then(res => res.json())
    .then(data => setAttendance(data))
  fetch(
  "http://https://payroll-management-system-owo2.onrender.com/api/leave-balance"
)
  .then(res => res.json())
  .then(data => setLeaveBalances(data))
  fetch(
  "http://https://payroll-management-system-owo2.onrender.com/api/recent-activities"
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
    `http://https://payroll-management-system-owo2.onrender.com/api/attendance/${todayDate}`
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
      Number(employee.payable_salary),
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
    name: 'Present',
    value: attendance.filter(
      employee =>
        employee.status === 'Present'
    ).length
  },

  {
    name: 'Absent',
    value: attendance.filter(
      employee =>
        employee.status === 'Absent'
    ).length
  },

  {
    name: 'Leave',
    value: attendance.filter(
      employee =>
        employee.status ===
        'Paid Leave'
    ).length
  }
]

const payrollData =
  payroll.map(employee => ({
    employee: employee.name,
    payroll: Number(
      employee.payable_salary
    )
  }))

  const COLORS = [
  '#22c55e',
  '#ef4444',
  '#f59e0b'
]

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
    background: '#0f172a'
  }}
>
{showTerms && (
        <div style={termsOverlay}>
          <div style={termsBox}>
            <h2 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '14px' }}>
              Terms &amp; Conditions
            </h2>
            <div style={termsTextBox}>
              <p><strong>Talent Pay Corner - Terms & Conditions</strong></p>
              <p><small>Last Updated: 08/07/2026</small></p>
              <br />
              <p>Welcome to Talent Pay Corner, an HR and Payroll Management Platform. By accessing, registering, or using this platform, you agree to the following Terms and Conditions.</p>
              <br />
              
              <p><strong>1. Use of the Platform</strong></p>
              <p>Talent Pay Corner provides services including employee management, payroll processing, attendance tracking, leave management, tax records, salary slips, and HR support.</p>
              <br />

              <p><strong>2. User Responsibilities</strong></p>
              <p>Users agree to:</p>
              <p>• Provide accurate and updated information.</p>
              <p>• Maintain the confidentiality of login credentials.</p>
              <p>• Use the platform only for authorized and lawful purposes.</p>
              <p>• Report any unauthorized access or security concerns immediately.</p>
              <br />

              <p><strong>3. Payroll & Employee Data</strong></p>
              <p>The platform may store and process employee information such as:</p>
              <p>• Personal and contact details</p>
              <p>• Attendance and leave records</p>
              <p>• Salary and payroll information</p>
              <p>• Tax and statutory records</p>
              <p>Users are responsible for ensuring that their information is accurate and up to date.</p>
              <br />

              <p><strong>4. Confidentiality</strong></p>
              <p>All payroll and employee information available on the platform is confidential. Users must not share, copy, distribute, or misuse any data without proper authorization.</p>
              <br />

              <p><strong>5. Prohibited Activities</strong></p>
              <p>Users shall not:</p>
              <p>• Attempt unauthorized access to any account or data.</p>
              <p>• Upload malicious software or harmful content.</p>
              <p>• Modify, manipulate, or misuse payroll records.</p>
              <p>• Disrupt the operation or security of the platform.</p>
              <br />

              <p><strong>6. Monitoring</strong></p>
              <p>Talent Pay Corner may monitor platform activity, maintain audit logs, and review system usage for security, compliance, and operational purposes.</p>
              <br />

              <p><strong>7. Service Availability</strong></p>
              <p>While we strive to provide uninterrupted service, we do not guarantee continuous availability. Services may be temporarily unavailable due to maintenance, upgrades, or technical issues.</p>
              <br />

              <p><strong>8. Limitation of Liability</strong></p>
              <p>Talent Pay Corner shall not be liable for any indirect losses, data loss, service interruptions, or damages arising from unauthorized use of the platform.</p>
              <br />

              <p><strong>9. Changes to Terms</strong></p>
              <p>We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform after updates constitutes acceptance of the revised Terms.</p>
              <br />

              <p><strong>10. Governing Law</strong></p>
              <p>These Terms and Conditions shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts of Mumbai, Maharashtra.</p>
              <br />
              
              <hr style={{ borderColor: '#334155', margin: '15px 0' }} />
              
              <p><strong>User Consent</strong></p>
              <p>By clicking "I Agree", you confirm that:</p>
              <p>✔ You have read and understood these Terms and Conditions.</p>
              <p>✔ You agree to the collection and processing of your information for HR and payroll administration purposes.</p>
              <p>✔ You will comply with all applicable company policies and legal requirements.</p>
            </div>

          

            <button
  onClick={() => setShowTerms(false)}
  style={{
  width: '100%',
  padding: '14px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '15px',
  cursor: 'pointer',
  marginTop: '15px'
}}
>
  Close
</button>
          </div>
        </div>
      )}
      <>
  <h1
  style={{
    fontSize: '42px',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '8px'
  }}
>
  HR Dashboard
</h1>

  <p
  style={{
    color: '#94a3b8',
    marginBottom: '30px'
  }}
>
  Welcome back. Here's today's workforce overview.
</p>
</>
<button
  onClick={() => setShowTerms(true)}
  style={{
    padding: "8px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    position: "relative",
    top: "-15px"
  }}
>
  📄 View Terms & Conditions
</button>

      {/* SUMMARY CARDS */}

      <div style={cardContainer}>

  <motion.div
initial={{ opacity:0, y:40 }}
animate={{ opacity:1, y:0 }}
transition={{
  delay:.2,
  duration:.6
}}
style={card}
>
    <h3
      style={{
        color: "#94a3b8",
        fontSize: "14px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "10px"
      }}
    >
      Total Employees
    </h3>

    <h1
      style={{
        fontSize: "42px",
        margin: 0,
        color: "#3b82f6"
      }}
    >
      {totalEmployees}
    </h1>
  </motion.div>

  <motion.div
initial={{ opacity:0, y:40 }}
animate={{ opacity:1, y:0 }}
transition={{
  delay:.35,
  duration:.6
}}
style={card}
>
    <h3
      style={{
        color: "#94a3b8",
        fontSize: "14px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "10px"
      }}
    >
      Monthly Payroll
    </h3>

    <h1
      style={{
        fontSize: "42px",
        margin: 0,
        color: "#22c55e"
      }}
    >
      ₹{monthlyPayroll.toLocaleString()}
    </h1>
  </motion.div>

  <motion.div
initial={{ opacity:0, y:40 }}
animate={{ opacity:1, y:0 }}
transition={{
  delay:.5,
  duration:.6
}}
style={card}
>
    <h3
      style={{
        color: "#94a3b8",
        fontSize: "14px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "10px"
      }}
    >
      Attendance
    </h3>

    <h1
      style={{
        fontSize: "42px",
        margin: 0,
        color: "#06b6d4"
      }}
    >
      {attendanceRate}%
    </h1>
  </motion.div>

  <motion.div
initial={{ opacity:0, y:40 }}
animate={{ opacity:1, y:0 }}
transition={{
  delay:.65,
  duration:.6
}}
style={card}
>
    <h3
      style={{
        color: "#94a3b8",
        fontSize: "14px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "10px"
      }}
    >
      Leave Utilization
    </h3>

    <h1
      style={{
        fontSize: "42px",
        margin: 0,
        color: "#a855f7"
      }}
    >
      {leaveUtilization}%
    </h1>

    <p
      style={{
        marginTop: "10px",
        color: "#94a3b8",
        fontSize: "14px"
      }}
    >
      {leavesUsed} of {totalLeavesEarned} leaves used
    </p>
  </motion.div>

</div>

      {/* CHARTS */}

      <div style={chartContainer}>

        {/* ATTENDANCE PIE CHART */}

        <div style={chartCard}>

          <h2
  style={{
    color: '#f8fafc',
    marginTop: 0
  }}
>
  Attendance Overview
</h2>

          <PieChart
            width={300}
            height={250}
          >

            <Pie
              data={attendanceData}
              dataKey="value"
              outerRadius={80}
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

            <Tooltip />

          </PieChart>

        </div>

        {/* PAYROLL BAR CHART */}

        <div style={chartCard}>

          <h2
  style={{
    color: '#f8fafc',
    marginTop: 0
  }}
>
  Payroll Distribution
</h2>
          <BarChart
            width={450}
            height={250}
            data={payrollData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
  dataKey="employee"
/>

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="payroll"
              fill="#2563eb"
            />

          </BarChart>

        </div>

      </div>

      {/* RECENT ACTIVITIES */}

      <div style={activityCard}>

        <div
  style={{
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  }}
>

  <div>

    <h2
  style={{
    margin: 0,
    fontSize: '30px',
    fontWeight: '700',
    color: '#f8fafc'
  }}
>
  Recent Activities
</h2>
    <p
      style={{
        margin: '6px 0 0',
        color: '#94a3b8',
        fontSize: '14px'
      }}
    >
      Latest workforce updates
    </p>

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

        background:
          employee.activity_type ===
          'attendance'
            ? '#f0fdf4'

          : employee.activity_type ===
            'employee'
            ? '#eff6ff'

          : employee.activity_type ===
            'payroll'
            ? '#fffbeb'

          : employee.activity_type ===
            'deletion'
            ? '#fef2f2'

          : '#ffffff'
      }}

      onMouseEnter={(e) => {

  e.currentTarget.style.transform =
    'translateY(-3px)'

  e.currentTarget.style.boxShadow =
    '0 12px 24px rgba(0,0,0,0.08)'

  e.currentTarget.style.background =

    employee.activity_type ===
    'attendance'

      ? '#dcfce7'

    : employee.activity_type ===
      'employee'

      ? '#dbeafe'

    : employee.activity_type ===
      'payroll'

      ? '#fef3c7'

    : employee.activity_type ===
      'deletion'

      ? '#fee2e2'

    : '#f9fafb'

}}

      onMouseLeave={(e) => {

  e.currentTarget.style.transform =
    'translateY(0)'

  e.currentTarget.style.boxShadow =
    '0 2px 8px rgba(0,0,0,0.05)'

  e.currentTarget.style.background =

    employee.activity_type ===
    'attendance'

      ? '#f0fdf4'

    : employee.activity_type ===
      'employee'

      ? '#eff6ff'

    : employee.activity_type ===
      'payroll'

      ? '#fffbeb'

    : employee.activity_type ===
      'deletion'

      ? '#fef2f2'

    : '#ffffff'

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
            width: '45px',
            height: '45px',
            borderRadius: '50%',

            background:
              employee.activity_type ===
              'employee'
                ? '#dbeafe'

              : employee.activity_type ===
                'attendance'
                ? '#dcfce7'

              : employee.activity_type ===
                'payroll'
                ? '#fef3c7'

              : '#fee2e2',

            color:
              employee.activity_type ===
              'employee'
                ? '#2563eb'

              : employee.activity_type ===
                'attendance'
                ? '#16a34a'

              : employee.activity_type ===
                'payroll'
                ? '#ca8a04'

              : '#dc2626',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '18px'
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
              fontWeight: '700',
              fontSize: '16px'
            }}
          >
            {employee.employee_name ||
              'System'}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#6b7280'
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
              fontSize: '12px',
              color: '#cbd5e1',
              marginTop: '4px'
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
          padding: '6px 12px',
          borderRadius: '999px',

          background:
            employee.activity_type ===
            'employee'
              ? '#dbeafe'

            : employee.activity_type ===
              'attendance'
              ? '#dcfce7'

            : employee.activity_type ===
              'payroll'
              ? '#fef3c7'

            : '#fee2e2',

          color:
            employee.activity_type ===
            'employee'
              ? '#2563eb'

            : employee.activity_type ===
              'attendance'
              ? '#16a34a'

            : employee.activity_type ===
              'payroll'
              ? '#ca8a04'

            : '#dc2626',

          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'capitalize'
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

      </div>

    </motion.div>
    

  )

}
/* STYLES */

const cardContainer = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '24px',
  marginBottom: '35px'
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
  background: '#1e293b',
  borderRadius: '20px',
  padding: '24px',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)',
  color: '#f8fafc'
}

const activityCard = {
  background: '#1e293b',
  borderRadius: '20px',
  padding: '24px',
  border: '1px solid #334155',
  boxShadow:
    '0 8px 32px rgba(0,0,0,0.35)'
}
const termsOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '20px'
}

const termsBox = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '32px',
  maxWidth: '560px',
  width: '100%',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)'
}

const termsTextBox = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '16px 18px',
  maxHeight: '220px',
  overflowY: 'auto',
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '1.7',
  marginBottom: '18px'
}
export default Dashboard