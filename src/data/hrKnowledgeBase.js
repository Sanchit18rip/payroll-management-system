const hrKnowledgeBase = [

/* ---------------- Greetings ---------------- */

{
keywords:["hi","hello","hey","good morning","good afternoon","good evening","good night"],
answer:
`Hello! 👋

I'm your HR AI Assistant.

I can help you with:

• Employee Management
• Attendance
• Leave Management
• Payroll
• Reports
• Company Policies
• Holidays
• Salary Components

How can I assist you today?`
},

{
keywords:["how are you","how are you doing"],
answer:
`I'm doing great! 😊

I'm ready to assist you with any HR-related tasks or questions.`
},

{
keywords:["thank you","thanks","thankyou"],
answer:
`You're welcome! 😊

If you need any more help, just ask.`
},

{
keywords:["bye","goodbye","see you"],
answer:
`Goodbye! 👋

Have a productive day.
Feel free to return whenever you need HR assistance.`
},

/* ---------------- Employee ---------------- */

{
keywords:["add employee","new employee","create employee","register employee"],
answer:
`To add a new employee:

1. Open Employees.
2. Click Add Employee.
3. Fill in employee information.
4. Click Save.

The employee will immediately appear in the employee list.`
},

{
keywords:["edit employee","update employee","modify employee"],
answer:
`To edit an employee:

1. Open Employees.
2. Search the employee.
3. Click Edit.
4. Update the information.
5. Save changes.`
},

{
keywords:["delete employee","remove employee","deactivate employee"],
answer:
`To deactivate an employee:

1. Open Employees.
2. Select the employee.
3. Click Deactivate/Delete.
4. Confirm the action.

The employee will no longer appear as an active employee.`
},

{
keywords:["import employee","csv import","upload employees"],
answer:
`To import employees:

1. Open Employees.
2. Click Import CSV.
3. Select the CSV file.
4. Review the preview.
5. Click Import.`
},

{
keywords:["export employee","download employees"],
answer:
`To export employee records:

1. Open Employees.
2. Click Export.
3. Choose CSV or Excel.
4. Download the file.`
},

/* ---------------- Attendance ---------------- */

{
keywords:["attendance","mark attendance","present","absent"],
answer:
`To mark attendance:

1. Open Attendance.
2. Select today's date.
3. Mark Present, Absent or Leave.
4. Save attendance.

Attendance percentages update automatically.`
},

{
keywords:["attendance report","attendance history"],
answer:
`Attendance reports can be generated from the Reports module.

Choose the employee and date range, then click Generate Report.`
},

/* ---------------- Leave ---------------- */

{
keywords:["leave","approve leave","reject leave","leave request"],
answer:
`To manage leave:

1. Open Leave Management.
2. Select a pending request.
3. Review employee details.
4. Click Approve or Reject.

The leave status updates immediately.`
},

{
keywords:["leave balance"],
answer:
`Leave balances are available in the Leave Management section for every employee.`
},

/* ---------------- Payroll ---------------- */

{
keywords:["payroll","generate payroll","salary"],
answer:
`To generate payroll:

1. Open Payroll.
2. Select the payroll month.
3. Verify attendance.
4. Verify approved leaves.
5. Click Generate Payroll.
6. Review salary calculations.
7. Export if required.`
},

{
keywords:["bonus","allowance","deduction","pf","tax"],
answer:
`Salary components can be managed from Payroll Settings.

You can configure:

• Basic Pay
• HRA
• Bonus
• PF
• Professional Tax
• Other Deductions`
},

{
keywords:["payslip","salary slip"],
answer:
`Payslips can be generated after payroll is completed from the Payroll module.`
},

/* ---------------- Reports ---------------- */

{
keywords:["reports","generate report","export report"],
answer:
`To generate reports:

1. Open Reports.
2. Select report type.
3. Choose date range.
4. Click Generate.
5. Export as PDF or CSV.`
},

/* ---------------- Company ---------------- */

{
keywords:["holiday","holidays"],
answer:
`Company holidays can be managed from the Holidays section.

Click Add Holiday and enter the required details.`
},

{
keywords:["policy","company policy","policies"],
answer:
`Company policies can be managed from the HR Documents module.

Update the document and save the changes.`
},

{
keywords:["hr documents","documents"],
answer:
`The HR Documents module allows you to manage company policies, employee documents, and HR-related files.`
},

/* ---------------- Help ---------------- */

{
keywords:["help","what can you do","features"],
answer:
`I can assist you with:

👥 Employee Management
📅 Attendance
🏖 Leave Management
💰 Payroll
📊 Reports
🏢 Company Policies
📁 HR Documents
🎉 Holidays

Ask me anything related to these modules.`
}

];

export default hrKnowledgeBase;