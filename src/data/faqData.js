export const HR_SUPPORT_CONTACT = {
  email: 'hr.support@talentcorner.example',
  phone: '+91-00000-00000'
}

export const faqData = [

  // ─────────────── EMPLOYEE QUERIES ───────────────

  {
    id: 'emp-mark-attendance',
    audience: 'employee',
    keywords: ['mark my attendance', 'mark attendance', 'attendance camera', 'face attendance'],
    question: 'How do I mark my attendance?',
    answer: 'On your Employee Dashboard, go to "Mark My Attendance" section. First time — you\'ll enroll your face (one-time). After that, just open the camera, select Office or Work From Home, and capture. Your attendance is marked Present automatically if face + location match.'
  },
  {
    id: 'emp-apply-leave',
    audience: 'employee',
    keywords: ['apply for leave', 'apply leave', 'take leave', 'request leave'],
    question: 'How can I apply for leave?',
    answer: 'Go to "Apply for Leave" on your dashboard. Pick the leave type (Vacation, Sick, Half Day, or Unpaid), select From/Till dates, write a reason, and click Submit. Probation/Intern employees can only apply for Unpaid Leave.'
  },
  {
    id: 'emp-leave-balance',
    audience: 'employee',
    keywords: ['leave balance', 'how many leaves', 'remaining leaves', 'available leaves'],
    question: 'How do I check my leave balance?',
    answer: 'Your dashboard shows a "Leave Balance" summary card with days available out of total earned leaves. You can also visit the Leave page for a detailed table of all your leave applications and their status.'
  },
  {
    id: 'emp-payslip',
    audience: 'employee',
    keywords: ['download my payslip', 'download payslip', 'salary slip', 'payslip', 'view payslip'],
    question: 'How can I download my payslip?',
    answer: 'Go to "Payslips" from the sidebar. Select the month and year, and your payslip will be displayed. Click "Download Payslip" to save it as an image. You can also view a Yearly Summary from the same page.'
  },
  {
    id: 'emp-salary-breakdown',
    audience: 'employee',
    keywords: ['salary breakdown', 'salary details', 'my salary', 'earnings deductions', 'what is my salary'],
    question: 'How can I see my salary breakdown?',
    answer: 'Go to "My Payroll" from the sidebar. You\'ll see your Gross Salary, Basic + DA, HRA, TA, MA, Other Allowances, Bonus, and all deductions (PF, ESIC, Professional Tax, TDS, etc.) broken down clearly. Net Payable is shown at the bottom.'
  },
  {
    id: 'emp-update-profile',
    audience: 'employee',
    keywords: ['update my profile', 'update profile', 'edit profile', 'change my details', 'my profile'],
    question: 'How do I update my profile?',
    answer: 'Go to "Profile" from the sidebar to view your personal details, bank details, statutory documents, and employment info. Profile self-editing isn\'t available yet — please contact HR with the details you\'d like updated.'
  },
  {
    id: 'emp-reset-password',
    audience: 'employee',
    keywords: ['reset my password', 'reset password', 'forgot password', 'change password'],
    question: 'How can I reset my password?',
    answer: 'On the Login page, use the "Forgot Password" option (via your email) to reset it yourself. If you don\'t see that option, please contact HR to reset it for you.'
  },
  {
    id: 'emp-company-policies',
    audience: 'employee',
    keywords: ['company policies', 'view policies', 'hr policy', 'policy document'],
    question: 'Where can I view company policies?',
    answer: 'Company policy documents aren\'t published in the system yet. Please contact HR to get the latest policy documents. You can type your question here and I can send it to HR as a support ticket.'
  },
  {
    id: 'emp-attendance-history',
    audience: 'employee',
    keywords: ['attendance history', 'check my attendance', 'past attendance', 'attendance record'],
    question: 'How do I check my attendance history?',
    answer: 'Go to "Attendance" from the sidebar. You\'ll see three tabs — "Mark Attendance" for today, "Monthly View" with a calendar and daily records, and "Yearly Summary" with month-by-month stats and progress bars.'
  },
  {
    id: 'emp-work-logs',
    audience: 'employee',
    keywords: ['work log', 'work logs', 'submit work log', 'task update', 'work update'],
    question: 'How do I submit a work log update?',
    answer: 'When you\'re checked in, work log slots are generated every 2 hours. A popup will appear automatically during an active slot. Describe your task (10+ characters), select the module, set status (In Progress/Completed), add a screenshot if needed, and submit.'
  },
  {
    id: 'emp-performance',
    audience: 'employee',
    keywords: ['my performance', 'performance review', 'rating', 'performance score'],
    question: 'How can I view my performance reviews?',
    answer: 'Go to "Performance" from the sidebar. You\'ll see a bar chart of your rating trend, your average rating, best rating, and total reviews. Each review shows the rating (out of 5), feedback, and date.'
  },
  {
    id: 'emp-increment',
    audience: 'employee',
    keywords: ['increment', 'salary increment', 'raise', 'increment history'],
    question: 'Where can I see my increment history?',
    answer: 'Go to "My Payroll" → click the "Increment History" tab. You\'ll see a table with Date, Previous Salary, Increment Amount (%), New Salary, Applicable From month, and Reason for each increment.'
  },
  {
    id: 'emp-contact-hr',
    audience: 'employee',
    keywords: ['contact hr', 'talk to hr', 'hr support', 'hr helpline', 'help'],
    question: 'How can I contact HR?',
    answer: `You can reach HR Support at ${HR_SUPPORT_CONTACT.email} or call ${HR_SUPPORT_CONTACT.phone}. You can also type your question here and I'll send it to HR directly as a support ticket.`
  },
  {
    id: 'emp-half-day-leave',
    audience: 'employee',
    keywords: ['half day leave', 'half day', 'half-day'],
    question: 'How do I apply for a half day leave?',
    answer: 'Go to "Apply for Leave", select "Half Day" as the leave type. Choose the session (First Half or Second Half), and pick the date. Note — Half Day leave can only be applied for a single day, and both From and Till dates must be the same.'
  },
  {
    id: 'emp-attendance-wfh',
    audience: 'employee',
    keywords: ['work from home', 'wfh', 'remote attendance'],
    question: 'How do I mark Work From Home attendance?',
    answer: 'When marking attendance, select "Work From Home" instead of Office, then open the camera. The geofence (location) check is skipped for WFH. Face verification is still required — show your live face and blink when prompted.'
  },
  {
    id: 'emp-exit-attendance',
    audience: 'employee',
    keywords: ['mark exit', 'check out', 'exit attendance', 'clock out'],
    question: 'How do I mark my exit / clock out?',
    answer: 'After checking in, a "Mark My Exit" button will appear on your dashboard. Click it, show your face to the camera, blink for liveness check, and your exit time will be recorded automatically.'
  },
  {
    id: 'emp-monthly-leaves',
    audience: 'employee',
    keywords: ['monthly leave credit', 'leave credit', 'leave earned'],
    question: 'When do I get my monthly leave credit?',
    answer: 'Permanent employees receive 1 leave credit per month, added automatically by the system. Probation/Intern employees do not receive leave credits until confirmed as Permanent. You can track your earned vs available leaves on the dashboard Leave Balance card.'
  },

  // ─────────────── HR QUERIES ───────────────

  {
    id: 'hr-add-employee',
    audience: 'hr',
    keywords: ['add a new employee', 'add new employee', 'add employee', 'create employee'],
    question: 'How do I add a new employee?',
    answer: 'Go to Employees from the sidebar, fill the Add Employee form (Employee Code, Name, Department, Salary are mandatory), and click "Add Employee". A leave balance and today\'s attendance record are created automatically.'
  },
  {
    id: 'hr-edit-employee',
    audience: 'hr',
    keywords: ['edit employee', 'update employee details', 'edit employee details'],
    question: 'How do I edit employee details?',
    answer: 'On the Employees page, click "Edit" next to the employee\'s row - their details load into the form above. Make your changes and click "Update Employee".'
  },
  {
    id: 'hr-approve-leave',
    audience: 'hr',
    keywords: ['approve leave', 'reject leave', 'approve or reject leave'],
    question: 'How do I approve or reject leave requests?',
    answer: 'Go to the Leave page. Every Pending application shows Approve and Reject buttons. Approving a paid leave type (Vacation/Sick/Half Day) automatically deducts one day from the employee\'s leave balance.'
  },
  {
    id: 'hr-generate-payroll',
    audience: 'hr',
    keywords: ['generate payroll', 'run payroll', 'process payroll'],
    question: 'How do I generate payroll?',
    answer: 'The Payroll page automatically calculates each employee\'s payable salary from their attendance, salary components and deductions - there\'s no separate "generate" step needed, it stays live.'
  },
  {
    id: 'hr-mark-employee-attendance',
    audience: 'hr',
    keywords: ['mark employee attendance', 'attendance management', 'generate today attendance'],
    question: 'How do I mark employee attendance?',
    answer: 'Go to Attendance, click "Generate Today\'s Attendance" once each day, then set each employee\'s status (Present/Absent/Paid Leave) using the dropdown in their row. Employees can also mark their own attendance using face + location verification.'
  },
  {
    id: 'hr-payroll-reports',
    audience: 'hr',
    keywords: ['payroll reports', 'generate reports', 'reports page'],
    question: 'How do I generate payroll reports?',
    answer: 'Go to the Reports page for a live company summary - total payroll, average compensation, attendance efficiency and leave stats. Click "Refresh Reports" to pull the latest numbers.'
  },
  {
    id: 'hr-salary-components',
    audience: 'hr',
    keywords: ['add salary components', 'add deductions', 'salary components'],
    question: 'How do I add salary components or deductions?',
    answer: 'On the Payroll page, click into an employee\'s row to edit Bonus, Deduction, Other Allowances and Gratuity - HRA/TA/MA/PF are calculated automatically from Basic Salary.'
  },
  {
    id: 'hr-deactivate-employee',
    audience: 'hr',
    keywords: ['deactivate employee', 'remove employee', 'delete employee account'],
    question: 'How do I deactivate an employee account?',
    answer: 'On the Employees page, click "Delete" next to the employee\'s row and confirm. This removes their record along with attendance, leave balance and payroll history. There is currently no "deactivate without deleting" option.'
  }

]

export function findFaqMatch(userText, audience) {

  const text = userText.toLowerCase()

  const candidates = faqData.filter(
    faq => faq.audience === audience || faq.audience === 'both'
  )

  let bestMatch = null
  let bestScore = 0

  candidates.forEach(faq => {

    faq.keywords.forEach(keyword => {

      if (text.includes(keyword)) {

        const score = keyword.length

        if (score > bestScore) {
          bestScore = score
          bestMatch = faq
        }

      }

    })

  })

  return bestMatch

}
