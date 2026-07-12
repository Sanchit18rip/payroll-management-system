export const HR_SUPPORT_CONTACT = {
  email: 'hr.support@talentcorner.example',
  phone: '+91-00000-00000'
}

export const faqData = [

  

  {
    id: 'emp-mark-attendance',
    audience: 'employee',
    keywords: ['mark my attendance', 'mark attendance', 'attendance camera', 'face attendance'],
    question: 'How do I mark my attendance?',
    answer: 'On your Employee Dashboard, use the "Mark My Attendance" section. The first time, you\'ll enroll your face (one-time step). After that, just open the camera each day and capture - your attendance is marked Present automatically if your face and location match.'
  },
  {
    id: 'emp-apply-leave',
    audience: 'employee',
    keywords: ['apply for leave', 'apply leave', 'take leave', 'request leave'],
    question: 'How can I apply for leave?',
    answer: 'Go to "Apply for Leave" on your dashboard, pick the leave type, From/Till dates and a reason, then click Submit Application. If you\'re on Probation or an Intern, only Unpaid Leave is available until you\'re confirmed as Permanent.'
  },
  {
    id: 'emp-leave-balance',
    audience: 'employee',
    keywords: ['leave balance', 'how many leaves', 'remaining leaves'],
    question: 'How do I check my leave balance?',
    answer: 'Your dashboard shows a "Leave Balance" summary card with the days available out of your total earned leaves.'
  },
  {
    id: 'emp-payslip',
    audience: 'employee',
    keywords: ['download my payslip', 'download payslip', 'salary slip', 'payslip'],
    question: 'How can I download my payslip?',
    answer: 'Your "Salary Breakdown" card on the dashboard shows your full salary details for the current cycle. A downloadable PDF payslip isn\'t available yet - for an official copy, please contact HR.'
  },
  {
    id: 'emp-update-profile',
    audience: 'employee',
    keywords: ['update my profile', 'update profile', 'edit profile', 'change my details'],
    question: 'How do I update my profile?',
    answer: 'Profile self-editing isn\'t available in the system yet. Please contact HR with the details you\'d like updated and they will make the change for you.'
  },
  {
    id: 'emp-reset-password',
    audience: 'employee',
    keywords: ['reset my password', 'reset password', 'forgot password', 'change password'],
    question: 'How can I reset my password?',
    answer: 'On the Login page, use the "Forgot Password" option (via your email) to reset it yourself. If you don\'t see that option yet, please contact HR to reset it for you.'
  },
  {
    id: 'emp-company-policies',
    audience: 'employee',
    keywords: ['company policies', 'view policies', 'hr policy', 'policy document'],
    question: 'Where can I view company policies?',
    answer: 'Company policy documents aren\'t published in the system yet. Please contact HR to get the latest policy documents.'
  },
  {
    id: 'emp-overtime-policy',
    audience: 'employee',
    keywords: ['overtime policy', 'overtime pay', 'extra hours'],
    question: 'What is the overtime policy?',
    answer: 'Overtime rules aren\'t configured in the system yet. Please contact HR for the current overtime policy.'
  },
  {
    id: 'emp-attendance-history',
    audience: 'employee',
    keywords: ['attendance history', 'check my attendance', 'past attendance'],
    question: 'How do I check my attendance history?',
    answer: 'The "Recent Attendance" table on your dashboard shows your last 30 days of attendance with status for each date.'
  },
  {
    id: 'emp-contact-hr',
    audience: 'employee',
    keywords: ['contact hr', 'talk to hr', 'hr support', 'hr helpline'],
    question: 'How can I contact HR?',
    answer: `You can reach HR Support at ${HR_SUPPORT_CONTACT.email} or call ${HR_SUPPORT_CONTACT.phone}. You can also type your question here and I can send it to HR directly.`
  },

  // ---------------- HR QUERIES ----------------

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
    id: 'hr-update-policies',
    audience: 'hr',
    keywords: ['update company policies', 'edit policies', 'manage policies'],
    question: 'How do I update company policies?',
    answer: 'A policy management page isn\'t built yet in the system. For now, policies are communicated to employees outside the system (email/notice).'
  },
  {
    id: 'hr-manage-holidays',
    audience: 'hr',
    keywords: ['manage holidays', 'add holiday', 'holiday list'],
    question: 'How do I manage holidays?',
    answer: 'A holiday calendar isn\'t built yet in the system. Currently, attendance for non-working days needs to be handled manually on the Attendance page.'
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
